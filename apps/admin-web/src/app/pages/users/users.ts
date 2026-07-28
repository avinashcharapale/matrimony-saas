import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@org/data-access-auth';
import { UserStore } from '@org/data-access-user';
import { UserListDto } from '@org/generated';
import { PageHeaderComponent } from '@org/shared-ui';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  DataTableComponent,
  TableColumn,
} from '@org/shared-ui';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface UserRow extends Record<string, unknown> {
  id?: number;
  email?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
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
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
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
          <mat-slide-toggle formControlName="isActive" color="primary">
            Active
          </mat-slide-toggle>
        </div>

        <div class="toggle-row">
          <mat-slide-toggle formControlName="isSuperAdmin" color="primary">
            Super Admin
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
      min-width: 380px;
    }
  `],
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  readonly data = inject<{
    mode: 'create' | 'edit';
    user?: UserListDto;
  }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    password: [
      '',
      this.data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : [],
    ],
    isActive: [this.data.user?.isActive ?? true],
    isSuperAdmin: [this.data.user?.isSuperAdmin ?? false],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.dialogRef.close({
        email: val.email,
        password: val.password,
        isActive: val.isActive,
        isSuperAdmin: val.isSuperAdmin,
      });
    } else {
      this.dialogRef.close({
        email: val.email,
        isActive: val.isActive,
        isSuperAdmin: val.isSuperAdmin,
      });
    }
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    UserFormDialogComponent,
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
          <input
            matInput
            [(ngModel)]="searchTerm"
            placeholder="Search by email..."
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <ui-data-table
        [columns]="columns"
        [data]="displayRows()"
        [loading]="userStore.loading()"
        emptyMessage="No users found"
        (rowEdit)="openEditDialog($event)"
        (rowDelete)="confirmDelete($event)"
      ></ui-data-table>
    </div>
  `,
  styles: [`
    .users-page {
      position: relative;
    }

    .search-bar {
      margin-bottom: 1.5rem;
    }

    .search-field {
      width: 360px;
    }
  `],
})
export class Users implements OnInit {
  readonly userStore = inject(UserStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);

  searchTerm = '';

  readonly columns: TableColumn[] = [
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'isActiveLabel', label: 'Status', type: 'badge' },
    { key: 'roleLabel', label: 'Role', type: 'text' },
    { key: 'createdAtFormatted', label: 'Created At', type: 'date' },
  ];

  readonly displayRows = computed<UserRow[]>(() => {
    const users = this.userStore.users();
    const term = this.searchTerm.toLowerCase();
    const mapped = users.map((u) => this.toRow(u));
    if (!term) return mapped;
    return mapped.filter((u) => {
      const email = u.email ?? '';
      return email.toLowerCase().includes(term);
    });
  });

  ngOnInit(): void {
    const session = this.authStore.session();
    if (session?.tenantId) {
      this.userStore.loadUsersByTenant(session.tenantId).subscribe();
    }
  }

  private toRow(user: UserListDto): UserRow {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
      isActiveLabel: user.isActive ? 'Active' : 'Inactive',
      roleLabel: user.isSuperAdmin ? 'Super Admin' : 'User',
      createdAtFormatted: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : '-',
    };
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '480px',
      data: { mode: 'create' as const },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const session = this.authStore.session();
        this.userStore
          .createUser({ ...result, tenantId: session?.tenantId ?? 0 })
          .subscribe(() => {
            const s = this.authStore.session();
            if (s?.tenantId) {
              this.userStore.loadUsersByTenant(s.tenantId).subscribe();
            }
          });
      }
    });
  }

  openEditDialog(row: Record<string, unknown>): void {
    const user = row as unknown as UserListDto;
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '480px',
      data: { mode: 'edit' as const, user },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && user.id != null) {
        this.userStore.updateUser(user.id, result).subscribe(() => {
          const session = this.authStore.session();
          if (session?.tenantId) {
            this.userStore.loadUsersByTenant(session.tenantId).subscribe();
          }
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
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && user.id != null) {
        this.userStore.deleteUser(user.id).subscribe(() => {
          const session = this.authStore.session();
          if (session?.tenantId) {
            this.userStore.loadUsersByTenant(session.tenantId).subscribe();
          }
        });
      }
    });
  }
}
