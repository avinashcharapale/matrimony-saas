import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@org/data-access-auth';
import { PageHeaderComponent, DataTableComponent, ConfirmDialogComponent, ConfirmDialogData, TableColumn } from '@org/shared-ui';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { PermissionService, PermissionDto } from '../../services/permission.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-permission-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatSelectModule,
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
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Resource Type</mat-label>
          <input matInput formControlName="resourceType" placeholder="User" />
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
          <mat-slide-toggle formControlName="isActive" color="primary">Active</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 4px; }
    .toggle-row { margin: 12px 0; }
    mat-dialog-content { min-width: 420px; }
  `],
})
export class PermissionFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PermissionFormDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; permission?: PermissionDto }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    permissionCode: [this.data.permission?.permissionCode ?? '', [Validators.required]],
    displayName: [this.data.permission?.displayName ?? '', [Validators.required]],
    description: [this.data.permission?.description ?? ''],
    resourceType: [this.data.permission?.resourceType ?? ''],
    action: [this.data.permission?.action ?? 'read'],
    isActive: [this.data.permission?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeaderComponent, DataTableComponent,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, PermissionFormDialogComponent,
  ],
  template: `
    <div class="permissions-page">
      <ui-page-header title="Permission Management" subtitle="Define and manage tenant permissions">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Permission
        </button>
      </ui-page-header>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search permissions</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by code or name..." />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <ui-data-table
        [columns]="columns"
        [data]="displayRows()"
        [loading]="loading()"
        emptyMessage="No permissions found"
        (rowEdit)="openEditDialog($event)"
        (rowDelete)="confirmDelete($event)"
      ></ui-data-table>
    </div>
  `,
  styles: [`
    .permissions-page { position: relative; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
  `],
})
export class Permissions implements OnInit {
  private readonly permissionService = inject(PermissionService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly permissions = signal<PermissionDto[]>([]);
  searchTerm = '';

  readonly columns: TableColumn[] = [
    { key: 'permissionCode', label: 'Code', type: 'text' },
    { key: 'displayName', label: 'Display Name', type: 'text' },
    { key: 'resourceType', label: 'Resource', type: 'text' },
    { key: 'action', label: 'Action', type: 'text' },
    { key: 'isActiveLabel', label: 'Status', type: 'badge' },
  ];

  readonly displayRows = computed(() => {
    const list = this.permissions();
    const term = this.searchTerm.toLowerCase();
    const mapped = list.map(p => ({
      id: p.permissionId,
      permissionCode: p.permissionCode,
      displayName: p.displayName,
      resourceType: p.resourceType,
      action: p.action,
      isActive: p.isActive,
      isActiveLabel: p.isActive ? 'Active' : 'Inactive',
    }));
    if (!term) return mapped;
    return mapped.filter(r =>
      (r.permissionCode?.toLowerCase().includes(term)) ||
      (r.displayName?.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.permissionService.getAll().subscribe({
      next: (data) => { this.permissions.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(PermissionFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: Record<string, unknown> | undefined) => {
      if (!result) return;
      this.permissionService.create(result as never).subscribe(() => this.loadPermissions());
    });
  }

  openEditDialog(row: Record<string, unknown>): void {
    const perm = this.permissions().find(p => p.permissionId === row['id']);
    if (!perm) return;
    const ref = this.dialog.open(PermissionFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', permission: perm },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: Record<string, unknown> | undefined) => {
      if (!result) return;
      this.permissionService.update(perm.permissionId, result as never).subscribe(() => this.loadPermissions());
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    const id = row['id'] as number;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Permission',
        message: 'Are you sure you want to delete this permission?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.permissionService.delete(id).subscribe(() => this.loadPermissions());
      }
    });
  }
}
