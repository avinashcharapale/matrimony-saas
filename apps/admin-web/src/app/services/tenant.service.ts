import { Injectable, inject } from '@angular/core';
import { TenantClient, TenantResolveResponse } from '@org/generated';
import { TenantConfig, resolveTenant } from './tenant-config';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenantClient = inject(TenantClient);
  private currentTenant: TenantConfig;

  constructor() {
    this.currentTenant = resolveTenant(window.location.hostname, window.location.search);
  }

  get tenant(): TenantConfig {
    return this.currentTenant;
  }

  async initialize(): Promise<void> {
    try {
      const resolved = await this.tenantClient
        .resolveTenant(window.location.hostname, window.location.pathname, window.location.search)
        .toPromise();
      if (resolved) {
        this.currentTenant = { ...this.currentTenant, ...resolved };
      }
    } catch {
      // Use default tenant config
    }
  }
}
