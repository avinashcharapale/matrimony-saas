export type TemplateCategory =
  | 'Traditional'
  | 'Regional'
  | 'Royal'
  | 'Festive'
  | 'Modern'
  | 'Premium'
  | 'Platform';

export type TemplateHeroVariant =
  | 'minimal'
  | 'centered'
  | 'frame'
  | 'rangoli'
  | 'royal'
  | 'mandala'
  | 'arch'
  | 'collage'
  | 'split'
  | 'fullbleed'
  | 'form'
  | 'parallax'
  | 'gradient-anim'
  | 'masonry'
  | 'circular'
  | 'hscroll'
  | 'asymmetric'
  | 'floating';

export type TemplateMotif =
  | 'none'
  | 'butti'
  | 'butti2'
  | 'rangoli'
  | 'pearl'
  | 'mandala'
  | 'mango'
  | 'dot'
  | 'zari'
  | 'coin'
  | 'vine'
  | 'wave'
  | 'toran'
  | 'stripe'
  | 'kite'
  | 'chevron'
  | 'chain'
  | 'floral'
  | 'tessellation'
  | 'plate'
  | 'crosshatch'
  | 'sariborder'
  | 'temple';

export type TemplateButtonStyle = 'solid' | 'gradient' | 'outline' | 'ghost';

export type TemplateSectionKey =
  | 'banner'
  | 'stats'
  | 'features'
  | 'how'
  | 'profiles'
  | 'success'
  | 'cta'
  | 'why'
  | 'castes'
  | 'melava'
  | 'app'
  | 'testimonials'
  | 'counters'
  | 'beforeafter';

export interface TemplateColors {
  p: string; // primary
  dp: string; // deep primary
  ink: string; // deepest primary (dark bands)
  s: string; // secondary
  sf: string; // soft secondary (tint)
  sd: string; // deep secondary
  pl: string; // primary light (chips / borders)
  od: string; // on-dark text
  ods: string; // on-dark soft text
  bg: string; // page background
  bgd: string; // alt section background
  card: string;
  t: string; // text
  ts: string; // text soft
  d1: string; // dark band 1
  d2: string; // dark band 2
}

export type TemplateCardStyle = 'rounds' | 'borders' | 'gold-ring' | 'softs';

export interface LandingTemplate {
  id: string;
  name: string;
  cat: TemplateCategory;
  tag?: string;
  brand: string;
  h: string; // heading font family
  b: string; // body font family
  motif: TemplateMotif;
  hero: TemplateHeroVariant;
  btn: TemplateButtonStyle;
  nav?: string | { dark?: boolean; glass?: boolean };
  c: TemplateColors;
  eyebrow?: string;
  h1?: string;
  sub?: string;
  cta1?: string;
  cta2?: string;
  footerBlurb?: string;
  order: TemplateSectionKey[];
  frameBorder?: boolean;
  darkHero?: boolean;
  arch?: boolean;
  gridVar?: TemplateCardStyle;
  bannerImg?: string;
  split?: boolean;
  orn?: string;
  banner?: boolean;
  bannerOrn?: 'rangoli' | 'butti';
  bannerGarland?: boolean;
  floatingStats?: boolean;
  formFor?: 'bride' | 'groom';
  formTitle?: string;
  formSub?: string;
  whyEyebrow?: string;
  whyTitle?: string;
  statsDark?: boolean;
  melavaEyebrow?: string;
  melavaTitle?: string;
  casteEyebrow?: string;
  casteTitle?: string;
  casteNote?: string;
  featStyle?: string;
  iconRound?: boolean;
  stepSolid?: boolean;
  stepLight?: boolean;
  badgeWhite?: boolean;
  appEyebrow?: string;
  appTitle?: string;
  appSub?: string;
  status?: 'approved' | 'revise' | 'reject';
  note?: string;
  /** Per-template design fidelity tokens emitted as --td-* vars on the host. */
  designTokens?: Record<string, string>;
  /** Show floating action button (FAB) on landing page. */
  fab?: boolean;
  /** Sticky bottom bar configuration. */
  stickyBar?: { text: string; cta?: string };
  /** Enable skeleton loaders for loading states. */
  skeleton?: boolean;
}

/** Per-tenant overrides (DB branding beats template defaults). */
export interface TemplateOverrides {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  headingFont?: string;
  bodyFont?: string;
  heroImage?: string;
  bannerImage?: string;
}
