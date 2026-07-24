import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SubscriptionStore } from '@org/data-access-subscription';
import { TenantService } from '../../services/tenant.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionPlanDto, PlanFeatureValueDto } from '@org/generated';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './plans.html',
  styleUrl: './plans.css',
})
export class PlansPage implements OnInit {
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly isProcessing = signal(false);
  readonly selectedPlanId = signal<number | null>(null);
  readonly checkoutResult = signal<CheckoutResult | null>(null);
  readonly error = signal<string | null>(null);

  readonly plans = this.subscriptionStore.plans;
  readonly loading = this.subscriptionStore.loading;

  ngOnInit(): void {
    this.subscriptionStore.loadPlans().subscribe();
  }

  selectPlan(plan: SubscriptionPlanDto): void {
    if (this.isProcessing() || this.checkoutResult()) return;

    this.selectedPlanId.set(plan.id ?? null);
    this.isProcessing.set(true);
    this.error.set(null);

    const tenantId = Number(this.tenantService.tenantHeaderId);

    this.http.post<CheckoutResult>('/subscription/Payments/checkout', {
      planId: Number(plan.id),
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
        this.error.set('Payment failed. Please try again.');
        this.selectedPlanId.set(null);
      },
    });
  }

  goToProfiles(): void {
    this.router.navigate(['/profiles']);
  }

  formatPrice(price?: number): string {
    if (!price) return 'Free';
    return `\u20B9${price.toLocaleString('en-IN')}`;
  }

  formatDuration(months?: number): string {
    if (!months) return '';
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return years === 1 ? '1 Year' : `${years} Years`;
    }
    return months === 1 ? '1 Month' : `${months} Months`;
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
}
