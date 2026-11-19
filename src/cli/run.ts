import { csvField, csvLine, flatten, type Row } from '../csv.js';
import { DATASETS, type DatasetOptions } from '../datasets.js';
import { Faker } from '../faker.js';
import { randomSeed, type Seed } from '../random.js';
import { VERSION } from '../version.js';

export interface CliIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

export const MAX_COUNT = 1_000_000;

const FORMATS = ['json', 'jsonl', 'csv'] as const;
type Format = (typeof FORMATS)[number];

const CHOICES: Record<string, readonly string[]> = {
  gender: ['male', 'female', 'neutral'],
  operator: ['grameenphone', 'banglalink', 'robi', 'airtel', 'teletalk'],
  provider: ['bkash', 'nagad', 'rocket'],
  format: FORMATS,
};

function help(): string {
  const width = Math.max(...Object.keys(DATASETS).map((k) => k.length));
  const list = Object.entries(DATASETS)
    .map(([name, ds]) => `  ${name.padEnd(width)}  ${ds.description}`)
    .join('\n');
  return `Usage: faker-bd <dataset> [options]

Realistic fake Bangladeshi test data. The same --seed always gives the same rows.

Datasets:
${list}

Options:
  -n, --count <n>          number of rows (default 10, at most ${MAX_COUNT.toLocaleString('en-US')})
  -s, --seed <seed>        number or text; random when omitted (printed to stderr)
  -f, --format <format>    json (default), jsonl or csv
      --fields <a,b,...>   only these columns, using dotted names such as name.en
      --flat               flatten nested objects in JSON output (csv is always flat)
      --gender <g>         male, female or neutral (people, names)
      --division <name>    English division name, e.g. Sylhet (addresses)
      --district <name>    English district name, e.g. Cumilla (addresses)
      --operator <op>      grameenphone, banglalink, robi, airtel or teletalk (phones)
      --provider <p>       bkash, nagad or rocket (transactions)
      --reference-date <d> "today" for ages and transaction dates (default 2026-01-01)
  -h, --help               show this help
  -v, --version            show the version

Examples:
  faker-bd people --count 100 --seed 42 --format csv > people.csv
  faker-bd phones -n 5 --operator teletalk --fields local,e164
  faker-bd transactions -n 3 --provider bkash --format jsonl
`;
}

class UsageError extends Error {}

