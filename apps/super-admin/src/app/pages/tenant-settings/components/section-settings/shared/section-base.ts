export type SettingsTab = 'content' | 'design' | 'layout';

export interface SectionConfig {
  [key: string]: any;
}

export interface SectionDef {
  key: string;
  label: string;
  icon: string;
  locked: boolean;
  alwaysVisible: boolean;
}

export const SECTION_DEFS: SectionDef[] = [
  { key: 'header', label: 'Header', icon: 'web', locked: true, alwaysVisible: true },
  { key: 'hero', label: 'Hero', icon: 'view_carousel', locked: true, alwaysVisible: true },
  { key: 'banner', label: 'Banner', icon: 'campaign', locked: false, alwaysVisible: false },
  { key: 'stats', label: 'Trust / Stats', icon: 'bar_chart', locked: false, alwaysVisible: false },
  { key: 'features', label: 'Features', icon: 'auto_awesome', locked: false, alwaysVisible: false },
  { key: 'how', label: 'How It Works', icon: 'route', locked: false, alwaysVisible: false },
  { key: 'profiles', label: 'Profiles', icon: 'people', locked: false, alwaysVisible: false },
  { key: 'success', label: 'Success Stories', icon: 'favorite', locked: false, alwaysVisible: false },
  { key: 'testimonials', label: 'Testimonials', icon: 'format_quote', locked: false, alwaysVisible: false },
  { key: 'counters', label: 'Counters', icon: 'pin_handle', locked: false, alwaysVisible: false },
  { key: 'why', label: 'Why Us', icon: 'shield', locked: false, alwaysVisible: false },
  { key: 'castes', label: 'Communities', icon: 'group_work', locked: false, alwaysVisible: false },
  { key: 'melava', label: 'Events', icon: 'event', locked: false, alwaysVisible: false },
  { key: 'app', label: 'App Download', icon: 'smartphone', locked: false, alwaysVisible: false },
  { key: 'beforeafter', label: 'Before / After', icon: 'compare', locked: false, alwaysVisible: false },
  { key: 'cta', label: 'CTA', icon: 'call_to_action', locked: false, alwaysVisible: false },
  { key: 'footer', label: 'Footer', icon: 'width_normal', locked: true, alwaysVisible: true },
];

