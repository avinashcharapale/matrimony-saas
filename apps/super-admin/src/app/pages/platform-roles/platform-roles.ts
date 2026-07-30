import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlatformRoleService, PlatformRoleDto } from '../../services/platform-role.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '@org/shared-ui';
import { RoleFormDialogComponent, RoleFormResult } from './role-form-dialog/role-form-dialog.component';
import { AssignPermissionsDialogComponent } from './assign-permissions-dialog/assign-permissions-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-platform-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Platform Roles</h1>
          <p class="subtitle">Manage platform roles and their permission assignments.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Role
        </button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Search by role name..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading roles...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">R</div>
          <p>No roles found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Role Name</th>
                <th>Permissions</th>
                <th>Admins</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (role of filtered(); track role.platformRoleId) {
                <tr>
                  <td class="cell-id">{{ role.platformRoleId }}</td>
                  <td class="cell-bold">{{ role.roleName }}</td>
                  <td class="cell-center">
                    {{ role.permissionCount }}
                    <button
                      mat-icon-button
                      title="Assign Permissions"
                      (click)="openAssignPermissions(role)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                  </td>
                  <td class="cell-center">{{ role.adminCount }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="role.isActive" [class.inactive]="!role.isActive">
                      {{ role.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Edit" (click)="openEditDialog(role)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Delete" (click)="confirmDelete(role)">
                      <mat-icon color="warn">delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-bar input { width: 100%; max-width: 400px; padding: 0.625rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; outline: none; }
    .search-bar input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123,31,162,0.1); }
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon { width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 1rem; }
    .table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #eee; background: #fafafa; }
    .data-table td { padding: 0.875rem 1rem; font-size: 0.875rem; color: #333; border-bottom: 1px solid #f0f0f0; }
    .data-table tbody tr:hover { background: #f9f5fc; }
    .cell-id { color: #999; font-family: monospace; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .badge { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
  `],
})
export class PlatformRoles implements OnInit {
  private readonly roleService = inject(PlatformRoleService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly roles = signal<PlatformRoleDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(r => r.roleName?.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (data) => { this.roles.set(data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' as const },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: RoleFormResult | undefined) => {
      if (result) {
        this.loading.set(true);
        this.roleService.create(result).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openEditDialog(role: PlatformRoleDto): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit' as const, role },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: RoleFormResult | undefined) => {
      if (result && role.platformRoleId != null) {
        this.loading.set(true);
        this.roleService.update(role.platformRoleId, result).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openAssignPermissions(role: PlatformRoleDto): void {
    this.dialog.open(AssignPermissionsDialogComponent, {
      width: '550px',
      data: { roleId: role.platformRoleId, roleName: role.roleName ?? '' },
      disableClose: true,
    });
  }

  confirmDelete(role: PlatformRoleDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${role.roleName}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && role.platformRoleId != null) {
        this.loading.set(true);
        this.roleService.delete(role.platformRoleId).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }
}
