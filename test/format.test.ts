import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatBanglaDate,
  formatBdt,
  formatBengaliDate,
  fromBanglaDigits,
  groupLakh,
  isoDate,
  isoDateTime,
  toBanglaDigits,
  toBengaliCalendar,
} from '../src/index.js';

const dhaka = (ymd: string, hm = '00:00') => new Date(`${ymd}T${hm}:00+06:00`);

describe('digits', () => {
  it('convert both ways and keep other characters', () => {
    assert.equal(toBanglaDigits('2026-11-19'), '২০২৬-১১-১৯');
    assert.equal(toBanglaDigits(1234567890), '১২৩৪৫৬৭৮৯০');
    assert.equal(fromBanglaDigits('০১৭১২-৩৪৫৬৭৮ abc'), '01712-345678 abc');
  });
});

describe('formatBdt', () => {
  const cases: [number, string, string][] = [
    [0, '৳০.০০', '৳0.00'],
    [999, '৳৯৯৯.০০', '৳999.00'],
    [1000, '৳১,০০০.০০', '৳1,000.00'],
    [100000, '৳১,০০,০০০.০০', '৳1,00,000.00'],
    [1234567.5, '৳১২,৩৪,৫৬৭.৫০', '৳12,34,567.50'],
    [123456789.129, '৳১২,৩৪,৫৬,৭৮৯.১৩', '৳12,34,56,789.13'],
    [-2500, '-৳২,৫০০.০০', '-৳2,500.00'],
  ];
  for (const [n, bn, en] of cases) {
    it(`formats ${n}`, () => {
      assert.equal(formatBdt(n), bn);
      assert.equal(formatBdt(n, { digits: 'en' }), en);
    });
  }

  it('supports options and rejects bad input', () => {
    assert.equal(formatBdt(1500, { symbol: false, decimals: 0 }), '১,৫০০');
    assert.equal(formatBdt(-0.001), '৳০.০০');
    assert.equal(groupLakh('10000000'), '1,00,00,000');
    assert.throws(() => formatBdt(Number.POSITIVE_INFINITY), RangeError);
    assert.throws(() => formatBdt(1, { decimals: 9 }), RangeError);
  });
});

describe('dates', () => {
  it('formats Gregorian dates in Bangla in Dhaka time', () => {
    assert.equal(formatBanglaDate(dhaka('2026-11-19')), '১৯ নভেম্বর ২০২৬');
    assert.equal(formatBanglaDate(dhaka('2026-11-19'), { weekday: true }), 'বৃহস্পতিবার, ১৯ নভেম্বর ২০২৬');
    assert.equal(formatBanglaDate(dhaka('2026-02-21', '09:05'), { time: true }), '২১ ফেব্রুয়ারি ২০২৬, ০৯:০৫');
    // 20:00 UTC is already the next day in Dhaka.
    assert.equal(formatBanglaDate(new Date('2026-12-15T20:00:00Z')), '১৬ ডিসেম্বর ২০২৬');
    assert.equal(formatBanglaDate(new Date('2026-12-15T20:00:00Z'), { offsetMinutes: 0 }), '১৫ ডিসেম্বর ২০২৬');
  });

  it('formats ISO dates with the +06:00 offset', () => {
    assert.equal(isoDate(new Date('2026-12-15T20:00:00Z')), '2026-12-16');
    assert.equal(isoDateTime(new Date('2026-12-15T20:30:15Z')), '2026-12-16T02:30:15+06:00');
    assert.equal(
      isoDateTime(new Date('2026-12-15T20:30:15Z'), { offsetMinutes: -90 }),
      '2026-12-15T19:00:15-01:30',
    );
    assert.throws(() => isoDate(new Date('nope')), RangeError);
  });

  // National days with fixed dates in the revised Bengali calendar.
  const bengali: [string, string][] = [
    ['2026-04-14', '১ বৈশাখ ১৪৩৩ বঙ্গাব্দ'], // Pohela Boishakh
    ['2026-04-13', '৩০ চৈত্র ১৪৩২ বঙ্গাব্দ'],
    ['2026-12-16', '১ পৌষ ১৪৩৩ বঙ্গাব্দ'], // Victory Day
    ['2027-02-14', '১ ফাল্গুন ১৪৩৩ বঙ্গাব্দ'], // Pohela Falgun
    ['2027-02-21', '৮ ফাল্গুন ১৪৩৩ বঙ্গাব্দ'], // International Mother Language Day
    ['2027-03-26', '১২ চৈত্র ১৪৩৩ বঙ্গাব্দ'], // Independence Day
    ['2027-03-14', '২৯ ফাল্গুন ১৪৩৩ বঙ্গাব্দ'],
    ['2027-03-15', '১ চৈত্র ১৪৩৩ বঙ্গাব্দ'],
    ['2028-03-14', '৩০ ফাল্গুন ১৪৩৪ বঙ্গাব্দ'], // leap year: Falgun has 30 days
    ['2026-10-16', '৩১ আশ্বিন ১৪৩৩ বঙ্গাব্দ'],
    ['2026-10-17', '১ কার্তিক ১৪৩৩ বঙ্গাব্দ'],
  ];
  for (const [ymd, expected] of bengali) {
    it(`converts ${ymd} to the Bengali calendar`, () => {
      assert.equal(formatBengaliDate(dhaka(ymd)), expected);
    });
  }

  it('toBengaliCalendar() returns the parts', () => {
    assert.deepEqual(toBengaliCalendar(dhaka('2026-11-19')), {
      year: 1433,
      month: 8,
      day: 4,
      monthNameBn: 'অগ্রহায়ণ',
      monthNameEn: 'Agrahayan',
    });
    assert.equal(formatBengaliDate(dhaka('2026-11-19'), { suffix: false }), '৪ অগ্রহায়ণ ১৪৩৩');
  });

  it('every day of a year maps to a valid, increasing Bengali date', () => {
    let prev = toBengaliCalendar(dhaka('2027-04-13'));
    assert.deepEqual([prev.month, prev.day], [12, 30]);
    for (let t = dhaka('2027-04-14').getTime(); t < dhaka('2028-04-14').getTime(); t += 86_400_000) {
      const b = toBengaliCalendar(new Date(t));
      const ok =
        (b.month === prev.month && b.day === prev.day + 1) ||
        (b.day === 1 && (b.month === prev.month + 1 || (b.month === 1 && prev.month === 12)));
      assert.ok(ok, `${new Date(t).toISOString()} ${JSON.stringify(b)}`);
      prev = b;
    }
    assert.deepEqual([prev.year, prev.month, prev.day], [1434, 12, 30]);
  });
});