interface Parsed {
  dataset?: string;
  count: number;
  seed?: Seed;
  format: Format;
  fields?: string[];
  flat: boolean;
  referenceDate?: Date;
  options: DatasetOptions;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: readonly string[]): Parsed {
  const out: Parsed = { count: 10, format: 'json', flat: false, options: {}, help: false, version: false };
  const args = [...argv];
  while (args.length) {
    let arg = args.shift()!;
    let inline: string | undefined;
    if (arg.startsWith('--') && arg.includes('=')) {
      inline = arg.slice(arg.indexOf('=') + 1);
      arg = arg.slice(0, arg.indexOf('='));
    }
    const value = () => {
      const v = inline ?? args.shift();
      if (v === undefined || v === '') throw new UsageError(`${arg} needs a value`);
      return v;
    };
    const choice = (key: string) => {
      const v = value().toLowerCase();
      if (!CHOICES[key]!.includes(v))
        throw new UsageError(`${arg} must be one of: ${CHOICES[key]!.join(', ')}`);
      return v;
    };
    switch (arg) {
      case '-h':
      case '--help':
        out.help = true;
        break;
      case '-v':
      case '--version':
        out.version = true;
        break;
      case '-n':
      case '--count': {
        const v = value();
        if (!/^\d+$/.test(v) || Number(v) > MAX_COUNT) {
          throw new UsageError(`--count must be a whole number from 0 to ${MAX_COUNT}`);
        }
        out.count = Number(v);
        break;
      }
      case '-s':
      case '--seed': {
        const v = value();
        out.seed = /^-?\d{1,15}$/.test(v) ? Number(v) : v;
        break;
      }
      case '-f':
      case '--format':
        out.format = choice('format') as Format;
        break;
      case '--fields':
        out.fields = value()
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
        if (!out.fields.length) throw new UsageError('--fields needs at least one column name');
        break;
      case '--flat':
        out.flat = true;
        break;
      case '--gender':
        out.options.gender = choice('gender') as DatasetOptions['gender'];
        break;
      case '--operator':
        out.options.operator = choice('operator') as DatasetOptions['operator'];
        break;
      case '--provider':
        out.options.provider = choice('provider') as DatasetOptions['provider'];
        break;
      case '--division':
        out.options.division = value();
        break;
      case '--district':
        out.options.district = value();
        break;
      case '--reference-date': {
        const v = value();
        const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00+06:00` : v);
        if (Number.isNaN(d.getTime())) throw new UsageError(`--reference-date: invalid date "${v}"`);
        out.referenceDate = d;
        break;
      }
      default:
        if (arg.startsWith('-') && arg !== '-') throw new UsageError(`unknown option ${arg}`);
        if (out.dataset) throw new UsageError(`unexpected argument "${arg}"`);
        out.dataset = arg;
    }
  }
  return out;
}

function pick(row: Row, fields: readonly string[]): Row {
  const out: Row = {};
  for (const f of fields) out[f] = row[f] ?? null;
  return out;
}

/** Runs the CLI and returns the exit code (0 ok, 1 usage error). */
export function run(argv: readonly string[], io: CliIo): number {
  let parsed: Parsed;
  try {
    parsed = parseArgs(argv);
    if (parsed.help) {
      io.stdout(help());
      return 0;
    }
    if (parsed.version) {
      io.stdout(`${VERSION}\n`);
      return 0;
    }
    if (!parsed.dataset) throw new UsageError('missing dataset name');
    if (!DATASETS[parsed.dataset]) {
      throw new UsageError(
        `unknown dataset "${parsed.dataset}" (use one of: ${Object.keys(DATASETS).join(', ')})`,
      );
    }
  } catch (err) {
    if (!(err instanceof UsageError)) throw err;
    io.stderr(`faker-bd: ${err.message}\nRun "faker-bd --help" for usage.\n`);
    return 1;
  }

  const seed = parsed.seed ?? randomSeed();
  if (parsed.seed === undefined) io.stderr(`faker-bd: using seed ${seed}\n`);
  const faker = new Faker({ seed, ...(parsed.referenceDate ? { referenceDate: parsed.referenceDate } : {}) });
  const ds = DATASETS[parsed.dataset]!;

  let make: (i: number) => object;
  try {
    // Fail early on bad --division / --district values.
    const probe = new Faker({ seed: 0 });
    ds.make(probe, 0, parsed.options);
    make = (i) => ds.make(faker, i, parsed.options);
  } catch (err) {
    io.stderr(`faker-bd: ${err instanceof Error ? err.message : String(err)}\n`);
    return 1;
  }

  const { format, fields, count } = parsed;
  const flat = parsed.flat || format === 'csv' || fields !== undefined;
  let buffer = '';
  const write = (text: string) => {
    buffer += text;
    if (buffer.length > 65_536) {
      io.stdout(buffer);
      buffer = '';
    }
  };

  let columns: string[] | undefined = fields;
  if (format === 'json') write('[');
  for (let i = 0; i < count; i++) {
    const record = make(i);
    let row: object = flat ? flatten(record) : record;
    if (fields) row = pick(row as Row, fields);
    if (format === 'csv') {
      if (!columns) columns = Object.keys(row);
      if (i === 0) write(`${columns.map(csvField).join(',')}\r\n`);
      write(`${csvLine(row as Row, columns)}\r\n`);
    } else if (format === 'jsonl') {
      write(`${JSON.stringify(row)}\n`);
    } else {
      write(`${i ? ',' : ''}\n  ${JSON.stringify(row)}`);
    }
  }
  if (format === 'json') write(count ? '\n]\n' : ']\n');
  if (format === 'csv' && count === 0 && fields) write(`${fields.map(csvField).join(',')}\r\n`);
  if (buffer) io.stdout(buffer);
  return 0;
}
