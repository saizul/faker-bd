import { fromBanglaDigits } from './digits.js';

export type Operator = 'grameenphone' | 'banglalink' | 'robi' | 'airtel' | 'teletalk';

/**
 * Mobile number prefixes allocated by BTRC. Airtel Bangladesh is part of
 * Robi but keeps its own 016 prefix.
 */
export const OPERATOR_PREFIXES: Readonly<Record<Operator, readonly string[]>> = {
  grameenphone: ['017', '013'],
  banglalink: ['019', '014'],
  robi: ['018'],
  airtel: ['016'],
  teletalk: ['015'],
};

export const OPERATOR_NAMES: Readonly<Record<Operator, { en: string; bn: string }>> = {
  grameenphone: { en: 'Grameenphone', bn: 'গ্রামীণফোন' },
  banglalink: { en: 'Banglalink', bn: 'বাংলালিংক' },
  robi: { en: 'Robi', bn: 'রবি' },
  airtel: { en: 'Airtel', bn: 'এয়ারটেল' },
  teletalk: { en: 'Teletalk', bn: 'টেলিটক' },
};

/** Approximate subscriber market shares, used to weight random operators. */
export const OPERATOR_WEIGHTS: readonly (readonly [Operator, number])[] = [
  ['grameenphone', 45],
  ['robi', 22],
  ['banglalink', 21],
  ['airtel', 9],
  ['teletalk', 3],
];

const PREFIX_TO_OPERATOR = new Map<string, Operator>();
for (const [op, prefixes] of Object.entries(OPERATOR_PREFIXES) as [Operator, readonly string[]][]) {
  for (const p of prefixes) PREFIX_TO_OPERATOR.set(p, op);
}

export interface ParsedMobile {
  /** 11 digits, e.g. `01712345678`. */
  local: string;
  /** E.164, e.g. `+8801712345678`. */
  e164: string;
  operator: Operator;
}

/**
 * Parses a Bangladeshi mobile number written as `01712345678`,
 * `+880 1712-345678`, `8801712345678`, `০১৭১২৩৪৫৬৭৮` and similar.
 * Returns `null` when it is not a valid 013-019 mobile number.
 */
export function parseMobile(input: string): ParsedMobile | null {
  let s = fromBanglaDigits(String(input)).replace(/[\s\-().]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('00880')) s = s.slice(2);
  if (s.startsWith('880')) s = s.slice(2);
  if (!/^01[3-9]\d{8}$/.test(s)) return null;
  const operator = PREFIX_TO_OPERATOR.get(s.slice(0, 3));
  if (!operator) return null;
  return { local: s, e164: `+88${s}`, operator };
}

/** True when `input` is a Bangladeshi mobile number with a valid operator prefix. */
export function isValidMobile(input: string): boolean {
  return parseMobile(input) !== null;
}
