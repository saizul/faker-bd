import {
  COMPANY_SUFFIXES,
  COMPANY_TYPES,
  COMPANY_WORDS,
  INDUSTRIES,
  TYPE_INDUSTRY,
} from './data/companies.js';
import { DISTRICTS, DIVISION_WEIGHTS, type District, type Division } from './data/geo.js';
import {
  FAMILY,
  FEMALE_GIVEN,
  MALE_GIVEN,
  MOHAMMAD_PREFIX,
  NEUTRAL_GIVEN,
  type NamePair,
  TRADITION_WEIGHTS,
  type Tradition,
} from './data/names.js';
import { formatBanglaDate, formatBengaliDate, isoDate, isoDateTime } from './dates.js';
import { toBanglaDigits } from './digits.js';
import {
  fakeBirthRegistration,
  fakeNid,
  fakeTransactionId,
  MFS_NAMES,
  type MfsProvider,
  type NidLength,
} from './ids.js';
import { formatBdt } from './money.js';
import { OPERATOR_NAMES, OPERATOR_PREFIXES, OPERATOR_WEIGHTS, type Operator } from './phone.js';
import { Random, type Seed } from './random.js';

/** A value in English (Latin script, ASCII digits) and in Bangla (Bangla script and digits). */
export interface Bilingual {
  en: string;
  bn: string;
}

export type Gender = 'male' | 'female' | 'neutral';

export interface FakerOptions {
  /** Same seed, same data. A number or any string. Random when omitted. */
  seed?: Seed;
  /**
   * "Today" for ages and recent dates. Defaults to a fixed date
   * (2026-01-01, Asia/Dhaka) so that output never changes between runs.
   */
  referenceDate?: Date;
}

export interface NameOptions {
  gender?: Gender;
  tradition?: Tradition;
  /** Allow the "Md." / "মোঃ" prefix for men (about one in three). Default true. */
  prefix?: boolean;
}

export interface Name {
  gender: Gender;
  first: Bilingual;
  last: Bilingual;
  full: Bilingual;
}

export interface PhoneOptions {
  operator?: Operator;
}

export interface Phone {
  /** `01712345678` */
  local: string;
  /** `+8801712345678` */
  e164: string;
  /** `০১৭১২৩৪৫৬৭৮` */
  bn: string;
  operator: Operator;
  operatorName: Bilingual;
}

export interface AddressOptions {
  /** English division name, e.g. `'Sylhet'`. */
  division?: string;
  /** English district name, e.g. `'Cumilla'`. */
  district?: string;
}

export interface Address {
  line: Bilingual;
  upazila: Bilingual;
  district: Bilingual;
  division: Bilingual;
  postcode: string;
  full: Bilingual;
}

export interface Person {
  id: number;
  gender: Gender;
  name: Bilingual;
  firstName: Bilingual;
  lastName: Bilingual;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  dateOfBirthBn: string;
  age: number;
  bloodGroup: string;
  phone: string;
  phoneE164: string;
  operator: Operator;
  email: string;
  /** Fake, see `isFakeId()`. */
  nid: string;
  address: Address;
}

export interface PersonOptions extends NameOptions {
  minAge?: number;
  maxAge?: number;
}

export interface Company {
  name: Bilingual;
  industry: Bilingual;
  phone: string;
  email: string;
  website: string;
  address: Address;
}

export interface Money {
  value: number;
  en: string;
  bn: string;
}

export interface MoneyOptions {
  min?: number;
  max?: number;
  /** Digits after the decimal point. Default 2. */
  decimals?: number;
}

export type TransactionType = 'send-money' | 'cash-out' | 'payment' | 'mobile-recharge' | 'add-money';

export const TRANSACTION_TYPES: Readonly<Record<TransactionType, Bilingual & { min: number; max: number }>> =
  {
    'send-money': { en: 'Send Money', bn: 'সেন্ড মানি', min: 50, max: 25_000 },
    'cash-out': { en: 'Cash Out', bn: 'ক্যাশ আউট', min: 100, max: 25_000 },
    payment: { en: 'Payment', bn: 'পেমেন্ট', min: 20, max: 15_000 },
    'mobile-recharge': { en: 'Mobile Recharge', bn: 'মোবাইল রিচার্জ', min: 20, max: 1_000 },
    'add-money': { en: 'Add Money', bn: 'অ্যাড মানি', min: 500, max: 50_000 },
  };

