import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { resolveTenant, TenantConfig, TENANT_CODE_MAP, TENANT_CONFIGS, THEME_PALETTES, ThemePalette } from './tenant-config';

/** Shape of the /api/gateway/tenant/resolve response */
interface TenantResolveResponse {
  resolved: boolean;
  host: string;
  path: string;
  query: string | null;
  tenantId: number;
  tenantCode: string;
  domain: string;
}

function resolveTenantHost(): string {
  const currentHost = globalThis.location?.hostname ?? '';
  const developmentTenantHost = environment.developmentTenantHost?.trim();

  if ((currentHost === 'localhost' || currentHost === '127.0.0.1') && developmentTenantHost) {
    return developmentTenantHost;
  }

  return currentHost;
}

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private static readonly THEME_STORAGE_KEY = 'tenant_theme_id';
  private static readonly AUTH_TENANT_STORAGE_KEY = 'auth_tenant_id';
  private currentTenant: TenantConfig;
  private selectedThemeId = 'warm-ivory';
  private resolvedTenantNumericId: number | null = null;

  constructor() {
    this.currentTenant = resolveTenant(resolveTenantHost(), window.location.search);
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
    if (this.resolvedTenantNumericId && this.resolvedTenantNumericId > 0) {
      return String(this.resolvedTenantNumericId);
    }

    const fromSession = Number(localStorage.getItem(TenantService.AUTH_TENANT_STORAGE_KEY));
    if (Number.isFinite(fromSession) && fromSession > 0) {
      return String(fromSession);
    }

    return null;
  }

  async initialize(): Promise<void> {
    // Use a relative API path so dev requests go through the Angular proxy and
    // production can stay same-origin behind the deployed gateway.
    const path = encodeURIComponent(window.location.pathname);
    const query = encodeURIComponent(window.location.search);
    const host = encodeURIComponent(resolveTenantHost());
    const url = `/api/gateway/tenant/resolve?host=${host}&path=${path}&query=${query}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'identity',
        },
      });
      if (response.ok) {
        const resolved = (await response.json()) as TenantResolveResponse;

        if (Number.isFinite(resolved.tenantId) && resolved.tenantId > 0) {
          this.resolvedTenantNumericId = resolved.tenantId;
        }

        if (resolved.resolved) {
          // Look up by tenantCode first, then fall back to domain matching
          const mappedId = TENANT_CODE_MAP[resolved.tenantCode];
          const matched =
            (mappedId ? TENANT_CONFIGS.find((c) => c.id === mappedId) : undefined) ??
            TENANT_CONFIGS.find((c) =>
              c.domainAliases.some((a) => a === resolved.domain || a === resolved.host)
            );

          if (matched) {
            this.currentTenant = matched;
            this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
            return;
          }
        }
      }
      // Non-2xx or unresolved: use local fallback silently.
    } catch {
      // Network error or JSON parse failure: use local fallback silently.
    }

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
    root.style.setProperty('--tenant-primary', mergedTheme.primary || tenant.primaryColor);
    root.style.setProperty('--tenant-accent', mergedTheme.accent || tenant.accentColor);
    root.style.setProperty('--tenant-bg-start', mergedTheme.bgStart);
    root.style.setProperty('--tenant-bg-mid', mergedTheme.bgMid);
    root.style.setProperty('--tenant-bg-end', mergedTheme.bgEnd);
    root.style.setProperty('--tenant-text', mergedTheme.text);
    document.title = tenant.displayName;

    if (tenant.logoUrl) {
      this.setFavicon(tenant.logoUrl);
    }
  }

  private resolveInitialThemeId(): string {
    const fromStorage = localStorage.getItem(TenantService.THEME_STORAGE_KEY);
    if (fromStorage && this.findTheme(fromStorage)) {
      return fromStorage;
    }

    if (this.currentTenant.defaultThemeId && this.findTheme(this.currentTenant.defaultThemeId)) {
      return this.currentTenant.defaultThemeId;
    }

    return THEME_PALETTES[0].id;
  }

  private findTheme(themeId: string): ThemePalette | undefined {
    return THEME_PALETTES.find((theme) => theme.id === themeId);
  }

  private setFavicon(iconUrl: string): void {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  }
}
