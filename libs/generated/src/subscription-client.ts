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
  TenantPlanFeatureOverrideDto,
  SetTenantFeatureOverridesRequest,
  TenantPlanExclusionDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class SubscriptionClient {
  private readonly http = inject(HttpClient);

  // ─── Plans ────────────────────────────────────────────────────────────────

  getAllSubscriptionPlans(tenantId?: number): Observable<SubscriptionPlanDto[]> {
    let params = new HttpParams();
    if (tenantId !== undefined) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.get<SubscriptionPlanDto[]>('/subscription/SubscriptionPlans', { params });
  }

  getAllSubscriptionPlansAdmin(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>('/subscription/SubscriptionPlans/all');
  }

  getSubscriptionPlanById(id: number): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/SubscriptionPlans/${id}`);
  }

  getSubscriptionPlanByCode(code: string): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/SubscriptionPlans/code/${code}`);
  }

  createSubscriptionPlan(body: CreateSubscriptionPlanRequest): Observable<SubscriptionPlanDto> {
    return this.http.post<SubscriptionPlanDto>('/subscription/SubscriptionPlans', body);
  }

  updateSubscriptionPlan(id: number, body: UpdateSubscriptionPlanRequest): Observable<void> {
    return this.http.put<void>(`/subscription/SubscriptionPlans/${id}`, body);
  }

  deleteSubscriptionPlan(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/SubscriptionPlans/${id}`);
  }

  // ─── Features ─────────────────────────────────────────────────────────────

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

  // ─── Status ───────────────────────────────────────────────────────────────

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/status/${tenantId}`);
  }

  getUserSubscriptionStatus(userId: number, tenantId: number): Observable<SubscriptionStatusDto> {
    const params = new HttpParams().set('tenantId', tenantId);
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/user-status/${userId}`, { params });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.http.post<CheckoutResponseDto>('/subscription/Payments/checkout', body);
  }

  // ─── Tenant Plan Pricing ──────────────────────────────────────────────────

  getTenantPlanFeatureOverrides(tenantId: number, planId: number): Observable<TenantPlanFeatureOverrideDto[]> {
    return this.http.get<TenantPlanFeatureOverrideDto[]>(`/subscription/TenantPlanPricing/${tenantId}/${planId}`);
  }

  setTenantPlanFeatureOverrides(tenantId: number, planId: number, body: SetTenantFeatureOverridesRequest): Observable<void> {
    return this.http.put<void>(`/subscription/TenantPlanPricing/${tenantId}/${planId}`, body);
  }

  deleteTenantPlanFeatureOverrides(tenantId: number, planId: number): Observable<void> {
    return this.http.delete<void>(`/subscription/TenantPlanPricing/${tenantId}/${planId}`);
  }

  // ─── Tenant Plan Exclusions ───────────────────────────────────────────────

  getTenantPlanExclusions(tenantId: number): Observable<TenantPlanExclusionDto[]> {
    return this.http.get<TenantPlanExclusionDto[]>(`/subscription/TenantPlanExclusions/${tenantId}`);
  }

  addTenantPlanExclusion(tenantId: number, planId: number): Observable<void> {
    return this.http.post<void>(`/subscription/TenantPlanExclusions/${tenantId}/${planId}`, {});
  }

  removeTenantPlanExclusion(tenantId: number, planId: number): Observable<void> {
    return this.http.delete<void>(`/subscription/TenantPlanExclusions/${tenantId}/${planId}`);
  }
}
