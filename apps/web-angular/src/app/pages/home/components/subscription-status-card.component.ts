import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubscriptionStatusDto } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-subscription-status-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="subscription-card" [class]="cardClass()">
      @if (loading) {
        <div class="sub-loading">
          <span class="sub-loading-dot"></span>
          <span class="sub-loading-dot"></span>
          <span class="sub-loading-dot"></span>
        </div>
      } @else if (status()) {
        <div class="sub-header">
          <span class="sub-icon">{{ icon() }}</span>
          <span class="sub-badge" [class]="badgeClass()">{{ badgeLabel() }}</span>
        </div>

        <p class="sub-plan-name">{{ status()!.planName ?? 'Unknown Plan' }}</p>

        <div class="sub-details">
          @if (status()!.startDate) {
            <div class="sub-row">
              <span class="sub-label">Effective</span>
              <span class="sub-value">{{ formatDate(status()!.startDate!) }}</span>
            </div>
          }
          @if (status()!.expiresAt) {
            <div class="sub-row">
              <span class="sub-label">Expires</span>
              <span class="sub-value">{{ formatDate(status()!.expiresAt!) }}</span>
            </div>
          }
          @if (daysRemaining() !== null) {
            <div class="sub-countdown" [class.urgent]="daysRemaining()! <= 15">
              <span class="sub-countdown-value">{{ daysRemaining() }}</span>
              <span class="sub-countdown-label">days remaining</span>
            </div>
          }
          @if (status()!.isTrial && status()!.expiresAt) {
            <div class="sub-countdown">
              <span class="sub-countdown-value">{{ daysUntilTrialEnd() }}</span>
              <span class="sub-countdown-label">days trial left</span>
            </div>
          }
        </div>

        @if (!status()!.isActive && !status()!.isTrial) {
          <a routerLink="/plans" class="sub-cta sub-cta--alert">
            {{ status()!.isExpired ? 'Renew Now' : 'Choose a Plan' }} &rarr;
          </a>
        } @else {
          <a routerLink="/plans" class="sub-cta sub-cta--soft">Manage Plan &rarr;</a>
        }
      } @else {
        <div class="sub-header">
          <span class="sub-icon">&#9744;</span>
          <span class="sub-badge sub-badge--none">No Plan</span>
        </div>
        <p class="sub-empty-text">You don't have an active subscription yet.</p>
        <a routerLink="/plans" class="sub-cta sub-cta--alert">Choose a Plan &rarr;</a>
      }
    </div>
  `,
  styleUrl: '../home.css',
})
export class SubscriptionStatusCardComponent {
  @Input() status: SubscriptionStatusDto | null = null;
  @Input() loading = false;

  readonly cardClass = computed(() => {
    const s = this.status;
    if (!s) return 'subscription-card subscription-card--none';
    if (s.isTrial) return 'subscription-card subscription-card--trial';
    if (s.isActive) return 'subscription-card subscription-card--active';
    return 'subscription-card subscription-card--expired';
  });

  readonly icon = computed(() => {
    const s = this.status;
    if (!s) return '\u25CB';
    if (s.isTrial) return '\u2726';
    if (s.isActive) return '\u2605';
    return '\u26A0';
  });

  readonly badgeClass = computed(() => {
    const s = this.status;
    if (!s) return 'sub-badge sub-badge--none';
    if (s.isTrial) return 'sub-badge sub-badge--trial';
    if (s.isActive) return 'sub-badge sub-badge--active';
    return 'sub-badge sub-badge--expired';
  });

  readonly badgeLabel = computed(() => {
    const s = this.status;
    if (!s) return 'No Plan';
    if (s.isTrial) return 'Trial';
    if (s.isActive) return 'Active';
    return 'Expired';
  });

  readonly daysRemaining = computed(() => {
    const s = this.status;
    if (!s?.expiresAt || (!s.isActive && !s.isTrial)) return null;
    const expiry = new Date(s.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  });

  readonly daysUntilTrialEnd = computed(() => {
    const s = this.status;
    if (!s?.expiresAt || !s.isTrial) return 0;
    const expiry = new Date(s.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  });

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
