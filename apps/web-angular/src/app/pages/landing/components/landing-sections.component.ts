import { Component, ChangeDetectionStrategy, Input, inject, OnInit, OnDestroy, AfterViewInit, HostListener, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  APPROVED_TEMPLATES,
  LandingTemplate,
  TemplateOverrides,
  resolveTemplateStyleVars,
} from '@org/landing-templates';
import { TenantContact } from '@org/tenant-config';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from '../landing.models';
import { TplIconComponent } from './tpl-icon.component';
import { LanguageSelectorComponent } from '../../../components/language-selector/language-selector.component';

export interface TplTenantView {
  displayName?: string;
  logoUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage?: string;
  ctaEnroll?: string;
  ctaLogin?: string;
  contacts?: TenantContact[];
  copyrightText?: string;
  landingContent?: {
    eyebrow?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    heroImageUrl?: string;
    heroImageUrl2?: string;
    bannerOverrideImageUrl?: string;
    pageBackgroundImageUrl?: string;
    ctaLogin?: string;
    ctaEnroll?: string;
    ctaHeading?: string;
    ctaDescription?: string;
    stats?: { value: string; label: string }[];
    features?: { icon: string; title: string; text: string }[];
    steps?: { title: string; text: string }[];
    stories?: { name: string; meta: string; quote: string; image: number }[];
    whyItems?: { icon: string; title: string; text: string }[];
    trustItems?: { icon: string; title: string }[];
    communities?: string[];
    events?: { day: string; month: string; title: string; place: string }[];
    footerDescription?: string;
    footerColumns?: { heading: string; links: { label: string; url: string }[] }[];
    copyrightText?: string;
    stickyBarText?: string;
    stickyBarCta?: string;
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
    playStoreUrl?: string;
    appStoreUrl?: string;
  };
  socialMedia?: { facebook?: string; instagram?: string; youtube?: string; twitter?: string; whatsapp?: string };
  footerSettings?: { showSocialMedia?: boolean; showLegalLinks?: boolean; showContactInfo?: boolean };
}

interface TplStory {
  name: string;
  meta: string;
  quote: string;
  image: number;
}

