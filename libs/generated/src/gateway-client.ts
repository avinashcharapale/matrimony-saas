import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantResolveResponse } from './dtos';

@Injectable({ providedIn: 'root' })
export class GatewayClient {
  private readonly http = inject(HttpClient);

  resolve(host: string, path: string, query: string): Observable<TenantResolveResponse> {
    const params = new HttpParams()
      .set('host', host)
      .set('path', path)
      .set('query', query);
    return this.http.get<TenantResolveResponse>('/api/gateway/resolve', { params });
  }
}
