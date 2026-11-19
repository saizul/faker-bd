import type { Faker } from './faker.js';

export interface DatasetOptions {
  gender?: 'male' | 'female' | 'neutral';
  division?: string;
  district?: string;
  operator?: 'grameenphone' | 'banglalink' | 'robi' | 'airtel' | 'teletalk';
  provider?: 'bkash' | 'nagad' | 'rocket';
}

export interface Dataset {
  description: string;
  make: (faker: Faker, index: number, options: DatasetOptions) => object;
}

/** The record types the CLI (and `generate()`) can produce. */
export const DATASETS: Readonly<Record<string, Dataset>> = {
  people: {
    description: 'people with name, birth date, phone, email, fake NID and address',
    make: (f, _i, o) => f.person(o.gender ? { gender: o.gender } : {}),
  },
  names: {
    description: 'given name, family name and full name in English and Bangla',
    make: (f, i, o) => ({ id: i + 1, ...f.name(o.gender ? { gender: o.gender } : {}) }),
  },
  phones: {
    description: 'mobile numbers with operator, local and E.164 formats',
    make: (f, i, o) => ({ id: i + 1, ...f.phone(o.operator ? { operator: o.operator } : {}) }),
  },
  addresses: {
    description: 'addresses with upazila, district, division and postcode',
    make: (f, i, o) => ({ id: i + 1, ...f.address({ division: o.division, district: o.district }) }),
  },
  companies: {
    description: 'company names, industry, contact details and address',
    make: (f, i) => ({ id: i + 1, ...f.company() }),
  },
  transactions: {
    description: 'bKash/Nagad/Rocket-like transactions with fake IDs and Bangla amounts',
    make: (f, i, o) => ({ id: i + 1, ...f.transaction(o.provider ? { provider: o.provider } : {}) }),
  },
  ids: {
    description: 'fake NID (10/13/17 digits) and birth registration numbers',
    make: (f, i) => ({ id: i + 1, ...f.ids() }),
  },
};

export type DatasetName = keyof typeof DATASETS;

/** Generates `count` records of a dataset. */
export function generate(
  faker: Faker,
  dataset: string,
  count: number,
  options: DatasetOptions = {},
): object[] {
  const ds = DATASETS[dataset];
  if (!ds)
    throw new RangeError(`unknown dataset "${dataset}" (use one of: ${Object.keys(DATASETS).join(', ')})`);
  return faker.many(count, (f, i) => ds.make(f, i, options));
}
