import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TenantDto } from '@org/generated';

export interface TenantFormDialogData {
  mode: 'create' | 'edit';
  tenant?: TenantDto;
}

export interface TenantFormDialogResult {
  dto: TenantDto;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
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
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Tenant' : 'Edit Tenant' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tenant Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter tenant name" />
          <mat-icon matPrefix>business</mat-icon>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Name</mat-label>
          <input matInput formControlName="displayName" placeholder="Enter display name" />
          <mat-icon matPrefix>badge</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tenant Code</mat-label>
          <input matInput formControlName="tenantCode" placeholder="Enter tenant code" />
          <mat-icon matPrefix>code</mat-icon>
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
          <mat-slide-toggle
            [checked]="isActiveValue()"
            (click)="isActiveValue.set(!isActiveValue())"
            color="primary"
          >
            {{ isActiveValue() ? 'Active' : 'Inactive' }}
          </mat-slide-toggle>
        </div>

        @if (data.mode === 'create') {
          <mat-divider class="section-divider"></mat-divider>
          <h3 class="section-title">Tenant Admin</h3>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Admin Email</mat-label>
            <input matInput formControlName="adminEmail" type="email" placeholder="admin@example.com" />
            <mat-icon matPrefix>mail</mat-icon>
            @if (form.get('adminEmail')?.hasError('required') && form.get('adminEmail')?.touched) {
              <mat-error>Required</mat-error>
            }
            @if (form.get('adminEmail')?.hasError('email') && form.get('adminEmail')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Admin Password</mat-label>
            <input matInput formControlName="adminPassword" type="password" placeholder="At least 8 characters" />
            <mat-icon matPrefix>lock</mat-icon>
            @if (form.get('adminPassword')?.hasError('required') && form.get('adminPassword')?.touched) {
              <mat-error>Required</mat-error>
            }
            @if (form.get('adminPassword')?.hasError('minlength') && form.get('adminPassword')?.touched) {
              <mat-error>At least 8 characters</mat-error>
            }
          </mat-form-field>
        } @else {
          <mat-divider class="section-divider"></mat-divider>
          <h3 class="section-title">Tenant Admin</h3>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Admin Email</mat-label>
            <input matInput [value]="data.tenant?.adminEmail ?? '—'" disabled />
            <mat-icon matPrefix>mail</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password (optional)</mat-label>
            <input matInput formControlName="adminPassword" type="password" placeholder="Leave blank to keep current" />
            <mat-icon matPrefix>lock</mat-icon>
            @if (form.get('adminPassword')?.hasError('minlength') && form.get('adminPassword')?.touched) {
              <mat-error>At least 8 characters</mat-error>
            }
          </mat-form-field>
        }
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
    .section-divider {
      margin: 8px 0 12px;
    }
    .section-title {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary, rgba(0, 0, 0, 0.6));
    }
    .section-hint {
      margin: 0 0 10px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
    }
    mat-dialog-content {
      min-width: 720px;
      max-height: 70vh;
    }
  `],
})
export class TenantFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TenantFormDialogComponent, TenantFormDialogResult>);
  readonly data = inject<TenantFormDialogData>(MAT_DIALOG_DATA);

  readonly isActiveValue = signal(this.data.tenant?.isActive ?? true);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.tenant?.name ?? '', Validators.required],
    displayName: [this.data.tenant?.displayName ?? ''],
    tenantCode: [this.data.tenant?.tenantCode ?? '', Validators.required],
    domain: [this.data.tenant?.domain ?? '', Validators.required],
    trialEndDate: [this.data.tenant?.trialEndDate ? new Date(this.data.tenant.trialEndDate) : null],
    isActive: [this.data.tenant?.isActive ?? true],
    adminEmail: [
      '',
      this.data.mode === 'create' ? [Validators.required, Validators.email] : [],
    ],
    adminPassword: [
      '',
      this.data.mode === 'create' ? [Validators.required, Validators.minLength(8)] : [],
    ],
  });
  private formatDateOnly(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const dto: TenantDto = {
      tenantId: this.data.tenant?.tenantId,
      name: val.name,
      displayName: val.displayName,
      tenantCode: val.tenantCode,
      domain: val.domain,
      trialEndDate: val.trialEndDate ? this.formatDateOnly(val.trialEndDate) : undefined,
      isActive: this.isActiveValue(),
    };

    if (this.data.mode === 'create') {
      dto.adminEmail = val.adminEmail;
      dto.adminPassword = val.adminPassword;
    } else if (val.adminPassword?.trim()) {
      dto.adminPassword = val.adminPassword;
    }

    this.dialogRef.close({
      dto,
    } satisfies TenantFormDialogResult);
  }
}
