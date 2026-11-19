import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fakeBirthRegistration, fakeNid, isFakeId, Random, withFakeCheckDigit } from '../src/index.js';

/** A correct Luhn check, for proving that fake IDs fail it. */
function luhnValid(id: string): boolean {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    let d = Number(id[id.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

describe('fake ids', () => {
  const rng = new Random('ids');

  it('have the right lengths and never pass a Luhn check', () => {
    for (let i = 0; i < 500; i++) {
      for (const len of [10, 13, 17] as const) {
        const id = fakeNid(rng, len);
        assert.equal(id.length, len);
        assert.match(id, /^[1-9]\d+$/);
        assert.equal(luhnValid(id), false, id);
        assert.ok(isFakeId(id), id);
      }
      const br = fakeBirthRegistration(rng, 2010);
      assert.match(br, /^2010\d{13}$/);
      assert.ok(isFakeId(br));
    }
  });

  it('17-digit NIDs start with the birth year', () => {
    assert.match(fakeNid(rng, 17, 1988), /^1988\d{13}$/);
  });

  it('isFakeId() rejects other numbers', () => {
    const id = fakeNid(rng, 10);
    const last = Number(id.at(-1));
    assert.equal(isFakeId(id.slice(0, -1) + String((last + 1) % 10)), false);
    assert.equal(isFakeId('12345'), false);
    assert.equal(isFakeId('abcdefghij'), false);
    assert.equal(isFakeId(`${id}0`), false);
  });

  it('withFakeCheckDigit() is the Luhn digit plus one', () => {
    // The Luhn check digit of 7992739871 is 3, so the fake marker is 4.
    assert.equal(withFakeCheckDigit('7992739871'), '79927398714');
    assert.ok(luhnValid('79927398713'));
    assert.throws(() => withFakeCheckDigit('12a'), TypeError);
    assert.throws(() => fakeNid(rng, 12 as 10), RangeError);
  });
});
