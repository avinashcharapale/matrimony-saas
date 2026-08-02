import { Injectable, effect, inject } from '@angular/core';
import { TenantClient } from '@org/generated';
import { AuthStore } from '@org/data-access-auth';
import { TenantStore } from '@org/data-access-tenant';
import { TenantConfig, resolveTenant } from './tenant-config';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenantClient = inject(TenantClient);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);
  private currentTenant: TenantConfig;

  constructor() {
    this.currentTenant = resolveTenant(window.location.hostname, window.location.search);
  }

  get tenant(): TenantConfig {
    return this.currentTenant;
  }

  initialize(): void {
    const tenantId = this.authStore.session()?.tenantId ?? 0;
    this.tenantStore.setResolvedTenant(tenantId, null);

    effect(() => {
      const current = this.authStore.session()?.tenantId ?? 0;
      this.tenantStore.setResolvedTenant(current, null);
    });

    this.tenantClient
      .resolveTenant(window.location.hostname, window.location.pathname, window.location.search)
      .subscribe({
        next: (resolved) => {
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
        },
        error: () => {
          // Use default tenant config
        },
      });
  }
}
