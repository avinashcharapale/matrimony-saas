import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionPlanDto, CreateTenantSubscriptionRequest } from '@org/generated';

export interface RenewSubscriptionDialogData {
  tenantId: number;
  plans: SubscriptionPlanDto[];
  currentPlanId?: number;
  planName?: string | null;
  currentEndDate?: string | null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-renew-subscription-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Renew Subscription</h2>
    <mat-dialog-content>
      <p class="sub-note">
        Choose a new plan (or keep the current one) and the period for the tenant.
        The previous period stays in the history.
      </p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Plan</mat-label>
          <mat-select formControlName="subscriptionPlanId">
            @for (plan of data.plans; track plan.id) {
              <mat-option [value]="plan.id">
                {{ plan.name }} ({{ plan.price ?? 0 | number:'1.2-2' }} {{ plan.currency ?? 'USD' }})
              </mat-option>
            }
          </mat-select>
          @if (form.get('subscriptionPlanId')?.hasError('required') && form.get('subscriptionPlanId')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          @if (form.get('startDate')?.hasError('required') && form.get('startDate')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          @if (form.hasError('endBeforeStart') && form.get('endDate')?.touched) {
            <mat-error>End date must be after start date</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Renew</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 4px; }
    .sub-note { margin: 0 0 1rem; color: #666; font-size: 0.875rem; }
    mat-dialog-content { min-width: 400px; }
  `],
})
export class RenewSubscriptionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RenewSubscriptionDialogComponent, CreateTenantSubscriptionRequest>);
  readonly data = inject<RenewSubscriptionDialogData>(MAT_DIALOG_DATA);

  private readonly defaults = this.computeDefaults();

  readonly form = this.fb.nonNullable.group(
    {
      subscriptionPlanId: [this.defaults.planId, Validators.required],
      startDate: [this.defaults.startDate, Validators.required],
      endDate: [this.defaults.endDate, Validators.required],
    },
    { validators: (g) => {
      const s = g.get('startDate')?.value as Date | null;
      const e = g.get('endDate')?.value as Date | null;
      return s && e && e <= s ? { endBeforeStart: true } : null;
    } },
  );

  constructor() {
    this.form.get('subscriptionPlanId')?.valueChanges.subscribe(() => this.autoFillEndDate());
    this.form.get('startDate')?.valueChanges.subscribe(() => this.autoFillEndDate());
  }

  private computeDefaults(): { planId: number; startDate: Date; endDate: Date } {
    const planId = this.data.currentPlanId ?? 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = today;
    if (this.data.currentEndDate) {
      const [y, m, d] = this.data.currentEndDate.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        const dayAfter = new Date(y, m - 1, d + 1);
        if (dayAfter > start) start = dayAfter;
      }
    }

    const plan = this.data.plans.find((p) => p.id === planId);
    const end = plan?.durationMonths
      ? new Date(start.getFullYear(), start.getMonth() + plan.durationMonths, start.getDate())
      : start;

    return { planId, startDate: start, endDate: end };
  }

  private autoFillEndDate(): void {
    const val = this.form.getRawValue();
    const plan = this.data.plans.find((p) => p.id === val.subscriptionPlanId);
    if (!plan?.durationMonths || !val.startDate) return;
    const start = val.startDate as Date;
    const end = new Date(start.getFullYear(), start.getMonth() + plan.durationMonths, start.getDate());
    this.form.patchValue({ endDate: end }, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const result: CreateTenantSubscriptionRequest = {
      tenantId: this.data.tenantId,
      subscriptionPlanId: val.subscriptionPlanId,
      startDate: val.startDate ? fmt(val.startDate as Date) : '',
      endDate: val.endDate ? fmt(val.endDate as Date) : '',
    };
    this.dialogRef.close(result);
  }
}
