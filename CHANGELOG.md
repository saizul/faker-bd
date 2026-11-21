# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). Output for a given seed only
changes in a minor or major release, and every such change is listed here.

## [Unreleased]

### Added

- `bdtInWords(amount, { lang?, only? })` writes Taka amounts in Bangla or
  English words with the lakh and crore system, as on cheques and invoices:
  `bdtInWords(12050)` gives `বারো হাজার পঞ্চাশ টাকা মাত্র`. Paisa are
  included and rounded to two decimals.
- `numberInWords(n, lang?)` for any non-negative safe integer, and
  `BN_NUMBER_WORDS` (the Bangla words for 0 to 99).

## [0.1.0] - 2026-11-19

### Added

- Seeded, deterministic generator (cyrb128 + sfc32) that behaves the same in
  every JavaScript engine.
- Names in English and Bangla for male, female and gender-neutral given
  names, with family names that match the naming tradition and the optional
  `Md.` / `মোঃ` prefix.
- Mobile numbers with BTRC operator prefixes (013 to 019) in local, E.164 and
  Bangla-digit form; `parseMobile()` and `isValidMobile()`.
- Addresses from all 8 divisions and 64 districts with three upazilas each and
  district head post office codes, in both scripts.
- NID-shaped (10, 13, 17 digits) and birth-registration-shaped numbers with a
  deliberately invalid check digit, and `isFakeId()`.
- bKash, Nagad and Rocket-like transactions and transaction IDs.
- Company names, Taka amounts with lakh/crore grouping (`formatBdt()`),
  Bangla digits, Gregorian dates in Bangla and the revised Bengali calendar
  (`toBengaliCalendar()`, `formatBengaliDate()`).
- `faker-bd` CLI with the `people`, `names`, `phones`, `addresses`,
  `companies`, `transactions` and `ids` datasets and JSON, JSON Lines and CSV
  output.

[Unreleased]: https://github.com/saizul/faker-bd/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/saizul/faker-bd/releases/tag/v0.1.0
