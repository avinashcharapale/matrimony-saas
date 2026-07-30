import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantPermissionService, TenantPermissionDto } from '../../services/tenant-permission.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent, ConfirmDialogData } from '@org/shared-ui';
import { PermFormDialogComponent, PermFormResult } from './perm-form-dialog/perm-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-permissions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/tenants">Tenants</a>
            <span class="sep">/</span>
            <span>Tenant #{{ tenantId() }} Permissions</span>
          </div>
          <h1>Tenant Permissions</h1>
          <p class="subtitle">Manage permissions scoped to this tenant.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Permission
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by code or name...</mat-label>
          <input matInput type="text" placeholder="Search by code or name..." [value]="searchTerm()" (input)="onSearch($event)" />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading permissions...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">P</div>
          <p>No permissions found for this tenant.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Display Name</th>
                <th>Resource</th>
                <th>Action</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (perm of filtered(); track perm.permissionId) {
                <tr>
                  <td class="cell-id">{{ perm.permissionId }}</td>
                  <td class="cell-bold">{{ perm.permissionCode }}</td>
                  <td>{{ perm.displayName }}</td>
                  <td>{{ perm.resourceType }}</td>
                  <td>{{ perm.action }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="perm.isActive" [class.inactive]="!perm.isActive">
                      {{ perm.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Edit" (click)="openEditDialog(perm)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Delete" (click)="confirmDelete(perm)">
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
    .breadcrumb { font-size: 0.8125rem; color: #888; margin-bottom: 0.5rem; }
    .breadcrumb a { color: #7b1fa2; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .sep { margin: 0 0.375rem; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
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
export class TenantPermissions implements OnInit {
  private readonly service = inject(TenantPermissionService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  readonly tenantId = signal<number>(0);
  readonly loading = signal(true);
  readonly permissions = signal<TenantPermissionDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.permissions();
    return this.permissions().filter(p =>
      p.permissionCode?.toLowerCase().includes(term) ||
      p.displayName?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.loadPermissions();
    }
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.service.getAll(this.tenantId()).subscribe({
      next: (data) => { this.permissions.set(data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PermFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: PermFormResult | undefined) => {
      if (result) {
        this.loading.set(true);
        this.service.create(this.tenantId(), result).subscribe({
          next: () => this.loadPermissions(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openEditDialog(perm: TenantPermissionDto): void {
    const dialogRef = this.dialog.open(PermFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', perm },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: PermFormResult | undefined) => {
      if (result && perm.permissionId) {
        this.loading.set(true);
        this.service.update(this.tenantId(), perm.permissionId, {
          displayName: result.displayName,
          description: result.description || undefined,
          isActive: result.isActive,
        }).subscribe({
          next: () => this.loadPermissions(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  confirmDelete(perm: TenantPermissionDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Permission',
        message: `Are you sure you want to delete "${perm.permissionCode}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && perm.permissionId) {
        this.loading.set(true);
        this.service.delete(this.tenantId(), perm.permissionId).subscribe({
          next: () => this.loadPermissions(),
          error: () => this.loading.set(false),
        });
      }
    });
  }
}
