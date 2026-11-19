/**
 * Identity-document-shaped numbers. They copy only the LENGTH and broad
 * structure of Bangladeshi NID and birth registration numbers. Every number
 * made here ends in a deliberately wrong Luhn check digit (the correct digit
 * plus one), so `isFakeId()` can recognise them and nobody can mistake a
 * fixture for a real person's number. They are not, and cannot be, real IDs.
 */
import type { Random } from './random.js';

export type NidLength = 10 | 13 | 17;

function luhnDigit(body: string): number {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    let d = body.charCodeAt(body.length - 1 - i) - 48;
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** Appends the faker-bd marker: the Luhn check digit plus one (mod 10). */
export function withFakeCheckDigit(body: string): string {
  if (!/^\d+$/.test(body)) throw new TypeError('body must contain digits only');
  return body + String((luhnDigit(body) + 1) % 10);
}

/**
 * True for numbers that carry the faker-bd marker (10, 13 or 17 digits whose
 * last digit is the Luhn check digit plus one). Use it in tests and data
 * pipelines to assert that only fake IDs reached a fixture or a staging table.
 */
export function isFakeId(id: string): boolean {
  if (!/^(\d{10}|\d{13}|\d{17})$/.test(id)) return false;
  return withFakeCheckDigit(id.slice(0, -1)) === id;
}

/**
 * - 10 digits: shaped like a smart-card NID.
 * - 13 digits: shaped like an older laminated NID.
 * - 17 digits: the birth year followed by 13 digits, like old NIDs were
 *   padded to 17.
 */
export function fakeNid(rng: Random, length: NidLength = 10, birthYear?: number): string {
  if (length === 10) return withFakeCheckDigit(String(rng.int(1, 9)) + rng.digits(8));
  if (length === 13) return withFakeCheckDigit(String(rng.int(1, 9)) + rng.digits(11));
  if (length === 17) {
    const year = birthYear ?? rng.int(1950, 2006);
    return withFakeCheckDigit(String(year) + String(rng.int(1, 9)) + rng.digits(11));
  }
  throw new RangeError(`NID length must be 10, 13 or 17, got ${length}`);
}

/** 17 digits shaped like a birth registration number: the birth year, then 13 digits. */
export function fakeBirthRegistration(rng: Random, birthYear?: number): string {
  const year = birthYear ?? rng.int(1950, 2025);
  return withFakeCheckDigit(String(year) + String(rng.int(1, 9)) + rng.digits(11));
}

export type MfsProvider = 'bkash' | 'nagad' | 'rocket';

export const MFS_NAMES: Readonly<Record<MfsProvider, { en: string; bn: string }>> = {
  bkash: { en: 'bKash', bn: 'বিকাশ' },
  nagad: { en: 'Nagad', bn: 'নগদ' },
  rocket: { en: 'Rocket', bn: 'রকেট' },
};

const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * A transaction ID with the look of a mobile financial service receipt:
 * bKash-like (10 uppercase letters and digits), Nagad-like (8 uppercase
 * letters and digits) or Rocket-like (10 digits). They are random strings and
 * do not refer to any real transaction.
 */
export function fakeTransactionId(rng: Random, provider: MfsProvider = 'bkash'): string {
  switch (provider) {
    case 'bkash':
      return rng.chars(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') + rng.chars(9, ALNUM);
    case 'nagad':
      return rng.chars(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') + rng.chars(7, ALNUM);
    case 'rocket':
      return String(rng.int(1, 9)) + rng.digits(9);
    default:
      throw new RangeError(`unknown provider "${provider as string}"`);
  }
}