export interface Transaction {
  trxId: string;
  provider: MfsProvider;
  providerName: Bilingual;
  type: TransactionType;
  typeName: Bilingual;
  from: string;
  to: string;
  amount: number;
  amountBn: string;
  /** ISO 8601 with the +06:00 offset. */
  timestamp: string;
  timestampBn: string;
  bengaliDate: string;
}

export interface TransactionOptions {
  provider?: MfsProvider;
  type?: TransactionType;
  /** Earliest time. Default: 90 days before the reference date. */
  from?: Date;
  /** Latest time. Default: the reference date. */
  to?: Date;
}

export interface Ids {
  nid10: string;
  nid13: string;
  nid17: string;
  birthRegistration: string;
}

const DAY = 86_400_000;
const DHAKA = 6 * 3_600_000;
/** 2026-01-01 00:00 in Asia/Dhaka. */
export const DEFAULT_REFERENCE_DATE = new Date(Date.UTC(2026, 0, 1) - DHAKA);

const BLOOD_GROUPS: readonly (readonly [string, number])[] = [
  ['B+', 31],
  ['O+', 30],
  ['A+', 25],
  ['AB+', 9],
  ['O-', 2],
  ['B-', 1.5],
  ['A-', 1],
  ['AB-', 0.5],
];

const EMAIL_DOMAINS = ['example.com', 'example.net', 'example.org'];

const pair = ([en, bn]: NamePair): Bilingual => ({ en, bn });
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Generates fake Bangladeshi test data from a seeded, deterministic random source. */
export class Faker {
  readonly rng: Random;
  readonly referenceDate: Date;
  private nextId = 1;

  constructor(options: FakerOptions = {}) {
    this.rng = new Random(options.seed);
    this.referenceDate = options.referenceDate ?? DEFAULT_REFERENCE_DATE;
    if (Number.isNaN(this.referenceDate.getTime())) throw new RangeError('referenceDate is invalid');
  }

  /** The seed in use (useful when it was chosen at random). */
  get seed(): Seed {
    return this.rng.seed;
  }

  gender(): Gender {
    return this.rng.weighted<Gender>([
      ['male', 49],
      ['female', 49],
      ['neutral', 2],
    ]);
  }

  name(options: NameOptions = {}): Name {
    const r = this.rng;
    const gender = options.gender ?? this.gender();
    const tradition = options.tradition ?? r.weighted(TRADITION_WEIGHTS);
    const family = FAMILY[tradition];
    let first: NamePair;
    let lastPool: readonly NamePair[];
    if (gender === 'male') {
      first = r.pick(MALE_GIVEN[tradition]);
      lastPool = family.male.length && r.bool(0.25) ? family.male : family.any;
    } else if (gender === 'female') {
      first = r.pick(FEMALE_GIVEN[tradition]);
      lastPool = family.female.length && r.bool(0.35) ? family.female : family.any;
    } else {
      first = r.pick(NEUTRAL_GIVEN);
      lastPool = family.any;
    }
    const last = r.pick(lastPool);
    const usePrefix = options.prefix !== false && gender === 'male' && tradition === 'muslim' && r.bool(0.35);
    const full = {
      en: `${usePrefix ? `${MOHAMMAD_PREFIX[0]} ` : ''}${first[0]} ${last[0]}`,
      bn: `${usePrefix ? `${MOHAMMAD_PREFIX[1]} ` : ''}${first[1]} ${last[1]}`,
    };
    return { gender, first: pair(first), last: pair(last), full };
  }

  phone(options: PhoneOptions = {}): Phone {
    const operator = options.operator ?? this.rng.weighted(OPERATOR_WEIGHTS);
    const prefixes = OPERATOR_PREFIXES[operator];
    if (!prefixes) throw new RangeError(`unknown operator "${operator as string}"`);
    const local = this.rng.pick(prefixes) + this.rng.digits(8);
    return {
      local,
      e164: `+88${local}`,
      bn: toBanglaDigits(local),
      operator,
      operatorName: { ...OPERATOR_NAMES[operator] },
    };
  }

  private district(options: AddressOptions): District & { division: Division } {
    let pool = DISTRICTS;
    if (options.district) {
      pool = pool.filter((d) => d.en.toLowerCase() === options.district!.toLowerCase());
      if (!pool.length) throw new RangeError(`unknown district "${options.district}"`);
    } else if (options.division) {
      pool = pool.filter((d) => d.division.en.toLowerCase() === options.division!.toLowerCase());
      if (!pool.length) throw new RangeError(`unknown division "${options.division}"`);
    }
    // Weight by division population, and give each division's capital district extra weight.
    return this.rng.weighted(
      pool.map((d) => {
        const perDistrict = (DIVISION_WEIGHTS[d.division.en] ?? 1) / d.division.districts.length;
        return [d, perDistrict * (d.en === d.division.en ? 3 : 1)] as const;
      }),
    );
  }

