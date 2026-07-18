import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SubscriptionClient,
  SubscriptionPlanDto,
  SubscriptionFeatureDto,
  SubscriptionStatusDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class SubscriptionRepository {
  private readonly subscription = inject(SubscriptionClient);

  getAllPlans(): Observable<SubscriptionPlanDto[]> {
    return this.subscription.getAllSubscriptionPlans();
  }

  getPlanById(id: number): Observable<SubscriptionPlanDto> {
    return this.subscription.getSubscriptionPlanById(id);
  }

  getPlanByCode(code: string): Observable<SubscriptionPlanDto> {
    return this.subscription.getSubscriptionPlanByCode(code);
  }

  createPlan(body: CreateSubscriptionPlanRequest): Observable<void> {
    return this.subscription.createSubscriptionPlan(body);
  }

  updatePlan(id: number, body: UpdateSubscriptionPlanRequest): Observable<void> {
    return this.subscription.updateSubscriptionPlan(id, body);
  }

  deletePlan(id: number): Observable<void> {
    return this.subscription.deleteSubscriptionPlan(id);
  }

  getAllFeatures(): Observable<SubscriptionFeatureDto[]> {
    return this.subscription.getAllSubscriptionFeatures();
  }

  getFeatureById(id: number): Observable<SubscriptionFeatureDto> {
    return this.subscription.getSubscriptionFeatureById(id);
  }

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.subscription.getSubscriptionStatus(tenantId);
  }
}
