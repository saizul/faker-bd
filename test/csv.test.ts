import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { csvField, flatten, toCsv } from '../src/index.js';

describe('csv', () => {
  it('flattens nested objects with dotted keys', () => {
    assert.deepEqual(flatten({ a: 1, b: { c: 'x', d: { e: true } }, f: [1, 2], g: null }), {
      a: 1,
      'b.c': 'x',
      'b.d.e': true,
      f: '1|2',
      g: null,
    });
  });

  it('quotes fields that need it (RFC 4180)', () => {
    assert.equal(csvField('plain'), 'plain');
    assert.equal(csvField('a,b'), '"a,b"');
    assert.equal(csvField('say "hi"'), '"say ""hi"""');
    assert.equal(csvField('line\nbreak'), '"line\nbreak"');
    assert.equal(csvField(' padded'), '" padded"');
    assert.equal(csvField(null), '');
    assert.equal(csvField(42), '42');
  });

  it('builds a document with a header and CRLF', () => {
    assert.equal(
      toCsv([
        { a: 1, b: 'x,y' },
        { a: 2, b: 'বাংলা' },
      ]),
      'a,b\r\n1,"x,y"\r\n2,বাংলা\r\n',
    );
    assert.equal(toCsv([]), '');
  });
});
