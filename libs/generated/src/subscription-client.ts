import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubscriptionPlanDto,
  SubscriptionFeatureDto,
  SubscriptionStatusDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  CreateSubscriptionFeatureRequest,
  UpdateSubscriptionFeatureRequest,
  CheckoutRequestDto,
  CheckoutResponseDto,
  TenantSubscriptionDto,
  CreateTenantSubscriptionRequest,
  UpdateTenantSubscriptionRequest,
  UserSubscriptionPlanDto,
  CreateUserSubscriptionPlanRequest,
  UpdateUserSubscriptionPlanRequest,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class SubscriptionClient {
  private readonly http = inject(HttpClient);

  // --- Plans ----------------------------------------------------------------

  getAllSubscriptionPlans(tenantId?: number): Observable<SubscriptionPlanDto[]> {
    let params = new HttpParams();
    if (tenantId !== undefined) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.get<SubscriptionPlanDto[]>('/subscription/TenantSubscriptionPlans', { params });
  }

  getAllSubscriptionPlansAdmin(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>('/subscription/TenantSubscriptionPlans/all');
  }

  getSubscriptionPlanById(id: number): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/TenantSubscriptionPlans/${id}`);
  }

  getSubscriptionPlanByCode(code: string): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/TenantSubscriptionPlans/code/${code}`);
  }

  createSubscriptionPlan(body: CreateSubscriptionPlanRequest): Observable<SubscriptionPlanDto> {
    return this.http.post<SubscriptionPlanDto>('/subscription/TenantSubscriptionPlans', body);
  }

  updateSubscriptionPlan(id: number, body: UpdateSubscriptionPlanRequest): Observable<void> {
    return this.http.put<void>(`/subscription/TenantSubscriptionPlans/${id}`, body);
  }

  deleteSubscriptionPlan(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/TenantSubscriptionPlans/${id}`);
  }

  // --- Features -------------------------------------------------------------

  getAllSubscriptionFeatures(): Observable<SubscriptionFeatureDto[]> {
    return this.http.get<SubscriptionFeatureDto[]>('/subscription/SubscriptionFeatures');
  }

  getSubscriptionFeatureById(id: number): Observable<SubscriptionFeatureDto> {
    return this.http.get<SubscriptionFeatureDto>(`/subscription/SubscriptionFeatures/${id}`);
  }

  createSubscriptionFeature(body: CreateSubscriptionFeatureRequest): Observable<SubscriptionFeatureDto> {
    return this.http.post<SubscriptionFeatureDto>('/subscription/SubscriptionFeatures', body);
  }

  updateSubscriptionFeature(id: number, body: UpdateSubscriptionFeatureRequest): Observable<void> {
    return this.http.put<void>(`/subscription/SubscriptionFeatures/${id}`, body);
  }

  deleteSubscriptionFeature(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/SubscriptionFeatures/${id}`);
  }

  // --- Status ---------------------------------------------------------------

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/status/${tenantId}`);
  }

  getUserSubscriptionStatus(userId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/user-status/${userId}`);
  }

  // --- Payments -------------------------------------------------------------

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.http.post<CheckoutResponseDto>('/subscription/Payments/checkout', body);
  }

  // --- Tenant Subscriptions --------------------------------------------------

  getTenantSubscriptions(tenantId: number): Observable<TenantSubscriptionDto[]> {
    return this.http.get<TenantSubscriptionDto[]>(`/subscription/TenantSubscriptions?tenantId=${tenantId}`);
  }

  getTenantSubscriptionById(id: number): Observable<TenantSubscriptionDto> {
    return this.http.get<TenantSubscriptionDto>(`/subscription/TenantSubscriptions/${id}`);
  }

  createTenantSubscription(body: CreateTenantSubscriptionRequest): Observable<TenantSubscriptionDto> {
    return this.http.post<TenantSubscriptionDto>('/subscription/TenantSubscriptions', body);
  }

  updateTenantSubscription(id: number, body: UpdateTenantSubscriptionRequest): Observable<void> {
    return this.http.put<void>(`/subscription/TenantSubscriptions/${id}`, body);
  }

  deleteTenantSubscription(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/TenantSubscriptions/${id}`);
  }

  // --- User Subscription Plans ----------------------------------------------

  getAllUserSubscriptionPlans(): Observable<UserSubscriptionPlanDto[]> {
    return this.http.get<UserSubscriptionPlanDto[]>('/subscription/UserSubscriptionPlans');
  }

  getUserSubscriptionPlanById(id: number): Observable<UserSubscriptionPlanDto> {
    return this.http.get<UserSubscriptionPlanDto>(`/subscription/UserSubscriptionPlans/${id}`);
  }

  createUserSubscriptionPlan(body: CreateUserSubscriptionPlanRequest): Observable<UserSubscriptionPlanDto> {
    return this.http.post<UserSubscriptionPlanDto>('/subscription/UserSubscriptionPlans', body);
  }

  updateUserSubscriptionPlan(id: number, body: UpdateUserSubscriptionPlanRequest): Observable<void> {
    return this.http.put<void>(`/subscription/UserSubscriptionPlans/${id}`, body);
  }

  deleteUserSubscriptionPlan(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/UserSubscriptionPlans/${id}`);
  }
}
