import { APPROVED_TEMPLATES, type LandingTemplate } from '@org/landing-templates';

export interface TenantContact {
  type: 'Email' | 'Phone' | 'WhatsApp' | 'Social' | 'Address';
  label?: string;
  value: string;
  isPrimary?: boolean;
}

export interface TenantLogoSettings {
  width?: string;
  height?: string;
  objectFit?: string;
  padding?: string;
  margin?: string;
  background?: string;
  borderRadius?: string;
  border?: string;
  shadow?: string;
}

export interface TenantSocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface TenantFooterSettings {
  showSocialMedia?: boolean;
  showLegalLinks?: boolean;
  showContactInfo?: boolean;
}

export interface TenantConfig {
  id: string;
  displayName?: string;
  defaultLanguage?: string;
  defaultCurrency?: string;
  logoText?: string;
  logoEmoji?: string;
  logoUrl?: string;
  faviconUrl?: string;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage?: string;
  heroImageUrl?: string;
  bannerImageUrl?: string;
  authBannerImage?: string;
  primaryColor?: string;
  accentColor?: string;
  defaultThemeId?: string;
  themeTemplateId?: string;
  customTheme?: Partial<ThemePalette>;
  contacts?: TenantContact[];
  featureFlags?: Record<string, boolean>;
  copyrightText?: string;
  ctaLogin?: string;
  ctaEnroll?: string;
  domainAliases: string[];
  pathAliases: string[];
  landingContent?: TenantLandingContent;
  logoSettings?: TenantLogoSettings;
  socialMedia?: TenantSocialMedia;
  footerSettings?: TenantFooterSettings;
}

export interface TenantLandingContent {
  eyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroBadges?: { text: string }[];
  heroImageUrl?: string;
  heroImageUrl2?: string;
  bannerOverrideImageUrl?: string;
  pageBackgroundImageUrl?: string;
  ctaLogin?: string;
  ctaEnroll?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  stickyBarText?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  stats?: { value: string; label: string }[];
  features?: { icon: string; title: string; text: string }[];
  steps?: { title: string; text: string }[];
  stories?: { name: string; meta: string; quote: string; image: number }[];
  whyItems?: { icon: string; title: string; text: string }[];
  trustItems?: { icon: string; title: string }[];
  communities?: string[];
  events?: { day: string; month: string; title: string; place: string }[];
  // ── Section headings ──
  bannerEyebrow?: string;
  bannerHeading?: string;
  bannerDescription?: string;
  bannerChips?: { icon: string; label: string }[];
  bannerCta1?: string;
  bannerCta2?: string;
  featuresEyebrow?: string;
  featuresTitle?: string;
  howEyebrow?: string;
  howTitle?: string;
  profilesEyebrow?: string;
  profilesTitle?: string;
  profilesViewAll?: string;
  storiesEyebrow?: string;
  storiesTitle?: string;
  ctaAdvisorLabel?: string;
  whyEyebrow?: string;
  whyTitle?: string;
  casteEyebrow?: string;
  casteTitle?: string;
  casteNote?: string;
  melavaEyebrow?: string;
  melavaTitle?: string;
  melavaViewLabel?: string;
  appEyebrow?: string;
  appTitle?: string;
  appDescription?: string;
  appRating?: string;
  appReviewNote?: string;
  testimonialsEyebrow?: string;
  testimonialsTitle?: string;
  countersEyebrow?: string;
  countersTitle?: string;
  beforeAfterEyebrow?: string;
  beforeAfterTitle?: string;
  formTitle?: string;
  formSubtitle?: string;
  formBrideLabel?: string;
  formGroomLabel?: string;
  formLookingForLabel?: string;
  formCasteLabel?: string;
  formCommunities?: string[];
  formMiniStats?: { value: string; label: string }[];
  stickyBarCta?: string;
  footerDescription?: string;
  footerColumns?: { heading: string; links: { label: string; url: string }[] }[];
  navLinks?: { label: string; href: string }[];
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  copyrightText?: string;
}

export interface ThemePalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  text: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'warm-ivory',
    name: 'Warm Ivory',
    primary: '#a85436',
    accent: '#ca8a66',
    bgStart: '#fff2e8',
    bgMid: '#f6f1ed',
    bgEnd: '#f4f0ec',
    text: '#242638',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    primary: '#4d56d6',
    accent: '#66a7ff',
    bgStart: '#eef1ff',
    bgMid: '#e8ecff',
    bgEnd: '#f1f4ff',
    text: '#1f2544',
  },
  {
    id: 'emerald-sand',
    name: 'Emerald Sand',
    primary: '#17776d',
    accent: '#46bda8',
    bgStart: '#edf8f4',
    bgMid: '#eef6f3',
    bgEnd: '#f6fbf9',
    text: '#1e2f30',
  },
];

export const TENANT_CONFIGS: TenantConfig[] = [
  {
    id: 'demo',
    domainAliases: ['localhost'],
    pathAliases: [],
    themeTemplateId: 'marigold-traditional',
  },
];

export const DEFAULT_TENANT = TENANT_CONFIGS[0];

export function resolveTenant(
  hostname: string,
  search: string,
  defaultTenantId = DEFAULT_TENANT.id,
): TenantConfig {
  const params = new URLSearchParams(search);
  const tenantId = params.get('tenant');

  if (tenantId) {
    const tenant = TENANT_CONFIGS.find((config) => config.id === tenantId);
    if (tenant) {
      return tenant;
    }
  }

  const normalizedHost = hostname.toLowerCase();
  const hostMatch = TENANT_CONFIGS.find((config) =>
    config.domainAliases.some((alias) => normalizedHost.includes(alias)),
  );
  if (hostMatch) {
    return hostMatch;
  }

  return (
    TENANT_CONFIGS.find((config) => config.id === defaultTenantId) ??
    DEFAULT_TENANT
  );
}

const DEFAULT_TEMPLATE_ID = 'marigold-traditional';

export function findTemplate(templateId?: string): LandingTemplate {
  const id = templateId || DEFAULT_TEMPLATE_ID;
  return APPROVED_TEMPLATES.find((t) => t.id === id) ?? APPROVED_TEMPLATES[0];
}

export function bootstrapFromTemplate(config: TenantConfig): TenantConfig {
  const tpl = findTemplate(config.themeTemplateId);
  return {
    ...config,
    displayName: config.displayName || `${tpl.brand} Matrimony`,
    logoText: config.logoText || tpl.brand,
    tagline: config.tagline || tpl.eyebrow || tpl.brand,
    heroTitle: config.heroTitle || tpl.h1?.replace(/<[^>]*>/g, '') || tpl.brand,
    heroSubtitle: config.heroSubtitle || tpl.sub || '',
    heroDescription: config.heroDescription || tpl.sub || '',
    heroImage: config.heroImage || '',
    primaryColor: config.primaryColor || tpl.c.p,
    accentColor: config.accentColor || tpl.c.s,
    defaultLanguage: config.defaultLanguage || 'en',
    defaultCurrency: config.defaultCurrency || 'INR',
    ctaLogin: config.ctaLogin || tpl.cta2 || 'Sign In',
    ctaEnroll: config.ctaEnroll || tpl.cta1 || 'Register Free',
    copyrightText: config.copyrightText || `© ${new Date().getFullYear()} ${tpl.brand} Matrimony. All rights reserved.`,
    contacts: config.contacts || [],
  };
}
