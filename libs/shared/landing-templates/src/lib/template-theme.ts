import { LandingTemplate, TemplateColors, TemplateOverrides } from './landing-template.model';

export interface TemplateStyleVars {
  /** CSS custom properties to set on the template host, keyed without the leading '--'. */
  vars: Record<string, string>;
  /** Google Fonts families to load. */
  fonts: { heading: string; body: string };
}

/**
 * Resolve the CSS variable map for a template. Tenant (DB) overrides win over
 * the approved template's default palette/fonts.
 */
export function resolveTemplateStyleVars(
  template: LandingTemplate,
  overrides: TemplateOverrides = {},
): TemplateStyleVars {
  const c = overridesToColors(template.c, overrides);
  return {
    vars: {
      'tp-p': c.p,
      'tp-dp': c.dp,
      'tp-ink': c.ink,
      'tp-s': c.s,
      'tp-sf': c.sf,
      'tp-sd': c.sd,
      'tp-pl': c.pl,
      'tp-od': c.od,
      'tp-ods': c.ods,
      'tp-bg': c.bg,
      'tp-bgd': c.bgd,
      'tp-card': c.card,
      'tp-t': c.t,
      'tp-ts': c.ts,
      'tp-d1': c.d1,
      'tp-d2': c.d2,
      'tp-h': overrides.headingFont || fontStack(template.h),
      'tp-b': overrides.bodyFont || fontStack(template.b),
      ...template.designTokens,
    },
    fonts: {
      heading: overrides.headingFont || template.h,
      body: overrides.bodyFont || template.b,
    },
  };
}

export function templateFontCss(fonts: { heading: string; body: string }): string {
  const families = Array.from(new Set([fonts.heading, fonts.body])).filter(Boolean);
  if (families.length === 0) {
    return '';
  }
  return `@import url('https://fonts.googleapis.com/css2?${families
    .map((f) => f.replace(/ /g, '+') + ':wght@400..800&display=swap')
    .join('&')}');`;
}

function overridesToColors(base: TemplateColors, o: TemplateOverrides): TemplateColors {
  if (!o.primary && !o.secondary && !o.background && !o.text) {
    return base;
  }
  const p = o.primary || base.p;
  const s = o.secondary || base.s;
  const bg = o.background || base.bg;
  const t = o.text || base.t;
  return {
    ...base,
    p,
    dp: o.primary ? shade(p, -0.12) : base.dp,
    ink: o.primary ? shade(p, -0.28) : base.ink,
    pl: o.primary ? shade(p, 0.9) : base.pl,
    s,
    sd: o.secondary ? shade(s, -0.18) : base.sd,
    sf: o.secondary ? shade(s, 0.75) : base.sf,
    bg,
    bgd: o.background ? shade(bg, -0.03) : base.bgd,
    d1: o.primary ? shade(p, -0.12) : base.d1,
    d2: o.primary ? shade(p, -0.28) : base.d2,
    t,
    ts: shade(t, 0.45),
    card: o.background ? mix(bg, '#ffffff', 0.68) : base.card,
    od: base.od,
    ods: base.ods,
  };
}

function fontStack(font: string): string {
  if (!font) {
    return "'Inter', sans-serif";
  }
  return `'${font}', sans-serif`;
}

/** Lighten/darken a hex color. amount in [-1, 1]; negative darkens, positive lightens. */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (v: number) => Math.round(v + (t - v) * p);
  return toHex(mix(r), mix(g), mix(b));
}

function mix(hex1: string, hex2: string, weight2: number): string {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  const m = (x: number, y: number) => Math.round(x + (y - x) * weight2);
  return toHex(m(a.r, b.r), m(a.g, b.g), m(a.b, b.b));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) {
    return { r: 127, g: 127, b: 127 };
  }
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`;
}
