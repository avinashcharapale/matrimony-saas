import { Injectable, effect, inject } from '@angular/core';
import { tap } from 'rxjs';
import { TenantClient, TenantResolveResponse } from '@org/generated';
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

  initialize() {
    const tenantId = this.authStore.session()?.tenantId ?? 0;
    this.tenantStore.setResolvedTenant(tenantId, null);

    effect(() => {
      const current = this.authStore.session()?.tenantId ?? 0;
      this.tenantStore.setResolvedTenant(current, null);
    });

    return this.tenantClient
      .resolveTenant(window.location.hostname, window.location.pathname, window.location.search)
      .pipe(tap((resolved) => this.applyResolvedTenant(resolved)));
  }

  private applyResolvedTenant(resolved: TenantResolveResponse): void {
    if (!resolved?.resolved) {
      return;
    }

    this.currentTenant = {
      ...this.currentTenant,
      id: resolved.tenantId ?? this.currentTenant.id,
      displayName:
        resolved.displayName || resolved.name || this.currentTenant.displayName,
      logoUrl: resolved.logoUrl ?? this.currentTenant.logoUrl,
      faviconUrl: resolved.faviconUrl ?? this.currentTenant.faviconUrl,
      primaryColor: resolved.primaryColor ?? this.currentTenant.primaryColor,
      accentColor: resolved.accentColor ?? this.currentTenant.accentColor,
    };

    this.setFavicon(this.currentTenant.faviconUrl ?? this.currentTenant.logoUrl);
  }

  private setFavicon(iconUrl: string | undefined): void {
    if (!iconUrl) {
      return;
    }
    let link = document.querySelector(
      "link[rel='icon']",
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  }
}
