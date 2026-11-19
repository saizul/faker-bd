import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isFakeId, isValidMobile, VERSION } from '../src/index.js';
import { cli } from './helpers.js';

/** Minimal RFC 4180 parser for checking the CLI output. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r' && text[i + 1] === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
    } else field += c;
  }
  return rows;
}

describe('cli', () => {
  it('prints help and version', () => {
    const h = cli(['--help']);
    assert.equal(h.code, 0);
    assert.match(h.stdout, /Usage: faker-bd <dataset> \[options\]/);
    for (const ds of ['people', 'names', 'phones', 'addresses', 'companies', 'transactions', 'ids']) {
      assert.match(h.stdout, new RegExp(`^  ${ds} `, 'm'));
    }
    assert.equal(cli(['-v']).stdout, `${VERSION}\n`);
  });

  it('people --count 100 --seed 42 --format csv', () => {
    const r = cli(['people', '--count', '100', '--seed', '42', '--format', 'csv']);
    assert.equal(r.code, 0);
    assert.equal(r.stderr, '');
    const rows = parseCsv(r.stdout);
    assert.equal(rows.length, 101);
    const header = rows[0]!;
    assert.ok(header.includes('name.bn') && header.includes('address.postcode'));
    for (const row of rows.slice(1)) {
      assert.equal(row.length, header.length);
      assert.ok(isValidMobile(row[header.indexOf('phone')]!));
      assert.ok(isFakeId(row[header.indexOf('nid')]!));
    }
    assert.equal(rows[1]![header.indexOf('name.en')], 'Shirin Rahman');
    // Same seed, same bytes.
    assert.equal(cli(['people', '-n', '100', '-s', '42', '-f', 'csv']).stdout, r.stdout);
  });

  it('JSON output is valid and matches the library', () => {
    const r = cli(['people', '-n', '3', '--seed=42']);
    const rows = JSON.parse(r.stdout);
    assert.equal(rows.length, 3);
    assert.equal(rows[0].name.bn, 'শিরিন রহমান');
    assert.deepEqual(JSON.parse(cli(['people', '-n', '0', '-s', '1']).stdout), []);
  });

  it('jsonl, --fields and --flat', () => {
    const r = cli([
      'phones',
      '-n',
      '4',
      '-s',
      '9',
      '-f',
      'jsonl',
      '--operator',
      'teletalk',
      '--fields',
      'local,e164',
    ]);
    const lines = r.stdout
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));
    assert.equal(lines.length, 4);
    for (const l of lines) {
      assert.deepEqual(Object.keys(l), ['local', 'e164']);
      assert.match(l.local, /^015\d{8}$/);
    }
    const flat = JSON.parse(cli(['addresses', '-n', '1', '-s', '1', '--flat']).stdout)[0];
    assert.ok('district.bn' in flat);
    const csv = cli(['addresses', '-n', '0', '-f', 'csv', '--fields', 'district.en']);
    assert.equal(csv.stdout, 'district.en\r\n');
  });

  it('dataset filters work', () => {
    const r = cli([
      'addresses',
      '-n',
      '20',
      '-s',
      '2',
      '-f',
      'csv',
      '--division',
      'Sylhet',
      '--fields',
      'division.en',
    ]);
    assert.deepEqual(new Set(parseCsv(r.stdout).slice(1).flat()), new Set(['Sylhet']));
    const t = cli(['transactions', '-n', '5', '-s', '2', '-f', 'jsonl', '--provider', 'nagad']);
    for (const line of t.stdout.trim().split('\n')) assert.equal(JSON.parse(line).provider, 'nagad');
    const g = cli(['names', '-n', '5', '-s', '2', '--gender', 'female', '--fields', 'gender']);
    assert.ok(JSON.parse(g.stdout).every((x: { gender: string }) => x.gender === 'female'));
  });

  it('--reference-date moves birth dates and transaction dates', () => {
    const args = ['people', '-n', '1', '-s', '5', '--fields', 'age,dateOfBirth'];
    const a = JSON.parse(cli(args).stdout)[0];
    const b = JSON.parse(cli([...args, '--reference-date', '2036-01-01']).stdout)[0];
    assert.equal(a.age, b.age);
    assert.equal(Number(b.dateOfBirth.slice(0, 4)) - Number(a.dateOfBirth.slice(0, 4)), 10);
    const t = cli([
      'transactions',
      '-n',
      '1',
      '-s',
      '5',
      '--fields',
      'timestamp',
      '--reference-date',
      '2030-06-01',
    ]);
    assert.match(JSON.parse(t.stdout)[0].timestamp, /^2030-0[3-6]-/);
  });

  it('prints the seed when it chose one', () => {
    const r = cli(['names', '-n', '1']);
    assert.equal(r.code, 0);
    const seed = r.stderr.match(/using seed (\d+)/)?.[1];
    assert.ok(seed);
    assert.equal(cli(['names', '-n', '1', '-s', seed!]).stdout, r.stdout);
  });

  it('reports usage errors with exit code 1', () => {
    const cases: [string[], RegExp][] = [
      [[], /missing dataset/],
      [['robots'], /unknown dataset "robots"/],
      [['people', '--count', 'ten'], /--count must be/],
      [['people', '--count', '2000000'], /--count must be/],
      [['people', '--format', 'xml'], /--format must be one of: json, jsonl, csv/],
      [['people', '--bogus'], /unknown option --bogus/],
      [['people', '--seed'], /--seed needs a value/],
      [['people', 'extra'], /unexpected argument "extra"/],
      [['addresses', '--district', 'Atlantis'], /unknown district "Atlantis"/],
      [['people', '--reference-date', 'soon'], /invalid date/],
    ];
    for (const [args, msg] of cases) {
      const r = cli(args);
      assert.equal(r.code, 1, args.join(' '));
      assert.match(r.stderr, msg);
      assert.equal(r.stdout, '');
    }
  });
});