  address(options: AddressOptions = {}): Address {
    const r = this.rng;
    const d = this.district(options);
    const upazila = pair(r.pick(d.upazilas));
    const house = r.int(1, 250);
    const letter = r.bool(0.2) ? r.pick([...'ABC']) : '';
    const letterBn = letter ? { A: 'ক', B: 'খ', C: 'গ' }[letter]! : '';
    const road = r.int(1, 30);
    const line = {
      en: `House ${house}${letter ? `/${letter}` : ''}, Road ${road}`,
      bn: toBanglaDigits(`বাড়ি ${house}${letterBn ? `/${letterBn}` : ''}, রোড ${road}`),
    };
    return {
      line,
      upazila,
      district: { en: d.en, bn: d.bn },
      division: { en: d.division.en, bn: d.division.bn },
      postcode: d.postcode,
      full: {
        en: `${line.en}, ${upazila.en}, ${d.en} ${d.postcode}`,
        bn: `${line.bn}, ${upazila.bn}, ${d.bn} ${toBanglaDigits(d.postcode)}`,
      },
    };
  }

  /** A date between `from` and `to` (inclusive), at a random time. */
  date(from: Date, to: Date): Date {
    const a = from.getTime();
    const b = to.getTime();
    if (Number.isNaN(a) || Number.isNaN(b) || b < a) throw new RangeError('invalid date range');
    return new Date(this.rng.int(a, b));
  }

  /** A birth date (midnight, Asia/Dhaka) for someone aged `minAge` to `maxAge` on the reference date. */
  birthDate(minAge = 18, maxAge = 75): Date {
    if (!(minAge >= 0 && maxAge >= minAge && maxAge <= 120)) throw new RangeError('invalid age range');
    const ref = this.referenceDate.getTime() + DHAKA;
    const refDay = new Date(ref);
    const y = refDay.getUTCFullYear();
    const m = refDay.getUTCMonth();
    const d = refDay.getUTCDate();
    // Latest birth date for minAge, earliest for maxAge.
    const latest = Date.UTC(y - minAge, m, d);
    const earliest = Date.UTC(y - maxAge - 1, m, d) + DAY;
    const day = this.rng.int(earliest / DAY, latest / DAY);
    return new Date(day * DAY - DHAKA);
  }

  ageOn(birth: Date, on: Date = this.referenceDate): number {
    const b = new Date(birth.getTime() + DHAKA);
    const o = new Date(on.getTime() + DHAKA);
    let age = o.getUTCFullYear() - b.getUTCFullYear();
    if (
      o.getUTCMonth() < b.getUTCMonth() ||
      (o.getUTCMonth() === b.getUTCMonth() && o.getUTCDate() < b.getUTCDate())
    ) {
      age--;
    }
    return age;
  }

  email(name?: Name): string {
    const n = name ?? this.name();
    const r = this.rng;
    const first = slug(n.first.en);
    const last = slug(n.last.en);
    const sep = r.pick(['.', '_', '']);
    const tail = r.bool(0.6) ? String(r.int(1, 99)) : '';
    const local = r.bool(0.8) ? `${first}${sep}${last}${tail}` : `${first}${tail || r.int(100, 999)}`;
    return `${local}@${r.pick(EMAIL_DOMAINS)}`;
  }

  bloodGroup(): string {
    return this.rng.weighted(BLOOD_GROUPS);
  }

  /** A fake NID-shaped number (default 10 digits). See `isFakeId()`. */
  nid(length: NidLength = 10, birthYear?: number): string {
    return fakeNid(this.rng, length, birthYear);
  }

  /** A fake 17-digit birth-registration-shaped number. See `isFakeId()`. */
  birthRegistration(birthYear?: number): string {
    return fakeBirthRegistration(this.rng, birthYear);
  }

  ids(birthYear?: number): Ids {
    return {
      nid10: this.nid(10),
      nid13: this.nid(13),
      nid17: this.nid(17, birthYear),
      birthRegistration: this.birthRegistration(birthYear),
    };
  }

