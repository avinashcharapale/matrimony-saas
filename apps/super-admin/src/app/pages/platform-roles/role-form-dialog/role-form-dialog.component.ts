import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlatformRoleDto } from '../../../services/platform-role.service';

export interface RoleFormDialogData {
  mode: 'create' | 'edit';
  role?: PlatformRoleDto;
}

export interface RoleFormResult {
  roleName: string;
  isActive: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Role' : 'Edit Role' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role Name</mat-label>
          <input matInput formControlName="roleName" placeholder="e.g. Support" />
          @if (form.get('roleName')?.hasError('required') && form.get('roleName')?.touched) {
            <mat-error>Required</mat-error>
          }
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
export class RoleFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RoleFormDialogComponent, RoleFormResult>);
  readonly data = inject<RoleFormDialogData>(MAT_DIALOG_DATA);

  readonly isActiveValue = signal(this.data.role?.isActive ?? true);

  readonly form = this.fb.nonNullable.group({
    roleName: [this.data.role?.roleName ?? '', Validators.required],
    isActive: [this.data.role?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.dialogRef.close({ ...val, isActive: this.isActiveValue() });
  }
}
