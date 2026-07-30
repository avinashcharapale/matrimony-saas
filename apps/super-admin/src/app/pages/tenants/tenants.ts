import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TenantClient, TenantDto } from '@org/generated';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent, ConfirmDialogData } from '@org/shared-ui';
import { TenantFormDialogComponent } from './tenant-form-dialog/tenant-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tenant Management</h1>
          <p class="subtitle">Create, configure, and manage all tenant instances across the platform.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Tenant
        </button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Search by name or domain..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading tenants...</div>
      } @else if (filteredTenants().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">T</div>
          <p>No tenants found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant Name</th>
                <th>Domain</th>
                <th>Users</th>
                <th>Status</th>
                <th>Trial End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of filteredTenants(); track tenant.tenantId) {
                <tr>
                  <td class="cell-id">{{ tenant.tenantId }}</td>
                  <td class="cell-bold">{{ tenant.name || tenant.tenantCode }}</td>
                  <td>{{ tenant.domain }}</td>
                  <td class="cell-center">{{ tenant.userCount ?? 0 }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="tenant.isActive" [class.inactive]="!tenant.isActive">
                      {{ tenant.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ tenant.trialEndDate ? (tenant.trialEndDate | date:'mediumDate') : '—' }}</td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Permissions" (click)="navigateToPerms(tenant.tenantId!)">
                      <mat-icon>lock</mat-icon>
                    </button>
                    <button mat-icon-button title="Roles" (click)="navigateToRoles(tenant.tenantId!)">
                      <mat-icon>group</mat-icon>
                    </button>
                    <button mat-icon-button title="Plan" (click)="navigateToPlan(tenant.tenantId!)">
                      <mat-icon>assignment</mat-icon>
                    </button>
                    <button mat-icon-button title="Edit" (click)="openEditDialog(tenant)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Delete" (click)="confirmDelete(tenant)">
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
    .search-bar input {
      width: 100%; max-width: 400px; padding: 0.625rem 1rem; border: 1px solid #ddd;
      border-radius: 6px; font-size: 0.875rem; outline: none;
    }
    .search-bar input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.1); }
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
      font-weight: 700; margin: 0 auto 1rem;
    }
    .table-wrapper {
      background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow-x: auto;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600;
      color: #666; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid #eee; background: #fafafa;
    }
    .data-table td {
      padding: 0.875rem 1rem; font-size: 0.875rem; color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .data-table tbody tr:hover { background: #f9f5fc; }
    .cell-id { color: #999; font-family: monospace; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
  `],
})
export class Tenants implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly tenants = signal<TenantDto[]>([]);
  readonly searchTerm = signal('');

  readonly filteredTenants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tenants();
    return this.tenants().filter(
      (t) =>
        (t.tenantCode?.toLowerCase().includes(term)) ||
        (t.domain?.toLowerCase().includes(term)),
    );
  });

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading.set(true);
    this.tenantClient.getAll().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  navigateToPerms(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'permissions']);
  }

  navigateToRoles(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'roles']);
  }

  navigateToPlan(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'plan']);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' as const },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: TenantDto | undefined) => {
      if (result) {
        this.loading.set(true);
        this.tenantClient.create(result).subscribe({
          next: () => this.loadTenants(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openEditDialog(tenant: TenantDto): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit' as const, tenant },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: TenantDto | undefined) => {
      if (result && tenant.tenantId != null) {
        this.loading.set(true);
        this.tenantClient.update(tenant.tenantId, result).subscribe({
          next: () => this.loadTenants(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  confirmDelete(tenant: TenantDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Tenant',
        message: `Are you sure you want to delete "${tenant.name || tenant.tenantCode}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && tenant.tenantId != null) {
        this.loading.set(true);
        this.tenantClient.delete(tenant.tenantId).subscribe({
          next: () => this.loadTenants(),
          error: () => this.loading.set(false),
        });
      }
    });
  }
}
