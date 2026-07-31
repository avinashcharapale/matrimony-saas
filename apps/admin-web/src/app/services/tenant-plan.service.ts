import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubscriptionPlanDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class TenantPlanService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>('/subscription/TenantOwnSubscriptionPlans');
  }

  getById(id: number): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`/subscription/TenantOwnSubscriptionPlans/${id}`);
  }

  create(request: CreateSubscriptionPlanRequest): Observable<SubscriptionPlanDto> {
    return this.http.post<SubscriptionPlanDto>('/subscription/TenantOwnSubscriptionPlans', request);
  }

  update(id: number, request: UpdateSubscriptionPlanRequest): Observable<void> {
    return this.http.put<void>(`/subscription/TenantOwnSubscriptionPlans/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/TenantOwnSubscriptionPlans/${id}`);
  }
}
