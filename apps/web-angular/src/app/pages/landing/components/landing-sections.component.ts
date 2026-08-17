import { Component, ChangeDetectionStrategy, Input, inject, OnInit, HostListener, signal } from '@angular/core';
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
  displayName: string;
  logoUrl?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  ctaEnroll: string;
  ctaLogin: string;
  contacts: TenantContact[];
  copyrightText: string;
  landingContent?: {
    eyebrow?: string;
    ctaHeading?: string;
    ctaDescription?: string;
    footerDescription?: string;
    footerLinks?: { label: string; url: string }[];
  };
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

  readonly stickyBarVisible = signal(false);
  readonly mobileMenuOpen = signal(false);
  private readonly isLoading = signal(true);
  private readonly scrollThreshold = 600;

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
    return ['nav', 'hero', ...this.tpl.order, 'footer'];
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
    const title = this.tpl.h1 || this.tenant.heroTitle || this.brandName;
    return this.sanitizer.bypassSecurityTrustHtml(title);
  }

  get heroSub(): string {
    return this.tpl.sub || this.tenant.heroSubtitle || this.tenant.heroDescription || '';
  }

  get cta1(): string {
    return this.tpl.cta1 || this.tenant.ctaEnroll || 'Register Free';
  }

  get cta2(): string {
    return this.tpl.cta2 || 'Search Matches';
  }

  get heroDark(): boolean {
    return !!this.tpl.darkHero;
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
    if (this.overrides.heroImage) {
      list[0] = img(this.overrides.heroImage, 'w=900&q=70');
    }
    return list;
  }

  get heroArchImage(): string {
    if (this.overrides.heroImage) {
      return img(this.overrides.heroImage, 'w=420&q=70');
    }
    return U(IMG.hero[this.templateIndex() % IMG.hero.length]) + '&w=420&q=70';
  }

  get heroSplitImages(): string[] {
    return this.heroImages.slice(0, 3).map((s) => s.replace('&w=500', '&w=520'));
  }

  get heroFullbleedBg(): string {
    const src = this.overrides.heroImage || this.tpl.bannerImg || IMG.hero[this.templateIndex() % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return `url('${img(base, 'w=1600&q=70')}')`;
  }

  get heroTrust(): { icon: string; label: string }[] {
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
    const src = this.overrides.bannerImage || this.tpl.bannerImg || IMG.banner;
    const base = src.includes('://') ? src : U(src);
    return img(base, 'w=1920&q=70');
  }

  get statCells(): { value: string; label: string }[] {
    if (this.stats.length > 0) {
      return this.stats.map((s) => ({ value: s.value, label: s.label }));
    }
    return DEFAULT_STATS;
  }

  get featureCards(): TplFeature[] {
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
    if (this.howItWorks.length > 0) {
      return this.howItWorks.slice(0, 3).map((s) => ({ title: s.title, text: s.description }));
    }
    return STEPS;
  }

  get profileCards(): (ProfileItem & { img: string })[] {
    return this.autoScrollProfiles.slice(0, 4).map((p, i) => ({
      ...p,
      img: p.photoUrl || U((i % 2 === 0 ? IMG.brides : IMG.grooms)[Math.floor(i / 2) % 2]) + '&w=600&q=60',
    }));
  }

  get storyCards(): (TplStory & { img: string })[] {
    return STORIES.map((s) => ({ ...s, img: U(IMG.stories[s.image % IMG.stories.length]) + '&w=700&q=60' }));
  }

  get castes(): string[] {
    return CASTES;
  }

  get events(): (typeof EVENTS)[number][] {
    return EVENTS;
  }

  get whyItems(): TplFeature[] {
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
    return (
      this.tenant.landingContent?.footerLinks ?? [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Refund Policy', url: '/refund' },
      ]
    );
  }

  get contactPhone(): string {
    return this.tenant.contacts.find((c) => c.type === 'Phone')?.value ?? '';
  }

  get contactEmail(): string {
    return this.tenant.contacts.find((c) => c.type === 'Email')?.value ?? '';
  }

  // ── New hero variant getters ──

  get heroParallaxBg(): string {
    const src = this.overrides.heroImage || this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 1) % IMG.hero.length];
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
    return {
      text: this.tpl.stickyBar.text || 'Find your perfect match today',
      cta: this.tpl.stickyBar.cta || 'Register Free',
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
