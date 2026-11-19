import { toBanglaDigits } from './digits.js';

/** Bangladesh Standard Time is UTC+06:00 all year (no daylight saving since 2009). */
export const DHAKA_OFFSET_MINUTES = 360;

export const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
] as const;

/** Sunday first, like `Date#getUTCDay()`. */
export const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'] as const;

/** Months of the Bengali calendar (Bangabda), Boishakh first. */
export const BENGALI_MONTHS_BN = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
] as const;

export const BENGALI_MONTHS_EN = [
  'Boishakh',
  'Jyoishtho',
  'Asharh',
  'Srabon',
  'Bhadro',
  'Ashwin',
  'Kartik',
  'Agrahayan',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
] as const;

export interface DateOptions {
  /** Minutes east of UTC used to read the calendar date. Default 360 (Asia/Dhaka). */
  offsetMinutes?: number;
}

interface Ymd {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0 = Sunday
  hour: number;
  minute: number;
}

function parts(date: Date, offsetMinutes = DHAKA_OFFSET_MINUTES): Ymd {
  const t = date.getTime();
  if (Number.isNaN(t)) throw new RangeError('invalid date');
  const d = new Date(t + offsetMinutes * 60_000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/** `YYYY-MM-DD` of the date in the given offset (default Asia/Dhaka). */
export function isoDate(date: Date, options: DateOptions = {}): string {
  const p = parts(date, options.offsetMinutes);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

/** ISO 8601 with the offset, e.g. `2026-11-19T14:05:00+06:00`. */
export function isoDateTime(date: Date, options: DateOptions = {}): string {
  const offset = options.offsetMinutes ?? DHAKA_OFFSET_MINUTES;
  const p = parts(date, offset);
  const sec = new Date(date.getTime() + offset * 60_000).getUTCSeconds();
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  return `${isoDate(date, options)}T${pad(p.hour)}:${pad(p.minute)}:${pad(sec)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export interface BanglaDateOptions extends DateOptions {
  /** Prefix the weekday, e.g. `বৃহস্পতিবার, ১৯ নভেম্বর ২০২৬`. Default false. */
  weekday?: boolean;
  /** Append the time as `HH:MM`. Default false. */
  time?: boolean;
}

/** A Gregorian date in Bangla, e.g. `১৯ নভেম্বর ২০২৬`. */
export function formatBanglaDate(date: Date, options: BanglaDateOptions = {}): string {
  const p = parts(date, options.offsetMinutes);
  let text = `${p.day} ${GREGORIAN_MONTHS_BN[p.month - 1]} ${p.year}`;
  if (options.weekday) text = `${WEEKDAYS_BN[p.weekday]}, ${text}`;
  if (options.time) text += `, ${pad(p.hour)}:${pad(p.minute)}`;
  return toBanglaDigits(text);
}

export interface BengaliDate {
  /** Bangabda year, e.g. 1433. */
  year: number;
  /** 1 (Boishakh) to 12 (Chaitra). */
  month: number;
  day: number;
  monthNameBn: string;
  monthNameEn: string;
}

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * Converts to the Bengali calendar as officially used in Bangladesh (the
 * revised calendar of 2019): Pohela Boishakh is always 14 April, the first
 * six months have 31 days, Falgun has 29 days (30 when the Gregorian year it
 * falls in is a leap year) and the other months have 30.
 */
export function toBengaliCalendar(date: Date, options: DateOptions = {}): BengaliDate {
  const p = parts(date, options.offsetMinutes);
  const dayNumber = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86_400_000;
  const startYear = p.month > 4 || (p.month === 4 && p.day >= 14) ? p.year : p.year - 1;
  let offset = dayNumber(p.year, p.month, p.day) - dayNumber(startYear, 4, 14);
  const lengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap(startYear + 1) ? 30 : 29, 30];
  let month = 0;
  while (offset >= lengths[month]!) {
    offset -= lengths[month]!;
    month++;
  }
  return {
    year: startYear - 593,
    month: month + 1,
    day: offset + 1,
    monthNameBn: BENGALI_MONTHS_BN[month]!,
    monthNameEn: BENGALI_MONTHS_EN[month]!,
  };
}

/** A Bengali calendar date in Bangla, e.g. `৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ`. */
export function formatBengaliDate(date: Date, options: DateOptions & { suffix?: boolean } = {}): string {
  const b = toBengaliCalendar(date, options);
  const text = `${b.day} ${b.monthNameBn} ${b.year}${options.suffix === false ? '' : ' বঙ্গাব্দ'}`;
  return toBanglaDigits(text);
}
