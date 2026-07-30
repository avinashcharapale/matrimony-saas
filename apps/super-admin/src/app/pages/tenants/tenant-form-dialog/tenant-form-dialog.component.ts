import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TenantDto } from '@org/generated';

export interface TenantFormDialogData {
  mode: 'create' | 'edit';
  tenant?: TenantDto;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Tenant' : 'Edit Tenant' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tenant Code</mat-label>
          <input matInput formControlName="tenantCode" placeholder="Enter tenant code" />
          <mat-icon matPrefix>business</mat-icon>
          @if (form.get('tenantCode')?.hasError('required') && form.get('tenantCode')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Domain</mat-label>
          <input matInput formControlName="domain" placeholder="example.com" />
          <mat-icon matPrefix>language</mat-icon>
          @if (form.get('domain')?.hasError('required') && form.get('domain')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Trial End Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="trialEndDate"
            placeholder="dd-mm-yyyy"
          />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="toggle-row">
          <mat-slide-toggle formControlName="isActive" color="primary">
            Active
          </mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }
    .toggle-row {
      margin: 12px 0;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `],
})
export class TenantFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TenantFormDialogComponent, TenantDto>);
  readonly data = inject<TenantFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    tenantCode: [this.data.tenant?.tenantCode ?? '', Validators.required],
    domain: [this.data.tenant?.domain ?? '', Validators.required],
    trialEndDate: [this.data.tenant?.trialEndDate ? new Date(this.data.tenant.trialEndDate) : null],
    isActive: [this.data.tenant?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const dto: TenantDto = {
      tenantId: this.data.tenant?.tenantId,
      tenantCode: val.tenantCode,
      domain: val.domain,
      trialEndDate: val.trialEndDate ? val.trialEndDate.toISOString() : undefined,
      isActive: val.isActive,
    };
    this.dialogRef.close(dto);
  }
}
