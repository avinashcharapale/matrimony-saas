import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SubscriptionStore } from '@org/data-access-subscription';
import { TenantService } from '../../services/tenant.service';
import { SubscriptionPlanDto } from '@org/generated';
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
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly isProcessing = signal(false);
  readonly selectedPlanId = signal<string | null>(null);
  readonly checkoutResult = signal<CheckoutResult | null>(null);
  readonly error = signal<string | null>(null);

  readonly plans = this.subscriptionStore.plans;

  ngOnInit(): void {
    this.subscriptionStore.loadPlans();
    setTimeout(() => this.isLoading.set(false), 500);
  }

  selectPlan(plan: SubscriptionPlanDto): void {
    if (this.isProcessing() || this.checkoutResult()) return;

    this.selectedPlanId.set(plan.id ?? null);
    this.isProcessing.set(true);
    this.error.set(null);

    const tenantId = Number(this.tenantService.tenantHeaderId);

    this.http.post<CheckoutResult>('/api/Payments/checkout', {
      planId: Number(plan.id),
    }, {
      headers: tenantId ? { 'X-Tenant-Id': String(tenantId) } : {},
    }).pipe(
      finalize(() => this.isProcessing.set(false)),
    ).subscribe({
      next: (result) => {
        this.checkoutResult.set(result);
        this.subscriptionStore.loadSubscriptionStatus(tenantId);
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
    return `₹${price.toLocaleString('en-IN')}`;
  }

  formatDuration(days?: number): string {
    if (!days) return '';
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return years === 1 ? '1 Year' : `${years} Years`;
    }
    const months = Math.round(days / 30);
    return months === 1 ? '1 Month' : `${months} Months`;
  }
}
