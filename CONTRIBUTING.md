# Contributing

Thanks for helping improve faker-bd. New data (upazilas, postcodes, names),
bug reports, better Bangla spelling and documentation fixes are all welcome.
If you are new to open source, start with one of the
[good first issues](#good-first-issues) below; each is small and points at the
files involved.

## Reporting a bug

Open an issue with the command or code you ran (including `--seed`), what you
got and what you expected, and your faker-bd and Node versions
(`node --version`). A misspelled Bangla name or a district in the wrong
division is a bug too.

## Development setup

You need Node 20 or newer.

```console
$ git clone https://github.com/saizul/faker-bd.git
$ cd faker-bd
$ npm ci
$ npm test              # builds ESM + CJS, compiles the tests and runs node:test
$ npm run lint          # biome lint + tsc --noEmit
$ npm run format        # biome format --write
$ npm run format:check  # what CI runs
```

Try the CLI from the build:

```console
$ node dist/esm/cli.js people -n 5 --seed 42 --format csv
```

## Guidelines

- **Zero runtime dependencies.** Only the JavaScript standard library.
  Development tools go in `devDependencies`.
- **The library must not need Node.** Only `src/cli.ts` and `src/cli/` may use
  Node APIs, so the library keeps working in browsers and edge runtimes.
- **Determinism first.** Never call `Math.random()`, `Date.now()` or `Intl`
  in a generator; use `this.rng` and `this.referenceDate`. Do not depend on
  ICU data, which differs between Node builds.
- **Data must be genuine and public.** Geography, postcodes and prefixes come
  from public government sources; say where in the pull request. Names must be
  common names, never a specific real person. No real phone numbers or IDs.
- **Output changes are visible.** Adding a name or an upazila changes the
  output for existing seeds. That is fine for a minor release, but it must be
  listed in `CHANGELOG.md`, and the pinned values in `test/faker.test.ts`,
  `test/random.test.ts` and the README examples must be updated (a test
  checks the README).
- Every change comes with a test and a line in the `Unreleased` section of
  `CHANGELOG.md`.

## Project layout

```text
src/
  random.ts      seeded generator (cyrb128 + sfc32)
  faker.ts       the Faker class: names, phones, addresses, people, ...
  datasets.ts    the datasets the CLI exposes
  phone.ts       operator prefixes, parseMobile()
  ids.ts         fake NID / birth registration / transaction IDs
  money.ts       formatBdt(), lakh grouping
  dates.ts       Bangla dates and the Bengali calendar
  digits.ts      Bangla digit conversion
  csv.ts         flatten() and CSV output
  data/          names, geography and company word lists
  cli.ts, cli/   command-line interface
test/            node:test suites and helpers
examples/        runnable ESM and CommonJS examples
```

## Adding data

- **Names**: add `[English, Bangla]` pairs to the right list in
  `src/data/names.ts`. Keep the most common English spelling; spelling
  variants are a separate roadmap item.
- **Upazilas**: add pairs to the district in `src/data/geo.ts`. `'Sadar'`
  expands to "<District> Sadar" / "<জেলা> সদর". The geography test currently
  expects three upazilas per district; relax it in the same pull request.
- **Postcodes**: today each district has its head post office code. Per-upazila
  codes need a small schema change (see the issues below).

## Good first issues

1. **Amounts in words**: add `bdtInWords(12050)` →
   `বারো হাজার পঞ্চাশ টাকা মাত্র` in a new `src/words.ts`, export it from
   `src/index.ts` and add tests for lakh and crore.
2. **More upazilas**: complete the upazila list of one district you know well
   in `src/data/geo.ts` and update the count check in `test/geo.test.ts`.
3. **Spelling variants**: let `name()` sometimes return `Hussain` or `Hosen`
   for `Hossain`, behind an option `variants: true`, in `src/faker.ts`.
4. **`--locale en|bn` flag**: drop the other script's fields from CLI output.
   Change `src/cli/run.ts` (filter keys ending in `.en` / `.bn`) and add tests
   in `test/cli.test.ts`.
5. **Vehicle plates**: `faker.vehiclePlate()` →
   `{ en: 'Dhaka Metro-Ga 12-3456', bn: 'ঢাকা মেট্রো-গ ১২-৩৪৫৬' }` and an
   `ids`-style dataset in `src/datasets.ts`.
6. **CSV formula protection**: add a `--safe-csv` flag that prefixes values
   starting with `=`, `+`, `-` or `@` with `'`, in `src/csv.ts` and
   `src/cli/run.ts`. Note that E.164 phone numbers start with `+`.
7. **Landline numbers**: `faker.landline()` for Dhaka `02-` and district area
   codes, with a parser test in `test/faker.test.ts`.
8. **A Jest/Vitest example**: add `examples/vitest-fixture.mjs` that shows a
   seeded fixture per test file.

## Pull requests

Keep them focused: one fix or feature per pull request. Describe what changed
and how you tested it; the template has a short checklist. CI runs lint,
format check and the tests on Node 20 and 22 on Linux, and Node 22 on Windows
and macOS.