export const DEFAULT_SECTION_CONFIGS: Record<string, SectionConfig> = {
  hero: {
    eyebrow: 'Find Your Perfect Match',
    heading: 'Begin Your Journey to a<br>Happier Tomorrow',
    subtitle: 'Join thousands of families who found their perfect match with dignity and joy.',
    ctaLabel: 'Register Free',
    ctaLink: '/register',
    ctaLabel2: 'Search Matches',
    ctaLink2: '/search',
    textAlign: 'center',
    height: 'large',
  },
  banner: {
    heading: 'Trusted by Marathi Families',
    description: 'The most trusted matrimony platform in Maharashtra.',
    chips: ['Verified', 'Private', 'Trusted'],
    ctaLabel: 'Join Now',
    ctaLink: '/register',
    ctaLabel2: 'Learn More',
    ctaLink2: '/plans',
  },
  stats: {
    items: [
      { value: '50K+', label: 'Brides' },
      { value: '48K+', label: 'Grooms' },
      { value: '30K+', label: 'Weddings' },
      { value: '4.9★', label: 'Family Rating' },
    ],
  },
  features: {
    eyebrow: 'Why Choose Us',
    title: 'Every Feature Designed for Families',
    items: [
      { icon: 'badge-check', title: 'Verified by Hand', text: 'Every profile is personally screened.' },
      { icon: 'sparkles', title: 'Culturally Curated', text: 'Matches aligned to caste, horoscope, region.' },
      { icon: 'lock', title: 'Privacy First', text: 'Family details never shared without consent.' },
    ],
  },
  how: {
    eyebrow: 'Simple Process',
    title: 'How It Works',
    steps: [
      { title: 'Create a Profile', text: 'Share family details in minutes.' },
      { title: 'Receive Matches', text: 'Get hand-picked suggestions.' },
      { title: 'Celebrate Together', text: 'Meet families and begin your union.' },
    ],
  },
  profiles: {
    eyebrow: 'Featured Matches',
    title: 'Profiles You May Like',
    viewAllLabel: 'View All Profiles',
  },
  success: {
    eyebrow: 'Real Stories',
    title: 'Success Stories',
    stories: [
      { name: 'Ashwini & Kedar', meta: 'Married Nov 2025 · Pune', quote: 'Our families connected within two weeks.' },
      { name: 'Meera & Sahil', meta: 'Married Jan 2026 · Mumbai', quote: 'Horoscope matching done so respectfully.' },
      { name: 'Priya & Arjun', meta: 'Married Mar 2026 · Nashik', quote: 'From first meeting to mangalsutra in six months.' },
    ],
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: 'What Families Say',
    items: [
      { name: 'Ashwini & Kedar', meta: 'Married Nov 2025 · Pune', quote: 'Our families connected within two weeks.' },
      { name: 'Meera & Sahil', meta: 'Married Jan 2026 · Mumbai', quote: 'Horoscope matching done so respectfully.' },
      { name: 'Priya & Arjun', meta: 'Married Mar 2026 · Nashik', quote: 'From first meeting to mangalsutra in six months.' },
    ],
  },
  counters: {
    items: [
      { value: '50K+', label: 'Brides' },
      { value: '48K+', label: 'Grooms' },
      { value: '30K+', label: 'Weddings' },
      { value: '4.9★', label: 'Family Rating' },
    ],
  },
  why: {
    eyebrow: 'Why Choose Us',
    title: 'Why Families Trust Us',
    items: [
      { icon: 'sparkles', title: 'AI-Powered Matching', text: 'Smart algorithms learn your preferences.' },
      { icon: 'shield_check', title: 'Rigorous Verification', text: 'Every profile screened and verified.' },
      { icon: 'handshake', title: 'Personal Assistance', text: 'Dedicated relationship managers at every step.' },
      { icon: 'users', title: '5 Lakh+ Happy Stories', text: 'Real Marathi couples found their match.' },
    ],
  },
  castes: {
    eyebrow: 'Communities',
    title: 'Find Your Community',
    communities: [
      'Deshastha Brahmin', '96 Kuli Maratha', 'Maratha', 'Kunbi', 'CKP', 'Pathare Prabhu',
      'Somvanshi Kshatriya', 'Chandraseniya Kayastha', 'Agri', 'Bhandari',
    ],
  },
  melava: {
    eyebrow: 'Upcoming Events',
    title: 'Melavas & Meetups',
    events: [
      { day: '8', month: 'Aug', title: 'Shubh Aarambh', place: 'Pune · Vadhu-var meetup' },
      { day: '22', month: 'Aug', title: 'Shubh Aarambh', place: 'Mumbai · Family introductions' },
    ],
  },
  app: {
    eyebrow: 'Download App',
    title: 'Find Your Match On The Go',
    subtitle: 'Download our app for the best experience.',
    playStoreUrl: '',
    appStoreUrl: '',
  },
  beforeafter: {
    eyebrow: 'Success',
    title: 'From Introduction to Celebration',
  },
  cta: {
    heading: "Your Family's Search Ends Here",
    description: 'Join thousands of families who found their perfect match.',
    ctaLabel: 'Get Started',
    ctaLink: '/register',
  },
  header: {
    logoText: '',
    navLinks: ['Home', 'Search', 'How It Works', 'Plans', 'Contact'],
    ctaLogin: 'Login',
    ctaRegister: 'Register Free',
  },
  footer: {
    description: 'The trusted matrimony platform weaving families together.',
    showSocial: true,
    showLegal: true,
    showContact: true,
  },
};
