export type SupportedLanguage = 'en' | 'mr' | 'hi';

export interface LanguageDef {
  code: SupportedLanguage;
  label: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageDef[] = [
  { code: 'en', label: 'English', locale: 'en-IN' },
  { code: 'mr', label: 'मराठी', locale: 'mr-IN' },
  { code: 'hi', label: 'हिंदी', locale: 'hi-IN' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

export function resolveLocale(code: string): string {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.locale ??
    DEFAULT_LANGUAGE
  );
}
