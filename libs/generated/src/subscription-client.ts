import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubscriptionPlanDto,
  SubscriptionFeatureDto,
  SubscriptionStatusDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class SubscriptionClient {
  private readonly http = inject(HttpClient);

  // ─── Plans ────────────────────────────────────────────────────────────────

  getAllSubscriptionPlans(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>('/subscription/SubscriptionPlans');
  }

  getSubscriptionPlanById(id: number): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/SubscriptionPlans/${id}`);
  }

  getSubscriptionPlanByCode(code: string): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/SubscriptionPlans/code/${code}`);
  }

  createSubscriptionPlan(body: CreateSubscriptionPlanRequest): Observable<void> {
    return this.http.post<void>('/subscription/SubscriptionPlans', body);
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

  // ─── Status ───────────────────────────────────────────────────────────────

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/status/${tenantId}`);
  }

  getUserSubscriptionStatus(userId: number, tenantId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/user-status/${userId}?tenantId=${tenantId}`);
  }
}
