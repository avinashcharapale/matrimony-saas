/**
 * Normalizes text by trimming whitespace and collapsing multiple spaces.
 */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').toString().trim().replace(/\s+/g, ' ');
}

/**
 * Normalizes a phone number to 10 digits (Indian format).
 * Removes country code (91) and leading zero.
 */
export function normalizePhone(value: string | null | undefined): string {
  const digitsOnly = (value ?? '').toString().replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly.slice(1);
  }
  return digitsOnly;
}

/**
 * Validates that a phone number is exactly 10 digits.
 */
export function isValidTenDigitPhone(value: string | null | undefined): boolean {
  return /^\d{10}$/.test(normalizePhone(value));
}

/**
 * Validates email format.
 */
export function isValidEmail(value: string | null | undefined): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim().toLowerCase());
}

/**
 * Validates that a name contains only letters and spaces.
 */
export function isValidName(value: string | null | undefined): boolean {
  return /^[A-Za-z ]+$/.test(normalizeText(value));
}

/**
 * Checks if a file is an image file (JPG, JPEG, PNG, WEBP).
 */
export function isImageFile(fileName: string): boolean {
  return /\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

/**
 * Generates a random alphanumeric CAPTCHA code.
 */
export function generateCaptchaCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Calculates age from birth year.
 */
export function calculateAgeFromYear(birthYear: number | string): number | undefined {
  const year = Number(birthYear);
  if (!Number.isFinite(year) || year <= 0) {
    return undefined;
  }
  return new Date().getFullYear() - year;
}

/**
 * Converts a value to an optional number (returns undefined for null, undefined, empty string, or NaN).
 */
export function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Converts a value to an optional boolean.
 */
export function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}
