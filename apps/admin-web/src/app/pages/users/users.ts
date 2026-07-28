import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@org/data-access-auth';
import { UserStore } from '@org/data-access-user';
import { UserListDto } from '@org/generated';
import { PageHeaderComponent, ConfirmDialogComponent, ConfirmDialogData, DataTableComponent, TableColumn } from '@org/shared-ui';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersClient } from '@org/generated';
import { RoleService, RoleDto } from '../../services/role.service';
import { forkJoin, Observable } from 'rxjs';

interface UserRow extends Record<string, unknown> {
  id?: number;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  isActiveLabel: string;
  roleLabel: string;
  createdAtFormatted: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New User' : 'Edit User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="user@example.com" />
          <mat-icon matPrefix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Enter a valid email</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Minimum 6 characters" />
            <mat-icon matPrefix>lock</mat-icon>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <mat-error>Minimum 6 characters</mat-error>
            }
          </mat-form-field>
        }

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
    mat-dialog-content { min-width: 380px; }
  `],
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; user?: UserListDto }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    password: ['', this.data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []],
    isActive: [this.data.user?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.dialogRef.close({ email: val.email, password: val.password, isActive: val.isActive });
    } else {
      this.dialogRef.close({ email: val.email, isActive: val.isActive });
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-assign-role-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Roles — {{ data.userEmail }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <p>Loading roles...</p>
      } @else if (allRoles().length === 0) {
        <p>No roles available.</p>
      } @else {
        <div class="role-list">
          @for (role of allRoles(); track role.roleId) {
            <label class="role-item">
              <mat-checkbox
                [checked]="userRoleIds().has(role.roleId)"
                (change)="toggleRole(role.roleId)"
              />
              <span>{{ role.roleName }}</span>
              <span class="role-count">{{ role.userCount }} users</span>
            </label>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="loading()" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 400px; max-height: 400px; overflow-y: auto; }
    .role-list { display: flex; flex-direction: column; gap: 4px; }
    .role-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; }
    .role-count { font-size: 12px; color: #888; margin-left: auto; }
  `],
})
export class AssignRoleDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AssignRoleDialogComponent>);
  private readonly roleService = inject(RoleService);
  private readonly usersClient = inject(UsersClient);
  readonly data = inject<{ userId: number; userEmail: string }>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly allRoles = signal<RoleDto[]>([]);
  readonly userRoleIds = signal<Set<number>>(new Set());
  readonly originalIds = signal<Set<number>>(new Set());

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.roleService.getAll().subscribe({
      next: (roles) => {
        this.allRoles.set(roles ?? []);
        this.loading.set(false);
        this.loadUserRoles(roles ?? []);
      },
      error: () => this.loading.set(false),
    });
  }

  loadUserRoles(roles: RoleDto[]): void {
    this.usersClient.getById(this.data.userId).subscribe({
      next: (user) => {
        const roleNameSet = new Set(user.roles ?? []);
        const ids = new Set<number>();
        for (const r of roles) {
          if (roleNameSet.has(r.roleName)) ids.add(r.roleId);
        }
        this.userRoleIds.set(new Set(ids));
        this.originalIds.set(new Set(ids));
      },
    });
  }

  toggleRole(id: number): void {
    const set = new Set(this.userRoleIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.userRoleIds.set(set);
  }

  save(): void {
    this.saving.set(true);
    const current = this.userRoleIds();
    const original = this.originalIds();
    const toAdd: number[] = [];
    const toRemove: number[] = [];
    for (const id of current) if (!original.has(id)) toAdd.push(id);
    for (const id of original) if (!current.has(id)) toRemove.push(id);

    const ops: Observable<unknown>[] = [];
    for (const roleId of toAdd) ops.push(this.roleService.assignUsers(roleId, [this.data.userId]));
    for (const roleId of toRemove) ops.push(this.roleService.removeUser(roleId, this.data.userId));

    if (ops.length === 0) {
      this.dialogRef.close();
      return;
    }

    forkJoin(ops).subscribe({
      next: () => { this.saving.set(false); this.dialogRef.close(true); },
      error: () => { this.saving.set(false); this.dialogRef.close(true); },
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeaderComponent, DataTableComponent,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, UserFormDialogComponent, AssignRoleDialogComponent,
  ],
  template: `
    <div class="users-page">
      <ui-page-header title="User Management" subtitle="Manage users, roles, and permissions">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </ui-page-header>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search users</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by email..." />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <ui-data-table
        [columns]="columns"
        [data]="displayRows()"
        [loading]="loading()"
        emptyMessage="No users found"
        (rowEdit)="openEditDialog($event)"
        (rowDelete)="confirmDelete($event)"
        (rowClick)="openAssignRoleDialog($event)"
      ></ui-data-table>
    </div>
  `,
  styles: [`
    .users-page { position: relative; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
  `],
})
export class Users implements OnInit {
  readonly userStore = inject(UserStore);
  private readonly usersClient = inject(UsersClient);
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly userRoles = signal<Map<number, string[]>>(new Map());
  searchTerm = '';

  readonly columns: TableColumn[] = [
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'roleLabel', label: 'Roles', type: 'text' },
    { key: 'isActiveLabel', label: 'Status', type: 'badge' },
    { key: 'createdAtFormatted', label: 'Created At', type: 'date' },
  ];

  readonly displayRows = computed<UserRow[]>(() => {
    const users = this.userStore.users();
    const term = this.searchTerm.toLowerCase();
    const roles = this.userRoles();
    const mapped = users.map((u) => this.toRow(u, roles));
    if (!term) return mapped;
    return mapped.filter((u) => (u.email ?? '').toLowerCase().includes(term));
  });

  ngOnInit(): void {
    const session = this.authStore.session();
    if (session?.tenantId) {
      this.loading.set(true);
      this.userStore.loadUsersByTenant(session.tenantId).subscribe(() => {
        this.loading.set(false);
        this.loadRolesForAllUsers();
      });
    }
  }

  loadRolesForAllUsers(): void {
    const users = this.userStore.users();
    const roles = new Map<number, string[]>();
    let completed = 0;
    if (users.length === 0) return;
    for (const u of users) {
      if (u.id == null) { completed++; continue; }
      this.usersClient.getById(u.id).subscribe({
        next: (detail) => {
          roles.set(u.id!, detail.roles ?? []);
          completed++;
          if (completed === users.length) this.userRoles.set(new Map(roles));
        },
        error: () => {
          completed++;
          if (completed === users.length) this.userRoles.set(new Map(roles));
        },
      });
    }
  }

  private toRow(user: UserListDto, roles: Map<number, string[]>): UserRow {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      isActiveLabel: user.isActive ? 'Active' : 'Inactive',
      roleLabel: user.id != null ? (roles.get(user.id)?.join(', ') || 'None') : 'None',
      createdAtFormatted: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
    };
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '480px', data: { mode: 'create' as const }, disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const session = this.authStore.session();
      this.userStore.createUser({ ...result, tenantId: session?.tenantId ?? 0 }).subscribe(() => {
        const s = this.authStore.session();
        if (s?.tenantId) this.userStore.loadUsersByTenant(s.tenantId).subscribe();
      });
    });
  }

  openEditDialog(row: Record<string, unknown>): void {
    const user = row as unknown as UserListDto;
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '480px', data: { mode: 'edit' as const, user }, disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && user.id != null) {
        this.userStore.updateUser(user.id, result).subscribe(() => {
          const session = this.authStore.session();
          if (session?.tenantId) this.userStore.loadUsersByTenant(session.tenantId).subscribe();
        });
      }
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    const user = row as unknown as UserListDto;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`,
        confirmText: 'Delete', cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && user.id != null) {
        this.userStore.deleteUser(user.id).subscribe(() => {
          const session = this.authStore.session();
          if (session?.tenantId) this.userStore.loadUsersByTenant(session.tenantId).subscribe();
        });
      }
    });
  }

  openAssignRoleDialog(row: Record<string, unknown>): void {
    const userId = row['id'] as number;
    const userEmail = row['email'] as string;
    const ref = this.dialog.open(AssignRoleDialogComponent, {
      width: '480px', data: { userId, userEmail }, disableClose: true,
    });
    ref.afterClosed().subscribe((changed) => {
      if (changed) {
        const session = this.authStore.session();
        if (session?.tenantId) this.userStore.loadUsersByTenant(session.tenantId).subscribe();
        this.loadRolesForAllUsers();
      }
    });
  }
}
