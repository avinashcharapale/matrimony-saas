import { Injectable, inject } from '@angular/core';
import { TenantClient } from '@org/generated';
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
        this.currentTenant = {
          ...this.currentTenant,
          id: resolved.tenantId ?? this.currentTenant.id,
          displayName:
            resolved.displayName || resolved.name || this.currentTenant.displayName,
          logoUrl: resolved.logoUrl ?? this.currentTenant.logoUrl,
          primaryColor: resolved.primaryColor ?? this.currentTenant.primaryColor,
          accentColor: resolved.accentColor ?? this.currentTenant.accentColor,
        };
      }
    } catch {
      // Use default
    }
  }
}
