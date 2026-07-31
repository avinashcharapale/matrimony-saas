import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformRoleDto {
  platformRoleId: number;
  roleName: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  permissionCount: number;
  adminCount: number;
  permissionIds: number[];
}

export interface CreatePlatformRoleRequest {
  roleName: string;
}

export interface UpdatePlatformRoleRequest {
  roleName?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlatformRoleService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<PlatformRoleDto[]> {
    return this.http.get<PlatformRoleDto[]>('/tenant/PlatformRoles');
  }

  getById(id: number): Observable<PlatformRoleDto> {
    return this.http.get<PlatformRoleDto>(`/tenant/PlatformRoles/${id}`);
  }

  create(request: CreatePlatformRoleRequest): Observable<PlatformRoleDto> {
    return this.http.post<PlatformRoleDto>('/tenant/PlatformRoles', request);
  }

  update(id: number, request: UpdatePlatformRoleRequest): Observable<PlatformRoleDto> {
    return this.http.put<PlatformRoleDto>(`/tenant/PlatformRoles/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/PlatformRoles/${id}`);
  }

  assignPermissions(id: number, permissionIds: number[]): Observable<void> {
    return this.http.post<void>(`/tenant/PlatformRoles/${id}/permissions`, { permissionIds });
  }

  removePermission(id: number, permId: number): Observable<void> {
    return this.http.delete<void>(`/tenant/PlatformRoles/${id}/permissions/${permId}`);
  }
}