  person(options: PersonOptions = {}): Person {
    const name = this.name(options);
    const birth = this.birthDate(options.minAge ?? 18, options.maxAge ?? 75);
    const phone = this.phone();
    return {
      id: this.nextId++,
      gender: name.gender,
      name: name.full,
      firstName: name.first,
      lastName: name.last,
      dateOfBirth: isoDate(birth),
      dateOfBirthBn: formatBanglaDate(birth),
      age: this.ageOn(birth),
      bloodGroup: this.bloodGroup(),
      phone: phone.local,
      phoneE164: phone.e164,
      operator: phone.operator,
      email: this.email(name),
      nid: this.nid(this.rng.bool(0.7) ? 10 : 17, Number(isoDate(birth).slice(0, 4))),
      address: this.address(),
    };
  }

  companyName(): Bilingual {
    return this.companyParts().name;
  }

  private companyParts(): { name: Bilingual; type: string } {
    const r = this.rng;
    const word = r.pick(COMPANY_WORDS);
    const type = r.pick(COMPANY_TYPES);
    const suffix = r.pick(COMPANY_SUFFIXES);
    return {
      type: type[0],
      name: {
        en: [word[0], type[0], suffix[0]].filter(Boolean).join(' '),
        bn: [word[1], type[1], suffix[1]].filter(Boolean).join(' '),
      },
    };
  }

  company(): Company {
    const { name, type } = this.companyParts();
    const domain = `${slug(name.en.replace(/\b(Ltd|Limited)\b\.?/g, ''))}.example`;
    const implied = TYPE_INDUSTRY[type];
    const industry = implied ? INDUSTRIES.find(([en]) => en === implied)! : this.rng.pick(INDUSTRIES);
    return {
      name,
      industry: pair(industry),
      phone: this.phone().local,
      email: `${this.rng.pick(['info', 'contact', 'hello', 'sales'])}@${domain}`,
      website: `https://www.${domain}`,
      address: this.address(),
    };
  }

  /** A random amount of Taka, formatted with lakh grouping in both scripts. */
  money(options: MoneyOptions = {}): Money {
    const min = options.min ?? 10;
    const max = options.max ?? 100_000;
    const decimals = options.decimals ?? 2;
    if (!(Number.isFinite(min) && Number.isFinite(max) && max >= min))
      throw new RangeError('invalid amount range');
    const scale = 10 ** decimals;
    const value = this.rng.int(Math.ceil(min * scale), Math.floor(max * scale)) / scale;
    return { value, en: formatBdt(value, { digits: 'en', decimals }), bn: formatBdt(value, { decimals }) };
  }

  transactionId(provider: MfsProvider = 'bkash'): string {
    return fakeTransactionId(this.rng, provider);
  }

  transaction(options: TransactionOptions = {}): Transaction {
    const r = this.rng;
    const provider =
      options.provider ??
      r.weighted<MfsProvider>([
        ['bkash', 60],
        ['nagad', 30],
        ['rocket', 10],
      ]);
    const type =
      options.type ??
      r.weighted<TransactionType>([
        ['send-money', 40],
        ['cash-out', 20],
        ['payment', 20],
        ['mobile-recharge', 15],
        ['add-money', 5],
      ]);
    const info = TRANSACTION_TYPES[type];
    const to = options.to ?? this.referenceDate;
    const from = options.from ?? new Date(to.getTime() - 90 * DAY);
    const when = this.date(from, to);
    when.setUTCMilliseconds(0);
    // Most real transfers are round numbers.
    const amount = r.bool(0.7)
      ? r.int(Math.ceil(info.min / 10), Math.floor(info.max / 10)) * 10
      : r.int(info.min, info.max);
    return {
      trxId: this.transactionId(provider),
      provider,
      providerName: { ...MFS_NAMES[provider] },
      type,
      typeName: { en: info.en, bn: info.bn },
      from: this.phone().local,
      to: this.phone().local,
      amount,
      amountBn: formatBdt(amount),
      timestamp: isoDateTime(when),
      timestampBn: formatBanglaDate(when, { time: true }),
      bengaliDate: formatBengaliDate(when),
    };
  }

  /** Calls `make` `count` times and returns the results. */
  many<T>(count: number, make: (faker: this, index: number) => T): T[] {
    if (!Number.isInteger(count) || count < 0)
      throw new RangeError(`count must be a non-negative integer, got ${count}`);
    const out: T[] = [];
    for (let i = 0; i < count; i++) out.push(make(this, i));
    return out;
  }
}

/** Shorthand for `new Faker(options)`. */
export function createFaker(options: FakerOptions = {}): Faker {
  return new Faker(options);
}
