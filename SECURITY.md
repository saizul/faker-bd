# Security policy

## Supported versions

Only the latest release receives fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Use GitHub's
private vulnerability reporting ("Report a vulnerability" under the
repository's **Security** tab). You will get an answer within a week.

## Scope

Reports in these areas are especially welcome:

- **Real personal data.** If a dataset in `src/data/` contains, or the
  generators can produce, something that identifies a real private person
  (for example a real person's full name together with a real phone number
  or ID), report it privately and we will remove it.
- **Fake IDs that are not marked.** Every NID and birth-registration-shaped
  number must satisfy `isFakeId()`. A way to get one that does not is a bug.
- **Output injection.** CSV output is quoted per RFC 4180. If a dataset value
  can break the CSV or JSON structure, or start a spreadsheet formula when
  opened, please report it.
- **Denial of service.** `--count` is capped at 1,000,000. A way to make the
  CLI or the library hang or use unbounded memory is a bug.

## What faker-bd is not

It makes test data. It does not validate real identity documents, and the
fake IDs and transaction IDs must never be used to deceive anyone.
