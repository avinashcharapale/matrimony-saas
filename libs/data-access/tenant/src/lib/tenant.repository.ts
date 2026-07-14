import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TenantClient, TenantResolveResponse } from '@org/generated';

@Injectable({ providedIn: 'root' })
export class TenantRepository {
  private readonly tenant = inject(TenantClient);

  resolveTenant(
    host: string,
    pathname: string,
    search: string,
  ): Observable<TenantResolveResponse> {
    return this.tenant.resolveTenant(host, pathname, search);
  }
}
