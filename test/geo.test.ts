import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DISTRICTS, DIVISIONS, FAMILY, FEMALE_GIVEN, MALE_GIVEN, NEUTRAL_GIVEN } from '../src/index.js';
import { BANGLA } from './helpers.js';

describe('geography dataset', () => {
  it('has all 8 divisions and all 64 districts', () => {
    assert.deepEqual(
      DIVISIONS.map((d) => d.en),
      ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'],
    );
    assert.equal(DISTRICTS.length, 64);
    assert.equal(new Set(DISTRICTS.map((d) => d.en)).size, 64);
    const counts = Object.fromEntries(DIVISIONS.map((d) => [d.en, d.districts.length]));
    assert.deepEqual(counts, {
      Barishal: 6,
      Chattogram: 11,
      Dhaka: 13,
      Khulna: 10,
      Mymensingh: 4,
      Rajshahi: 8,
      Rangpur: 8,
      Sylhet: 4,
    });
  });

  it('every division has its capital district', () => {
    for (const div of DIVISIONS)
      assert.ok(
        div.districts.some((d) => d.en === div.en),
        div.en,
      );
  });

  it('postcodes are unique 4-digit codes and names are in Bangla script', () => {
    assert.equal(new Set(DISTRICTS.map((d) => d.postcode)).size, 64);
    for (const d of DISTRICTS) {
      assert.match(d.postcode, /^[1-9]\d{3}$/, d.en);
      assert.match(d.bn, BANGLA, d.en);
      assert.equal(d.upazilas.length, 3, d.en);
      for (const [en, bn] of d.upazilas) {
        assert.match(en, /^[A-Z][A-Za-z' ]+$/, en);
        assert.match(bn, BANGLA, en);
      }
    }
    assert.equal(DISTRICTS.find((d) => d.en === 'Dhaka')!.postcode, '1000');
    assert.equal(DISTRICTS.find((d) => d.en === 'Chattogram')!.postcode, '4000');
    assert.equal(DISTRICTS.find((d) => d.en === 'Sylhet')!.postcode, '3100');
  });
});

describe('name dataset', () => {
  it('has English and Bangla for every name, without duplicates', () => {
    const lists = [
      ...Object.values(MALE_GIVEN),
      ...Object.values(FEMALE_GIVEN),
      NEUTRAL_GIVEN,
      ...Object.values(FAMILY).flatMap((f) => [f.any, f.male, f.female]),
    ];
    for (const list of lists) {
      assert.equal(new Set(list.map(([en]) => en)).size, list.length);
      for (const [en, bn] of list) {
        assert.match(en, /^[A-Z][a-z]+$/, en);
        assert.match(bn, BANGLA, en);
      }
    }
  });
});
