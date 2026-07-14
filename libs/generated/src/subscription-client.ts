import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriptionPlanDto, SubscriptionStatusDto } from './dtos';

@Injectable({ providedIn: 'root' })
export class SubscriptionClient {
  private readonly http = inject(HttpClient);

  getSubscriptionPlanById(id: string): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/SubscriptionPlans/${id}`);
  }

  updateSubscriptionPlan(id: string, body: SubscriptionPlanDto): Observable<void> {
    return this.http.put<void>(`/subscription/SubscriptionPlans/${id}`, body);
  }

  deleteSubscriptionPlan(id: string): Observable<void> {
    return this.http.delete<void>(`/subscription/SubscriptionPlans/${id}`);
  }

  getAllSubscriptionPlans(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>('/subscription/SubscriptionPlans');
  }

  createSubscriptionPlan(body: SubscriptionPlanDto): Observable<void> {
    return this.http.post<void>('/subscription/SubscriptionPlans', body);
  }

  getSubscriptionStatus(tenantId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`/subscription/subscription/status/${tenantId}`);
  }
}
