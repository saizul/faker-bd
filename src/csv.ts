export type Row = Record<string, string | number | boolean | null>;

/**
 * Flattens nested objects into one level with dotted keys:
 * `{ name: { en: 'A', bn: 'অ' } }` → `{ 'name.en': 'A', 'name.bn': 'অ' }`.
 */
export function flatten(value: object, prefix = '', out: Row = {}): Row {
  for (const [key, v] of Object.entries(value)) {
    const k = prefix ? `${prefix}.${key}` : key;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      flatten(v as object, k, out);
    } else if (Array.isArray(v)) {
      out[k] = v.join('|');
    } else if (v instanceof Date) {
      out[k] = v.toISOString();
    } else {
      out[k] = v === undefined ? null : (v as Row[string]);
    }
  }
  return out;
}

/** Quotes a CSV field when needed (RFC 4180). */
export function csvField(value: Row[string]): string {
  if (value === null) return '';
  const s = String(value);
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

/** One CSV line (without the line break) for the given columns. */
export function csvLine(row: Row, columns: readonly string[]): string {
  return columns.map((c) => csvField(row[c] ?? null)).join(',');
}

/** A complete CSV document with a header row and CRLF line breaks. */
export function toCsv(rows: readonly Row[], columns: readonly string[] = Object.keys(rows[0] ?? {})): string {
  if (columns.length === 0) return '';
  return `${[columns.map(csvField).join(','), ...rows.map((r) => csvLine(r, columns))].join('\r\n')}\r\n`;
}
