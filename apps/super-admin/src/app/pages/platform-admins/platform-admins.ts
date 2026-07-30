import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService, PlatformAdminDto, PlatformRoleDto } from '../../services/platform-admin.service';
import { PlatformRoleService } from '../../services/platform-role.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent, ConfirmDialogData } from '@org/shared-ui';
import { AdminFormDialogComponent, AdminFormDialogData, AdminFormResult } from './admin-form-dialog/admin-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-platform-admins',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Platform Admins</h1>
          <p class="subtitle">Manage platform administrators and their role assignments.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Admin
        </button>
      </div>

      <div class="search-bar">
        <input type="text" placeholder="Search by email..." [value]="searchTerm()" (input)="onSearch($event)" />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading admins...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">A</div>
          <p>No admins found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Display Name</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (admin of filtered(); track admin.platformAdminId) {
                <tr>
                  <td class="cell-id">{{ admin.platformAdminId }}</td>
                  <td class="cell-bold">{{ admin.email }}</td>
                  <td>{{ admin.displayName || '—' }}</td>
                  <td>
                    @for (role of admin.roles; track role.platformRoleId) {
                      <span class="role-tag">{{ role.roleName }}</span>
                    }
                  </td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="admin.isActive" [class.inactive]="!admin.isActive">
                      {{ admin.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ admin.createdAt ? (admin.createdAt | date:'shortDate') : '—' }}</td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Edit" (click)="openEditDialog(admin)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Deactivate" (click)="confirmDeactivate(admin)">
                      <mat-icon color="warn">block</mat-icon>
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
    .role-tag { display: inline-block; padding: 2px 8px; background: #f3e5f5; color: #7b1fa2; border-radius: 4px; font-size: 0.75rem; font-weight: 500; margin: 1px 2px; }
  `],
})
export class PlatformAdmins implements OnInit {
  private readonly adminService = inject(PlatformAdminService);
  private readonly roleService = inject(PlatformRoleService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly admins = signal<PlatformAdminDto[]>([]);
  readonly availableRoles = signal<PlatformRoleDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.admins();
    return this.admins().filter(a => a.email?.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadAdmins();
    this.loadRoles();
  }

  loadAdmins(): void {
    this.loading.set(true);
    this.adminService.getAll().subscribe({
      next: (data) => { this.admins.set(data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => { this.availableRoles.set(data ?? []); },
      error: () => {},
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AdminFormDialogComponent, {
      width: '500px',
      data: {
        mode: 'create',
        availableRoles: this.availableRoles(),
      } satisfies AdminFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: AdminFormResult | undefined) => {
      if (!result) return;
      this.saving.set(true);
      this.adminService.create({
        email: result.email,
        password: result.password!,
        displayName: result.displayName,
        roleIds: result.roleIds,
      }).subscribe({
        next: () => { this.saving.set(false); this.loadAdmins(); },
        error: () => { this.saving.set(false); },
      });
    });
  }

  openEditDialog(admin: PlatformAdminDto): void {
    const dialogRef = this.dialog.open(AdminFormDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        admin,
        availableRoles: this.availableRoles(),
      } satisfies AdminFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: AdminFormResult | undefined) => {
      if (!result || !admin.platformAdminId) return;
      this.saving.set(true);
      this.adminService.update(admin.platformAdminId, {
        email: result.email,
        displayName: result.displayName,
        isActive: result.isActive,
        roleIds: result.roleIds,
      }).subscribe({
        next: () => { this.saving.set(false); this.loadAdmins(); },
        error: () => { this.saving.set(false); },
      });
    });
  }

  confirmDeactivate(admin: PlatformAdminDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Deactivate Admin',
        message: `Are you sure you want to deactivate ${admin.email}?`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && admin.platformAdminId) {
        this.adminService.delete(admin.platformAdminId).subscribe({
          next: () => this.loadAdmins(),
          error: () => {},
        });
      }
    });
  }
}
