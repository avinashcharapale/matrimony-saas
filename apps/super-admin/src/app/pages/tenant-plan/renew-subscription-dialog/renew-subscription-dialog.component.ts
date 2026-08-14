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
import { MatRadioModule } from '@angular/material/radio';
import { SubscriptionPlanDto, CreateTenantSubscriptionRequest } from '@org/generated';

export interface RenewSubscriptionDialogData {
  tenantId: number;
  plans: SubscriptionPlanDto[];
  currentPlanId?: number;
  planName?: string | null;
  latestEndDate?: string | null;
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
    MatRadioModule,
  ],
  template: `
    <h2 mat-dialog-title>Renew Subscription</h2>
    <mat-dialog-content>
      <p class="sub-note">
        Renewal continues after the current period with no gap. Choose "change plan" to switch to a
        different plan starting today (remaining days of the current plan are forfeited).
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

        <mat-radio-group formControlName="startMode" class="mode-group">
          <mat-radio-button value="sequential">Renewal — starts when the current period ends</mat-radio-button>
          <mat-radio-button value="immediate">Change plan — starts now</mat-radio-button>
        </mat-radio-group>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
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
    .mode-group { display: flex; flex-direction: column; gap: 0.375rem; margin: 0.25rem 0 0.75rem; }
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
      startMode: ['sequential' as 'sequential' | 'immediate'],
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
    this.form.get('startDate')?.disable();
    this.form.get('subscriptionPlanId')?.valueChanges.subscribe(() => this.autoFillEndDate());
    this.form.get('startMode')?.valueChanges.subscribe(() => this.recomputeDates());
  }

  private computeDefaults(): { planId: number; startDate: Date; endDate: Date } {
    const planId = this.data.currentPlanId ?? 0;
    const start = this.sequentialStart();
    const plan = this.data.plans.find((p) => p.id === planId);
    const end = plan?.durationMonths ? this.addMonths(start, plan.durationMonths) : start;
    return { planId, startDate: start, endDate: end };
  }

  private today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private sequentialStart(): Date {
    const today = this.today();
    if (this.data.latestEndDate) {
      const [y, m, d] = this.data.latestEndDate.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        const dayAfter = new Date(y, m - 1, d + 1);
        dayAfter.setHours(0, 0, 0, 0);
        if (dayAfter > today) return dayAfter;
      }
    }
    return today;
  }

  private addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  }

  private recomputeDates(): void {
    const mode = this.form.get('startMode')?.value;
    const start = mode === 'immediate' ? this.today() : this.sequentialStart();
    this.form.patchValue({ startDate: start });
    this.autoFillEndDate();
  }

  private autoFillEndDate(): void {
    const val = this.form.getRawValue();
    const plan = this.data.plans.find((p) => p.id === val.subscriptionPlanId);
    if (!plan?.durationMonths || !val.startDate) return;
    const start = val.startDate as Date;
    const end = this.addMonths(start, plan.durationMonths);
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
      startImmediately: val.startMode === 'immediate',
    };
    this.dialogRef.close(result);
  }
}
