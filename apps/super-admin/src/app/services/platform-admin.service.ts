import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformAdminDto {
  platformAdminId: number;
  email: string;
  displayName?: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: PlatformRoleDto[];
}

export interface PlatformAdminDetailDto {
  platformAdminId: number;
  email: string;
  displayName?: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: PlatformRoleDto[];
}

export interface PlatformRoleDto {
  platformRoleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  permissionCount: number;
  adminCount: number;
}

export interface CreatePlatformAdminRequest {
  email: string;
  password: string;
  displayName?: string;
  roleIds?: number[];
}

export interface UpdatePlatformAdminRequest {
  email?: string;
  displayName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<PlatformAdminDto[]> {
    return this.http.get<PlatformAdminDto[]>('/tenant/PlatformAdmins');
  }

  getById(id: number): Observable<PlatformAdminDetailDto> {
    return this.http.get<PlatformAdminDetailDto>(`/tenant/PlatformAdmins/${id}`);
  }

  create(request: CreatePlatformAdminRequest): Observable<PlatformAdminDetailDto> {
    return this.http.post<PlatformAdminDetailDto>('/tenant/PlatformAdmins', request);
  }

  update(id: number, request: UpdatePlatformAdminRequest): Observable<PlatformAdminDetailDto> {
    return this.http.put<PlatformAdminDetailDto>(`/tenant/PlatformAdmins/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/PlatformAdmins/${id}`);
  }
}

export interface PlatformAuthPermission {
  platformPermissionId: number;
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive?: boolean;
}

export interface PlatformAuthRole {
  platformRoleId: number;
  roleName: string;
  permissionCount: number;
  adminCount: number;
}
