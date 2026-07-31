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
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersClient } from '@org/generated';
import { RoleService, RoleDto } from '../../services/role.service';
import { CROSS_TENANT_ROLE_NAMES } from '../../services/role.constants';
import { forkJoin, Observable } from 'rxjs';

function extractHttpError(err: unknown): string {
  const raw = (err as { error?: unknown })?.error;
  if (typeof raw === 'string' && raw) return raw;
  if (raw && typeof raw === 'object') {
    const body = raw as { message?: string; title?: string };
    if (body.message) return body.message;
    if (body.title) return body.title;
  }
  return 'Operation failed. Please try again.';
}

interface UserRow extends Record<string, unknown> {
  id?: number;
  email?: string;
  isActive?: boolean;
  isTenantAdmin?: boolean;
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
        @if (hiddenRoleCount() > 0) {
          <p class="role-note">Platform-level roles are not assignable here.</p>
        }
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
      <button mat-flat-button color="primary" [disabled]="loading() || saving()" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 400px; max-height: 400px; overflow-y: auto; }
    .role-list { display: flex; flex-direction: column; gap: 4px; }
    .role-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; }
    .role-count { font-size: 12px; color: #888; margin-left: auto; }
    .role-note { font-size: 12px; color: #888; margin: 0 0 8px; }
  `],
})
export class AssignRoleDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AssignRoleDialogComponent>);
  private readonly roleService = inject(RoleService);
  private readonly usersClient = inject(UsersClient);
  private readonly snackbar = inject(MatSnackBar);
  readonly data = inject<{ userId: number; userEmail: string }>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly allRoles = signal<RoleDto[]>([]);
  readonly hiddenRoleCount = signal(0);
  readonly userRoleIds = signal<Set<number>>(new Set());
  readonly originalIds = signal<Set<number>>(new Set());

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.roleService.getAll().subscribe({
      next: (roles) => {
        const all = roles ?? [];
        const filtered = all.filter(r => !CROSS_TENANT_ROLE_NAMES.includes(r.roleName));
        this.hiddenRoleCount.set(all.length - filtered.length);
        this.allRoles.set(filtered);
        this.loading.set(false);
        this.loadUserRoles(filtered);
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
      error: (err) => {
        this.saving.set(false);
        this.snackbar.open(extractHttpError(err), 'Close', { duration: 5000 });
      },
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
    MatSlideToggleModule,
  ],
  template: `
    <div class="users-page">
      <ui-page-header title="Staff" subtitle="Manage tenant admin staff, roles, and permissions">
        @if (can('user.create')) {
          <button mat-flat-button color="primary" (click)="openAddDialog()">
            <mat-icon>add</mat-icon>
            Add User
          </button>
        }
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
        emptyMessage="No staff members found"
        (rowClick)="openAssignRoleDialog($event)"
      >
        <ng-template #actions let-row>
          @if (can('user.update')) {
            <button
              mat-icon-button
              color="primary"
              title="Edit"
              (click)="openEditDialog(row); $event.stopPropagation()"
            >
              <mat-icon>edit</mat-icon>
            </button>
          }
          @if (can('user.assign_roles')) {
            <button
              mat-icon-button
              title="Promote to Tenant Admin"
              [disabled]="isTenantAdminRow(row)"
              (click)="promoteToTenantAdmin(row); $event.stopPropagation()"
            >
              <mat-icon>admin_panel_settings</mat-icon>
            </button>
          }
          @if (can('user.delete')) {
            <button
              mat-icon-button
              color="warn"
              title="Delete"
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
    .users-page { position: relative; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
  `],
})
export class Users implements OnInit {
  readonly userStore = inject(UserStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly roleService = inject(RoleService);

  readonly can = this.authStore.can;

  readonly loading = signal(false);
  searchTerm = '';

  readonly columns: TableColumn[] = [
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'roleLabel', label: 'Roles', type: 'text' },
    { key: 'isActiveLabel', label: 'Status', type: 'badge' },
    { key: 'createdAtFormatted', label: 'Created At', type: 'date' },
  ];

  readonly displayRows = computed<UserRow[]>(() => {
    const users = this.userStore.users();
    const term = this.searchTerm.trim().toLowerCase();
    return users
      .map((u) => this.toRow(u))
      .filter((u) => {
        if (u.isTenantAdmin === true) return true;
        if (!term) return false;
        return (u.email ?? '').toLowerCase().includes(term);
      });
  });

  ngOnInit(): void {
    const session = this.authStore.session();
    if (session?.tenantId) {
      this.loading.set(true);
      this.userStore.loadUsersByTenant(session.tenantId).subscribe(() => {
        this.loading.set(false);
      });
    }
  }

  private toRow(user: UserListDto): UserRow {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isTenantAdmin: user.isTenantAdmin,
      createdAt: user.createdAt,
      isActiveLabel: user.isActive ? 'Active' : 'Inactive',
      roleLabel: (user.roles ?? []).join(', ') || 'None',
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
    if (!this.can('user.assign_roles')) return;
    const userId = row['id'] as number;
    const userEmail = row['email'] as string;
    const ref = this.dialog.open(AssignRoleDialogComponent, {
      width: '480px', data: { userId, userEmail }, disableClose: true,
    });
    ref.afterClosed().subscribe((changed) => {
      if (changed) {
        const session = this.authStore.session();
        if (session?.tenantId) this.userStore.loadUsersByTenant(session.tenantId).subscribe();
      }
    });
  }

  isTenantAdminRow(row: Record<string, unknown>): boolean {
    return (row['isTenantAdmin'] as boolean) ?? false;
  }

  promoteToTenantAdmin(row: Record<string, unknown>): void {
    const userId = row['id'] as number;
    const userEmail = row['email'] as string;
    if (userId == null) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Promote to Tenant Admin',
        message: `Are you sure you want to promote "${userEmail}" to Tenant Admin?`,
        confirmText: 'Promote',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.roleService.getAll().subscribe({
        next: (roles) => {
          const tenantAdminRole = (roles ?? []).find(r => r.roleName === 'TenantAdmin');
          if (!tenantAdminRole) {
            this.snackbar.open('TenantAdmin role not found for this tenant.', 'Close', { duration: 4000 });
            return;
          }
          this.roleService.assignUsers(tenantAdminRole.roleId, [userId]).subscribe({
            next: () => {
              this.snackbar.open(`${userEmail} promoted to Tenant Admin.`, 'Close', { duration: 4000 });
              const session = this.authStore.session();
              if (session?.tenantId) this.userStore.loadUsersByTenant(session.tenantId).subscribe();
            },
            error: (err) => this.snackbar.open(extractHttpError(err), 'Close', { duration: 5000 }),
          });
        },
        error: (err) => this.snackbar.open(extractHttpError(err), 'Close', { duration: 5000 }),
      });
    });
  }
}
