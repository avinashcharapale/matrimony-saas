import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SubscriptionClient,
  SubscriptionPlanDto,
  SubscriptionFeatureDto,
  SubscriptionStatusDto,
  UserSubscriptionPlanDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class SubscriptionRepository {
  private readonly subscription = inject(SubscriptionClient);

  getAllPlans(): Observable<UserSubscriptionPlanDto[]> {
    return this.subscription.getActiveUserSubscriptionPlans();
  }

  getPlanById(id: number): Observable<SubscriptionPlanDto> {
    return this.subscription.getSubscriptionPlanById(id);
  }

  getPlanByCode(code: string): Observable<SubscriptionPlanDto> {
    return this.subscription.getSubscriptionPlanByCode(code);
  }

  createPlan(body: CreateSubscriptionPlanRequest): Observable<SubscriptionPlanDto> {
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

  getTenantSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.subscription.getTenantSubscriptionStatus(tenantId);
  }

  getUserSubscriptionStatus(userId: number): Observable<SubscriptionStatusDto> {
    return this.subscription.getUserSubscriptionStatus(userId);
  }
}
