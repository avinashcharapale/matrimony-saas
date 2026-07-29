import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './plans.html',
  styleUrl: './plans.css',
})
export class Plans implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly loading = signal(true);
  readonly isProcessing = signal(false);
  readonly selectedPlanId = signal<number | null>(null);
  readonly checkoutResult = signal<CheckoutResult | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.http.get<SubscriptionPlanDto[]>('/subscription/TenantSubscriptionPlans').pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (plans) => this.plans.set(plans ?? []),
      error: (err) => {
        console.error('Failed to load plans:', err);
        this.error.set('Failed to load plans. Please try again.');
      },
    });
  }

  selectPlan(plan: SubscriptionPlanDto): void {
    if (this.isProcessing() || this.checkoutResult()) return;

    this.selectedPlanId.set(plan.id ?? null);
    this.isProcessing.set(true);
    this.error.set(null);

    this.http.post<CheckoutResult>('/subscription/Payments/checkout', {
      planId: Number(plan.id),
    }).pipe(
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: (result) => {
        this.checkoutResult.set(result);
      },
      error: (err) => {
        console.error('Checkout failed:', err);
        this.error.set('Payment failed. Please try again.');
        this.selectedPlanId.set(null);
      },
    });
  }

  goBack(): void {
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
        return value === 'true' ? name : '';
      default:
        return value ? `${name}: ${value}` : name;
    }
  }
}
