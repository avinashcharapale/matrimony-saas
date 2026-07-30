import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SubscriptionClient,
  SubscriptionPlanDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  TenantFeatureValueDto,
} from '@org/generated';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent, ConfirmDialogData, PaginatorComponent, createSort, createPagination } from '@org/shared-ui';
import { PlanFormDialogComponent, PlanFormDialogData } from './plan-form-dialog/plan-form-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, PaginatorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tenant Subscription Plans</h1>
          <p class="subtitle">Manage subscription plans available for tenants across the platform.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Plan
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading plans...</div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">S</div>
          <p>No subscription plans configured.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="sort.toggleSort('code')">Code <mat-icon class="sort-icon">{{ sort.sortIcon('code') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('name')">Name <mat-icon class="sort-icon">{{ sort.sortIcon('name') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('price')">Price <mat-icon class="sort-icon">{{ sort.sortIcon('price') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('durationMonths')">Duration (mo) <mat-icon class="sort-icon">{{ sort.sortIcon('durationMonths') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('currency')">Currency <mat-icon class="sort-icon">{{ sort.sortIcon('currency') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('isPopular')">Popular <mat-icon class="sort-icon">{{ sort.sortIcon('isPopular') }}</mat-icon></th>
                <th>Tenant Features</th>
                <th class="sortable" (click)="sort.toggleSort('isActive')">Status <mat-icon class="sort-icon">{{ sort.sortIcon('isActive') }}</mat-icon></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (plan of pagination.paginated(); track plan.id) {
                <tr>
                  <td class="cell-code">{{ plan.code }}</td>
                  <td class="cell-bold">{{ plan.name }}</td>
                  <td class="cell-price">{{ plan.price ?? 0 | number:'1.2-2' }}</td>
                  <td class="cell-center">{{ plan.durationMonths }}</td>
                  <td class="cell-center">{{ plan.currency ?? 'USD' }}</td>
                  <td class="cell-center">
                    @if (plan.isPopular) {
                      <span class="popular-badge">Popular</span>
                    } @else {
                      <span class="muted">—</span>
                    }
                  </td>
                  <td class="cell-center">
                    @if (plan.tenantFeatures?.length) {
                      <button mat-icon-button (click)="toggleTenantFeatures(plan.id)" title="View tenant features">
                        <mat-icon>{{ expandedTenantId() === plan.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      </button>
                    } @else {
                      <span class="muted">—</span>
                    }
                  </td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="plan.isActive" [class.inactive]="!plan.isActive">
                      {{ plan.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Edit" (click)="openEditDialog(plan)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Delete" (click)="confirmDelete(plan)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
                @if (expandedTenantId() === plan.id) {
                  <tr class="features-row">
                    <td colspan="8">
                      <div class="features-grid">
                        @for (f of plan.tenantFeatures; track f.featureCode) {
                          <div class="feature-tag">{{ f.displayName || f.featureCode }}: {{ f.value }}</div>
                        }
                      </div>
                    </td>
                  </tr>
                }
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
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #fff3e0; color: #e65100; border-radius: 12px;
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
    .cell-code { font-family: monospace; color: #7b1fa2; font-weight: 600; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-price { font-weight: 600; color: #2e7d32; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .muted { color: #ccc; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; line-height: 1; }
    .popular-badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600; background: #fff3e0; color: #e65100;
    }
    .features-row td { padding: 0.75rem 1rem !important; background: #fafafa; }
    .features-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .feature-tag {
      padding: 0.25rem 0.625rem; background: #f3e5f5; color: #7b1fa2;
      border-radius: 4px; font-size: 0.8125rem; font-weight: 500;
    }
  `],
})
export class System implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly expandedTenantId = signal<number | undefined>(undefined);

  readonly sort = createSort();

  private readonly sorted = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.plans();
    const dir = this.sort.sortDirection();
    const data = [...this.plans()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'code': cmp = (a.code || '').localeCompare(b.code || ''); break;
        case 'name': cmp = (a.name || '').localeCompare(b.name || ''); break;
        case 'price': cmp = (a.price ?? 0) - (b.price ?? 0); break;
        case 'durationMonths': cmp = (a.durationMonths ?? 0) - (b.durationMonths ?? 0); break;
        case 'currency': cmp = (a.currency || '').localeCompare(b.currency || ''); break;
        case 'isPopular': cmp = (a.isPopular ? 1 : 0) - (b.isPopular ? 1 : 0); break;
        case 'isActive': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sorted);

  ngOnInit(): void {
    this.loadPlans();
  }

  toggleTenantFeatures(planId: number | undefined): void {
    this.expandedTenantId.update(id => id === planId ? undefined : planId);
  }

  loadPlans(): void {
    this.loading.set(true);
    this.subscriptionClient.getAllSubscriptionPlansAdmin().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openAddDialog(): void {
    const data: PlanFormDialogData = { mode: 'create' };
    const dialogRef = this.dialog.open(PlanFormDialogComponent, { data });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const dto: CreateSubscriptionPlanRequest = {
        code: result.code!,
        name: result.name!,
        description: result.description,
        price: result.price!,
        durationMonths: result.durationMonths!,
        currency: result.currency ?? 'USD',
        displayOrder: result.displayOrder,
        isPopular: result.isPopular ?? false,
        isActive: result.isActive ?? true,
      };

      this.subscriptionClient.createSubscriptionPlan(dto).subscribe({
        next: () => this.loadPlans(),
      });
    });
  }

  openEditDialog(plan: SubscriptionPlanDto): void {
    const data: PlanFormDialogData = { mode: 'edit', plan };
    const dialogRef = this.dialog.open(PlanFormDialogComponent, { data });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const dto: UpdateSubscriptionPlanRequest = {
        name: result.name!,
        description: result.description,
        price: result.price!,
        durationMonths: result.durationMonths!,
        currency: result.currency ?? 'USD',
        displayOrder: result.displayOrder,
        isPopular: result.isPopular ?? false,
        isActive: result.isActive ?? true,
      };

      this.subscriptionClient.updateSubscriptionPlan(plan.id!, dto).subscribe({
        next: () => this.loadPlans(),
      });
    });
  }

  confirmDelete(plan: SubscriptionPlanDto): void {
    const data: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: `Are you sure you want to delete plan **${plan.name}**? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.subscriptionClient.deleteSubscriptionPlan(plan.id!).subscribe({
        next: () => this.loadPlans(),
      });
    });
  }
}
