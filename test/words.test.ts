import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BN_NUMBER_WORDS, bdtInWords, numberInWords } from '../src/index.js';

describe('numberInWords', () => {
  it('has a distinct Bangla word for every number below 100', () => {
    assert.equal(BN_NUMBER_WORDS.length, 100);
    assert.equal(new Set(BN_NUMBER_WORDS).size, 100);
    const spot: [number, string][] = [
      [0, 'শূন্য'],
      [9, 'নয়'],
      [15, 'পনেরো'],
      [29, 'ঊনত্রিশ'],
      [42, 'বিয়াল্লিশ'],
      [71, 'একাত্তর'],
      [88, 'অষ্টাশি'],
      [99, 'নিরানব্বই'],
    ];
    for (const [n, word] of spot) assert.equal(numberInWords(n), word, String(n));
  });

  it('uses hundred, thousand, lakh and crore', () => {
    const cases: [number, string, string][] = [
      [100, 'এক শত', 'One Hundred'],
      [105, 'এক শত পাঁচ', 'One Hundred Five'],
      [1000, 'এক হাজার', 'One Thousand'],
      [12_050, 'বারো হাজার পঞ্চাশ', 'Twelve Thousand Fifty'],
      [120_000, 'এক লক্ষ বিশ হাজার', 'One Lakh Twenty Thousand'],
      [
        2_545_321,
        'পঁচিশ লক্ষ পঁয়তাল্লিশ হাজার তিন শত একুশ',
        'Twenty-Five Lakh Forty-Five Thousand Three Hundred Twenty-One',
      ],
      [10_000_000, 'এক কোটি', 'One Crore'],
      [10_000_001, 'এক কোটি এক', 'One Crore One'],
      [
        99_99_99_999,
        'নিরানব্বই কোটি নিরানব্বই লক্ষ নিরানব্বই হাজার নয় শত নিরানব্বই',
        'Ninety-Nine Crore Ninety-Nine Lakh Ninety-Nine Thousand Nine Hundred Ninety-Nine',
      ],
    ];
    for (const [n, bn, en] of cases) {
      assert.equal(numberInWords(n), bn, String(n));
      assert.equal(numberInWords(n, 'en'), en, String(n));
    }
  });

  it('repeats the scales before crore for very large amounts', () => {
    assert.equal(numberInWords(1_500_000_000), 'এক শত পঞ্চাশ কোটি');
    assert.equal(numberInWords(12_345_00_00_000, 'en'), 'Twelve Thousand Three Hundred Forty-Five Crore');
  });

  it('rejects negative, fractional and unsafe numbers', () => {
    for (const n of [-1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => numberInWords(n), RangeError, String(n));
    }
  });
});

describe('bdtInWords', () => {
  it('writes cheque-style Taka amounts', () => {
    assert.equal(bdtInWords(12050), 'বারো হাজার পঞ্চাশ টাকা মাত্র');
    assert.equal(bdtInWords(120_000, { lang: 'en' }), 'One Lakh Twenty Thousand Taka Only');
    assert.equal(bdtInWords(0), 'শূন্য টাকা মাত্র');
  });

  it('adds paisa, rounded to two decimals', () => {
    assert.equal(bdtInWords(1500.5), 'এক হাজার পাঁচ শত টাকা পঞ্চাশ পয়সা মাত্র');
    assert.equal(bdtInWords(1500.5, { lang: 'en' }), 'One Thousand Five Hundred Taka and Fifty Paisa Only');
    assert.equal(bdtInWords(10.256, { lang: 'en' }), 'Ten Taka and Twenty-Six Paisa Only');
    assert.equal(bdtInWords(9.999), 'দশ টাকা মাত্র');
  });

  it('can leave out the "only" suffix', () => {
    assert.equal(bdtInWords(25, { only: false }), 'পঁচিশ টাকা');
    assert.equal(bdtInWords(25, { lang: 'en', only: false }), 'Twenty-Five Taka');
  });

  it('rejects bad input', () => {
    assert.throws(() => bdtInWords(-5), RangeError);
    assert.throws(() => bdtInWords(Number.POSITIVE_INFINITY), RangeError);
    assert.throws(() => bdtInWords(1e17), RangeError);
    assert.throws(() => bdtInWords(5, { lang: 'fr' as never }), RangeError);
  });
});
