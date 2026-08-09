import { Injectable, inject } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { TenantStore } from '@org/data-access-tenant';
import { TenantResolveResponse } from '@org/generated';
import {
  resolveTenant,
  TenantConfig,
  TenantContact,
  THEME_PALETTES,
  ThemePalette,
} from '@org/tenant-config';

function resolveTenantHost(): string {
  return globalThis.location?.hostname ?? '';
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private static readonly THEME_STORAGE_KEY = 'tenant_theme_id';

  private readonly store = inject(TenantStore);
  private currentTenant: TenantConfig;
  private selectedThemeId = 'warm-ivory';

  constructor() {
    this.currentTenant = resolveTenant(
      resolveTenantHost(),
      window.location.search,
    );
    this.applyTheme(this.currentTenant);
  }

  get tenant(): TenantConfig {
    return this.currentTenant;
  }

  get themes(): ThemePalette[] {
    return THEME_PALETTES;
  }

  get activeThemeId(): string {
    return this.selectedThemeId;
  }

  get tenantHeaderId(): string | null {
    return this.store.tenantHeaderId();
  }

  flagEnabled(code: string): boolean {
    return this.currentTenant.featureFlags?.[code] ?? true;
  }

  initialize() {
    return this.store
      .resolveTenant(
        resolveTenantHost(),
        window.location.pathname,
        window.location.search,
      )
      .pipe(
        tap((resolved) => this.applyResolvedTenant(resolved)),
        catchError(() => {
          this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
          return of(void 0);
        }),
      );
  }

  private applyResolvedTenant(resolved: TenantResolveResponse): void {
    if (!resolved?.resolved) {
      return;
    }

    this.currentTenant = {
      ...this.currentTenant,
      displayName:
        resolved.displayName || resolved.name || this.currentTenant.displayName,
      logoUrl: resolved.logoUrl ?? this.currentTenant.logoUrl,
      faviconUrl: resolved.faviconUrl ?? this.currentTenant.faviconUrl,
      primaryColor: resolved.primaryColor ?? this.currentTenant.primaryColor,
      accentColor: resolved.accentColor ?? this.currentTenant.accentColor,
      contacts:
        resolved.contacts && resolved.contacts.length > 0
          ? resolved.contacts.map((c) => ({
              type: c.contactType as TenantContact['type'],
              label: c.label ?? undefined,
              value: c.value,
              isPrimary: c.isPrimary,
            }))
          : this.currentTenant.contacts,
      featureFlags:
        resolved.featureFlags && resolved.featureFlags.length > 0
          ? resolved.featureFlags.reduce(
              (acc, f) => {
                acc[f.featureCode] = f.isEnabled;
                return acc;
              },
              {} as Record<string, boolean>,
            )
          : this.currentTenant.featureFlags,
      domainAliases:
        resolved.domainAliases && resolved.domainAliases.length > 0
          ? resolved.domainAliases
          : this.currentTenant.domainAliases,
    };
    this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
  }

  setTheme(themeId: string): void {
    const theme = this.findTheme(themeId);
    if (!theme) {
      return;
    }

    this.selectedThemeId = theme.id;
    localStorage.setItem(TenantService.THEME_STORAGE_KEY, theme.id);
    this.applyTheme(this.currentTenant, theme.id);
  }

  private applyTheme(tenant: TenantConfig, themeId?: string): void {
    const resolvedThemeId = themeId ?? this.resolveInitialThemeId();
    const theme = this.findTheme(resolvedThemeId) ?? THEME_PALETTES[0];
    this.selectedThemeId = theme.id;

    const mergedTheme: ThemePalette = {
      ...theme,
      primary: tenant.customTheme?.primary ?? theme.primary,
      accent: tenant.customTheme?.accent ?? theme.accent,
      bgStart: tenant.customTheme?.bgStart ?? theme.bgStart,
      bgMid: tenant.customTheme?.bgMid ?? theme.bgMid,
      bgEnd: tenant.customTheme?.bgEnd ?? theme.bgEnd,
      text: tenant.customTheme?.text ?? theme.text,
    };

    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty(
      '--tenant-primary',
      mergedTheme.primary || tenant.primaryColor,
    );
    root.style.setProperty(
      '--tenant-accent',
      mergedTheme.accent || tenant.accentColor,
    );
    root.style.setProperty('--tenant-bg-start', mergedTheme.bgStart);
    root.style.setProperty('--tenant-bg-mid', mergedTheme.bgMid);
    root.style.setProperty('--tenant-bg-end', mergedTheme.bgEnd);
    root.style.setProperty('--tenant-text', mergedTheme.text);
    document.title = tenant.displayName;

    const iconUrl = tenant.faviconUrl ?? tenant.logoUrl;
    if (iconUrl) {
      this.setFavicon(iconUrl);
    }
  }

  private resolveInitialThemeId(): string {
    const fromStorage = localStorage.getItem(
      TenantService.THEME_STORAGE_KEY,
    );
    if (fromStorage && this.findTheme(fromStorage)) {
      return fromStorage;
    }

    if (
      this.currentTenant.defaultThemeId &&
      this.findTheme(this.currentTenant.defaultThemeId)
    ) {
      return this.currentTenant.defaultThemeId;
    }

    return THEME_PALETTES[0].id;
  }

  private findTheme(themeId: string): ThemePalette | undefined {
    return THEME_PALETTES.find((theme) => theme.id === themeId);
  }

  private setFavicon(iconUrl: string): void {
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
