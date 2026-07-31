import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TenantRoleDto {
  roleId: number;
  tenantId: number;
  roleName: string;
  isSystem: boolean;
  createdAt: string;
  userCount: number;
  permissionCount: number;
}

export interface TenantRoleDetailDto {
  roleId: number;
  tenantId: number;
  roleName: string;
  isSystem: boolean;
  createdAt: string;
  users: { id: number; email: string; tenantId: number; isActive: boolean }[];
  permissions: { permissionCode: string }[];
}

export interface CreateTenantRoleRequest {
  roleName: string;
}

export interface UpdateTenantRoleRequest {
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class TenantRoleService {
  private readonly http = inject(HttpClient);

  getAll(tenantId: number, search?: string): Observable<TenantRoleDto[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    return this.http.get<TenantRoleDto[]>(`/identity/Tenants/${tenantId}/roles`, { params });
  }

  getById(tenantId: number, id: number): Observable<TenantRoleDetailDto> {
    return this.http.get<TenantRoleDetailDto>(`/identity/Tenants/${tenantId}/roles/${id}`);
  }

  create(tenantId: number, request: CreateTenantRoleRequest): Observable<TenantRoleDto> {
    return this.http.post<TenantRoleDto>(`/identity/Tenants/${tenantId}/roles`, request);
  }

  update(tenantId: number, id: number, request: UpdateTenantRoleRequest): Observable<TenantRoleDto> {
    return this.http.put<TenantRoleDto>(`/identity/Tenants/${tenantId}/roles/${id}`, request);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`/identity/Tenants/${tenantId}/roles/${id}`);
  }

  assignPermissions(tenantId: number, roleId: number, permissionIds: number[]): Observable<void> {
    return this.http.post<void>(`/identity/Tenants/${tenantId}/roles/${roleId}/permissions`, { permissionIds });
  }

  removePermission(tenantId: number, roleId: number, permId: number): Observable<void> {
    return this.http.delete<void>(`/identity/Tenants/${tenantId}/roles/${roleId}/permissions/${permId}`);
  }
}
