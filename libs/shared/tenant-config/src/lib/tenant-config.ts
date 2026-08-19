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
  displayName: string;
  defaultLanguage: string;
  defaultCurrency: string;
  logoText: string;
  logoEmoji?: string;
  logoUrl?: string;
  faviconUrl?: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageUrl?: string;
  bannerImageUrl?: string;
  authBannerImage?: string;
  primaryColor: string;
  accentColor: string;
  defaultThemeId?: string;
  themeTemplateId?: string;
  customTheme?: Partial<ThemePalette>;
  contacts: TenantContact[];
  featureFlags?: Record<string, boolean>;
  copyrightText: string;
  ctaLogin: string;
  ctaEnroll: string;
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
    displayName: 'Matrimony Demo',
    defaultLanguage: 'en',
    defaultCurrency: 'INR',
    logoText: 'Matrimony',
    logoEmoji: '💍',
    tagline: 'Trusted Matrimony Platform',
    heroTitle: 'Find Your Life Partner',
    heroSubtitle: 'Trusted by thousands of families',
    heroDescription: 'Join the trusted matrimonial platform with real profiles, guidance, and simple enrollment.',
    heroImage: 'https://images.pexels.com/photos/32947298/pexels-photo-32947298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    authBannerImage: 'https://images.pexels.com/photos/30184678/pexels-photo-30184678.jpeg?auto=compress&cs=tinysrgb&w=1600',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
    defaultThemeId: 'warm-ivory',
    themeTemplateId: 'paithani-royal',
    contacts: [
      { type: 'Phone', label: 'Support', value: '+91 9999999999', isPrimary: true },
      { type: 'Email', label: 'Support', value: 'support@demo.matrimony.local', isPrimary: true },
      { type: 'Address', label: 'Office', value: 'Demo Address' },
    ],
    copyrightText: '© 2026 Matrimony Demo. All rights reserved.',
    ctaLogin: 'Sign In',
    ctaEnroll: 'Register Now',
    domainAliases: ['demo.matrimony.local', 'localhost'],
    pathAliases: ['demo'],
    landingContent: {
      eyebrow: 'Trusted Matrimony Platform',
      heroBadges: [
        { text: '100% Verified Profiles' },
        { text: 'Family-Approved Matches' },
      ],
      whyItems: [
        { icon: 'sparkles', title: 'Trusted Platform', text: 'A reliable matrimonial platform with verified profiles and meaningful matchmaking.' },
        { icon: 'shield-check', title: 'Smart Matching', text: 'AI-powered matching based on preferences, location, and lifestyle.' },
        { icon: 'badge-check', title: 'Verified Profiles', text: 'Every profile is carefully verified for authenticity and trust.' },
        { icon: 'heart-handshake', title: 'Affordable Plans', text: 'Quality matchmaking accessible for everyone.' },
      ],
      steps: [
        { title: 'Register & Create Profile', text: 'Sign up and tell us your details including profession, education, and family background.' },
        { title: 'Enroll & Pay', text: 'Activate your account with an affordable yearly membership.' },
        { title: 'Search Matches', text: 'Browse verified profiles filtered by age, location, education and occupation.' },
        { title: 'Connect & Meet', text: 'Exchange contacts and start your journey with confidence.' },
      ],
      trustItems: [
        { icon: 'badge-check', title: '100% Verified Profiles' },
        { icon: 'shield-check', title: 'Privacy Protected' },
        { icon: 'heart-handshake', title: 'Family-Focused Matching' },
      ],
      ctaHeading: 'Begin Your Journey Today',
      ctaDescription: 'Join thousands of families who found their perfect match.',
      footerDescription: 'Trusted matrimony service with real profiles and meaningful matchmaking.',
      footerColumns: [
        { heading: 'Legal', links: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms & Conditions', url: '/terms' },
          { label: 'Refund Policy', url: '/refund' },
        ]},
      ],
    },
  },
  {
    id: 'anand-maratha',
    displayName: 'Anand Maratha',
    defaultLanguage: 'mr',
    defaultCurrency: 'INR',
    logoText: 'Anand Maratha',
    logoEmoji: '🌼',
    tagline: 'Maratha Matrimony',
    heroTitle: 'आनंद मराठा वधूवर केंद्र',
    heroSubtitle: 'मराठा समाजासाठी महाराष्ट्रातील अग्रणी विवाहसंस्था',
    heroDescription: 'Join the trusted matrimonial platform for Marathi communities with real profiles, astrology guidance, and simple enrollment.',
    heroImage: 'https://images.pexels.com/photos/32947298/pexels-photo-32947298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    authBannerImage: 'https://images.pexels.com/photos/30184678/pexels-photo-30184678.jpeg?auto=compress&cs=tinysrgb&w=1600',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
    defaultThemeId: 'warm-ivory',
    themeTemplateId: 'sundarjodi-castes',
    contacts: [
      { type: 'Phone', label: 'Office', value: '+91 9822214005', isPrimary: true },
      { type: 'Phone', label: 'Alternate', value: '+91 9921501133' },
      { type: 'Email', label: 'Contact', value: 'contact@anandmaratha.com', isPrimary: true },
      { type: 'Address', label: 'Office', value: '203, 2nd Floor, Saras Plaza, Opp. Shaniwar Wada, Pune - 411030, Maharashtra' },
    ],
    copyrightText: '© 2026 Anand Maratha Marriage Bureau. All rights reserved.',
    ctaLogin: 'Profile Login',
    ctaEnroll: 'Enroll Now',
    domainAliases: ['anandmaratha.com', 'www.anandmaratha.com'],
    pathAliases: ['anand-maratha'],
    landingContent: {
      eyebrow: 'Trusted Matrimony Service',
      heroBadges: [
        { text: 'Verified Profiles' },
        { text: 'Family-Approved Matches' },
      ],
      whyItems: [
        { icon: 'sparkles', title: '26+ Years of Experience', text: 'Decades of trusted matrimony service with deep roots in the Maratha community.' },
        { icon: 'users', title: 'Exclusive for Marathas', text: 'A focused platform for Marathas, including families, brides and grooms.' },
        { icon: 'badge-check', title: 'Verified Profiles', text: 'Every profile is carefully verified for authenticity and better trust.' },
        { icon: 'heart-handshake', title: 'Affordable Membership', text: 'A low yearly plan that keeps quality matchmaking accessible for everyone.' },
      ],
      steps: [
        { title: 'Register & Create Profile', text: 'Sign up and tell us your details including profession, education, and family background.' },
        { title: 'Enroll & Pay', text: 'Activate your account with an affordable yearly membership.' },
        { title: 'Search Matches', text: 'Browse verified profiles filtered by age, location, education and occupation.' },
        { title: 'Connect & Meet', text: 'Exchange contacts and start your journey with confidence.' },
      ],
      trustItems: [
        { icon: 'badge-check', title: '100% Verified Profiles' },
        { icon: 'shield-check', title: 'Privacy Protected' },
        { icon: 'heart-handshake', title: 'Family-Focused Matching' },
      ],
      ctaHeading: 'Begin Your Journey Today',
      ctaDescription: 'Join thousands of families who found their perfect match.',
      footerDescription: 'Trusted matrimony service for the Maratha community.',
      footerColumns: [
        { heading: 'Legal', links: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms & Conditions', url: '/terms' },
          { label: 'Refund Policy', url: '/refund' },
        ]},
      ],
    },
  },
  {
    id: 'petwatch',
    displayName: '24Petwatch',
    defaultLanguage: 'en',
    defaultCurrency: 'CAD',
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
    contacts: [
      { type: 'Phone', label: 'Support', value: '+1 866-375-7387', isPrimary: true },
      { type: 'Email', label: 'Support', value: 'support@24petwatch.com', isPrimary: true },
      { type: 'Address', label: 'Head Office', value: 'Pethealth Inc., Oakville, ON, Canada' },
    ],
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
