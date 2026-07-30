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

export interface PlanFormDialogData {
  plans: SubscriptionPlanDto[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-assign-plan-dialog',
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
    <h2 mat-dialog-title>Assign Plan</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Plan</mat-label>
          <mat-select formControlName="planId">
            @for (plan of data.plans; track plan.id) {
              <mat-option [value]="plan.id">
                {{ plan.name }} ({{ plan.price ?? 0 | number:'1.2-2' }} {{ plan.currency ?? 'USD' }})
              </mat-option>
            }
          </mat-select>
          @if (form.get('planId')?.hasError('required') && form.get('planId')?.touched) {
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
          @if (form.get('endDate')?.hasError('required') && form.get('endDate')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Assign</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 4px; }
    mat-dialog-content { min-width: 400px; }
  `],
})
export class AssignPlanDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AssignPlanDialogComponent, CreateTenantSubscriptionRequest>);
  readonly data = inject<PlanFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    planId: [0, Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const result: CreateTenantSubscriptionRequest = {
      tenantId: 0,
      planId: val.planId,
      startDate: val.startDate?.toISOString() ?? '',
      endDate: val.endDate?.toISOString() ?? '',
    };
    this.dialogRef.close(result);
  }
}
