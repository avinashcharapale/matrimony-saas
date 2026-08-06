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
  authBannerImage?: string;
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
  landingContent?: TenantLandingContent;
}

export interface TenantLandingContent {
  eyebrow?: string;
  heroBadges?: { text: string }[];
  whyChoose?: { title: string; description: string }[];
  howItWorks?: { title: string; description: string }[];
  trustCards?: { value: string; title: string; description: string; icon: string }[];
  ctaHeading?: string;
  ctaDescription?: string;
  footerDescription?: string;
  footerLinks?: { label: string; url: string }[];
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
    heroImage: 'https://images.pexels.com/photos/32947298/pexels-photo-32947298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    authBannerImage: 'https://images.pexels.com/photos/30184678/pexels-photo-30184678.jpeg?auto=compress&cs=tinysrgb&w=1600',
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
    landingContent: {
      eyebrow: 'Trusted Matrimony Platform',
      heroBadges: [
        { text: '100% Verified Profiles' },
        { text: 'Family-Approved Matches' },
      ],
      whyChoose: [
        { title: 'Trusted Platform', description: 'A reliable matrimonial platform with verified profiles and meaningful matchmaking.' },
        { title: 'Smart Matching', description: 'AI-powered matching based on preferences, location, and lifestyle.' },
        { title: 'Verified Profiles', description: 'Every profile is carefully verified for authenticity and trust.' },
        { title: 'Affordable Plans', description: 'Quality matchmaking accessible for everyone.' },
      ],
      howItWorks: [
        { title: 'Register & Create Profile', description: 'Sign up and tell us your details including profession, education, and family background.' },
        { title: 'Enroll & Pay', description: 'Activate your account with an affordable yearly membership.' },
        { title: 'Search Matches', description: 'Browse verified profiles filtered by age, location, education and occupation.' },
        { title: 'Connect & Meet', description: 'Exchange contacts and start your journey with confidence.' },
      ],
      trustCards: [
        { value: '11,000+', title: 'Genuine Profiles', description: 'Every profile is verified by our team for authenticity and trust.', icon: '🪪' },
        { value: '26+ Years', title: 'Most Trusted', description: 'The most trusted matrimony service.', icon: '🏆' },
        { value: 'AI + Manual', title: 'Smart Match', description: 'Find matches by preferences, location, education and more.', icon: '🔎' },
        { value: '28,000+', title: 'Weddings Complete', description: 'Thousands of happy families and success stories every year.', icon: '💍' },
      ],
      ctaHeading: 'Begin Your Journey Today',
      ctaDescription: 'Join thousands of families who found their perfect match.',
      footerDescription: 'Trusted matrimony service with real profiles and meaningful matchmaking.',
      footerLinks: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Refund Policy', url: '/refund' },
      ],
    },
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
    heroImage: 'https://images.pexels.com/photos/32947298/pexels-photo-32947298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    authBannerImage: 'https://images.pexels.com/photos/30184678/pexels-photo-30184678.jpeg?auto=compress&cs=tinysrgb&w=1600',
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
    landingContent: {
      eyebrow: 'Trusted Matrimony Service',
      heroBadges: [
        { text: 'Verified Profiles' },
        { text: 'Family-Approved Matches' },
      ],
      whyChoose: [
        { title: '26+ Years of Experience', description: 'Decades of trusted matrimony service with deep roots in the Maratha community.' },
        { title: 'Exclusive for Marathas', description: 'A focused platform for Marathas, including families, brides and grooms.' },
        { title: 'Verified Profiles', description: 'Every profile is carefully verified for authenticity and better trust.' },
        { title: 'Affordable Membership', description: 'A low yearly plan that keeps quality matchmaking accessible for everyone.' },
      ],
      howItWorks: [
        { title: 'Register & Create Profile', description: 'Sign up and tell us your details including profession, education, and family background.' },
        { title: 'Enroll & Pay', description: 'Activate your account with an affordable yearly membership.' },
        { title: 'Search Matches', description: 'Browse verified profiles filtered by age, location, education and occupation.' },
        { title: 'Connect & Meet', description: 'Exchange contacts and start your journey with confidence.' },
      ],
      trustCards: [
        { value: '11,000+', title: 'Genuine Profiles', description: 'Every profile is verified by our team for authenticity and trust.', icon: '🪪' },
        { value: '26+ Years', title: 'Most Trusted', description: 'The most trusted Maratha matrimony service in Maharashtra.', icon: '🏆' },
        { value: 'AI + Manual', title: 'Smart Match', description: 'Find matches by preferences, location, education and more.', icon: '🔎' },
        { value: '28,000+', title: 'Weddings Complete', description: 'Thousands of happy families and success stories every year.', icon: '💍' },
      ],
      ctaHeading: 'Begin Your Journey Today',
      ctaDescription: 'Join thousands of families who found their perfect match.',
      footerDescription: 'Trusted matrimony service for the Maratha community.',
      footerLinks: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Refund Policy', url: '/refund' },
      ],
    },
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
