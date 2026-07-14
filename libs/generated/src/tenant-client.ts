import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDto, TenantResolveResponse } from './dtos';

@Injectable({ providedIn: 'root' })
export class TenantClient {
  private readonly http = inject(HttpClient);

  getById(id: number): Observable<TenantDto> {
    return this.http.get<TenantDto>(`/tenant/Tenants/${id}`);
  }

  update(id: number, body: TenantDto): Observable<void> {
    return this.http.put<void>(`/tenant/Tenants/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/Tenants/${id}`);
  }

  getAll(): Observable<TenantDto[]> {
    return this.http.get<TenantDto[]>('/tenant/Tenants');
  }

  create(body: TenantDto): Observable<void> {
    return this.http.post<void>('/tenant/Tenants', body);
  }

  resolveTenant(host: string, path: string, query: string): Observable<TenantResolveResponse> {
    const params = new HttpParams()
      .set('host', host)
      .set('path', path)
      .set('query', query);
    return this.http.get<TenantResolveResponse>('/api/gateway/resolve', { params });
  }
}
