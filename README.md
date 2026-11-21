# faker-bd

[![CI](https://github.com/saizul/faker-bd/actions/workflows/ci.yml/badge.svg)](https://github.com/saizul/faker-bd/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/saizul/faker-bd)](https://github.com/saizul/faker-bd/releases)
[![npm (GitHub Packages)](https://img.shields.io/badge/npm-%40saizul%2Ffaker--bd-blue)](https://github.com/saizul/faker-bd/pkgs/npm/faker-bd)
![Node 20+](https://img.shields.io/badge/node-20%2B-blue)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Realistic, reproducible fake Bangladeshi test data, in English and বাংলা.

Generic fakers give you "John Smith, 555-0100, Springfield". If your app
validates `01XXXXXXXXX` numbers, prints Bangla receipts, or groups Taka as
`১২,৩৪,৫৬৭`, that data does not test anything. faker-bd generates:

- **Names** in English and Bangla script, male, female or gender-neutral,
  with family names that fit the given name (no "Sourav Hossain"), and the
  optional `Md.` / `মোঃ` prefix.
- **Mobile numbers** with real operator prefixes (013 to 019), in local,
  E.164 and Bangla-digit form, plus a parser/validator.
- **Addresses** from all 8 divisions and 64 districts, with upazilas and
  district head post office codes, in both scripts.
- **NID and birth registration shaped numbers** (10, 13 and 17 digits) that
  carry a deliberately invalid check digit, so you can prove a fixture never
  contains a real ID.
- **bKash, Nagad and Rocket-like transactions** with fake transaction IDs,
  Taka amounts with lakh/crore grouping, and dates in Bangla and in the
  Bengali calendar (বঙ্গাব্দ).
- **Company names** such as `Meghna Textiles Ltd.` / `মেঘনা টেক্সটাইলস লিমিটেড`.

The same seed always gives the same data, on every machine and Node version.
A library and a CLI with JSON, JSON Lines and CSV output. Zero runtime
dependencies. ESM, CommonJS and type declarations included.

## Contents

- [Quick start](#quick-start)
- [CLI](#cli)
- [Library API](#library-api)
- [Datasets](#datasets)
- [About the fake IDs](#about-the-fake-ids)
- [Data sources](#data-sources)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Quick start

The package is published to GitHub Packages. Tell npm where `@saizul`
packages live (once per project), then install:

```console
$ echo "@saizul:registry=https://npm.pkg.github.com" >> .npmrc
$ npm install --save-dev @saizul/faker-bd
```

GitHub Packages asks for a token even for public packages: create a classic
personal access token with the `read:packages` scope and add
`//npm.pkg.github.com/:_authToken=YOUR_TOKEN` to your user `~/.npmrc`.

Generate a CSV file from the command line:

```console
$ npx faker-bd people --count 3 --seed 42 --format csv --fields name.en,name.bn,phone,address.district.en,nid
name.en,name.bn,phone,address.district.en,nid
Shirin Rahman,শিরিন রহমান,01890337750,Mymensingh,2954777733
Fatema Bhuiyan,ফাতেমা ভূঁইয়া,01397328310,Satkhira,19984804539693156
Md. Arif Miah,মোঃ আরিফ মিয়া,01709258749,Sylhet,5815406145
```

Or use it in tests:

```ts
import { createFaker, isValidMobile } from '@saizul/faker-bd';

const faker = createFaker({ seed: 42 });
const user = faker.person();

user.name; // { en: 'Shirin Rahman', bn: 'শিরিন রহমান' }
user.phone; // '01890337750'
isValidMobile(user.phone); // true
user.address.full.bn; // 'বাড়ি ৩৩, রোড ২৫, ত্রিশাল, ময়মনসিংহ ২২০০'
```

## CLI

```text
faker-bd <dataset> [options]

  -n, --count <n>          number of rows (default 10, at most 1,000,000)
  -s, --seed <seed>        number or text; random when omitted (printed to stderr)
  -f, --format <format>    json (default), jsonl or csv
      --fields <a,b,...>   only these columns, using dotted names such as name.en
      --flat               flatten nested objects in JSON output (csv is always flat)
      --gender <g>         male, female or neutral (people, names)
      --division <name>    English division name, e.g. Sylhet (addresses)
      --district <name>    English district name, e.g. Cumilla (addresses)
      --operator <op>      grameenphone, banglalink, robi, airtel or teletalk (phones)
      --provider <p>       bkash, nagad or rocket (transactions)
      --reference-date <d> "today" for ages and transaction dates (default 2026-01-01)
  -h, --help / -v, --version
```

Nested values become dotted columns in CSV (`name.en`, `address.district.bn`).
CSV follows RFC 4180 (quoted fields, CRLF line breaks) and is UTF-8, so Bangla
opens correctly in LibreOffice, Google Sheets and Excel's "From Text/CSV"
import. Exit codes: `0` success, `1` usage error.

More examples:

```console
$ faker-bd phones -n 3 -s 1 --fields local,e164,operator -f csv
local,e164,operator
01890319651,+8801890319651,robi
01919389526,+8801919389526,banglalink
01972016756,+8801972016756,banglalink

$ faker-bd transactions -n 2 -s 7 -f jsonl --fields trxId,provider,amountBn,timestampBn,bengaliDate
{"trxId":"ITDOQ7YJ","provider":"nagad","amountBn":"৳১৩,২২০.০০","timestampBn":"২১ ডিসেম্বর ২০২৫, ০৬:২১","bengaliDate":"৬ পৌষ ১৪৩২ বঙ্গাব্দ"}
{"trxId":"B2UF8MJQXP","provider":"bkash","amountBn":"৳৬,৬৫০.০০","timestampBn":"৩ নভেম্বর ২০২৫, ২১:২৮","bengaliDate":"১৮ কার্তিক ১৪৩২ বঙ্গাব্দ"}

$ faker-bd addresses -n 1000 --division Chattogram -f jsonl > addresses.jsonl
$ faker-bd people -n 100000 -s ci -f csv > people.csv
```

## Library API

### `createFaker(options?)` / `new Faker(options?)`

| Option          | Default                     | Meaning                                                   |
| --------------- | --------------------------- | --------------------------------------------------------- |
| `seed`          | random                      | Number or string. Same seed, same data. Read back with `faker.seed`. |
| `referenceDate` | 2026-01-01 00:00 Asia/Dhaka | "Today" for ages and recent transaction dates. Fixed so output never drifts. |

Methods (all deterministic for a given seed and call order):

| Method                         | Returns                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `person({ gender, tradition, minAge, maxAge, prefix })` | `Person`: name, birth date (ISO and Bangla), age, blood group, phone, email, fake NID, address |
| `name({ gender, tradition, prefix })` | `{ gender, first, last, full }`, each `{ en, bn }`                        |
| `phone({ operator })`          | `{ local, e164, bn, operator, operatorName }`                                    |
| `address({ division, district })` | `{ line, upazila, district, division, postcode, full }`                       |
| `company()` / `companyName()`  | name, industry, phone, `.example` email and website, address                     |
| `transaction({ provider, type, from, to })` | `trxId`, provider, type, `from`/`to` numbers, amount, Bangla amount, timestamp (+06:00), Bangla and Bengali-calendar dates |
| `transactionId(provider)`      | bKash-like (10 chars), Nagad-like (8 chars) or Rocket-like (10 digits)           |
| `money({ min, max, decimals })` | `{ value, en: '৳12,34,567.50', bn: '৳১২,৩৪,৫৬৭.৫০' }`                         |
| `nid(10 \| 13 \| 17, birthYear?)`, `birthRegistration(birthYear?)`, `ids()` | fake ID-shaped numbers |
| `birthDate(minAge, maxAge)`, `date(from, to)`, `email(name?)`, `bloodGroup()`, `gender()` | building blocks |
| `many(count, (faker, i) => ...)` | an array of `count` results                                                    |

`gender` is `'male'`, `'female'` or `'neutral'` (a given name used for any
gender). `tradition` is `'muslim'` or `'hindu'` and keeps given and family
names consistent; by default about 90% / 10%.

### Helpers

```ts
import {
  parseMobile, isValidMobile,          // phone numbers
  formatBdt, groupLakh,                // money
  bdtInWords, numberInWords,           // amounts in words
  toBanglaDigits, fromBanglaDigits,    // digits
  formatBanglaDate, formatBengaliDate, toBengaliCalendar, isoDate, isoDateTime,
  isFakeId,                            // fake ID marker
  toCsv, flatten,                      // output
  DIVISIONS, DISTRICTS,                // geography dataset
  generate, DATASETS,                  // what the CLI uses
} from '@saizul/faker-bd';

parseMobile('+880 1712-345678');
// { local: '01712345678', e164: '+8801712345678', operator: 'grameenphone' }
parseMobile('০১৫১২৩৪৫৬৭৮')?.operator; // 'teletalk'
isValidMobile('01212345678'); // false (012 is not a mobile prefix)

formatBdt(1234567.5); // '৳১২,৩৪,৫৬৭.৫০'
formatBdt(1234567.5, { digits: 'en' }); // '৳12,34,567.50'
formatBdt(1500, { symbol: false, decimals: 0 }); // '১,৫০০'

bdtInWords(120050); // 'এক লক্ষ বিশ হাজার পঞ্চাশ টাকা মাত্র'
bdtInWords(1500.5, { lang: 'en' }); // 'One Thousand Five Hundred Taka and Fifty Paisa Only'
bdtInWords(25, { only: false }); // 'পঁচিশ টাকা'
numberInWords(1_500_000_000); // 'এক শত পঞ্চাশ কোটি'

const d = new Date('2026-12-16T00:00:00+06:00');
formatBanglaDate(d, { weekday: true }); // 'বুধবার, ১৬ ডিসেম্বর ২০২৬'
formatBengaliDate(d); // '১ পৌষ ১৪৩৩ বঙ্গাব্দ'
toBengaliCalendar(d); // { year: 1433, month: 9, day: 1, monthNameBn: 'পৌষ', monthNameEn: 'Poush' }
```

`bdtInWords()` writes Taka amounts the way cheques, money receipts and
invoices in Bangladesh do, with the lakh and crore system and paisa rounded
to two decimals. `numberInWords(n, 'bn' | 'en')` does the same for any whole
number, and `BN_NUMBER_WORDS` is the list of Bangla words for 0 to 99.

Dates are read in Bangladesh Standard Time (UTC+06:00, no daylight saving)
unless you pass `{ offsetMinutes }`. The Bengali calendar follows the revised
calendar used officially in Bangladesh since 2019: 14 April is always ১
বৈশাখ, 16 December is ১ পৌষ and 21 February is ৮ ফাল্গুন.

### Determinism

- Seeds are hashed with cyrb128 and drive an sfc32 generator: 32-bit integer
  math only, identical in every JavaScript engine. `42` and `'42'` are
  different seeds; the CLI reads an all-digit `--seed` as a number, so
  `--seed 42` matches `createFaker({ seed: 42 })`.
- Nothing reads the clock or `Math.random()` once a seed is given.
- Output for a seed is stable within a minor version. A change to the
  datasets or the generators that changes output is listed in the changelog
  and only ships in a minor (0.x) or major release.
- Each call draws from one stream, so `faker.person()` then `faker.phone()`
  differs from `faker.phone()` then `faker.person()`. Use one `Faker` per
  table if you want tables to be independent.

## Datasets

| Dataset        | What one row contains                                                    |
| -------------- | ------------------------------------------------------------------------ |
| `people`       | id, gender, name, first and last name, birth date, age, blood group, phone, email, fake NID, address |
| `names`        | gender, first, last and full name in English and Bangla                  |
| `phones`       | local, E.164 and Bangla-digit number, operator                           |
| `addresses`    | house and road, upazila, district, division, postcode, full address      |
| `companies`    | name, industry, phone, email, website, address                           |
| `transactions` | transaction ID, provider, type, sender, receiver, amount, timestamp, Bangla dates |
| `ids`          | fake 10, 13 and 17 digit NID-shaped numbers and a birth-registration-shaped number |

Mobile prefixes:

| Prefix    | Operator     |
| --------- | ------------ |
| 013, 017  | Grameenphone |
| 014, 019  | Banglalink   |
| 015       | Teletalk     |
| 016       | Airtel (Robi) |
| 018       | Robi         |

Emails always use the reserved `example.com`, `example.net` and `example.org`
domains, and company websites use the reserved `.example` top-level domain,
so test mail can never reach a real inbox.

## About the fake IDs

faker-bd copies only the **length and outline** of Bangladeshi identity
numbers: 10 digits like a smart-card NID, 13 digits like an older NID, and 17
digits (birth year plus 13 digits) like a padded NID or a birth registration
number. Nothing else about real numbering is reproduced.

Every generated ID ends in a **deliberately wrong check digit**: the Luhn
check digit of the other digits, plus one. `isFakeId(id)` returns `true` only
for numbers with that marker, so you can assert in a test, a seed script or a
data pipeline that no real-looking ID slipped in:

```ts
for (const row of fixtureRows) assert.ok(isFakeId(row.nid), `not a faker-bd ID: ${row.nid}`);
```

Bangladesh's real NID and birth registration numbers do not use the Luhn
algorithm, so the marker does not make a number "invalid" to any government
system; it only makes faker-bd's numbers recognisable. A random 10-digit
string can still coincide with a real number by chance. Never use generated
numbers outside testing, never present them as genuine, and never put real
people's IDs in test data.

Transaction IDs are random strings with the look of bKash, Nagad and Rocket
receipts. They do not refer to real transactions, and faker-bd has no
connection with those services.

## Data sources

- **Geography**: the 8 divisions and 64 districts of Bangladesh with their
  official 2018 English spellings (Chattogram, Cumilla, Barishal, Bogura,
  Jashore), three upazilas per district, and the district head post office
  code (1000 Dhaka GPO, 4000 Chattogram GPO, 3100 Sylhet, ...). Public
  administrative information from the Bangladesh Bureau of Statistics and
  Bangladesh Post Office.
- **Mobile prefixes**: BTRC numbering for the five mobile operators.
- **Names**: common Bangladeshi given and family names in their most usual
  English spelling.
- **Weights**: division population shares, operator market shares and the
  blood group distribution are rounded public figures; they make data look
  plausible, they are not statistics.

The datasets are deliberately small and readable (see `src/data/`). Adding
upazilas, postcodes and names is the easiest way to contribute.

## FAQ

**Why not just use faker.js?** It has no Bangladeshi locale with Bangla
script, valid mobile prefixes, lakh grouping or the Bengali calendar. faker-bd
is small and focused, and you can use both side by side.

**Can I use the data in production or demos?** Use it for tests, staging,
screenshots and demos. Do not use it to pretend to be a real person, company
or payment, and do not use the fake IDs or transaction IDs to deceive anyone.

**Does it work in the browser?** Yes. The library has no Node dependencies;
only the CLI uses `process`.

**Why is the default reference date fixed?** So `--seed 42` produces the
same ages today and next year. Pass `referenceDate` (or `--reference-date`)
when you want ages relative to another day.

**The CSV looks garbled in Excel.** Excel guesses the encoding when you
double-click a file. Use Data > From Text/CSV and choose UTF-8, or open it in
LibreOffice or Google Sheets.

**Is a generated phone number someone's real number?** It may be. The
numbers have valid prefixes so that validators accept them, so do not send
SMS or call them. Use them in systems that do not contact anybody.

## Roadmap

Ideas, many of them good first issues (see [CONTRIBUTING.md](CONTRIBUTING.md)):

- [ ] Upazila-level post office codes
- [ ] All upazilas of each district, and city corporation areas (Dhaka North / South wards)
- [ ] Bank account and routing-number-shaped fake values, clearly marked
- [ ] More names, spelling variants (Hossain / Hussain / Hosen) and Buddhist and Christian naming traditions
- [ ] A `--locale en|bn` CLI option that keeps only one script
- [ ] Vehicle registration plates (`ঢাকা মেট্রো-গ ১২-৩৪৫৬`)

## Contributing

Contributions are welcome, especially data. Read
[CONTRIBUTING.md](CONTRIBUTING.md) for setup, the check commands and a list of
beginner-friendly issues. By taking part you agree to the
[Code of Conduct](CODE_OF_CONDUCT.md). Security problems: see
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Saizul Amin
