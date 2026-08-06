import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TenantClient, TenantDto } from '@org/generated';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialogComponent, ConfirmDialogData, PaginatorComponent, createSort, createPagination } from '@org/shared-ui';
import { TenantFormDialogComponent } from './tenant-form-dialog/tenant-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    PaginatorComponent,
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
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search tenants</mat-label>
          <input
            matInput
            type="text"
            placeholder="Search by name or domain..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
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
                <th class="sortable" (click)="sort.toggleSort('id')">ID <mat-icon class="sort-icon">{{ sort.sortIcon('id') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('name')">Tenant Name <mat-icon class="sort-icon">{{ sort.sortIcon('name') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('domain')">Domain <mat-icon class="sort-icon">{{ sort.sortIcon('domain') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('users')">Users <mat-icon class="sort-icon">{{ sort.sortIcon('users') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('status')">Status <mat-icon class="sort-icon">{{ sort.sortIcon('status') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('trialEndDate')">Trial End Date <mat-icon class="sort-icon">{{ sort.sortIcon('trialEndDate') }}</mat-icon></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of pagination.paginated(); track tenant.tenantId) {
                <tr>
                  <td class="cell-id">{{ tenant.tenantId }}</td>
                  <td class="cell-bold">{{ tenant.name || tenant.tenantCode }}</td>
                  <td>{{ tenant.domain }}</td>
                  <td class="cell-center">{{ tenant.userCount ?? 0 }}</td>
                  <td class="cell-center">
                    <mat-slide-toggle
                      [checked]="tenant.isActive"
                      (click)="$event.stopPropagation(); toggleStatus(tenant)"
                      color="primary"
                    >
                      {{ tenant.isActive ? 'Active' : 'Inactive' }}
                    </mat-slide-toggle>
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
                    <button mat-icon-button title="Settings" (click)="navigateToSettings(tenant.tenantId!)">
                      <mat-icon>settings</mat-icon>
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
          <ui-paginator
            [totalItems]="pagination.totalItems()"
            [totalPages]="pagination.totalPages()"
            [currentPage]="pagination.currentPage()"
            [pageSize]="pagination.pageSize()"
            (pageChange)="pagination.goToPage($event)"
            (pageSizeChange)="pagination.onPageSizeChange($event)"
          />
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
    .search-field { width: 360px; }
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
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; line-height: 1; }

  `],
})
export class Tenants implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly tenants = signal<TenantDto[]>([]);
  readonly searchTerm = signal('');

  readonly sort = createSort();

  readonly filteredTenants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tenants();
    return this.tenants().filter(
      (t) =>
        (t.tenantCode?.toLowerCase().includes(term)) ||
        (t.domain?.toLowerCase().includes(term)),
    );
  });

  private readonly sortedTenants = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.filteredTenants();
    const dir = this.sort.sortDirection();
    const data = [...this.filteredTenants()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'id': cmp = (a.tenantId ?? 0) - (b.tenantId ?? 0); break;
        case 'name': cmp = (a.name || a.tenantCode || '').localeCompare(b.name || b.tenantCode || ''); break;
        case 'domain': cmp = (a.domain || '').localeCompare(b.domain || ''); break;
        case 'users': cmp = (a.userCount ?? 0) - (b.userCount ?? 0); break;
        case 'status': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
        case 'trialEndDate': cmp = ((a.trialEndDate ?? '') < (b.trialEndDate ?? '') ? -1 : ((a.trialEndDate ?? '') > (b.trialEndDate ?? '') ? 1 : 0)); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sortedTenants);

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

  navigateToSettings(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'settings']);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.pagination.goToPage(1);
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
        this.tenantClient.update(tenant.tenantId, result as any).subscribe({
          next: () => this.loadTenants(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  toggleStatus(tenant: TenantDto): void {
    if (tenant.tenantId == null) return;
    const newStatus = !tenant.isActive;
    this.tenants.update(list =>
      list.map(t => t.tenantId === tenant.tenantId ? { ...t, isActive: newStatus } : t)
    );
    this.tenantClient.update(tenant.tenantId, {
      isActive: newStatus,
      trialEndDate: tenant.trialEndDate?.split('T')[0],
    } as any).subscribe({
      next: () => this.loadTenants(),
      error: () => this.loadTenants(),
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
