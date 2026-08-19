import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { TenantStore } from '@org/data-access-tenant';
import { TenantResolveResponse } from '@org/generated';
import { resolveTenant, TenantConfig, TenantContact, THEME_PALETTES, ThemePalette } from '@org/tenant-config';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private static readonly THEME_STORAGE_KEY = 'tenant_theme_id';
  private currentTenant: TenantConfig;
  private selectedThemeId = 'warm-ivory';
  private readonly store = inject(TenantStore);

  constructor() {
    this.currentTenant = resolveTenant(
      window.location.hostname,
      window.location.search,
      'anand-maratha',
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
        window.location.hostname,
        window.location.pathname,
        window.location.search,
      )
      .pipe(
        map((resolved) => this.applyResolvedTenant(resolved)),
        catchError(() => {
          this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
          return of(void 0);
        }),
      );
  }

  private applyResolvedTenant(resolved: TenantResolveResponse): void {
    if (!resolved) {
      return;
    }

    let branding: any = {};
    if (resolved.brandingJson) {
      try { branding = JSON.parse(resolved.brandingJson); } catch {}
    }

    const logoSettings = branding.logoDisplay || branding.logoSettings || {};

    this.currentTenant = {
      ...this.currentTenant,
      displayName: resolved.displayName || resolved.name || this.currentTenant.displayName,
      logoUrl: branding.logoUrl ?? this.currentTenant.logoUrl,
      faviconUrl: branding.faviconUrl ?? this.currentTenant.faviconUrl,
      primaryColor: branding.primaryColor ?? this.currentTenant.primaryColor,
      accentColor: branding.accentColor ?? this.currentTenant.accentColor,
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
      logoSettings: {
        width: logoSettings.width ?? this.currentTenant.logoSettings?.width,
        height: logoSettings.height ?? this.currentTenant.logoSettings?.height,
        objectFit: logoSettings.objectFit ?? this.currentTenant.logoSettings?.objectFit,
        padding: logoSettings.padding ?? this.currentTenant.logoSettings?.padding,
        margin: logoSettings.margin ?? this.currentTenant.logoSettings?.margin,
        background: logoSettings.background ?? this.currentTenant.logoSettings?.background,
        borderRadius: logoSettings.borderRadius ?? this.currentTenant.logoSettings?.borderRadius,
        border: logoSettings.border ?? this.currentTenant.logoSettings?.border,
        shadow: logoSettings.shadow ?? this.currentTenant.logoSettings?.shadow,
      },
      socialMedia: {
        facebook: branding.facebookUrl ?? this.currentTenant.socialMedia?.facebook,
        instagram: branding.instagramUrl ?? this.currentTenant.socialMedia?.instagram,
        youtube: branding.youTubeUrl ?? this.currentTenant.socialMedia?.youtube,
        twitter: branding.twitterUrl ?? this.currentTenant.socialMedia?.twitter,
        whatsapp: branding.whatsAppUrl ?? this.currentTenant.socialMedia?.whatsapp,
      },
      footerSettings: {
        showSocialMedia: branding.showFooterSocialMedia ?? this.currentTenant.footerSettings?.showSocialMedia,
        showLegalLinks: branding.showFooterLegalLinks ?? this.currentTenant.footerSettings?.showLegalLinks,
        showContactInfo: branding.showFooterContactInfo ?? this.currentTenant.footerSettings?.showContactInfo,
      },
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
    root.style.setProperty('--tenant-primary', mergedTheme.primary || tenant.primaryColor);
    root.style.setProperty('--tenant-accent', mergedTheme.accent || tenant.accentColor);
    root.style.setProperty('--tenant-bg-start', mergedTheme.bgStart);
    root.style.setProperty('--tenant-bg-mid', mergedTheme.bgMid);
    root.style.setProperty('--tenant-bg-end', mergedTheme.bgEnd);
    root.style.setProperty('--tenant-text', mergedTheme.text);

    const ls = tenant.logoSettings;
    if (ls) {
      if (ls.width) root.style.setProperty('--logo-width', ls.width);
      if (ls.height) root.style.setProperty('--logo-height', ls.height);
      if (ls.objectFit) root.style.setProperty('--logo-object-fit', ls.objectFit);
      if (ls.padding) root.style.setProperty('--logo-padding', ls.padding);
      if (ls.margin) root.style.setProperty('--logo-margin', ls.margin);
      if (ls.background) root.style.setProperty('--logo-bg', ls.background);
      if (ls.borderRadius) root.style.setProperty('--logo-radius', ls.borderRadius);
      if (ls.border) root.style.setProperty('--logo-border', ls.border);
      if (ls.shadow) root.style.setProperty('--logo-shadow', ls.shadow);
    }

    root.style.setProperty('--ion-color-primary', mergedTheme.primary || tenant.primaryColor);
    root.style.setProperty('--ion-color-secondary', mergedTheme.accent || tenant.accentColor);
    root.style.setProperty('--ion-background-color', mergedTheme.bgEnd);
    document.title = tenant.displayName;

    const iconUrl = tenant.faviconUrl ?? tenant.logoUrl;
    if (iconUrl) {
      this.setFavicon(iconUrl);
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
