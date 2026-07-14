export interface TenantConfig {
  id: string;
  displayName: string;
  logoText: string;
  logoEmoji?: string;
  logoUrl?: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  primaryColor: string;
  accentColor: string;
  defaultThemeId?: string;
  customTheme?: Partial<ThemePalette>;
  supportPhone: string;
  supportEmail: string;
  supportAddress: string;
  copyrightText: string;
  ctaLogin: string;
  ctaEnroll: string;
  domainAliases: string[];
  pathAliases: string[];
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
    displayName: 'Matrimony Demo',
    logoText: 'Matrimony',
    logoEmoji: '💍',
    tagline: 'Trusted Matrimony Platform',
    heroTitle: 'Find Your Life Partner',
    heroSubtitle: 'Trusted by thousands of families',
    heroDescription: 'Join the trusted matrimonial platform with real profiles, guidance, and simple enrollment.',
    heroImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
    defaultThemeId: 'warm-ivory',
    supportPhone: '+91 9999999999',
    supportEmail: 'support@demo.matrimony.local',
    supportAddress: 'Demo Address',
    copyrightText: '© 2026 Matrimony Demo. All rights reserved.',
    ctaLogin: 'Sign In',
    ctaEnroll: 'Register Now',
    domainAliases: ['demo.matrimony.local', 'localhost'],
    pathAliases: ['demo'],
  },
  {
    id: 'anand-maratha',
    displayName: 'Anand Maratha',
    logoText: 'Anand Maratha',
    logoEmoji: '🌼',
    tagline: 'Maratha Matrimony',
    heroTitle: 'आनंद मराठा वधूवर केंद्र',
    heroSubtitle: 'मराठा समाजासाठी महाराष्ट्रातील अग्रणी विवाहसंस्था',
    heroDescription: 'Join the trusted matrimonial platform for Marathi communities with real profiles, astrology guidance, and simple enrollment.',
    heroImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
    defaultThemeId: 'warm-ivory',
    supportPhone: '+91 9822214005 / 9921501133',
    supportEmail: 'contact@anandmaratha.com',
    supportAddress: '203, 2nd Floor, Saras Plaza, Opp. Shaniwar Wada, Pune - 411030, Maharashtra',
    copyrightText: '© 2026 Anand Maratha Marriage Bureau. All rights reserved.',
    ctaLogin: 'Profile Login',
    ctaEnroll: 'Enroll Now',
    domainAliases: ['anandmaratha.com', 'www.anandmaratha.com'],
    pathAliases: ['anand-maratha'],
  },
  {
    id: 'petwatch',
    displayName: '24Petwatch',
    logoText: '24Petwatch',
    logoEmoji: '🐾',
    tagline: 'Pet Care Platform',
    heroTitle: 'Your Pet\'s Trusted Care Partner',
    heroSubtitle: 'Protect your pet with fast claims and trusted coverage',
    heroDescription: 'Bring your pets into a comprehensive care network with easy enrollment and on-demand support.',
    heroImage: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1600&q=80',
    primaryColor: '#0f7079',
    accentColor: '#14b8a6',
    defaultThemeId: 'emerald-sand',
    supportPhone: '+1 866-375-7387',
    supportEmail: 'support@24petwatch.com',
    supportAddress: 'Pethealth Inc., Oakville, ON, Canada',
    copyrightText: '© 2026 24Petwatch. All rights reserved.',
    ctaLogin: 'Log In',
    ctaEnroll: 'Get Started',
    domainAliases: ['24petwatch.com', 'www.24petwatch.com'],
    pathAliases: ['petwatch'],
  },
];

/** Tenant code returned by the gateway resolve endpoint → local tenant id */
export const TENANT_CODE_MAP: Record<string, string> = {
  DEMO_TENANT: 'demo',
  ANAND_MARATHA: 'anand-maratha',
  PETWATCH: 'petwatch',
};

export const DEFAULT_TENANT = TENANT_CONFIGS[0];

export function resolveTenant(hostname: string, search: string): TenantConfig {
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

  return DEFAULT_TENANT;
}
