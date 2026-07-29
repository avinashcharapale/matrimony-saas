import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantPermissionDto {
  permissionId: number;
  tenantId: number;
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTenantPermissionRequest {
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive?: boolean;
}

export interface UpdateTenantPermissionRequest {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TenantPermissionService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: number, search?: string, isActive?: boolean): Observable<TenantPermissionDto[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (isActive != null) params['isActive'] = String(isActive);
    return this.http.get<TenantPermissionDto[]>(`/identity/Tenants/${tenantId}/permissions`, { params });
  }

  getById(tenantId: number, id: number): Observable<TenantPermissionDto> {
    return this.http.get<TenantPermissionDto>(`/identity/Tenants/${tenantId}/permissions/${id}`);
  }

  create(tenantId: number, request: CreateTenantPermissionRequest): Observable<TenantPermissionDto> {
    return this.http.post<TenantPermissionDto>(`/identity/Tenants/${tenantId}/permissions`, request);
  }

  update(tenantId: number, id: number, request: UpdateTenantPermissionRequest): Observable<TenantPermissionDto> {
    return this.http.put<TenantPermissionDto>(`/identity/Tenants/${tenantId}/permissions/${id}`, request);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`/identity/Tenants/${tenantId}/permissions/${id}`);
  }
}
