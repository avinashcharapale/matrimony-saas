import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { TenantService } from '@org/web-angular/services/tenant.service';
import { resolveTemplateStyleVars } from '@org/landing-templates';

export interface ThemeVariables {
  '--tenant-primary': string;
  '--tenant-accent': string;
  '--tenant-bg-start': string;
  '--tenant-bg-mid': string;
  '--tenant-bg-end': string;
  '--tenant-text': string;
  '--text-strong': string;
  '--text-muted': string;
  '--text-subtle': string;
  '--surface-card': string;
  '--surface-soft': string;
  '--border-soft': string;
  '--border-strong': string;
  '--accent-strong': string;
  '--on-primary': string;
  '--color-white': string;
  '--color-black': string;
  '--theme-shadow-sm': string;
  '--theme-shadow-lg': string;
  '--theme-radius-lg': string;
  '--theme-surface-overlay': string;
  '--theme-page-background': string;
  '--theme-surface': string;
  '--theme-surface-raised': string;
  '--theme-surface-soft': string;
  '--theme-surface-subtle': string;
  '--theme-accent-soft': string;
  '--theme-border': string;
  '--theme-border-strong': string;
  '--theme-text': string;
  '--theme-text-muted': string;
  '--theme-text-subtle': string;
  '--theme-focus': string;
  '--theme-radius-sm': string;
  '--theme-radius-md': string;
  '--theme-shadow-md': string;
  '--font-heading': string;
  '--font-body': string;
}

const DEFAULT_VARS: ThemeVariables = {
  '--tenant-primary': '#8e1f4f',
  '--tenant-accent': '#d4a643',
  '--tenant-bg-start': '#fdf6ec',
  '--tenant-bg-mid': '#f3e7d2',
  '--tenant-bg-end': '#f7e7c3',
  '--tenant-text': '#4a2438',
  '--text-strong': '#4a2438',
  '--text-muted': '#7c5670',
  '--text-subtle': '#7c5670',
  '--surface-card': '#fffefb',
  '--surface-soft': '#f3e7d2',
  '--border-soft': '#f7e7c3',
  '--border-strong': '#d4a643',
  '--accent-strong': '#d4a643',
  '--on-primary': '#fff',
  '--color-white': '#fff',
  '--color-black': '#000',
  '--theme-shadow-sm': '0 12px 34px rgba(60,20,40,.10)',
  '--theme-shadow-lg': '0 12px 40px color-mix(in srgb, #4a2438 18%, transparent)',
  '--theme-radius-lg': '28px',
  '--theme-surface-overlay': 'rgba(0,0,0,.45)',
  '--theme-page-background': '#fdf6ec',
  '--theme-surface': '#fffefb',
  '--theme-surface-raised': '#fff',
  '--theme-surface-soft': '#f3e7d2',
  '--theme-surface-subtle': '#f3e7d2',
  '--theme-accent-soft': 'color-mix(in srgb, #ecc97f 50%, #fff)',
  '--theme-border': '#f7e7c3',
  '--theme-border-strong': '#d4a643',
  '--theme-text': '#4a2438',
  '--theme-text-muted': '#7c5670',
  '--theme-text-subtle': '#7c5670',
  '--theme-focus': '#8e1f4f',
  '--theme-radius-sm': '12px',
  '--theme-radius-md': '18px',
  '--theme-shadow-md': '0 12px 34px rgba(60,20,40,.10)',
  '--font-heading': "'Fraunces', serif",
  '--font-body': "'Manrope', sans-serif",
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly tenantService = inject(TenantService);

  readonly themeVars = signal<ThemeVariables>(DEFAULT_VARS);
  readonly isApplied = signal(false);

  constructor() {
    effect(() => {
      const tenant = this.tenantService.tenant();
      const template = this.tenantService.template;
      const overrides = this.tenantService.templateOverrides;

      if (tenant) {
        this.resolveAndSetTheme(template, overrides);
      }
    });
  }

  private resolveAndSetTheme(template: any, overrides: any): void {
    const { vars } = resolveTemplateStyleVars(template, overrides);

    const p = vars['tp-p'] || DEFAULT_VARS['--tenant-primary'];
    const sec = vars['tp-s'] || DEFAULT_VARS['--tenant-accent'];
    const sf = vars['tp-sf'] || '#ecc97f';
    const pl = vars['tp-pl'] || '#f7e7c3';
    const bg = vars['tp-bg'] || '#fdf6ec';
    const bgd = vars['tp-bgd'] || '#f3e7d2';
    const card = vars['tp-card'] || '#fffefb';
    const t = vars['tp-t'] || '#4a2438';
    const ts = vars['tp-ts'] || '#7c5670';
    const od = vars['tp-od'] || '#fff';
    const h = vars['tp-h'] || "'Fraunces', serif";
    const b = vars['tp-b'] || "'Manrope', sans-serif";
    const r = vars['tp-r'] || '18px';
    const rl = vars['tp-r-lg'] || '28px';
    const sh = vars['tp-shadow'] || '0 12px 34px rgba(60,20,40,.10)';

    const newVars: ThemeVariables = {
      '--tenant-primary': p,
      '--tenant-accent': sec,
      '--tenant-bg-start': bg,
      '--tenant-bg-mid': bgd,
      '--tenant-bg-end': pl,
      '--tenant-text': t,
      '--text-strong': t,
      '--text-muted': ts,
      '--text-subtle': ts,
      '--surface-card': card,
      '--surface-soft': bgd,
      '--border-soft': pl,
      '--border-strong': sec,
      '--accent-strong': sec,
      '--on-primary': od,
      '--color-white': '#fff',
      '--color-black': '#000',
      '--theme-shadow-sm': sh,
      '--theme-shadow-lg': `0 12px 40px color-mix(in srgb, ${t} 18%, transparent)`,
      '--theme-radius-lg': rl,
      '--theme-surface-overlay': 'rgba(0,0,0,.45)',
      '--theme-page-background': bg,
      '--theme-surface': card,
      '--theme-surface-raised': '#fff',
      '--theme-surface-soft': bgd,
      '--theme-surface-subtle': bgd,
      '--theme-accent-soft': `color-mix(in srgb, ${sf} 50%, #fff)`,
      '--theme-border': pl,
      '--theme-border-strong': sec,
      '--theme-text': t,
      '--theme-text-muted': ts,
      '--theme-text-subtle': ts,
      '--theme-focus': p,
      '--theme-radius-sm': '12px',
      '--theme-radius-md': r,
      '--theme-shadow-md': sh,
      '--font-heading': h,
      '--font-body': b,
    };

    this.themeVars.set(newVars);
    this.applyToDocument(newVars);
  }

  private applyToDocument(vars: ThemeVariables): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    this.isApplied.set(true);
  }

  applyToElement(element: HTMLElement): void {
    const vars = this.themeVars();
    for (const [key, value] of Object.entries(vars)) {
      element.style.setProperty(key, value);
    }
  }

  getVar(key: keyof ThemeVariables): string {
    return this.themeVars()[key];
  }
}