interface TplFeature {
  icon: string;
  title: string;
  text: string;
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop`;

const img = (src: string, params?: string): string => {
  const sep = src.includes('?') ? '&' : '?';
  return src + (params ? sep + params : '');
};

const IMG = {
  hero: [
    'photo-1741201864879-c5e7f81c98b0',
    'photo-1602631985686-1bb0e6a8696e',
    'photo-1511795409834-ef04bbd61622',
    'photo-1522673607200-164d1b6ce486',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
    'photo-1607330289024-1535c6b4e1c1',
    'photo-1519741497674-611481863552',
  ],
  brides: [
    'photo-1531123897727-8f129e1688ce',
    'photo-1589156280159-27698a70f29e',
    'photo-1607330289024-1535c6b4e1c1',
    'photo-1531746020798-e6953c6e8e04',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
  ],
  grooms: [
    'photo-1583394838336-acd977736f90',
    'photo-1568602471122-7832951cc4c5',
    'photo-1506794778202-cad84cf45f1d',
    'photo-1635488640163-e5f6782cda6e',
    'photo-1520854221256-17451cc331bf',
    'photo-1519225421980-715cb0215aed',
  ],
  stories: [
    'photo-1519741497674-611481863552',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
    'photo-1583939003579-730e3918a45a',
    'photo-1602631985686-1bb0e6a8696e',
    'photo-1511795409834-ef04bbd61622',
  ],
  banner: 'photo-1741201864879-c5e7f81c98b0',
};

const TRUST: string[] = [
  'badge-check',
  '100% Verified Profiles',
  'shield-check',
  'Privacy Protected',
  'heart-handshake',
  'Family-Focused Matching',
];

const FEATURES: TplFeature[] = [
  { icon: 'scroll-text', title: 'Horoscope Matching', text: 'Kundali matching done by experienced pandits before families connect \u2014 the way it has always been.' },
  { icon: 'shield-check', title: 'Parent-Assisted', text: 'Parents are involved at every step, with dedicated relationship managers for respectful meetings.' },
  { icon: 'badge-check', title: 'Document Verified', text: 'Identity, education and background documents verified by our local verification team.' },
];

const STEPS: { title: string; text: string }[] = [
  { title: 'Register the Family', text: 'Create a family profile with photos, education and preferences.' },
  { title: 'Connect with Families', text: 'Share horoscopes and preferences through our advisor.' },
  { title: 'Celebrate Shubh Vivah', text: 'Families meet, elders bless, and a new journey begins.' },
];

const STORIES: TplStory[] = [
  { name: 'Sunita & Rajesh Deshpande', meta: 'Married Nov 2025 \u00b7 Pune', quote: 'Our families connected within two weeks. The verification team gave everyone complete confidence in the process.', image: 0 },
  { name: 'Aishwarya & Rohan Patil', meta: 'Married Jan 2026 \u00b7 Mumbai', quote: 'Horoscope matching and family meetings were handled so respectfully. The traditional way, done right.', image: 1 },
  { name: 'Pooja & Vikram Jadhav', meta: 'Married Mar 2026 \u00b7 Nashik', quote: 'From first meeting to mangalsutra in six months. Our families are grateful for such a caring platform.', image: 2 },
];

const WHY_ITEMS: TplFeature[] = [
  { icon: 'sparkles', title: 'AI-Powered Matching', text: 'Smart algorithms learn your family\u2019s preferences and surface truly compatible profiles.' },
  { icon: 'shield-check', title: 'Rigorous Verification', text: 'Every profile is screened and mobile-verified before it reaches you.' },
  { icon: 'heart-handshake', title: 'Personal Assistance', text: 'Dedicated relationship managers guide parents at every step.' },
  { icon: 'users', title: '5 Lakh+ Happy Stories', text: 'Real Marathi couples found their life partner on our platform.' },
  { icon: 'badge-check', title: 'Trusted for 26 Years', text: 'The most trusted Marathi matrimony service, generation after generation.' },
  { icon: 'map-pin', title: 'Melavas Across Maharashtra', text: 'Attend community meetups and family introductions near you, in person.' },
];

const CASTES: string[] = [
  'Deshastha Brahmin', '96 Kuli Maratha', 'Maratha', 'Kunbi', 'CKP', 'Pathare Prabhu',
  'Somvanshi Kshatriya', 'Chandraseniya Kayastha', 'Agri', 'Bhandari', 'Vani', 'Gurav',
  'Sonar', 'Koli', 'Mali', 'Dhangar', 'Teli', 'Shimpi', 'Lohar', 'Vaishya', 'Jain',
  'Neo Buddhist', 'Sutar', 'Nhavi', 'Gavandi', 'Kumbhar',
];

const EVENTS: { day: string; month: string; title: string; place: string }[] = [
  { day: '8', month: 'Aug', title: 'Shubh Aarambh (Marathi)', place: 'Pune \u00b7 Vadhu-var meetup for all castes' },
  { day: '22', month: 'Aug', title: 'Shubh Aarambh (Marathi)', place: 'Mumbai \u00b7 Family introductions' },
  { day: '30', month: 'Aug', title: 'Lagna Tharavtana', place: 'Counselling workshop for parents' },
  { day: '20', month: 'Sep', title: 'New York Meet Up', place: 'NRI Marathi community gathering' },
  { day: '3', month: 'Oct', title: 'Berlin Meet Up', place: 'NRI Marathi community gathering' },
  { day: '10', month: 'Oct', title: 'London Meet Up', place: 'NRI Marathi community gathering' },
];

const DEFAULT_STATS: { value: string; label: string }[] = [
  { value: '50,000+', label: 'Verified Brides' },
  { value: '48,000+', label: 'Verified Grooms' },
  { value: '30,000+', label: 'Happy Marriages' },
  { value: '4.9\u2605', label: 'Family Rating' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-sections',
  standalone: true,
  imports: [TplIconComponent, RouterModule, TranslateModule, LanguageSelectorComponent],
  templateUrl: './landing-sections.component.html',
})
export class LandingSectionsComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) tpl!: LandingTemplate;
  @Input() overrides: TemplateOverrides = {};
  @Input({ required: true }) tenant!: TplTenantView;
  @Input() stats: StatItem[] = [];
  @Input() whyChoose: FeatureItem[] = [];
  @Input() howItWorks: FeatureItem[] = [];
  @Input() autoScrollProfiles: ProfileItem[] = [];
  @Input() trustCards: TrustCardItem[] = [];
  @Input() sectionsVisible: Record<string, boolean> = {};

  readonly stickyBarVisible = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly testimonialIndex = signal(0);
  private readonly isLoading = signal(true);
  private readonly scrollThreshold = 600;
  private testimonialTimer: ReturnType<typeof setInterval> | null = null;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrolled = window.scrollY > this.scrollThreshold;
    this.stickyBarVisible.set(scrolled && this.tpl.stickyBar != null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.mobileMenuOpen()) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.tpl-nav') && !target.closest('.nav-hamburger')) {
      this.mobileMenuOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.loadTemplateFonts();
    setTimeout(() => this.isLoading.set(false), 300);
    this.startTestimonialRotation();
  }

  ngOnDestroy(): void {
    if (this.testimonialTimer) clearInterval(this.testimonialTimer);
  }

  private startTestimonialRotation(): void {
    this.testimonialTimer = setInterval(() => {
      this.testimonialIndex.update(i => (i + 1) % this.testimonialItems.length);
    }, 4000);
  }

  setTestimonial(index: number): void {
    this.testimonialIndex.set(index);
    if (this.testimonialTimer) clearInterval(this.testimonialTimer);
    this.startTestimonialRotation();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  get hostStyle(): Record<string, string> {
    const { vars } = resolveTemplateStyleVars(this.tpl, this.overrides);
    const style: Record<string, string> = {};
    for (const key of Object.keys(vars)) {
      style[`--${key}`] = vars[key];
    }
    return style;
  }

  get sections(): string[] {
    const vis = this.sectionsVisible;
    return ['nav', 'hero', ...this.tpl.order.filter(s => vis[s] !== false), 'footer'];
  }

  get brandName(): string {
    return this.tenant.displayName || (this.tpl.brand ? `${this.tpl.brand} Matrimony` : 'Matrimony');
  }

  get brandLetter(): string {
    return this.brandName.trim().charAt(0).toUpperCase() || 'M';
  }

  get navDark(): boolean {
    return typeof this.tpl.nav === 'object' && !!this.tpl.nav?.dark;
  }

  get eyebrowText(): string {
    return this.tenant.displayName || this.tpl.eyebrow || this.tenant.landingContent?.eyebrow || '';
  }

  get heroH1Html(): SafeHtml {
    const title = this.tpl.h1 || this.tenant.landingContent?.heroTitle || this.tenant.heroTitle || this.brandName;
    return this.sanitizer.bypassSecurityTrustHtml(title);
  }

  get heroSub(): string {
    return this.tpl.sub || this.tenant.landingContent?.heroSubtitle || this.tenant.landingContent?.heroDescription || this.tenant.heroSubtitle || this.tenant.heroDescription || '';
  }

  get cta1(): string {
    return this.tpl.cta1 || this.tenant.landingContent?.ctaEnroll || this.tenant.ctaEnroll || 'Register Free';
  }

  get cta2(): string {
    return this.tpl.cta2 || this.tenant.landingContent?.ctaLogin || 'Search Matches';
  }

  get heroDark(): boolean {
    if (this.tpl.darkHero !== undefined) return this.tpl.darkHero;
    const darkHeroes = ['frame', 'royal', 'fullbleed', 'parallax'];
    return darkHeroes.includes(this.tpl.hero);
  }

  get heroOrnClass(): string {
    return this.tpl.orn === 'rangoli'
      ? 'orn-rangoli'
      : this.tpl.orn === 'kite'
        ? 'orn-kite'
        : this.tpl.orn === 'mandala'
          ? 'orn-mandala'
          : '';
  }

  get heroGridClass(): string {
    return this.tpl.gridVar || 'gold-ring';
  }

  get heroImages(): string[] {
    const start = (this.templateIndex() * 2) % IMG.hero.length;
    const list = [0, 1, 2, 3].map((i) => U(IMG.hero[(start + i) % IMG.hero.length]) + '&w=500&q=60');
    const heroOverride = this.overrides.heroImage || this.tenant.landingContent?.heroImageUrl;
    if (heroOverride) {
      list[0] = img(heroOverride, 'w=900&q=70');
    }
    const hero2 = this.tenant.landingContent?.heroImageUrl2;
    if (hero2) {
      list[1] = img(hero2, 'w=900&q=70');
    }
    return list;
  }

  get heroArchImage(): string {
    const override = this.overrides.heroImage || this.tenant.landingContent?.heroImageUrl;
    if (override) {
      return img(override, 'w=420&q=70');
    }
    return U(IMG.hero[this.templateIndex() % IMG.hero.length]) + '&w=420&q=70';
  }

  get heroSplitImages(): string[] {
    return this.heroImages.slice(0, 3).map((s) => s.replace('&w=500', '&w=520'));
  }

  get heroFullbleedBg(): string {
    const src = this.overrides.heroImage || this.tenant.landingContent?.pageBackgroundImageUrl || this.tpl.bannerImg || IMG.hero[this.templateIndex() % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return `url('${img(base, 'w=1600&q=70')}')`;
  }

  get heroTrust(): { icon: string; label: string }[] {
    const trustItems = this.tenant.landingContent?.trustItems;
    if (trustItems?.length) {
      return trustItems.map(t => ({ icon: t.icon, label: t.title }));
    }
    return [0, 2, 4].map((i) => ({ icon: TRUST[i], label: TRUST[i + 1] }));
  }

  get motifDividerClass(): string {
    return this.tpl.motif === 'butti2' ? 'm-butti2' : `m-${this.tpl.motif}`;
  }

  get motifClass(): string {
    return `m-${this.tpl.motif}`;
  }

  get formForGroom(): boolean {
    return this.tpl.formFor === 'groom';
  }

  get bannerImg(): string {
    const src = this.overrides.bannerImage || this.tenant.landingContent?.bannerOverrideImageUrl || this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 3) % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return img(base, 'w=1920&q=70');
  }

  get statCells(): { value: string; label: string }[] {
    const lc = this.tenant.landingContent?.stats;
    if (lc?.length) return lc;
    if (this.stats.length > 0) {
      return this.stats.map((s) => ({ value: s.value, label: s.label }));
    }
    return DEFAULT_STATS;
  }

  get featureCards(): TplFeature[] {
    const lcFeatures = this.tenant.landingContent?.features;
    if (lcFeatures?.length) {
      return lcFeatures.slice(0, 3);
    }
    if (this.whyChoose.length > 0) {
      return this.whyChoose.slice(0, 3).map((f, i) => ({
        icon: FEATURES[i]?.icon ?? 'badge-check',
        title: f.title,
        text: f.description,
      }));
    }
    return FEATURES;
  }

  get steps(): { title: string; text: string }[] {
    const lcSteps = this.tenant.landingContent?.steps;
    if (lcSteps?.length) return lcSteps.slice(0, 3);
    if (this.howItWorks.length > 0) {
      return this.howItWorks.slice(0, 3).map((s) => ({ title: s.title, text: s.description }));
    }
    return STEPS;
  }

  get profileCards(): (ProfileItem & { img: string })[] {
    const start = this.templateIndex();
    return this.autoScrollProfiles.slice(0, 4).map((p, i) => {
      const pool = i % 2 === 0 ? IMG.brides : IMG.grooms;
      const idx = (start + Math.floor(i / 2)) % pool.length;
      return { ...p, img: p.photoUrl || U(pool[idx]) + '&w=600&q=60' };
    });
  }

  get storyCards(): (TplStory & { img: string })[] {
    const lcStories = this.tenant.landingContent?.stories;
    const source = lcStories?.length
      ? lcStories.map(s => ({ name: s.name, meta: s.meta, quote: s.quote, image: s.image ?? 0 }))
      : STORIES;
    return source.map((s) => ({ ...s, img: U(IMG.stories[(s.image + this.templateIndex()) % IMG.stories.length]) + '&w=700&q=60' }));
  }

  get castes(): string[] {
    const lcCommunities = this.tenant.landingContent?.communities;
    if (lcCommunities?.length) return lcCommunities;
    return CASTES;
  }

  get events(): (typeof EVENTS)[number][] {
    const lcEvents = this.tenant.landingContent?.events;
    if (lcEvents?.length) return lcEvents;
    return EVENTS;
  }

  get whyItems(): TplFeature[] {
    const lcWhy = this.tenant.landingContent?.whyItems;
    if (lcWhy?.length) return lcWhy;
    return WHY_ITEMS;
  }

  get ctaTitle(): string {
    return this.tenant.landingContent?.ctaHeading || "Your Family's Search Ends Here";
  }

  get ctaSub(): string {
    return (
      this.tenant.landingContent?.ctaDescription ||
      'Join thousands of families who found their perfect match with dignity and joy.'
    );
  }

  get footerBlurb(): string {
    return (
      this.tpl.footerBlurb ||
      this.tenant.landingContent?.footerDescription ||
      'The trusted matrimony platform weaving families together with tradition and trust.'
    );
  }

  get footerLinks(): { label: string; url: string }[] {
    const cols = this.tenant.landingContent?.footerColumns;
    if (cols?.length) {
      return cols.flatMap(c => c.links ?? []);
    }
    return [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms & Conditions', url: '/terms' },
      { label: 'Refund Policy', url: '/refund' },
    ];
  }

  get contactPhone(): string {
    return this.tenant.contacts?.find((c) => c.type === 'Phone')?.value ?? '';
  }

  get contactEmail(): string {
    return this.tenant.contacts?.find((c) => c.type === 'Email')?.value ?? '';
  }

  get footerSocialMedia(): { facebook?: string; instagram?: string; youtube?: string; twitter?: string; whatsapp?: string } {
    return this.tenant.socialMedia ?? {};
  }

  get footerSettings(): { showSocialMedia: boolean; showLegalLinks: boolean; showContactInfo: boolean } {
    const s = this.tenant.footerSettings;
    return {
      showSocialMedia: s?.showSocialMedia ?? true,
      showLegalLinks: s?.showLegalLinks ?? true,
      showContactInfo: s?.showContactInfo ?? true,
    };
  }

  get socialMediaItems(): { key: string; url: string; label: string }[] {
    const sm = this.footerSocialMedia;
    const items: { key: string; url: string; label: string }[] = [];
    if (sm.facebook) items.push({ key: 'facebook', url: sm.facebook, label: 'Facebook' });
    if (sm.instagram) items.push({ key: 'instagram', url: sm.instagram, label: 'Instagram' });
    if (sm.youtube) items.push({ key: 'youtube', url: sm.youtube, label: 'YouTube' });
    if (sm.twitter) items.push({ key: 'twitter', url: sm.twitter, label: 'Twitter' });
    if (sm.whatsapp) items.push({ key: 'whatsapp', url: sm.whatsapp, label: 'WhatsApp' });
    return items;
  }

  // ── New hero variant getters ──

  get heroParallaxBg(): string {
    const src = this.overrides.heroImage || this.tenant.landingContent?.pageBackgroundImageUrl || this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 1) % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return `url('${img(base, 'w=1600&q=70')}')`;
  }

  get heroAsymmetricReverse(): boolean {
    return this.templateIndex() % 2 === 1;
  }

  // ── New section getters ──

  get showFab(): boolean {
    return this.tpl.fab === true;
  }

  get stickyBarConfig(): { text: string; cta: string } | null {
    if (!this.tpl.stickyBar) return null;
    const lc = this.tenant.landingContent;
    return {
      text: lc?.stickyBarText || this.tpl.stickyBar.text || 'Find your perfect match today',
      cta: lc?.stickyBarCta || this.tpl.stickyBar.cta || 'Register Free',
    };
  }

  get showStickyBar(): boolean {
    return this.stickyBarVisible();
  }

  get showSkeleton(): boolean {
    return this.tpl.skeleton === true && this.isLoading();
  }

  get counterItems(): { value: string; label: string }[] {
    return this.statCells;
  }

  get testimonialItems(): (TplStory & { img: string })[] {
    return this.storyCards;
  }

  get beforeAfterImages(): { before: string; after: string } {
    const start = (this.templateIndex() * 2) % IMG.stories.length;
    return {
      before: U(IMG.stories[start % IMG.stories.length]) + '&w=800&q=70',
      after: U(IMG.stories[(start + 1) % IMG.stories.length]) + '&w=800&q=70',
    };
  }

  // ── Section heading getters ──

  get bannerEyebrow(): string {
    return this.tenant.landingContent?.bannerEyebrow || 'Create a Free Matrimony Profile';
  }

  get bannerHeading(): string {
    return this.tenant.landingContent?.bannerHeading || '50,000+ Successful Marriages & Counting';
  }

  get bannerDescription(): string {
    return this.tenant.landingContent?.bannerDescription || 'Our community celebrates one new wedding every 15 minutes \u2014 find your soulmate among lakhs of verified Marathi profiles.';
  }

  get bannerChips(): { icon: string; label: string }[] {
    return this.tenant.landingContent?.bannerChips || [
      { icon: 'user-check', label: '100% Verified' },
      { icon: 'shield-check', label: 'Privacy Protected' },
      { icon: 'heart-handshake', label: 'Family Approved' },
    ];
  }

  get bannerCta1(): string {
    return this.tenant.landingContent?.bannerCta1 || 'Create Free Profile';
  }

  get bannerCta2(): string {
    return this.tenant.landingContent?.bannerCta2 || 'Learn More';
  }

  get featuresEyebrow(): string {
    return this.tenant.landingContent?.featuresEyebrow || 'Why Marathi Families Trust Us';
  }

  get featuresTitle(): string {
    return this.tenant.landingContent?.featuresTitle || 'Matrimony the Way It Should Be';
  }

  get howEyebrow(): string {
    return this.tenant.landingContent?.howEyebrow || 'How It Works';
  }

  get howTitle(): string {
    return this.tenant.landingContent?.howTitle || 'Three Simple Steps to Your Match';
  }

  get profilesEyebrow(): string {
    return this.tenant.landingContent?.profilesEyebrow || 'Freshly Joined Members';
  }

  get profilesTitle(): string {
    return this.tenant.landingContent?.profilesTitle || 'Recently Added Profiles';
  }

  get profilesViewAll(): string {
    return this.tenant.landingContent?.profilesViewAll || 'View all profiles';
  }

  get storiesEyebrow(): string {
    return this.tenant.landingContent?.storiesEyebrow || 'Success Stories';
  }

  get storiesTitle(): string {
    return this.tenant.landingContent?.storiesTitle || 'A Thousand Happy Beginnings';
  }

  get ctaAdvisorLabel(): string {
    return this.tenant.landingContent?.ctaAdvisorLabel || 'Talk to an Advisor';
  }

  get playStoreUrl(): string {
    return this.tenant.landingContent?.playStoreUrl || '';
  }

  get appStoreUrl(): string {
    return this.tenant.landingContent?.appStoreUrl || '';
  }

  get whyEyebrow(): string {
    return this.tpl.whyEyebrow || this.tenant.landingContent?.whyEyebrow || 'Why Choose Us';
  }

  get whyTitle(): string {
    return this.tpl.whyTitle || this.tenant.landingContent?.whyTitle || 'Trusted by Families, Powered by Technology';
  }

  get casteEyebrow(): string {
    return this.tpl.casteEyebrow || this.tenant.landingContent?.casteEyebrow || 'Communities We Serve';
  }

  get casteTitle(): string {
    return this.tpl.casteTitle || this.tenant.landingContent?.casteTitle || '200+ Marathi Castes & Communities';
  }

  get casteNote(): string {
    return this.tpl.casteNote || this.tenant.landingContent?.casteNote || 'From Brahmin to Kshatriya and every community in between \u2014 find a match who shares your heritage.';
  }

  get melavaEyebrow(): string {
    return this.tpl.melavaEyebrow || this.tenant.landingContent?.melavaEyebrow || 'Melava & Events';
  }

  get melavaTitle(): string {
    return this.tpl.melavaTitle || this.tenant.landingContent?.melavaTitle || 'Meet Families In Person';
  }

  get melavaViewLabel(): string {
    return this.tenant.landingContent?.melavaViewLabel || 'View details';
  }

  get appEyebrow(): string {
    return this.tpl.appEyebrow || this.tenant.landingContent?.appEyebrow || 'Download the App';
  }

  get appTitle(): string {
    return this.tpl.appTitle || this.tenant.landingContent?.appTitle || 'Find Your Match in 30 Seconds';
  }

  get appDescription(): string {
    return this.tpl.appSub || this.tenant.landingContent?.appDescription || 'Fast, simple and delightful. The most loved Marathi matrimony app \u2014 search, chat and connect on the go.';
  }

  get appRating(): string {
    return this.tenant.landingContent?.appRating || '4.3 \u00b7 10M+ Downloads';
  }

  get appReviewNote(): string {
    return this.tenant.landingContent?.appReviewNote || 'Based on customer reviews';
  }

  get testimonialsEyebrow(): string {
    return this.tenant.landingContent?.testimonialsEyebrow || 'What Families Say';
  }

  get testimonialsTitle(): string {
    return this.tenant.landingContent?.testimonialsTitle || 'Testimonials from Happy Families';
  }

  get countersEyebrow(): string {
    return this.tenant.landingContent?.countersEyebrow || 'By the Numbers';
  }

  get countersTitle(): string {
    return this.tenant.landingContent?.countersTitle || 'Our Journey in Numbers';
  }

  get beforeAfterEyebrow(): string {
    return this.tenant.landingContent?.beforeAfterEyebrow || 'Before & After';
  }

  get beforeAfterTitle(): string {
    return this.tenant.landingContent?.beforeAfterTitle || 'Transform Your Story';
  }

  // ── Form hero getters ──

  get formTitle(): string {
    return this.tpl.formTitle || this.tenant.landingContent?.formTitle || 'Create Free Matrimony Profile';
  }

  get formSubtitle(): string {
    return this.tpl.formSub || this.tenant.landingContent?.formSubtitle || 'Join lakhs of happy Marathi families. Free forever.';
  }

  get formBrideLabel(): string {
    return this.tenant.landingContent?.formBrideLabel || 'Bride';
  }

  get formGroomLabel(): string {
    return this.tenant.landingContent?.formGroomLabel || 'Groom';
  }

  get formLookingForLabel(): string {
    return this.tenant.landingContent?.formLookingForLabel || 'Looking for';
  }

  get formCasteLabel(): string {
    return this.tenant.landingContent?.formCasteLabel || 'Caste / Community';
  }

  get formAgeRanges(): string[] {
    const bride = this.formBrideLabel;
    const groom = this.formGroomLabel;
    const who = this.formForGroom ? bride : groom;
    return [who + ' aged 22 - 30', who + ' aged 31 - 40'];
  }

  get formCommunities(): string[] {
    return this.tenant.landingContent?.formCommunities || [
      'Any Marathi community',
      'Maratha / 96 Kuli',
      'Deshastha Brahmin',
      'Chandraseniya Kayastha (CKP)',
    ];
  }

  get formMiniStats(): { value: string; label: string }[] {
    return this.tenant.landingContent?.formMiniStats || [
      { value: '5L+', label: 'Happy Stories' },
      { value: '350L+', label: 'Members' },
      { value: '100%', label: 'Mobile-verified' },
    ];
  }

  // ── Footer columns getter ──

  get footerContentColumns(): { heading: string; links: { label: string; url: string }[] }[] {
    const lcCols = this.tenant.landingContent?.footerColumns;
    const defaults: { heading: string; links: { label: string; url: string }[] }[] = [
      { heading: 'Find a Match', links: [
        { label: 'Brides', url: '/search' },
        { label: 'Grooms', url: '/search' },
        { label: 'NRI Profiles', url: '/search' },
        { label: 'Horoscope Matching', url: '#' },
      ]},
      { heading: 'Community', links: [
        { label: 'Success Stories', url: '#' },
        { label: 'Matrimonial Events', url: '#' },
        { label: 'Blog', url: '#' },
        { label: 'Help & Support', url: '#' },
      ]},
    ];
    if (lcCols?.length) {
      const nonLegal = lcCols.filter(c => c.heading !== 'Legal');
      if (nonLegal.length) return nonLegal;
    }
    return defaults;
  }

  private templateIndex(): number {
    const i = APPROVED_TEMPLATES.findIndex((t) => t.id === this.tpl.id);
    return i < 0 ? 0 : i;
  }

  private loadTemplateFonts(): void {
    const fonts = resolveTemplateStyleVars(this.tpl, this.overrides).fonts;
    const families = Array.from(new Set([fonts.heading, fonts.body])).filter(Boolean);
    if (families.length === 0) {
      return;
    }
    const href =
      'https://fonts.googleapis.com/css2?' +
      families.map((f) => `${f.replace(/ /g, '+')}:wght@400..800`).join('&') +
      '&display=swap';
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
