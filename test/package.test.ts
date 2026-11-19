import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import * as esm from '../src/index.js';
import { cli } from './helpers.js';

const require = createRequire(import.meta.url);
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('package', () => {
  it('the CommonJS build exposes the same API and the same data', () => {
    const cjs = require('../cjs/index.js') as typeof esm;
    assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort());
    assert.deepEqual(cjs.createFaker({ seed: 42 }).person(), esm.createFaker({ seed: 42 }).person());
  });

  it('the CommonJS folder is marked as commonjs', () => {
    assert.equal(JSON.parse(read('../cjs/package.json')).type, 'commonjs');
  });

  it('has no runtime dependencies and versions agree', () => {
    const pkg = JSON.parse(read('../../package.json'));
    assert.equal(pkg.dependencies, undefined);
    assert.equal(pkg.version, esm.VERSION);
    assert.equal(pkg.name, '@saizul/faker-bd');
    assert.equal(pkg.bin['faker-bd'], './dist/esm/cli.js');
  });

  it('the CLI entry starts with a shebang', () => {
    assert.ok(read('../esm/cli.js').startsWith('#!/usr/bin/env node'));
  });

  it('the README lists every dataset', () => {
    const readme = read('../../README.md');
    for (const name of Object.keys(esm.DATASETS)) assert.ok(readme.includes(`\`${name}\``), name);
  });

  it('every CLI example in the README prints exactly what the README shows', () => {
    const readme = read('../../README.md');
    const blocks = [...readme.matchAll(/```console\n([\s\S]*?)```/g)].map((m) => m[1]!);
    let checked = 0;
    for (const block of blocks) {
      const parts = block.split(/^\$ /m).slice(1);
      for (const part of parts) {
        const [command, ...output] = part.split('\n');
        if (!/^(npx )?faker-bd /.test(command!) || command!.includes('>')) continue;
        const args = command!.replace(/^(npx )?faker-bd /, '').split(/\s+/);
        const r = cli(args);
        assert.equal(r.code, 0, command);
        assert.equal(r.stdout.replace(/\r\n/g, '\n').trim(), output.join('\n').trim(), command);
        checked++;
      }
    }
    assert.ok(checked >= 3, `checked ${checked}`);
  });
});
