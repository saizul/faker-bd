import { run } from '../src/cli/run.js';

/** Runs the CLI in-process and captures its output. */
export function cli(args: string[]) {
  let stdout = '';
  let stderr = '';
  const code = run(args, {
    stdout: (t) => {
      stdout += t;
    },
    stderr: (t) => {
      stderr += t;
    },
  });
  return { code, stdout, stderr };
}

/** Bangla script letters, signs and digits (U+0980 to U+09FF). */
export const BANGLA = /^[ঀ-৿\s.,/'’-]+$/;
