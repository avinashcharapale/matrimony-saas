import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthStore } from '@org/data-access-auth';
import { PageHeaderComponent, DataTableComponent, ConfirmDialogComponent, ConfirmDialogData, TableColumn } from '@org/shared-ui';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RoleService, RoleDto } from '../../services/role.service';
import { PermissionService, PermissionDto } from '../../services/permission.service';
import { RESERVED_ROLE_NAMES } from '../../services/role.constants';

interface RoleRow extends Record<string, unknown> {
  id?: number;
  roleName?: string;
  isSystem?: boolean;
  userCount?: number;
  permissionCount?: number;
  createdAtFormatted: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Role' : 'Edit Role' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role Name</mat-label>
          <input matInput formControlName="roleName" placeholder="e.g. Editor" />
          @if (form.get('roleName')?.hasError('required') && form.get('roleName')?.touched) {
            <mat-error>Required</mat-error>
          }
          @if (form.get('roleName')?.hasError('reserved')) {
            <mat-error>This role name is reserved by the system.</mat-error>
          }
        </mat-form-field>
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
    .full-width { width: 100%; }
    mat-dialog-content { min-width: 380px; }
  `],
})
export class RoleFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RoleFormDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; role?: RoleDto }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    roleName: [this.data.role?.roleName ?? '', [Validators.required, reservedRoleNameValidator]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}

function reservedRoleNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = (control.value as string)?.trim();
  if (name && RESERVED_ROLE_NAMES.some(r => r.toLowerCase() === name.toLowerCase())) {
    return { reserved: true };
  }
  return null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-assign-permissions-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Permissions to {{ data.roleName }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <p>Loading permissions...</p>
      } @else if (availablePermissions().length === 0) {
        <p>No permissions available.</p>
      } @else {
        <div class="perm-list">
          @for (perm of availablePermissions(); track perm.permissionId) {
            <label class="perm-item">
              <mat-checkbox
                [checked]="data.assignedIds.includes(perm.permissionId)"
                (change)="togglePermission(perm.permissionId)"
              />
              <span class="perm-label">{{ perm.displayName }}</span>
              <span class="perm-code">{{ perm.permissionCode }}</span>
            </label>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="loading()" (click)="save()">
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 420px; max-height: 400px; overflow-y: auto; }
    .perm-list { display: flex; flex-direction: column; gap: 4px; }
    .perm-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; }
    .perm-label { font-size: 14px; }
    .perm-code { font-size: 12px; color: #888; margin-left: auto; }
  `],
})
export class AssignPermissionsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AssignPermissionsDialogComponent>);
  private readonly permissionService = inject(PermissionService);
  readonly data = inject<{ roleName: string; assignedIds: number[] }>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly availablePermissions = signal<PermissionDto[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set(this.data.assignedIds));

  constructor() {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionService.getAll().subscribe({
      next: (perms) => { this.availablePermissions.set(perms ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  togglePermission(id: number): void {
    const set = new Set(this.selectedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedIds.set(set);
  }

  save(): void {
    this.dialogRef.close(Array.from(this.selectedIds()));
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeaderComponent, DataTableComponent,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <div class="roles-page">
      <ui-page-header title="Role Management" subtitle="Create and manage roles with permissions">
        @if (can('role.create')) {
          <button mat-flat-button color="primary" (click)="openAddDialog()">
            <mat-icon>add</mat-icon>
            Add Role
          </button>
        }
      </ui-page-header>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search roles</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by name..." />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <ui-data-table
        [columns]="columns"
        [data]="displayRows()"
        [loading]="loading()"
        emptyMessage="No roles found"
        (rowEdit)="openEditDialog($event)"
        (rowDelete)="confirmDelete($event)"
        (rowClick)="openAssignPermissions($event)"
      >
        <ng-template #actions let-row>
          @if (can('role.update')) {
            <button
              mat-icon-button
              color="primary"
              title="Edit"
              [disabled]="isReservedRow(row)"
              (click)="openEditDialog(row); $event.stopPropagation()"
            >
              <mat-icon>edit</mat-icon>
            </button>
          }
          @if (can('role.assign_permissions')) {
            <button
              mat-icon-button
              color="accent"
              title="Permissions"
              (click)="openAssignPermissions(row); $event.stopPropagation()"
            >
              <mat-icon>key</mat-icon>
            </button>
          }
          @if (can('role.delete')) {
            <button
              mat-icon-button
              color="warn"
              title="Delete"
              [disabled]="isReservedRow(row)"
              (click)="confirmDelete(row); $event.stopPropagation()"
            >
              <mat-icon>delete</mat-icon>
            </button>
          }
        </ng-template>
      </ui-data-table>
    </div>
  `,
  styles: [`
    .roles-page { position: relative; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
  `],
})
export class Roles implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);
  private readonly authStore = inject(AuthStore);

  readonly can = this.authStore.can;

  readonly loading = signal(false);
  readonly roles = signal<RoleDto[]>([]);
  searchTerm = '';

  isReservedRow(row: Record<string, unknown>): boolean {
    return row['isSystem'] === true || RESERVED_ROLE_NAMES.includes(row['roleName'] as string);
  }

  readonly columns: TableColumn[] = [
    { key: 'roleName', label: 'Role Name', type: 'text' },
    { key: 'isSystemText', label: 'System', type: 'text' },
    { key: 'userCount', label: 'Users', type: 'text' },
    { key: 'permissionCount', label: 'Permissions', type: 'text' },
    { key: 'createdAtFormatted', label: 'Created At', type: 'date' },
  ];

  readonly displayRows = computed(() => {
    const list = this.roles();
    const term = this.searchTerm.toLowerCase();
    const mapped = list.map(r => ({
      id: r.roleId,
      roleName: r.roleName,
      isSystem: r.isSystem,
      isSystemText: r.isSystem ? 'Yes' : '',
      userCount: r.userCount,
      permissionCount: r.permissionCount,
      createdAtFormatted: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-',
    }));
    if (!term) return mapped;
    return mapped.filter(r => r.roleName?.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (data) => { this.roles.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(RoleFormDialogComponent, {
      width: '440px',
      data: { mode: 'create' },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: { roleName: string } | undefined) => {
      if (!result) return;
      this.roleService.create(result).subscribe({
        next: () => this.loadRoles(),
        error: () => undefined,
      });
    });
  }

  openEditDialog(row: Record<string, unknown>): void {
    const role = this.roles().find(r => r.roleId === row['id']);
    if (!role) return;
    const ref = this.dialog.open(RoleFormDialogComponent, {
      width: '440px',
      data: { mode: 'edit', role },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: { roleName: string } | undefined) => {
      if (!result) return;
      this.roleService.update(role.roleId, result).subscribe({
        next: () => this.loadRoles(),
        error: () => undefined,
      });
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    const id = row['id'] as number;
    const roleName = row['roleName'] as string;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Role',
        message: `Are you sure you want to delete "${roleName}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.roleService.delete(id).subscribe({
          next: () => this.loadRoles(),
          error: () => undefined,
        });
      }
    });
  }

  openAssignPermissions(row: Record<string, unknown>): void {
    if (!this.can('role.assign_permissions')) return;
    const roleId = row['id'] as number;
    const roleName = row['roleName'] as string;
    this.roleService.getById(roleId).subscribe({
      next: (detail) => {
        const assignedIds = detail.permissions.map(p => p.permissionId);
        const ref = this.dialog.open(AssignPermissionsDialogComponent, {
          width: '500px',
          data: { roleName, assignedIds },
          disableClose: true,
        });
        ref.afterClosed().subscribe((selectedIds: number[] | undefined) => {
          if (!selectedIds) return;
          this.roleService.assignPermissions(roleId, selectedIds).subscribe({
            next: () => this.loadRoles(),
            error: () => undefined,
          });
        });
      },
    });
  }
}
