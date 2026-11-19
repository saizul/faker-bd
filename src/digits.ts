const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Replaces ASCII digits 0-9 with Bangla digits ০-৯. Everything else is kept. */
export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[d.charCodeAt(0) - 48]!);
}

/** Replaces Bangla digits ০-৯ with ASCII digits 0-9. Everything else is kept. */
export function fromBanglaDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
}
