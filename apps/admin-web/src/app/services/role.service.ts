import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleDto {
  roleId: number;
  tenantId: number;
  roleName: string;
  createdAt: string;
  userCount: number;
  permissionCount: number;
}

export interface UserBasicInfoDto {
  userId: number;
  email: string;
  displayName?: string;
}

export interface UserPermissionDto {
  userPermissionId: number;
  permissionId: number;
  permissionCode: string;
  displayName: string;
}

export interface RoleDetailDto {
  roleId: number;
  tenantId: number;
  roleName: string;
  createdAt: string;
  users: UserBasicInfoDto[];
  permissions: UserPermissionDto[];
}

export interface CreateRoleRequest {
  roleName: string;
}

export interface UpdateRoleRequest {
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  getAll(search?: string): Observable<RoleDto[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    return this.http.get<RoleDto[]>('/identity/Roles', { params });
  }

  getById(id: number): Observable<RoleDetailDto> {
    return this.http.get<RoleDetailDto>(`/identity/Roles/${id}`);
  }

  create(request: CreateRoleRequest): Observable<RoleDto> {
    return this.http.post<RoleDto>('/identity/Roles', request);
  }

  update(id: number, request: UpdateRoleRequest): Observable<RoleDto> {
    return this.http.put<RoleDto>(`/identity/Roles/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/identity/Roles/${id}`);
  }

  assignPermissions(id: number, permissionIds: number[]): Observable<void> {
    return this.http.post<void>(`/identity/Roles/${id}/permissions`, { permissionIds });
  }

  removePermission(id: number, permId: number): Observable<void> {
    return this.http.delete<void>(`/identity/Roles/${id}/permissions/${permId}`);
  }

  assignUsers(id: number, userIds: number[]): Observable<void> {
    return this.http.post<void>(`/identity/Roles/${id}/users`, { userIds });
  }

  removeUser(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`/identity/Roles/${id}/users/${userId}`);
  }
}
