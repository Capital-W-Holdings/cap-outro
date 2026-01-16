import {
  parseCsv,
  findMatchingField,
  normalizeString,
  validateEmail,
  type CsvParseResult,
  type ParsedCsvRow,
} from './csv-parser';

export type InvestorSource = 'openvc' | 'angellist' | 'manual';

export interface ParsedInvestorRow {
  sourceId: string;
  name: string;
  firm: string | null;
  email: string | null;
  linkedinUrl: string | null;
  investorType: string | null;
  rawMetadata: Record<string, string>;
  rowNumber: number;
}

export interface AdapterResult {
  success: boolean;
  investors: ParsedInvestorRow[];
  errors: AdapterError[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

export interface AdapterError {
  row: number;
  field: string | null;
  message: string;
  code: string;
}

// Field mappings for different CSV sources
const FIELD_MAPPINGS: Record<InvestorSource, {
  name: readonly string[];
  firm: readonly string[];
  email: readonly string[];
  linkedin: readonly string[];
  type: readonly string[];
}> = {
  openvc: {
    name: ['name', 'full_name', 'investor_name', 'person_name', 'contact_name'],
    firm: ['firm', 'company', 'organization', 'fund', 'fund_name', 'investor_firm'],
    email: ['email', 'email_address', 'contact_email', 'work_email'],
    linkedin: ['linkedin', 'linkedin_url', 'linkedin_profile', 'li_url'],
    type: ['type', 'investor_type', 'category'],
  },
  angellist: {
    name: ['name', 'full_name', 'investor_name', 'syndicate_lead'],
    firm: ['firm', 'fund', 'syndicate', 'organization', 'company'],
    email: ['email', 'contact_email', 'email_address'],
    linkedin: ['linkedin', 'linkedin_url', 'social_linkedin'],
    type: ['type', 'investor_type', 'role'],
  },
  manual: {
    name: ['name', 'full_name', 'investor_name'],
    firm: ['firm', 'company', 'organization'],
    email: ['email', 'email_address'],
    linkedin: ['linkedin', 'linkedin_url'],
    type: ['type', 'investor_type'],
  },
};

function generateSourceId(row: Record<string, string>, source: InvestorSource, rowNumber: number): string {
  const mappings = FIELD_MAPPINGS[source] || FIELD_MAPPINGS.openvc;
  const name = findMatchingField(row, mappings.name);
  const firm = findMatchingField(row, mappings.firm);
  const email = findMatchingField(row, mappings.email);

  const parts = [source, name ?? '', firm ?? '', email ?? '', rowNumber.toString()];
  return Buffer.from(parts.join('|')).toString('base64url');
}

function parseRow(
  row: ParsedCsvRow,
  source: InvestorSource
): { investor: ParsedInvestorRow | null; error: AdapterError | null } {
  const { data, rowNumber } = row;
  const mappings = FIELD_MAPPINGS[source] || FIELD_MAPPINGS.openvc;

  const name = normalizeString(findMatchingField(data, mappings.name));

  if (!name) {
    return {
      investor: null,
      error: {
        row: rowNumber,
        field: 'name',
        message: 'Missing required field: name',
        code: 'IMPORT_MISSING_REQUIRED_FIELD',
      },
    };
  }

  const firm = normalizeString(findMatchingField(data, mappings.firm));
  const emailRaw = normalizeString(findMatchingField(data, mappings.email));
  const email = emailRaw && validateEmail(emailRaw) ? emailRaw : null;
  const linkedinUrl = normalizeString(findMatchingField(data, mappings.linkedin));
  const investorType = normalizeString(findMatchingField(data, mappings.type));

  const investor: ParsedInvestorRow = {
    sourceId: generateSourceId(data, source, rowNumber),
    name,
    firm,
    email,
    linkedinUrl,
    investorType,
    rawMetadata: data,
    rowNumber,
  };

  return { investor, error: null };
}

export function adaptCsv(content: string, source: InvestorSource): AdapterResult {
  const parseResult: CsvParseResult = parseCsv(content);

  if (!parseResult.success) {
    return {
      success: false,
      investors: [],
      errors: parseResult.errors.map((e) => ({
        row: e.row,
        field: null,
        message: e.message,
        code: e.code,
      })),
      stats: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
      },
    };
  }

  const investors: ParsedInvestorRow[] = [];
  const errors: AdapterError[] = [];

  for (const row of parseResult.rows) {
    const { investor, error } = parseRow(row, source);

    if (error) {
      errors.push(error);
    } else if (investor) {
      investors.push(investor);
    }
  }

  return {
    success: errors.length === 0 || investors.length > 0,
    investors,
    errors,
    stats: {
      totalRows: parseResult.totalRows,
      validRows: investors.length,
      invalidRows: errors.length,
    },
  };
}

// Export specific adapters for convenience
export const adaptOpenVcCsv = (content: string) => adaptCsv(content, 'openvc');
export const adaptAngelListCsv = (content: string) => adaptCsv(content, 'angellist');
