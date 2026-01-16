import { parse } from 'csv-parse/sync';

export interface CsvParseOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  maxRows?: number;
}

export interface ParsedCsvRow {
  rowNumber: number;
  data: Record<string, string>;
}

export interface CsvParseResult {
  success: boolean;
  rows: ParsedCsvRow[];
  headers: string[];
  totalRows: number;
  errors: CsvParseError[];
}

export interface CsvParseError {
  row: number;
  message: string;
  code: string;
}

const defaultOptions: Required<CsvParseOptions> = {
  delimiter: ',',
  skipEmptyLines: true,
  trimValues: true,
  maxRows: 0,
};

export function parseCsv(
  content: string,
  options: CsvParseOptions = {}
): CsvParseResult {
  const opts = { ...defaultOptions, ...options };
  const errors: CsvParseError[] = [];

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      rows: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: 'Empty CSV content', code: 'IMPORT_INVALID_FORMAT' }],
    };
  }

  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: opts.skipEmptyLines,
      trim: opts.trimValues,
      delimiter: opts.delimiter,
      relaxColumnCount: true,
      skipRecordsWithError: true,
      onRecord: (record: Record<string, string>, context: { lines: number }) => {
        if (opts.maxRows > 0 && context.lines > opts.maxRows) {
          return null;
        }
        return record;
      },
    }) as Record<string, string>[];

    if (records.length === 0) {
      return {
        success: false,
        rows: [],
        headers: [],
        totalRows: 0,
        errors: [{ row: 0, message: 'No data rows found in CSV', code: 'IMPORT_INVALID_FORMAT' }],
      };
    }

    const firstRecord = records[0];
    if (!firstRecord) {
      return {
        success: false,
        rows: [],
        headers: [],
        totalRows: 0,
        errors: [{ row: 0, message: 'No data rows found in CSV', code: 'IMPORT_INVALID_FORMAT' }],
      };
    }

    const headers = Object.keys(firstRecord);

    const rows: ParsedCsvRow[] = records.map((record, index) => ({
      rowNumber: index + 2,
      data: record,
    }));

    return {
      success: true,
      rows,
      headers,
      totalRows: rows.length,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return {
      success: false,
      rows: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message, code: 'IMPORT_PARSE_ERROR' }],
    };
  }
}

export function findMatchingField(
  row: Record<string, string>,
  possibleNames: readonly string[]
): string | null {
  const keys = Object.keys(row);

  for (const possibleName of possibleNames) {
    const lowerPossible = possibleName.toLowerCase();
    const matchedKey = keys.find((key) => key.toLowerCase() === lowerPossible);
    if (matchedKey !== undefined) {
      const value = row[matchedKey];
      if (value !== undefined && value.trim() !== '') {
        return value.trim();
      }
    }
  }

  return null;
}

export function normalizeString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function validateEmail(email: string | null): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function extractLinkedinHandle(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
  return match?.[1] ?? null;
}
