import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleService } from '@org/i18n';
import { SubscriptionStore } from '@org/data-access-subscription';
import { TenantService } from '../../services/tenant.service';
import { AuthService } from '../../services/auth.service';
import { UserSubscriptionPlanDto, PlanFeatureValueDto } from '@org/generated';
import { finalize } from 'rxjs/operators';

interface CheckoutResult {
  success: boolean;
  subscriptionId: number;
  paymentId: number;
  planName: string;
  startDate: string;
  endDate: string;
  amount: number;
}

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
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly localeService = inject(LocaleService);

  private readonly langTick = signal(0);

  readonly isProcessing = signal(false);
  readonly selectedPlanId = signal<number | null>(null);
  readonly checkoutResult = signal<CheckoutResult | null>(null);
  readonly error = signal<string | null>(null);

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

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update(v => v + 1));
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnInit(): void {
    this.subscriptionStore.loadPlans().subscribe();
    const userId = this.authService.getSession()?.userId;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }
  }

  isActiveFreePlan(plan: UserSubscriptionPlanDto): boolean {
    return this.hasActiveFreePlan() && (plan.price ?? 0) <= 0;
  }

  selectPlan(plan: UserSubscriptionPlanDto): void {
    if (this.isProcessing() || this.checkoutResult()) return;
    if (this.isActiveFreePlan(plan)) return;

    if (!this.isLoggedIn()) {
      this.router.navigate(['/register']);
      return;
    }

    this.selectedPlanId.set(plan.id ?? null);
    this.isProcessing.set(true);
    this.error.set(null);

    const tenantId = Number(this.tenantService.tenantHeaderId);

    this.http.post<CheckoutResult>('/subscription/Payments/checkout', {
      subscriptionPlanId: Number(plan.id),
    }, {
      headers: tenantId ? { 'X-Tenant-Id': String(tenantId) } : {},
    }).pipe(
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: (result) => {
        this.checkoutResult.set(result);
        const userId = this.authService.getSession()?.userId ?? 0;
        if (userId) {
          this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
        }
      },
      error: (err) => {
        console.error('Checkout failed:', err);
        this.error.set(this.t('plans.errors.checkout'));
        this.selectedPlanId.set(null);
      },
    });
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
