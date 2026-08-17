import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleService } from '@org/i18n';
import { SubscriptionStore } from '@org/data-access-subscription';
import { BillingRepository } from '@org/data-access-billing';
import { AuthService } from '../../services/auth.service';
import { PaymentService, OfflinePaymentMethod } from '../../services/payment.service';
import { UserSubscriptionPlanDto, PlanFeatureValueDto, CheckoutResponseDto, PaymentSettingsDto } from '@org/generated';
import { finalize, map, switchMap } from 'rxjs/operators';

type ActivationState = 'confirming' | 'activated' | 'failed' | 'timeout';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './plans.html',
  styleUrl: './plans.css',
})
export class PlansPage implements OnInit {
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly billingRepository = inject(BillingRepository);
  private readonly authService = inject(AuthService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly localeService = inject(LocaleService);

  private readonly langTick = signal(0);

  readonly isProcessing = signal(false);
  readonly selectedPlanId = signal<number | null>(null);
  readonly checkoutResult = signal<CheckoutResponseDto | null>(null);
  readonly activationState = signal<ActivationState>('activated');
  readonly error = signal<string | null>(null);

  readonly paymentSettings = signal<PaymentSettingsDto | null>(null);
  readonly showMethodChooser = signal(false);
  readonly showOfflineChooser = signal(false);
  readonly offlinePending = signal<CheckoutResponseDto | null>(null);
  readonly offlineReported = signal(false);
  readonly selectedOfflineMethod = signal<OfflinePaymentMethod | null>(null);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly plans = this.subscriptionStore.plans;
  readonly loading = this.subscriptionStore.loading;
  readonly hasActiveFreePlan = computed(() => {
    const status = this.subscriptionStore.status();
    const currentPlanName = status?.planName;
    if (!this.isLoggedIn() || !status?.isActive || !currentPlanName) return false;
    const freePlan = this.plans().find((plan) => (plan.price ?? 0) <= 0);
    return !!freePlan && freePlan.name === currentPlanName;
  });
  readonly paymentMode = computed(() => {
    const settings = this.paymentSettings();
    return settings?.isActive ? settings.paymentMode ?? 'online' : 'online';
  });
  readonly offlineAvailable = computed(() => {
    const mode = this.paymentMode();
    return mode === 'offline' || mode === 'both';
  });

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update(v => v + 1));
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnInit(): void {
    this.subscriptionStore.loadPlans().subscribe({ error: () => {} });
    const userId = this.authService.getSession()?.userId;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
      this.billingRepository.getPaymentSettings().subscribe({
        next: (settings) => this.paymentSettings.set(settings),
        error: () => {},
      });
    }
  }

  isActiveFreePlan(plan: UserSubscriptionPlanDto): boolean {
    return this.hasActiveFreePlan() && (plan.price ?? 0) <= 0;
  }

  selectPlan(plan: UserSubscriptionPlanDto): void {
    if (this.isProcessing() || this.checkoutResult() || this.offlinePending()) return;
    if (this.isActiveFreePlan(plan)) return;

    if (!this.isLoggedIn()) {
      this.router.navigate(['/register']);
      return;
    }

    const planId = plan.id ?? 0;
    this.selectedPlanId.set(planId);
    this.error.set(null);

    if (this.paymentMode() === 'both') {
      this.showMethodChooser.set(true);
      return;
    }

    if (this.paymentMode() === 'offline') {
      this.showOfflineChooser.set(true);
      return;
    }

    this.startOnlineCheckout(planId);
  }

  chooseOnline(): void {
    this.showMethodChooser.set(false);
    const planId = this.selectedPlanId();
    if (planId != null) this.startOnlineCheckout(planId);
  }

  chooseOffline(): void {
    this.showMethodChooser.set(false);
    this.showOfflineChooser.set(true);
  }

  cancelChooser(): void {
    this.showMethodChooser.set(false);
    this.showOfflineChooser.set(false);
    this.selectedPlanId.set(null);
  }

  selectOfflineMethod(method: OfflinePaymentMethod): void {
    const planId = this.selectedPlanId();
    if (planId == null || this.isProcessing()) return;

    this.selectedOfflineMethod.set(method);
    this.showOfflineChooser.set(false);
    this.isProcessing.set(true);

    this.paymentService.checkout(planId, method).pipe(
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: (checkout) => {
        if (checkout.status === 'pending_manual') {
          this.offlinePending.set(checkout);
          this.offlineReported.set(false);
        } else if (checkout.success && checkout.orderId) {
          this.checkoutResult.set(checkout);
          this.activationState.set('confirming');
          this.confirmPayment(checkout.orderId);
        } else {
          this.error.set(this.t('plans.errors.checkout'));
          this.selectedPlanId.set(null);
        }
      },
      error: () => {
        console.error('Offline checkout failed');
        this.error.set(this.t('plans.errors.checkout'));
        this.selectedPlanId.set(null);
      },
    });
  }

  reportOfflineDone(): void {
    const transactionId = this.offlinePending()?.transactionId;
    if (transactionId == null || this.isProcessing()) return;

    this.isProcessing.set(true);
    this.paymentService.reportOfflinePayment(transactionId).pipe(
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: () => {
        this.offlineReported.set(true);
      },
      error: () => {
        this.error.set(this.t('plans.errors.report'));
      },
    });
  }

  backToPlans(): void {
    this.offlinePending.set(null);
    this.offlineReported.set(false);
    this.selectedOfflineMethod.set(null);
    this.selectedPlanId.set(null);
    this.error.set(null);
  }

  private startOnlineCheckout(planId: number): void {
    this.isProcessing.set(true);

    this.paymentService.checkout(planId).pipe(
      switchMap((checkout) => {
        if (!checkout.success || !checkout.orderId) {
          throw new Error('Checkout failed');
        }
        return this.paymentService.openRazorpay(checkout).pipe(
          map((outcome) => ({ checkout, outcome })),
        );
      }),
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: ({ checkout, outcome }) => {
        if (outcome === 'success') {
          this.checkoutResult.set(checkout);
          this.activationState.set('confirming');
          this.confirmPayment(checkout.orderId ?? '');
        } else if (outcome === 'failed') {
          this.error.set(this.t('plans.paymentFailed'));
          this.selectedPlanId.set(null);
        } else {
          this.selectedPlanId.set(null);
        }
      },
      error: () => {
        console.error('Checkout failed');
        this.error.set(this.t('plans.errors.checkout'));
        this.selectedPlanId.set(null);
      },
    });
  }

  private confirmPayment(orderId: string): void {
    let attempts = 0;
    const check = (): void => {
      attempts++;
      this.paymentService.getPaymentStatus(orderId).subscribe({
        next: (status) => {
          const txStatus = status?.status?.toLowerCase();
          if (txStatus === 'success' || txStatus === 'paid' || txStatus === 'captured') {
            this.activationState.set('activated');
            const userId = this.authService.getSession()?.userId ?? 0;
            if (userId) {
              this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
            }
          } else if (txStatus === 'failed') {
            this.activationState.set('failed');
          } else if (attempts < 10) {
            setTimeout(check, 3000);
          } else {
            this.activationState.set('timeout');
          }
        },
        error: () => {
          if (attempts < 10) {
            setTimeout(check, 3000);
          } else {
            this.activationState.set('timeout');
          }
        },
      });
    };
    check();
  }

  goToProfiles(): void {
    this.router.navigate(['/search']);
  }

  formatPrice(price?: number): string {
    this.langTick();
    if (!price) return this.t('plans.free');
    return this.localeService.formatCurrency(price);
  }

  formatDuration(months?: number): string {
    this.langTick();
    if (!months) return '';
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return years === 1 ? this.t('plans.oneYear') : this.translate.instant('plans.years', { count: years });
    }
    return months === 1 ? this.t('plans.oneMonth') : this.translate.instant('plans.months', { count: months });
  }

  formatFeatureValue(feature: PlanFeatureValueDto): string {
    if (!feature) return '';
    const name = feature.name ?? feature.code ?? '';
    const value = feature.value ?? '';
    switch (feature.dataType) {
      case 'Boolean':
        return name;
      default:
        return value ? `${name}: ${value}` : name;
    }
  }

  groupFeatures(features?: PlanFeatureValueDto[]): { category: string; items: PlanFeatureValueDto[] }[] {
    const groups = new Map<string, PlanFeatureValueDto[]>();
    for (const feature of features ?? []) {
      const category = feature.category || 'General';
      const list = groups.get(category) ?? [];
      list.push(feature);
      groups.set(category, list);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  }
}
