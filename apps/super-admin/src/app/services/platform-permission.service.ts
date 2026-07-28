import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformPermissionDto {
  platformPermissionId?: number;
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreatePlatformPermissionRequest {
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive?: boolean;
}

export interface UpdatePlatformPermissionRequest {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlatformPermissionService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<PlatformPermissionDto[]> {
    return this.http.get<PlatformPermissionDto[]>('/identity/PlatformPermissions');
  }

  getById(id: number): Observable<PlatformPermissionDto> {
    return this.http.get<PlatformPermissionDto>(`/identity/PlatformPermissions/${id}`);
  }

  create(request: CreatePlatformPermissionRequest): Observable<PlatformPermissionDto> {
    return this.http.post<PlatformPermissionDto>('/identity/PlatformPermissions', request);
  }

  update(id: number, request: UpdatePlatformPermissionRequest): Observable<PlatformPermissionDto> {
    return this.http.put<PlatformPermissionDto>(`/identity/PlatformPermissions/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/identity/PlatformPermissions/${id}`);
  }
}
