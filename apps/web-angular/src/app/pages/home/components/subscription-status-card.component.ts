import { Component, ChangeDetectionStrategy, Input, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleDatePipe } from '@org/i18n';
import { SubscriptionStatusDto } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-subscription-status-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LocaleDatePipe],
  templateUrl: './subscription-status-card.component.html',
  styleUrl: '../../../components/shared-sidebar/shared-sidebar.css',
})
export class SubscriptionStatusCardComponent {
  @Input() status: SubscriptionStatusDto | null = null;
  @Input() loading = false;

  private readonly translate = inject(TranslateService);

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
    if (!s) return this.translate.instant('subscription.noPlan');
    if (s.isTrial) return this.translate.instant('subscription.trial');
    if (s.isActive) return this.translate.instant('subscription.active');
    return this.translate.instant('subscription.expired');
  });

  readonly planName = computed(() => {
    const s = this.status;
    if (!s) return '';
    return (
      s.planName ??
      (s.isActive || s.isTrial
        ? this.translate.instant('subscription.activePlan')
        : this.translate.instant('subscription.noPlan'))
    );
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
}
