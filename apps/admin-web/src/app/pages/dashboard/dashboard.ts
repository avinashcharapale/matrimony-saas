import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { UserStore } from '@org/data-access-user';
import { ProfileStore } from '@org/data-access-profile';
import { ProfileClient, ProfileStatsDto, SubscriptionClient } from '@org/generated';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard">
      <div class="page-title">
        <h1>Dashboard</h1>
        <p>Welcome to the Matrimony Admin Panel</p>
      </div>

      <div class="stats-grid">
        <a routerLink="/users" class="stat-card stat-card--users">
          <div class="stat-icon-wrapper">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Users</span>
            <span class="stat-value">{{ userCount() }}</span>
          </div>
          <mat-icon class="stat-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/profiles" class="stat-card stat-card--profiles">
          <div class="stat-icon-wrapper">
            <mat-icon>person_search</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Active Profiles</span>
            <span class="stat-value">{{ profileStats()?.totalProfiles ?? 0 }}</span>
          </div>
          <mat-icon class="stat-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/subscriptions" class="stat-card stat-card--subscription">
          <div class="stat-icon-wrapper">
            <mat-icon>card_membership</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Subscription Status</span>
            <span class="stat-value stat-value--text">
              {{ subStatus() === 'Active' ? 'Active' : subStatus() === 'Trial' ? 'Trial' : 'None' }}
            </span>
          </div>
          <mat-icon class="stat-arrow">arrow_forward</mat-icon>
        </a>

        <a routerLink="/subscriptions" class="stat-card stat-card--plan">
          <div class="stat-icon-wrapper">
            <mat-icon>workspace_premium</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Current Plan</span>
            <span class="stat-value stat-value--text">{{ planName() }}</span>
          </div>
          <mat-icon class="stat-arrow">arrow_forward</mat-icon>
        </a>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      position: relative;
    }

    .page-title {
      margin-bottom: 2rem;
    }

    .page-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .page-title p {
      margin: 4px 0 0;
      font-size: 14px;
      color: #757575;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 4px solid transparent;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .stat-card--users { border-left-color: #1976d2; }
    .stat-card--profiles { border-left-color: #388e3c; }
    .stat-card--subscription { border-left-color: #f57c00; }
    .stat-card--plan { border-left-color: #7b1fa2; }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card--users .stat-icon-wrapper { background: #e3f2fd; color: #1976d2; }
    .stat-card--profiles .stat-icon-wrapper { background: #e8f5e9; color: #388e3c; }
    .stat-card--subscription .stat-icon-wrapper { background: #fff3e0; color: #f57c00; }
    .stat-card--plan .stat-icon-wrapper { background: #f3e5f5; color: #7b1fa2; }

    .stat-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .stat-label {
      font-size: 13px;
      color: #757575;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.2;
    }

    .stat-value--text {
      font-size: 18px;
      font-weight: 600;
    }

    .stat-arrow {
      color: #bdbdbd;
      flex-shrink: 0;
    }

    .loading-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `],
})
export class Dashboard {
  private readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);
  private readonly profileClient = inject(ProfileClient);
  private readonly subscriptionClient = inject(SubscriptionClient);

  readonly userCount = signal(0);
  readonly profileStats = signal<ProfileStatsDto | null>(null);
  readonly loading = signal(true);

  readonly subStatus = signal('None');
  readonly planName = signal('No Plan');

  constructor() {
    effect(() => {
      const session = this.authStore.session();
      if (!session) return;

      const tid = session.tenantId;
      if (tid) {
        this.userStore.loadUsersByTenant(tid).subscribe((users) => {
          this.userCount.set(Array.isArray(users) ? users.length : 0);
        });

        this.subscriptionClient.getTenantSubscriptionStatus(tid).subscribe({
          next: (s) => {
            if (s) {
              if (s.isTrial) {
                this.subStatus.set('Trial');
              } else if (s.isActive) {
                this.subStatus.set('Active');
              } else {
                this.subStatus.set('Inactive');
              }
              this.planName.set(s.planName ?? 'No Plan');
            }
          },
        });
      }

      this.profileClient.getProfileStats().subscribe((stats) => {
        this.profileStats.set(stats);
      });

      this.loading.set(false);
    });
  }
}
