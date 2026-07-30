import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { TenantPermissionDto } from '../../../services/tenant-permission.service';

export interface PermFormDialogData {
  mode: 'create' | 'edit';
  perm?: TenantPermissionDto;
}

export interface PermFormResult {
  permissionCode: string;
  displayName: string;
  description: string;
  resourceType: string;
  action: string;
  isActive: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-perm-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Permission' : 'Edit Permission' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Permission Code</mat-label>
          <input matInput formControlName="permissionCode" placeholder="e.g. user_create" />
          @if (form.get('permissionCode')?.hasError('required') && form.get('permissionCode')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Display Name</mat-label>
          <input matInput formControlName="displayName" placeholder="Create User" />
          @if (form.get('displayName')?.hasError('required') && form.get('displayName')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Optional description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Resource Type</mat-label>
          <input matInput formControlName="resourceType" placeholder="e.g. User" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Action</mat-label>
          <mat-select formControlName="action">
            <mat-option value="create">Create</mat-option>
            <mat-option value="read">Read</mat-option>
            <mat-option value="update">Update</mat-option>
            <mat-option value="delete">Delete</mat-option>
            <mat-option value="manage">Manage</mat-option>
          </mat-select>
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
    .full-width { width: 100%; }
    .toggle-row { margin: 12px 0; }
    mat-dialog-content { min-width: 400px; }
  `],
})
export class PermFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PermFormDialogComponent, PermFormResult>);
  readonly data = inject<PermFormDialogData>(MAT_DIALOG_DATA);

  readonly isActiveValue = signal(this.data.perm?.isActive ?? true);

  readonly form = this.fb.nonNullable.group({
    permissionCode: [this.data.perm?.permissionCode ?? '', Validators.required],
    displayName: [this.data.perm?.displayName ?? '', Validators.required],
    description: [this.data.perm?.description ?? ''],
    resourceType: [this.data.perm?.resourceType ?? ''],
    action: [this.data.perm?.action ?? 'read'],
    isActive: [this.data.perm?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({ ...raw, isActive: this.isActiveValue() });
  }
}
