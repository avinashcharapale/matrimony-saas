import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '@org/data-access-auth';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SubscriptionPlanDto } from '@org/generated';
import { PageHeaderComponent, StatusBadgeComponent } from '@org/shared-ui';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="subscriptions-page">
      <ui-page-header
        title="Subscriptions"
        subtitle="View subscription status and available plans"
      />

      <div class="status-section">
        <div class="status-card">
          <div class="status-card-header">
            <mat-icon class="status-icon">card_membership</mat-icon>
            <h3>Current Subscription</h3>
          </div>

          @if (loading()) {
            <div class="status-loading">
              <mat-spinner diameter="32"></mat-spinner>
              <span>Loading subscription status...</span>
            </div>
          } @else if (subscriptionStatus()) {
            <div class="status-details">
              <div class="status-row">
                <span class="status-label">Plan</span>
                <span class="status-value">{{ subscriptionStatus()?.planName ?? 'No Plan' }}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Status</span>
                <span class="status-value">
                  <ui-status-badge
                    [status]="getStatusText()"
                  ></ui-status-badge>
                </span>
              </div>
              <div class="status-row">
                <span class="status-label">Trial</span>
                <span class="status-value">
                  {{ subscriptionStatus()?.isTrial ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="status-row">
                <span class="status-label">Start Date</span>
                <span class="status-value">{{ formatDate(subscriptionStatus()?.startDate) }}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Expiry Date</span>
                <span class="status-value">{{ formatDate(subscriptionStatus()?.expiresAt) }}</span>
              </div>
            </div>
          } @else {
            <div class="status-empty">
              <mat-icon>info_outline</mat-icon>
              <span>No active subscription</span>
            </div>
          }
        </div>
      </div>

      <div class="plans-section">
        <h2 class="section-title">Available Plans</h2>

        @if (loadingPlans()) {
          <div class="plans-loading">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Loading plans...</span>
          </div>
        } @else if (plans().length === 0) {
          <div class="plans-empty">
            <mat-icon>inventory_2</mat-icon>
            <span>No plans available</span>
          </div>
        } @else {
          <div class="plans-grid">
            @for (plan of plans(); track plan.id) {
              <div class="plan-card" [class.plan-popular]="plan.isPopular">
                @if (plan.isPopular) {
                  <div class="popular-badge">Popular</div>
                }
                <div class="plan-header">
                  <h3>{{ plan.name }}</h3>
                  @if (plan.description) {
                    <p class="plan-desc">{{ plan.description }}</p>
                  }
                </div>
                <div class="plan-pricing">
                  <span class="plan-price">{{ plan.currency ?? 'INR' }} {{ plan.price ?? 0 }}</span>
                  <span class="plan-duration">
                    / {{ plan.durationMonths ?? 1 }} {{ (plan.durationMonths ?? 1) === 1 ? 'month' : 'months' }}
                  </span>
                </div>
                @if (plan.features?.length) {
                  <ul class="plan-features">
                    @for (feature of plan.features; track feature.code) {
                      <li>
                        <mat-icon>check_circle</mat-icon>
                        {{ feature.name || feature.code }}
                      </li>
                    }
                  </ul>
                }
                <div class="plan-footer">
                  <ui-status-badge
                    [status]="plan.isActive ? 'Active' : 'Inactive'"
                  ></ui-status-badge>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .subscriptions-page {
      position: relative;
    }

    .status-section {
      margin-bottom: 2.5rem;
    }

    .status-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      max-width: 560px;
    }

    .status-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1.25rem;
    }

    .status-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1976d2;
    }

    .status-card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .status-loading,
    .status-empty {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1.5rem 0;
      color: #757575;
      font-size: 14px;
    }

    .status-details {
      display: flex;
      flex-direction: column;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .status-row:last-child {
      border-bottom: none;
    }

    .status-label {
      font-size: 14px;
      color: #757575;
    }

    .status-value {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .section-title {
      margin: 0 0 1.5rem;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .plans-loading,
    .plans-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 3rem;
      color: #757575;
      font-size: 14px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .plan-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      position: relative;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .plan-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .plan-card.plan-popular {
      border-color: #1976d2;
    }

    .popular-badge {
      position: absolute;
      top: -10px;
      right: 16px;
      background: #1976d2;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .plan-header h3 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
    }

    .plan-desc {
      margin: 0 0 12px;
      font-size: 13px;
      color: #757575;
      line-height: 1.4;
    }

    .plan-pricing {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .plan-price {
      font-size: 28px;
      font-weight: 700;
      color: #1976d2;
    }

    .plan-duration {
      font-size: 14px;
      color: #757575;
    }

    .plan-features {
      list-style: none;
      margin: 0 0 16px;
      padding: 0;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;
      color: #424242;
    }

    .plan-features li mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #388e3c;
    }

    .plan-footer {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  `],
})
export class Subscriptions implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly subscriptionStore = inject(SubscriptionStore);

  readonly loading = signal(true);
  readonly loadingPlans = signal(true);
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly plans = this.subscriptionStore.plans;

  ngOnInit(): void {
    const session = this.authStore.session();
    if (session) {
      this.subscriptionStore.loadSubscriptionStatus(session.userId).subscribe(() => {
        this.loading.set(false);
      });

      this.subscriptionStore.loadPlans().subscribe(() => {
        this.loadingPlans.set(false);
      });
    } else {
      this.loading.set(false);
      this.loadingPlans.set(false);
    }
  }

  getStatusText(): string {
    const s = this.subscriptionStatus();
    if (!s) return 'None';
    if (s.isTrial) return 'Trial';
    if (s.isActive) return 'Active';
    if (s.isExpired) return 'Expired';
    return 'Inactive';
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
