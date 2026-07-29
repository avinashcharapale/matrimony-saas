import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSubscriptionPlanDto {
  id?: number;
  tenantId?: number;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: PlanFeatureValueDto[];
}

export interface PlanFeatureValueDto {
  code?: string;
  name?: string;
  category?: string;
  dataType?: string;
  value?: string;
}

export interface FeatureValueRequest {
  featureCode?: string;
  value?: string;
}

export interface CreateUserSubscriptionPlanRequest {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

export interface UpdateUserSubscriptionPlanRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

@Injectable({ providedIn: 'root' })
export class UserSubscriptionPlanService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<UserSubscriptionPlanDto[]> {
    return this.http.get<UserSubscriptionPlanDto[]>('/subscription/UserSubscriptionPlans');
  }

  getById(id: number): Observable<UserSubscriptionPlanDto> {
    return this.http.get<UserSubscriptionPlanDto>(`/subscription/UserSubscriptionPlans/${id}`);
  }

  create(request: CreateUserSubscriptionPlanRequest): Observable<UserSubscriptionPlanDto> {
    return this.http.post<UserSubscriptionPlanDto>('/subscription/UserSubscriptionPlans', request);
  }

  update(id: number, request: UpdateUserSubscriptionPlanRequest): Observable<UserSubscriptionPlanDto> {
    return this.http.put<UserSubscriptionPlanDto>(`/subscription/UserSubscriptionPlans/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/subscription/UserSubscriptionPlans/${id}`);
  }
}
