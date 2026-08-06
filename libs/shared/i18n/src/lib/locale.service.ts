import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { TenantConfig } from '@org/tenant-config';
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  resolveLocale,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './languages';

export interface LocaleState {
  language: SupportedLanguage;
  locale: string;
  currency: string;
}

const STORAGE_KEY = 'tenant_language_id';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly languageSignal = signal<SupportedLanguage>(
    DEFAULT_LANGUAGE,
  );
  private readonly currencySignal = signal<string>('INR');
  private initialized = false;

  readonly language = this.languageSignal.asReadonly();
  readonly currency = this.currencySignal.asReadonly();
  readonly locale = computed(() => resolveLocale(this.language()));

  constructor() {
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.translate.addLangs(SUPPORTED_LANGUAGES.map((lang) => lang.code));
  }

  initialize(tenant: TenantConfig): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const defaultLanguage =
      tenant.defaultLanguage && isSupportedLanguage(tenant.defaultLanguage)
        ? tenant.defaultLanguage
        : DEFAULT_LANGUAGE;
    this.currencySignal.set(tenant.defaultCurrency || 'INR');

    const persisted = isBrowser()
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;
    const initialLanguage =
      persisted && isSupportedLanguage(persisted)
        ? persisted
        : defaultLanguage;

    this.languageSignal.set(initialLanguage);
    this.translate.use(initialLanguage).subscribe();
    this.syncDocumentLanguage(initialLanguage);
  }

  setLanguage(code: string): void {
    if (!isSupportedLanguage(code)) {
      return;
    }
    this.languageSignal.set(code);
    this.translate.use(code).subscribe();
    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, code);
    }
    this.syncDocumentLanguage(code);
  }

  get state(): LocaleState {
    return {
      language: this.language(),
      locale: this.locale(),
      currency: this.currency(),
    };
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale(), options).format(value);
  }

  formatCurrency(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale(), {
      style: 'currency',
      currency: this.currency(),
      maximumFractionDigits: 0,
      ...options,
    }).format(value);
  }

  formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat(this.locale(), {
      style: 'currency',
      currency: this.currency(),
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  formatDate(value: Date | string | number): string {
    return new Intl.DateTimeFormat(this.locale(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  private syncDocumentLanguage(language: string): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }
}
