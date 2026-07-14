import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SubscriptionClient, SubscriptionPlanDto, SubscriptionStatusDto } from '@org/generated';

@Injectable({ providedIn: 'root' })
export class SubscriptionRepository {
  private readonly subscription = inject(SubscriptionClient);

  getAllPlans(): Observable<SubscriptionPlanDto[]> {
    return this.subscription.getAllSubscriptionPlans();
  }

  getPlanById(id: string): Observable<SubscriptionPlanDto> {
    return this.subscription.getSubscriptionPlanById(id);
  }

  createPlan(body: SubscriptionPlanDto): Observable<void> {
    return this.subscription.createSubscriptionPlan(body);
  }

  updatePlan(id: string, body: SubscriptionPlanDto): Observable<void> {
    return this.subscription.updateSubscriptionPlan(id, body);
  }

  deletePlan(id: string): Observable<void> {
    return this.subscription.deleteSubscriptionPlan(id);
  }

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.subscription.getSubscriptionStatus(tenantId);
  }
}
