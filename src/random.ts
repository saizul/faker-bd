/**
 * A small, fast, seedable pseudo-random number generator.
 *
 * The seed (a number or any string) is hashed with cyrb128 into 128 bits of
 * state for sfc32. Both algorithms are public domain, need only 32-bit integer
 * math and behave identically on every JavaScript engine, so the same seed
 * always produces the same sequence, in Node, browsers and edge runtimes.
 *
 * This is NOT a cryptographic generator. Never use it for secrets.
 */

export type Seed = number | string;

function cyrb128(text: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < text.length; i++) {
    const k = text.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** Makes a seed when the caller did not give one. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

export class Random {
  readonly seed: Seed;
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(seed: Seed = randomSeed()) {
    if (typeof seed === 'number' && !Number.isFinite(seed)) {
      throw new TypeError(`seed must be a finite number or a string, got ${seed}`);
    }
    this.seed = seed;
    [this.a, this.b, this.c, this.d] = cyrb128(`${typeof seed}:${seed}`);
    // Warm up so that similar seeds diverge quickly.
    for (let i = 0; i < 15; i++) this.uint32();
  }

  /** The next unsigned 32-bit integer (sfc32). */
  uint32(): number {
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** A float in [0, 1). */
  next(): number {
    return this.uint32() / 4294967296;
  }

  /** An integer between `min` and `max`, both inclusive. */
  int(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`invalid integer range ${min}..${max}`);
    }
    const span = max - min + 1;
    if (span <= 4294967296) return min + Math.floor(this.next() * span);
    // Wide ranges: combine two draws for 53 bits.
    const hi = this.uint32() >>> 5;
    const lo = this.uint32() >>> 6;
    return min + Math.floor(((hi * 67108864 + lo) / 9007199254740992) * span);
  }

  /** True with probability `p`. */
  bool(p = 0.5): boolean {
    return this.next() < p;
  }

  /** One element of a non-empty array. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError('cannot pick from an empty list');
    return items[Math.floor(this.next() * items.length)]!;
  }

  /** One element, chosen with the given relative weights. */
  weighted<T>(items: readonly (readonly [T, number])[]): T {
    let total = 0;
    for (const [, w] of items) total += w;
    if (!(total > 0)) throw new RangeError('weights must add up to more than 0');
    let r = this.next() * total;
    for (const [item, w] of items) {
      r -= w;
      if (r < 0) return item;
    }
    return items[items.length - 1]![0];
  }

  /** `length` characters drawn from `alphabet`. */
  chars(length: number, alphabet: string): string {
    let out = '';
    for (let i = 0; i < length; i++) out += alphabet[Math.floor(this.next() * alphabet.length)];
    return out;
  }

  /** `length` decimal digits (may start with 0). */
  digits(length: number): string {
    return this.chars(length, '0123456789');
  }
}
