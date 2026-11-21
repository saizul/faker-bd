/** Bangla number words from 0 to 99. Bangla has a distinct word for every number below 100. */
// biome-ignore format: ten words per line, so the table is easy to check
export const BN_NUMBER_WORDS: readonly string[] = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

// biome-ignore format: ten words per line
const EN_ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const EN_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

interface Scale {
  value: number;
  bn: string;
  en: string;
}

/** The South Asian scales, largest first. Amounts of 100 crore and more repeat them before "crore". */
const SCALES: Scale[] = [
  { value: 10_000_000, bn: 'কোটি', en: 'Crore' },
  { value: 100_000, bn: 'লক্ষ', en: 'Lakh' },
  { value: 1_000, bn: 'হাজার', en: 'Thousand' },
  { value: 100, bn: 'শত', en: 'Hundred' },
];

function below100(n: number, lang: 'bn' | 'en'): string {
  if (lang === 'bn') return BN_NUMBER_WORDS[n]!;
  if (n < 20) return EN_ONES[n]!;
  const tens = EN_TENS[Math.floor(n / 10)]!;
  return n % 10 === 0 ? tens : `${tens}-${EN_ONES[n % 10]}`;
}

/**
 * Writes a whole number in words with the lakh and crore system:
 * `numberInWords(120050)` → `এক লক্ষ বিশ হাজার পঞ্চাশ`,
 * `numberInWords(120050, 'en')` → `One Lakh Twenty Thousand Fifty`.
 */
export function numberInWords(n: number, lang: 'bn' | 'en' = 'bn'): string {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError(`n must be a non-negative safe integer, got ${n}`);
  }
  if (n < 100) return below100(n, lang);
  const parts: string[] = [];
  let rest = n;
  for (const scale of SCALES) {
    if (rest < scale.value) continue;
    const count = Math.floor(rest / scale.value);
    rest %= scale.value;
    // Only crore can repeat (e.g. 150 crore); the other scales count to 99 at most.
    parts.push(`${numberInWords(count, lang)} ${scale[lang]}`);
  }
  if (rest > 0) parts.push(below100(rest, lang));
  return parts.join(' ');
}

export interface BdtInWordsOptions {
  /** `'bn'` (default) for Bangla words, `'en'` for English. */
  lang?: 'bn' | 'en';
  /** End with `মাত্র` / `Only`, as on cheques and invoices. Default true. */
  only?: boolean;
}

/**
 * Writes a Taka amount in words, as on cheques, money receipts and invoices.
 * Paisa are rounded to two decimals.
 *
 * ```ts
 * bdtInWords(12050); // 'বারো হাজার পঞ্চাশ টাকা মাত্র'
 * bdtInWords(120000.5, { lang: 'en' }); // 'One Lakh Twenty Thousand Taka and Fifty Paisa Only'
 * ```
 */
export function bdtInWords(amount: number, options: BdtInWordsOptions = {}): string {
  const lang = options.lang ?? 'bn';
  if (lang !== 'bn' && lang !== 'en') throw new RangeError(`lang must be "bn" or "en", got ${String(lang)}`);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError(`amount must be a non-negative finite number, got ${amount}`);
  }
  // toFixed avoids binary rounding surprises such as 1.005 * 100 = 100.49999.
  const [intText, paisaText] = amount.toFixed(2).split('.') as [string, string];
  const taka = Number(intText);
  const paisa = Number(paisaText);
  if (!Number.isSafeInteger(taka)) throw new RangeError(`amount is too large: ${amount}`);

  let text: string;
  if (lang === 'bn') {
    text = `${numberInWords(taka)} টাকা`;
    if (paisa > 0) text += ` ${numberInWords(paisa)} পয়সা`;
    if (options.only !== false) text += ' মাত্র';
  } else {
    text = `${numberInWords(taka, 'en')} Taka`;
    if (paisa > 0) text += ` and ${numberInWords(paisa, 'en')} Paisa`;
    if (options.only !== false) text += ' Only';
  }
  return text;
}
