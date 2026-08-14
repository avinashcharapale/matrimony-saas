import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  SubscriptionClient,
  TenantClient,
  TenantDto,
  SubscriptionPlanDto,
  TenantSubscriptionDto,
  TenantSubscriptionEventDto,
  CreateTenantSubscriptionRequest,
  UpdateTenantSubscriptionRequest,
  PlanFeatureValueDto,
  TenantFeatureValueDto,
} from '@org/generated';
import { ConfirmDialogComponent, ConfirmDialogData, PaginatorComponent, createSort, createPagination } from '@org/shared-ui';
import { AssignPlanDialogComponent, PlanFormDialogData } from './assign-plan-dialog/assign-plan-dialog.component';
import { RenewSubscriptionDialogComponent, RenewSubscriptionDialogData } from './renew-subscription-dialog/renew-subscription-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-plan',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule, MatIconModule, PaginatorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/tenants">Tenants</a>
            <span class="sep">/</span>
            <span>Tenant #{{ tenantId() }} Plan</span>
          </div>
          <h1>Tenant Subscription Plan</h1>
          <p class="subtitle">
            @if (tenant(); as t) {
              {{ t.name || t.tenantCode }}
            } @else {
              Loading tenant...
            }
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="openAssignDialog()">
          <mat-icon>add</mat-icon> Assign Plan
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading subscription data...</div>
      } @else {
        @if (errorMessage(); as msg) {
          <div class="error-banner">
            <span>{{ msg }}</span>
            <button mat-icon-button (click)="errorMessage.set('')" title="Dismiss"><mat-icon>close</mat-icon></button>
          </div>
        }
        <section class="card current-subscription">
          <h2>Current Subscription</h2>
          @if (activeSubscription(); as sub) {
            <div class="sub-details">
              <div class="sub-field">
                <span class="sub-label">Plan</span>
                <span class="sub-value">{{ sub.planName }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Start Date</span>
                <span class="sub-value">{{ sub.startDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">End Date</span>
                <span class="sub-value">{{ sub.endDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Duration</span>
                <span class="sub-value">{{ sub.durationMonths ? sub.durationMonths + ' months' : '—' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Status</span>
                <span class="badge" [class.active]="sub.isActive" [class.inactive]="!sub.isActive">
                  {{ sub.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            @if (sub.isActive) {
              <div class="sub-actions">
                <button mat-flat-button color="primary" [disabled]="renewing()" (click)="openRenewDialog()">
                  @if (renewing()) { Saving... } @else { Renew }
                </button>
                <button mat-flat-button color="warn" [disabled]="cancelling()" (click)="confirmCancel()">
                  @if (cancelling()) { Cancelling... } @else { Cancel Subscription }
                </button>
              </div>
            }
          } @else {
            <div class="empty-state">
              <div class="empty-icon">P</div>
              <p>No active subscription</p>
              <button mat-flat-button color="primary" (click)="openRenewDialog()">Renew</button>
            </div>
          }
        </section>

        @if (upcomingSubscription(); as upcoming) {
          <section class="card upcoming-section">
            <h2>Upcoming Subscription</h2>
            <div class="sub-details">
              <div class="sub-field">
                <span class="sub-label">Plan</span>
                <span class="sub-value">{{ upcoming.planName }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Start Date</span>
                <span class="sub-value">{{ upcoming.startDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">End Date</span>
                <span class="sub-value">{{ upcoming.endDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Status</span>
                <span class="badge upcoming">Upcoming</span>
              </div>
            </div>
          </section>
        }

        @if (pastSubscriptions().length > 0) {
          <section class="card history-section">
            <h2>Subscription History</h2>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="sortable" (click)="hSort.toggleSort('planName')">Plan <mat-icon class="sort-icon">{{ hSort.sortIcon('planName') }}</mat-icon></th>
                    <th>Features</th>
                    <th class="sortable" (click)="hSort.toggleSort('startDate')">Start Date <mat-icon class="sort-icon">{{ hSort.sortIcon('startDate') }}</mat-icon></th>
                    <th class="sortable" (click)="hSort.toggleSort('endDate')">End Date <mat-icon class="sort-icon">{{ hSort.sortIcon('endDate') }}</mat-icon></th>
                    <th class="sortable" (click)="hSort.toggleSort('isActive')">Status <mat-icon class="sort-icon">{{ hSort.sortIcon('isActive') }}</mat-icon></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sub of hPagination.paginated(); track sub.subscriptionId) {
                    <tr>
                      <td class="cell-bold">{{ sub.planName || '—' }}</td>
                      <td>
                        @if (getPlanFeatures(sub.subscriptionPlanId).length > 0) {
                          <button mat-icon-button (click)="toggleFeatures(sub.subscriptionId)" title="View features">
                            <mat-icon>{{ expandedId() === sub.subscriptionId ? 'expand_less' : 'expand_more' }}</mat-icon>
                          </button>
                        }
                      </td>
                      <td>{{ sub.startDate | date:'mediumDate' }}</td>
                      <td>{{ sub.endDate | date:'mediumDate' }}</td>
                      <td>
                        <span class="badge" [class.expired]="sub.isActive" [class.inactive]="!sub.isActive">
                          {{ sub.isActive ? 'Expired' : 'Cancelled' }}
                        </span>
                      </td>
                      <td>
                        <button mat-stroked-button color="primary" [disabled]="renewing()" (click)="openRenewDialog(sub)">
                          Renew
                        </button>
                      </td>
                    </tr>
                    @if (expandedId() === sub.subscriptionId) {
                      <tr class="features-row">
                        <td colspan="6">
                          <div class="features-grid">
                            @for (f of getPlanFeatures(sub.subscriptionPlanId); track f.featureCode) {
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
                [totalItems]="hPagination.totalItems()"
                [totalPages]="hPagination.totalPages()"
                [currentPage]="hPagination.currentPage()"
                [pageSize]="hPagination.pageSize()"
                (pageChange)="hPagination.goToPage($event)"
                (pageSizeChange)="hPagination.onPageSizeChange($event)"
              />
            </div>
          </section>
        }

        <section class="card history-section">
          <h2>Subscription Events</h2>
          @if (events().length === 0) {
            <div class="empty-state">
              <p>No subscription events yet.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Changed From</th>
                    <th>Changed To</th>
                    <th>When</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  @for (evt of events(); track evt.eventId) {
                    <tr>
                      <td>
                        <span
                          class="badge"
                          [class.active]="evt.eventType === 'Assigned' || evt.eventType === 'Renewed'"
                          [class.planchanged]="evt.eventType === 'PlanChanged'"
                          [class.inactive]="evt.eventType === 'Cancelled'"
                          [class.expired]="evt.eventType === 'Expired'"
                        >{{ evt.eventType }}</span>
                      </td>
                      <td>
                        @if (evt.oldPlanName) {
                          {{ evt.oldPlanName }}
                          @if (evt.oldStartDate || evt.oldEndDate) {
                            <span class="period-note">({{ evt.oldStartDate | date:'mediumDate' }} – {{ evt.oldEndDate | date:'mediumDate' }})</span>
                          }
                        } @else {
                          <span class="muted">—</span>
                        }
                      </td>
                      <td>
                        @if (evt.newPlanName) {
                          {{ evt.newPlanName }}
                          @if (evt.newStartDate || evt.newEndDate) {
                            <span class="period-note">({{ evt.newStartDate | date:'mediumDate' }} – {{ evt.newEndDate | date:'mediumDate' }})</span>
                          }
                        } @else {
                          <span class="muted">—</span>
                        }
                      </td>
                      <td>{{ evt.createdAt | date:'medium' }}</td>
                      <td>{{ evt.triggeredByUserName ?? (evt.triggeredByUserId != null ? 'User #' + evt.triggeredByUserId : 'System') }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <section class="card available-plans">
          <h2>Available Plans</h2>
          <div class="search-bar">
            <input class="search-input" type="text" placeholder="Search plans..." [value]="searchTerm()" (input)="onSearch($event)" />
          </div>
          @if (filtered().length === 0) {
            <div class="empty-state">
              <p>No subscription plans available.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="sortable" (click)="sort.toggleSort('code')">Code <mat-icon class="sort-icon">{{ sort.sortIcon('code') }}</mat-icon></th>
                    <th class="sortable" (click)="sort.toggleSort('name')">Name <mat-icon class="sort-icon">{{ sort.sortIcon('name') }}</mat-icon></th>
                    <th>Features</th>
                    <th class="sortable" (click)="sort.toggleSort('price')">Price <mat-icon class="sort-icon">{{ sort.sortIcon('price') }}</mat-icon></th>
                    <th class="sortable" (click)="sort.toggleSort('durationMonths')">Duration (mo) <mat-icon class="sort-icon">{{ sort.sortIcon('durationMonths') }}</mat-icon></th>
                    <th class="sortable" (click)="sort.toggleSort('currency')">Currency <mat-icon class="sort-icon">{{ sort.sortIcon('currency') }}</mat-icon></th>
                    <th class="sortable" (click)="sort.toggleSort('isActive')">Status <mat-icon class="sort-icon">{{ sort.sortIcon('isActive') }}</mat-icon></th>
                  </tr>
                </thead>
                <tbody>
                  @for (plan of pagination.paginated(); track plan.id) {
                    <tr>
                      <td class="cell-code">{{ plan.code }}</td>
                      <td class="cell-bold">{{ plan.name }}</td>
                      <td>
                        @if (plan.features?.length || plan.tenantFeatures?.length) {
                          <button mat-icon-button (click)="toggleAvailablePlanFeatures(plan.id)" title="View features">
                            <mat-icon>{{ availablePlanExpandedId() === plan.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                          </button>
                        }
                      </td>
                      <td class="cell-price">{{ plan.price ?? 0 | number:'1.2-2' }}</td>
                      <td class="cell-center">{{ plan.durationMonths }}</td>
                      <td class="cell-center">{{ plan.currency ?? 'USD' }}</td>
                      <td class="cell-center">
                        <span class="badge" [class.active]="plan.isActive" [class.inactive]="!plan.isActive">
                          {{ plan.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </tr>
                    @if (availablePlanExpandedId() === plan.id) {
                      <tr class="features-row">
                        <td colspan="7">
                          <div class="features-grid">
                            @if (plan.tenantFeatures?.length) {
                              <div class="feature-group-label" style="margin-top:8px;">Tenant Features</div>
                              @for (f of plan.tenantFeatures; track f.featureCode) {
                                <div class="feature-tag">{{ f.displayName || f.featureCode }}: {{ f.value }}</div>
                              }
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
        </section>
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
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 2rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
      font-weight: 700; margin: 0 auto 1rem;
    }
    .card {
      background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .card h2 { font-size: 1.125rem; color: #2c003e; margin: 0 0 1rem; }
    .current-subscription .sub-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .sub-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .sub-field { display: flex; flex-direction: column; gap: 0.25rem; }
    .sub-label { font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .sub-value { font-size: 0.9375rem; color: #333; font-weight: 500; }
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
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .badge.expired { background: #fff3e0; color: #e65100; }
    .badge.upcoming { background: #ede7f6; color: #4527a0; }
    .badge.planchanged { background: #e3f2fd; color: #1565c0; }
    .upcoming-section .sub-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .period-note { color: #888; font-size: 0.8125rem; }
    .muted { color: #bbb; }
    .history-section .table-wrapper { margin-top: -0.5rem; }
    .features-row td { padding: 0.75rem 1rem !important; background: #fafafa; }
    .features-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .feature-tag {
      padding: 0.25rem 0.625rem; background: #f3e5f5; color: #7b1fa2;
      border-radius: 4px; font-size: 0.8125rem; font-weight: 500;
    }
    .feature-group-label {
      width: 100%;
      font-size: 0.75rem;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .search-bar { margin-bottom: 1rem; }
    .search-input { padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; width: 280px; outline: none; }
    .search-input:focus { border-color: #7b1fa2; }
    .error-banner {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem; margin-bottom: 1rem;
      background: #fbe9e7; color: #c62828; border-radius: 6px; font-size: 0.875rem;
    }
    .error-banner button { color: #c62828; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; line-height: 1; }
  `],
})
export class TenantPlan implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly tenantClient = inject(TenantClient);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly tenantId = signal<number>(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly cancelling = signal(false);
  readonly renewing = signal(false);
  readonly errorMessage = signal('');
  readonly tenant = signal<TenantDto | null>(null);
  readonly subscriptions = signal<TenantSubscriptionDto[]>([]);
  readonly events = signal<TenantSubscriptionEventDto[]>([]);
  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.plans();
    return this.plans().filter(p =>
      p.code?.toLowerCase().includes(term) ||
      p.name?.toLowerCase().includes(term)
    );
  });

  readonly sort = createSort();

  readonly sorted = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.filtered();
    const dir = this.sort.sortDirection();
    const data = [...this.filtered()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'code': cmp = (a.code ?? '').localeCompare(b.code ?? ''); break;
        case 'name': cmp = (a.name ?? '').localeCompare(b.name ?? ''); break;
        case 'price': cmp = (a.price ?? 0) - (b.price ?? 0); break;
        case 'durationMonths': cmp = (a.durationMonths ?? 0) - (b.durationMonths ?? 0); break;
        case 'currency': cmp = (a.currency ?? '').localeCompare(b.currency ?? ''); break;
        case 'isActive': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sorted);

  readonly activeSubscription = computed(() =>
    this.subscriptions().find((s) => this.isInForce(s)) ?? null,
  );

  readonly upcomingSubscription = computed(() => {
    const upcoming = this.subscriptions()
      .filter((s) => s.isActive && this.toDate(s.startDate) > this.today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    return upcoming[0] ?? null;
  });

  readonly latestEndDate = computed(() => {
    const ends = this.subscriptions()
      .map((s) => s.endDate)
      .filter((d): d is string => !!d);
    if (ends.length === 0) return null;
    ends.sort();
    return ends[ends.length - 1];
  });

  private readonly today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  private readonly toDate = (value?: string): Date => {
    const d = value ? new Date(`${value}T00:00:00`) : new Date(NaN);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  private readonly isInForce = (s: TenantSubscriptionDto): boolean => {
    if (!s.isActive) return false;
    const start = this.toDate(s.startDate);
    const end = this.toDate(s.endDate);
    return start <= this.today && end >= this.today;
  };

  private readonly isUpcoming = (s: TenantSubscriptionDto): boolean =>
    s.isActive && this.toDate(s.startDate) > this.today;

  readonly pastSubscriptions = computed(() =>
    this.subscriptions().filter((s) => !this.isInForce(s) && !this.isUpcoming(s)),
  );

  readonly hSort = createSort();

  private readonly sortedHistory = computed(() => {
    const col = this.hSort.sortColumn();
    if (!col) return this.pastSubscriptions();
    const dir = this.hSort.sortDirection();
    const data = [...this.pastSubscriptions()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'planName': cmp = (a.planName ?? '').localeCompare(b.planName ?? ''); break;
        case 'startDate': cmp = (a.startDate ?? '').localeCompare(b.startDate ?? ''); break;
        case 'endDate': cmp = (a.endDate ?? '').localeCompare(b.endDate ?? ''); break;
        case 'isActive': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly hPagination = createPagination(this.sortedHistory);

  readonly expandedId = signal<number | null>(null);
  readonly availablePlanExpandedId = signal<number | undefined>(undefined);

  toggleFeatures(subscriptionId: number): void {
    this.expandedId.update(id => id === subscriptionId ? null : subscriptionId);
  }

  toggleAvailablePlanFeatures(planId: number | undefined): void {
    this.availablePlanExpandedId.update(id => id === planId ? undefined : planId);
  }

  getPlanFeatures(planId: number): TenantFeatureValueDto[] {
    return this.plans().find(p => p.id === planId)?.tenantFeatures ?? [];
  }

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.loadData();
    }
  }

  private loadData(): void {
    this.loading.set(true);
    const tid = this.tenantId();
    this.tenantClient.getById(tid).subscribe({
      next: (t) => this.tenant.set(t),
    });
    this.subscriptionClient.getTenantSubscriptions(tid).subscribe({
      next: (data) => {
        this.subscriptions.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
    this.subscriptionClient.getTenantSubscriptionEvents(tid).subscribe({
      next: (data) => {
        this.events.set(data ?? []);
      },
      error: () => {
        this.events.set([]);
      },
    });
    this.subscriptionClient.getAllSubscriptionPlansAdmin().subscribe({
      next: (data) => {
        this.plans.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
    this.loading.set(false);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.pagination.goToPage(1);
  }

  openAssignDialog(): void {
    const dialogRef = this.dialog.open(AssignPlanDialogComponent, {
      width: '480px',
      data: { plans: this.plans(), tenantId: this.tenantId() } satisfies PlanFormDialogData,
    });

    dialogRef.afterClosed().subscribe((result: CreateTenantSubscriptionRequest | undefined) => {
      if (!result) return;

      this.saving.set(true);
      this.subscriptionClient.createTenantSubscription(result).subscribe({
        next: () => {
          this.saving.set(false);
          this.loadData();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.error ?? 'Failed to assign plan.');
        },
      });
    });
  }

  openRenewDialog(sub?: TenantSubscriptionDto): void {
    const source = sub ?? this.activeSubscription() ?? this.upcomingSubscription() ?? undefined;

    const dialogRef = this.dialog.open(RenewSubscriptionDialogComponent, {
      width: '480px',
      data: {
        tenantId: this.tenantId(),
        plans: this.plans(),
        currentPlanId: source?.subscriptionPlanId,
        planName: source?.planName,
        latestEndDate: this.latestEndDate(),
      } satisfies RenewSubscriptionDialogData,
    });

    dialogRef.afterClosed().subscribe((result: CreateTenantSubscriptionRequest | undefined) => {
      if (!result) return;

      this.renewing.set(true);
      this.subscriptionClient.renewTenantSubscription(result).subscribe({
        next: () => {
          this.renewing.set(false);
          this.loadData();
        },
        error: (err) => {
          this.renewing.set(false);
          this.errorMessage.set(err.error?.error ?? 'Failed to renew subscription.');
        },
      });
    });
  }

  confirmCancel(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Subscription',
        message: 'Are you sure you want to cancel the active subscription for this tenant?',
        confirmText: 'Yes, cancel',
        cancelText: 'No, keep it',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const active = this.activeSubscription();
      if (!active) return;

      this.cancelling.set(true);
      const body: UpdateTenantSubscriptionRequest = { isActive: false };
      this.subscriptionClient.updateTenantSubscription(active.subscriptionId, body).subscribe({
        next: () => {
          this.cancelling.set(false);
          this.loadData();
        },
        error: (err) => {
          this.cancelling.set(false);
          this.errorMessage.set(err.error?.error ?? 'Failed to cancel subscription.');
        },
      });
    });
  }
}
