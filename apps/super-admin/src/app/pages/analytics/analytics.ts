import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantClient, SubscriptionClient, TenantDto, SubscriptionPlanDto } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Platform Analytics</h1>
          <p class="subtitle">Usage statistics and performance metrics across all tenants.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading analytics...</div>
      } @else {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon tenants-icon">T</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalTenants() }}</span>
              <span class="stat-label">Total Tenants</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon users-icon">U</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalUsers() }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon profiles-icon">P</div>
            <div class="stat-info">
              <span class="stat-value">{{ activeTenants() }}</span>
              <span class="stat-label">Active Tenants</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon plans-icon">S</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalPlans() }}</span>
              <span class="stat-label">Subscription Plans</span>
            </div>
          </div>
        </div>

        <div class="section-row">
          <div class="card">
            <h3>Tenant Overview</h3>
            <div class="overview-list">
              @for (tenant of tenants(); track tenant.tenantId) {
                <div class="overview-item">
                  <div class="overview-item-info">
                    <span class="overview-name">{{ tenant.tenantName }}</span>
                    <span class="overview-domain">{{ tenant.domainName }}</span>
                  </div>
                  <div class="overview-item-meta">
                    <span class="badge" [class.active]="tenant.isActive" [class.inactive]="!tenant.isActive">
                      {{ tenant.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    <span class="overview-users">{{ tenant.userCount ?? 0 }} users</span>
                  </div>
                </div>
              } @empty {
                <p class="empty-text">No tenants available.</p>
              }
            </div>
          </div>

          <div class="card">
            <h3>Plan Distribution</h3>
            <div class="overview-list">
              @for (plan of plans(); track plan.id) {
                <div class="overview-item">
                  <div class="overview-item-info">
                    <span class="overview-name">{{ plan.name }}</span>
                    <span class="overview-domain">{{ plan.code }}</span>
                  </div>
                  <div class="overview-item-meta">
                    <span class="plan-price">{{ plan.currency ?? 'USD' }} {{ plan.price ?? 0 }}</span>
                    <span class="plan-duration">{{ plan.durationMonths }}mo</span>
                  </div>
                </div>
              } @empty {
                <p class="empty-text">No plans configured.</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem; margin-bottom: 2rem;
    }
    .stat-card {
      background: white; border-radius: 10px; padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 1rem;
    }
    .stat-icon {
      width: 52px; height: 52px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; font-size: 1.25rem;
      font-weight: 700; flex-shrink: 0;
    }
    .tenants-icon { background: #ede7f6; color: #7b1fa2; }
    .users-icon { background: #e3f2fd; color: #1565c0; }
    .profiles-icon { background: #e8f5e9; color: #2e7d32; }
    .plans-icon { background: #fff3e0; color: #e65100; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #2c003e; }
    .stat-label { font-size: 0.8125rem; color: #888; margin-top: 0.125rem; }
    .section-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media (max-width: 768px) { .section-row { grid-template-columns: 1fr; } }
    .card {
      background: white; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      padding: 1.5rem;
    }
    .card h3 { font-size: 1rem; color: #2c003e; margin-bottom: 1rem; }
    .overview-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .overview-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem; background: #fafafa; border-radius: 6px;
    }
    .overview-item-info { display: flex; flex-direction: column; }
    .overview-name { font-size: 0.875rem; font-weight: 500; color: #333; }
    .overview-domain { font-size: 0.75rem; color: #888; }
    .overview-item-meta { display: flex; align-items: center; gap: 0.75rem; }
    .overview-users { font-size: 0.75rem; color: #888; }
    .plan-price { font-size: 0.875rem; font-weight: 600; color: #7b1fa2; }
    .plan-duration { font-size: 0.75rem; color: #888; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .empty-text { color: #aaa; font-size: 0.875rem; text-align: center; padding: 1rem; }
  `],
})
export class Analytics implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly tenants = signal<TenantDto[]>([]);
  readonly plans = signal<SubscriptionPlanDto[]>([]);

  readonly totalTenants = signal(0);
  readonly totalUsers = signal(0);
  readonly activeTenants = signal(0);
  readonly totalPlans = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 2) {
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    };

    this.tenantClient.getAll().subscribe({
      next: (data) => {
        const list = data ?? [];
        this.tenants.set(list);
        this.totalTenants.set(list.length);
        this.totalUsers.set(list.reduce((sum, t) => sum + (t.userCount ?? 0), 0));
        this.activeTenants.set(list.filter((t) => t.isActive).length);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.subscriptionClient.getAllSubscriptionPlansAdmin().subscribe({
      next: (data) => {
        const list = data ?? [];
        this.plans.set(list);
        this.totalPlans.set(list.length);
        checkDone();
      },
      error: () => checkDone(),
    });
  }
}
