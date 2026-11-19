#!/usr/bin/env node
import { run } from './cli/run.js';

try {
  process.exitCode = run(process.argv.slice(2), {
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
} catch (err) {
  process.stderr.write(`faker-bd: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 2;
}
