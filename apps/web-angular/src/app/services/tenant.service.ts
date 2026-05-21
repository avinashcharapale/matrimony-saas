import { Injectable } from '@angular/core';
import { resolveTenant, TenantConfig, THEME_PALETTES, ThemePalette } from './tenant-config';
import { environment } from 'libs/shared-services/src/lib/config/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private static readonly THEME_STORAGE_KEY = 'tenant_theme_id';
  private currentTenant: TenantConfig;
  private selectedThemeId = 'warm-ivory';

  constructor() {
    this.currentTenant = resolveTenant(window.location.hostname, window.location.search);
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

  async initialize(): Promise<void> {
    // Use only the implemented gateway endpoint for tenant resolution
    const host = encodeURIComponent(window.location.hostname);
    const path = encodeURIComponent(window.location.pathname);
    const query = encodeURIComponent(window.location.search);
    const baseUrl = environment.apiConfig.baseUrl.replace(/\/$/, '');
    const url = `${baseUrl}/api/gateway/tenant/resolve?host=${host}&path=${path}&query=${query}`;

    try {
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const resolved = (await response.json()) as Partial<TenantConfig>;
        this.currentTenant = { ...this.currentTenant, ...resolved };
        this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
        return;
      }
    } catch {
      // Continue to fallback.
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
