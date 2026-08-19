import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, of, tap } from 'rxjs';
import { TenantStore } from '@org/data-access-tenant';
import { TenantResolveResponse } from '@org/generated';
import {
  resolveTenant,
  bootstrapFromTemplate,
  TenantConfig,
  TenantContact,
  THEME_PALETTES,
  ThemePalette,
} from '@org/tenant-config';
import {
  APPROVED_TEMPLATES,
  LandingTemplate,
  TemplateOverrides,
  resolveTemplateStyleVars,
} from '@org/landing-templates';

function resolveTenantHost(): string {
  return globalThis.location?.hostname ?? '';
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private static readonly THEME_STORAGE_KEY = 'tenant_theme_id';

  private readonly store = inject(TenantStore);
  private currentTenant: TenantConfig;
  private selectedThemeId = 'warm-ivory';

  /** Bumped whenever currentTenant is replaced so Angular signals can track it. */
  readonly tenantVersion = signal(0);
  /** Observable variant so non-signal subscribers (Layout ngOnInit) can subscribe. */
  readonly tenantVersion$ = new BehaviorSubject<void>(undefined);

  constructor() {
    const routingConfig = resolveTenant(
      resolveTenantHost(),
      window.location.search,
    );
    this.currentTenant = bootstrapFromTemplate(routingConfig);
    this.applyTheme(this.currentTenant);
  }

  get tenant(): TenantConfig {
    return this.currentTenant;
  }

  /** Approved landing template chosen for this tenant (DB ThemeTemplateId). */
  get template(): LandingTemplate {
    const id = this.currentTenant.themeTemplateId;
    const found = id ? APPROVED_TEMPLATES.find((t) => t.id === id) : undefined;
    return found ?? APPROVED_TEMPLATES[0];
  }

  /** Tenant branding overrides that beat template defaults.
   *  When a landing template is selected its palette fully wins, so the
   *  visitor pages match the approved design exactly. */
  get templateOverrides(): TemplateOverrides {
    const legacyColors = this.currentTenant.themeTemplateId
      ? {}
      : {
          primary:
            this.currentTenant.primaryColor ??
            this.currentTenant.customTheme?.primary,
          secondary:
            this.currentTenant.accentColor ??
            this.currentTenant.customTheme?.accent,
          background: this.currentTenant.customTheme?.bgStart,
          text: this.currentTenant.customTheme?.text,
        };
    return {
      ...legacyColors,
      heroImage: this.currentTenant.heroImageUrl,
      bannerImage: this.currentTenant.bannerImageUrl,
    };
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

  initialize(): Promise<void> {
    return firstValueFrom(
      this.store
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
        ),
    ) as Promise<void>;
  }

  private applyResolvedTenant(resolved: TenantResolveResponse): void {
    if (!resolved?.resolved) {
      return;
    }

    let branding: any = {};
    if (resolved.brandingJson) {
      try { branding = JSON.parse(resolved.brandingJson); } catch {}
    }

    let landingContent: any = {};
    if (resolved.landingContentJson) {
      try { landingContent = JSON.parse(resolved.landingContentJson); } catch {}
    }

    const logoSettings = branding.logoDisplay || branding.logoSettings || {};
    const templateChanged = branding.themeTemplateId && branding.themeTemplateId !== this.currentTenant.themeTemplateId;

    this.currentTenant = {
      ...this.currentTenant,
      id: this.currentTenant.id,
      domainAliases: this.currentTenant.domainAliases,
      pathAliases: this.currentTenant.pathAliases,
      themeTemplateId: branding.themeTemplateId ?? this.currentTenant.themeTemplateId,
      displayName:
        resolved.displayName || resolved.name || this.currentTenant.displayName,
      logoUrl: branding.logoUrl ?? this.currentTenant.logoUrl,
      faviconUrl: branding.faviconUrl ?? this.currentTenant.faviconUrl,
      heroImageUrl: branding.heroImageUrl ?? this.currentTenant.heroImageUrl,
      bannerImageUrl: branding.bannerImageUrl ?? this.currentTenant.bannerImageUrl,
      primaryColor: branding.primaryColor ?? this.currentTenant.primaryColor,
      accentColor: branding.accentColor ?? this.currentTenant.accentColor,
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
      copyrightText: landingContent.copyrightText ?? this.currentTenant.copyrightText,
      sectionsVisible: branding.sectionsVisible ?? landingContent.sectionVisibility ?? this.currentTenant.sectionsVisible,
      landingContent: { ...this.currentTenant.landingContent, ...landingContent },
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
    };

    if (templateChanged) {
      this.currentTenant = bootstrapFromTemplate(this.currentTenant);
    }

    this.applyTheme(this.currentTenant, this.resolveInitialThemeId());
    this.tenantVersion.update(v => v + 1);
    this.tenantVersion$.next();
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

    let mergedTheme: ThemePalette = {
      ...theme,
      primary: tenant.customTheme?.primary ?? theme.primary,
      accent: tenant.customTheme?.accent ?? theme.accent,
      bgStart: tenant.customTheme?.bgStart ?? theme.bgStart,
      bgMid: tenant.customTheme?.bgMid ?? theme.bgMid,
      bgEnd: tenant.customTheme?.bgEnd ?? theme.bgEnd,
      text: tenant.customTheme?.text ?? theme.text,
    };

    const root = document.documentElement;
    const templateTheme = this.templateTheme(tenant);
    if (templateTheme) {
      mergedTheme = { ...mergedTheme, ...templateTheme.palette };
      root.style.setProperty('--on-primary', templateTheme.onPrimary);
    } else {
      root.style.setProperty('--on-primary', '#fff8f3');
    }

    root.setAttribute('data-theme', theme.id);
    root.style.setProperty(
      '--tenant-primary',
      mergedTheme.primary || (tenant.primaryColor ?? ''),
    );
    root.style.setProperty(
      '--tenant-accent',
      mergedTheme.accent || (tenant.accentColor ?? ''),
    );
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

    document.title = tenant.displayName ?? 'Matrimony';

    const iconUrl = tenant.faviconUrl ?? tenant.logoUrl;
    if (iconUrl) {
      this.setFavicon(iconUrl);
    }
  }

  /** When a landing template is selected, expose its palette as the app theme so
   *  every page (login, register, plans, search, contact, ...) matches the design. */
  private templateTheme(tenant: TenantConfig): { palette: ThemePalette; onPrimary: string } | null {
    const id = tenant.themeTemplateId;
    const tpl = id ? APPROVED_TEMPLATES.find((t) => t.id === id) : undefined;
    if (!tpl) {
      return null;
    }
    const overrides: TemplateOverrides = tenant.themeTemplateId
      ? {
          heroImage: tenant.heroImageUrl,
          bannerImage: tenant.bannerImageUrl,
        }
      : {
          primary: tenant.primaryColor ?? tenant.customTheme?.primary,
          secondary: tenant.accentColor ?? tenant.customTheme?.accent,
          background: tenant.customTheme?.bgStart,
          text: tenant.customTheme?.text,
        };
    const v = resolveTemplateStyleVars(tpl, overrides).vars;
    return {
      palette: {
        id: tpl.id,
        name: tpl.name,
        primary: v['tp-p'],
        accent: v['tp-s'],
        bgStart: v['tp-bg'],
        bgMid: v['tp-bgd'],
        bgEnd: v['tp-bgd'],
        text: v['tp-t'],
      },
      onPrimary: v['tp-od'],
    };
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
