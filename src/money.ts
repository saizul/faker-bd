import { toBanglaDigits } from './digits.js';

export interface FormatBdtOptions {
  /** `'bn'` (default) for Bangla digits, `'en'` for ASCII digits. */
  digits?: 'bn' | 'en';
  /** Digits after the decimal point. Default 2. */
  decimals?: number;
  /** Put the Taka sign `৳` in front. Default true. */
  symbol?: boolean;
}

/**
 * Groups an integer string the South Asian way: the last three digits, then
 * groups of two (lakh, crore). `1234567` → `12,34,567`.
 */
export function groupLakh(integer: string): string {
  if (integer.length <= 3) return integer;
  const last3 = integer.slice(-3);
  let rest = integer.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) groups.unshift(rest);
  return `${groups.join(',')},${last3}`;
}

/**
 * Formats a Taka amount with lakh/crore grouping, e.g.
 * `formatBdt(1234567.5)` → `৳১২,৩৪,৫৬৭.৫০` and
 * `formatBdt(1234567.5, { digits: 'en' })` → `৳12,34,567.50`.
 */
export function formatBdt(amount: number, options: FormatBdtOptions = {}): string {
  if (!Number.isFinite(amount)) throw new RangeError(`amount must be a finite number, got ${amount}`);
  const decimals = options.decimals ?? 2;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 6) {
    throw new RangeError(`decimals must be an integer from 0 to 6, got ${decimals}`);
  }
  const fixed = Math.abs(amount).toFixed(decimals);
  const [int, frac] = fixed.split('.') as [string, string | undefined];
  const isZero = /^[0.]+$/.test(fixed);
  let text = groupLakh(int) + (frac ? `.${frac}` : '');
  if (options.symbol !== false) text = `৳${text}`;
  if (amount < 0 && !isZero) text = `-${text}`;
  return options.digits === 'en' ? text : toBanglaDigits(text);
}
