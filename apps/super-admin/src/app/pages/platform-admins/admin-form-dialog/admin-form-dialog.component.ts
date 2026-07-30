import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlatformAdminDto, PlatformRoleDto } from '../../../services/platform-admin.service';

export interface AdminFormDialogData {
  mode: 'create' | 'edit';
  admin?: PlatformAdminDto;
  availableRoles: PlatformRoleDto[];
}

export interface AdminFormResult {
  email: string;
  password?: string;
  displayName?: string;
  isActive: boolean;
  roleIds: number[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-form-dialog',
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
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Admin' : 'Edit Admin' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="admin@example.com" />
          <mat-icon matPrefix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Required</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Invalid email</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Min 6 characters" />
            <mat-icon matPrefix>lock</mat-icon>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Required</mat-error>
            }
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <mat-error>Minimum 6 characters</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Name</mat-label>
          <input matInput formControlName="displayName" placeholder="Optional display name" />
          <mat-icon matPrefix>person</mat-icon>
        </mat-form-field>

        <div class="field">
          <label class="field-label">Roles</label>
          <div class="role-checkbox-list">
            @for (role of data.availableRoles; track role.platformRoleId) {
              <div class="role-checkbox-item">
                <mat-checkbox
                  [checked]="selectedRoleIds().has(role.platformRoleId)"
                  (change)="toggleRole(role.platformRoleId, $event.checked)"
                >
                  {{ role.roleName }}
                </mat-checkbox>
              </div>
            }
          </div>
        </div>

        <div class="toggle-row">
          <mat-slide-toggle
            [checked]="isActiveValue()"
            (click)="isActiveValue.set(!isActiveValue())"
            color="primary"
          >
            {{ isActiveValue() ? 'Active' : 'Inactive' }}
          </mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
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
    .field {
      margin-bottom: 16px;
    }
    .field-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
    }
    .role-checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }
    .role-checkbox-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 4px 0;
    }
    mat-dialog-content {
      min-width: 420px;
    }
  `],
})
export class AdminFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminFormDialogComponent, AdminFormResult | undefined>);
  readonly data = inject<AdminFormDialogData>(MAT_DIALOG_DATA);

  readonly selectedRoleIds = signal<Set<number>>(
    new Set(this.data.admin?.roles.map(r => r.platformRoleId) ?? []),
  );

  readonly isActiveValue = signal(this.data.admin?.isActive ?? true);

  readonly form = this.fb.nonNullable.group({
    email: [this.data.admin?.email ?? '', [Validators.required, Validators.email]],
    password: ['', this.data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []],
    displayName: [this.data.admin?.displayName ?? ''],
    isActive: [this.data.admin?.isActive ?? true], // keep form control for structure, value replaced by signal
  });

    toggleRole(id: number, checked: boolean): void {
      const set = new Set(this.selectedRoleIds());
      if (checked) set.add(id); else set.delete(id);
      this.selectedRoleIds.set(set);
    }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const result: AdminFormResult = {
      email: val.email,
      password: this.data.mode === 'create' ? val.password : undefined,
      displayName: val.displayName || undefined,
      isActive: this.isActiveValue(),
      roleIds: Array.from(this.selectedRoleIds()),
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
