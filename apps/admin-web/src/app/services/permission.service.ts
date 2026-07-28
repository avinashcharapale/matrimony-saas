import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermissionDto {
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

export interface CreatePermissionRequest {
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive?: boolean;
}

export interface UpdatePermissionRequest {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignPermissionRequest {
  userId: number;
  permissionId: number;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);

  getAll(search?: string, isActive?: boolean): Observable<PermissionDto[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (isActive != null) params['isActive'] = String(isActive);
    return this.http.get<PermissionDto[]>('/identity/Permissions', { params });
  }

  getById(id: number): Observable<PermissionDto> {
    return this.http.get<PermissionDto>(`/identity/Permissions/${id}`);
  }

  create(request: CreatePermissionRequest): Observable<PermissionDto> {
    return this.http.post<PermissionDto>('/identity/Permissions', request);
  }

  update(id: number, request: UpdatePermissionRequest): Observable<PermissionDto> {
    return this.http.put<PermissionDto>(`/identity/Permissions/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/identity/Permissions/${id}`);
  }

  assignToUser(userId: number, permissionId: number): Observable<void> {
    return this.http.post<void>('/identity/Permissions/assign', { userId, permissionId });
  }

  revokeFromUser(userId: number, permissionId: number): Observable<void> {
    return this.http.request<void>('delete', '/identity/Permissions/assign', {
      body: { userId, permissionId },
    });
  }
}
