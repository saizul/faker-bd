import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Random } from '../src/index.js';

describe('Random', () => {
  it('is deterministic for a numeric seed', () => {
    const a = new Random(42);
    const b = new Random(42);
    const xs = Array.from({ length: 50 }, () => a.uint32());
    const ys = Array.from({ length: 50 }, () => b.uint32());
    assert.deepEqual(xs, ys);
  });

  it('pins the first values so the algorithm never changes silently', () => {
    const r = new Random(42);
    assert.deepEqual(
      Array.from({ length: 3 }, () => r.uint32()),
      [2575078583, 630102858, 2008418509],
    );
  });

  it('treats 42 and "42" as different seeds, and different seeds diverge', () => {
    assert.notEqual(new Random(42).uint32(), new Random('42').uint32());
    assert.notEqual(new Random(1).uint32(), new Random(2).uint32());
    assert.equal(new Random('hello').uint32(), new Random('hello').uint32());
  });

  it('int() stays in range, hits both ends and handles wide ranges', () => {
    const r = new Random('int');
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = r.int(1, 6);
      assert.ok(n >= 1 && n <= 6 && Number.isInteger(n));
      seen.add(n);
    }
    assert.equal(seen.size, 6);
    for (let i = 0; i < 200; i++) {
      const n = r.int(0, 2 ** 40);
      assert.ok(n >= 0 && n <= 2 ** 40 && Number.isInteger(n));
    }
    assert.throws(() => r.int(5, 1), RangeError);
  });

  it('next() is in [0, 1) and roughly uniform', () => {
    const r = new Random(7);
    let sum = 0;
    for (let i = 0; i < 10_000; i++) {
      const x = r.next();
      assert.ok(x >= 0 && x < 1);
      sum += x;
    }
    assert.ok(Math.abs(sum / 10_000 - 0.5) < 0.02);
  });

  it('weighted() respects weights', () => {
    const r = new Random(3);
    let a = 0;
    for (let i = 0; i < 5000; i++)
      if (
        r.weighted([
          ['a', 9],
          ['b', 1],
        ]) === 'a'
      )
        a++;
    assert.ok(a > 4300 && a < 4700, String(a));
    assert.throws(() => r.weighted([['x', 0]]), RangeError);
    assert.throws(() => r.pick([]), RangeError);
  });

  it('rejects non-finite seeds', () => {
    assert.throws(() => new Random(Number.NaN), TypeError);
  });
});
