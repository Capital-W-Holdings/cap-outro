// Investor Data Enrichment Service
// Integrates with public investor databases for data enrichment

export interface EnrichedInvestorData {
  name: string;
  email: string | null;
  firm: string | null;
  title: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website: string | null;
  check_size_min: number | null;
  check_size_max: number | null;
  stages: string[];
  sectors: string[];
  location: string | null;
  bio: string | null;
  source: 'openbook' | 'sec_13f' | 'openvc' | 'manual';
  source_url: string | null;
}

export interface InvestorFirm {
  name: string;
  website: string | null;
  description: string | null;
  location: string | null;
  aum: number | null;
  team_members: EnrichedInvestorData[];
}

// OpenBook Dolt Database Integration
// Data hosted at: https://www.dolthub.com/repositories/iloveitaly/venture_capital_firms
const OPENBOOK_API_BASE = 'https://www.dolthub.com/api/v1alpha1/iloveitaly/venture_capital_firms';

export async function queryOpenBookFirms(
  search?: string,
  limit = 100
): Promise<InvestorFirm[]> {
  try {
    // Build SQL query
    let query = 'SELECT * FROM firms';
    if (search) {
      query += ` WHERE name ILIKE '%${search}%' OR description ILIKE '%${search}%'`;
    }
    query += ` LIMIT ${limit}`;

    const response = await fetch(
      `${OPENBOOK_API_BASE}/main?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('OpenBook API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return parseOpenBookFirmsResponse(data);
  } catch (error) {
    console.error('Failed to query OpenBook:', error);
    return [];
  }
}

function parseOpenBookFirmsResponse(data: unknown): InvestorFirm[] {
  if (!data || typeof data !== 'object') return [];

  const rows = (data as { rows?: unknown[] }).rows ?? [];

  return rows.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const teamMembers = parseTeamMembers(r.team);

    return {
      name: String(r.name ?? ''),
      website: r.website ? String(r.website) : null,
      description: r.description ? String(r.description) : null,
      location: r.location ? String(r.location) : null,
      aum: r.aum ? Number(r.aum) : null,
      team_members: teamMembers,
    };
  });
}

function parseTeamMembers(team: unknown): EnrichedInvestorData[] {
  if (!team || !Array.isArray(team)) return [];

  return team.map((member: unknown) => {
    const m = member as Record<string, unknown>;
    return {
      name: String(m.name ?? ''),
      email: m.email ? String(m.email) : null,
      firm: null, // Will be set by caller
      title: m.role ? String(m.role) : null,
      linkedin_url: m.linkedin ? String(m.linkedin) : null,
      twitter_url: m.twitter ? String(m.twitter) : null,
      website: null,
      check_size_min: null,
      check_size_max: null,
      stages: [],
      sectors: [],
      location: null,
      bio: null,
      source: 'openbook' as const,
      source_url: 'https://www.dolthub.com/repositories/iloveitaly/venture_capital_firms',
    };
  });
}

// SEC EDGAR 13F Integration for institutional investors
// Free official data from SEC.gov
const SEC_EDGAR_BASE = 'https://data.sec.gov';

export interface SEC13FHolding {
  cik: string;
  name: string;
  filingDate: string;
  holdings: Array<{
    issuer: string;
    cusip: string;
    value: number;
    shares: number;
  }>;
}

export async function searchSEC13FManagers(
  search: string,
  limit = 50
): Promise<Array<{ cik: string; name: string; filings_count: number }>> {
  try {
    // SEC full-text search endpoint
    const response = await fetch(
      `${SEC_EDGAR_BASE}/cgi-bin/browse-edgar?action=getcompany&type=13F&company=${encodeURIComponent(search)}&output=atom`,
      {
        headers: {
          'User-Agent': 'Cap-Outro contact@example.com', // SEC requires user-agent
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('SEC EDGAR API error:', response.statusText);
      return [];
    }

    // Parse Atom feed response (SEC returns XML/Atom for this endpoint)
    const text = await response.text();
    return parseSECSearchResults(text).slice(0, limit);
  } catch (error) {
    console.error('Failed to search SEC 13F managers:', error);
    return [];
  }
}

function parseSECSearchResults(
  atomXml: string
): Array<{ cik: string; name: string; filings_count: number }> {
  // Basic XML parsing for SEC Atom feed
  const results: Array<{ cik: string; name: string; filings_count: number }> = [];

  // Extract entries using regex (lightweight parsing)
  const entryMatches = Array.from(atomXml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));

  for (const match of entryMatches) {
    const entry = match[1];
    if (!entry) continue;

    const cikMatch = entry.match(/<cik>(\d+)<\/cik>/);
    const nameMatch = entry.match(/<conformed-name>([^<]+)<\/conformed-name>/);

    if (cikMatch?.[1] && nameMatch?.[1]) {
      results.push({
        cik: cikMatch[1],
        name: nameMatch[1],
        filings_count: 0, // Would need additional API call to get count
      });
    }
  }

  return results;
}

// OpenVC CSV Parser
// OpenVC allows exporting investor data as CSV
export function parseOpenVCCSV(csvContent: string): EnrichedInvestorData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0]?.toLowerCase().split(',').map(h => h.trim()) ?? [];
  const investors: EnrichedInvestorData[] = [];

  // Map common OpenVC column names
  const columnMap: Record<string, string> = {
    'investor name': 'name',
    'name': 'name',
    'fund name': 'firm',
    'firm': 'firm',
    'email': 'email',
    'contact email': 'email',
    'linkedin': 'linkedin_url',
    'linkedin url': 'linkedin_url',
    'website': 'website',
    'check size min': 'check_size_min',
    'check size max': 'check_size_max',
    'min check': 'check_size_min',
    'max check': 'check_size_max',
    'stages': 'stages',
    'investment stage': 'stages',
    'sectors': 'sectors',
    'focus areas': 'sectors',
    'location': 'location',
    'city': 'location',
  };

  // Build index map
  const indexMap: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const normalizedKey = columnMap[header] ?? header.replace(/\s+/g, '_');
    indexMap[normalizedKey] = idx;
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Handle CSV with quoted fields
    const values = parseCSVLine(line);

    const getValue = (key: string): string | null => {
      const idx = indexMap[key];
      if (idx === undefined) return null;
      const val = values[idx]?.trim();
      return val && val !== '' ? val : null;
    };

    const name = getValue('name');
    if (!name) continue;

    const parseNumber = (val: string | null): number | null => {
      if (!val) return null;
      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? null : num;
    };

    const parseArray = (val: string | null): string[] => {
      if (!val) return [];
      return val.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    };

    investors.push({
      name,
      email: getValue('email'),
      firm: getValue('firm'),
      title: getValue('title'),
      linkedin_url: getValue('linkedin_url'),
      twitter_url: getValue('twitter_url'),
      website: getValue('website'),
      check_size_min: parseNumber(getValue('check_size_min')),
      check_size_max: parseNumber(getValue('check_size_max')),
      stages: parseArray(getValue('stages')),
      sectors: parseArray(getValue('sectors')),
      location: getValue('location'),
      bio: getValue('bio'),
      source: 'openvc',
      source_url: 'https://www.openvc.app',
    });
  }

  return investors;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.replace(/^"|"$/g, ''));
  return values;
}

// FindFunding.vc Airtable Integration
// This service uses Airtable - would need API key for full access
const FINDFUNDING_AIRTABLE_BASE = 'appXXXXXXX'; // Public base ID if available

export async function fetchFindFundingInvestors(): Promise<EnrichedInvestorData[]> {
  // Note: Airtable API requires authentication
  // For public data, we'd need to check if they expose a public API
  // Alternative: They may have a public CSV export
  console.log('FindFunding.vc integration requires Airtable API configuration');
  return [];
}

// Unified search across all sources
export async function searchInvestors(
  query: string,
  sources: ('openbook' | 'sec_13f' | 'openvc')[] = ['openbook'],
  limit = 50
): Promise<EnrichedInvestorData[]> {
  const results: EnrichedInvestorData[] = [];

  const promises: Promise<void>[] = [];

  if (sources.includes('openbook')) {
    promises.push(
      queryOpenBookFirms(query, limit).then(firms => {
        firms.forEach(firm => {
          firm.team_members.forEach(member => {
            results.push({
              ...member,
              firm: firm.name,
              location: member.location ?? firm.location,
            });
          });
        });
      })
    );
  }

  if (sources.includes('sec_13f')) {
    promises.push(
      searchSEC13FManagers(query, limit).then(managers => {
        managers.forEach(manager => {
          results.push({
            name: manager.name,
            email: null,
            firm: manager.name,
            title: 'Investment Manager',
            linkedin_url: null,
            twitter_url: null,
            website: null,
            check_size_min: null,
            check_size_max: null,
            stages: [],
            sectors: [],
            location: null,
            bio: null,
            source: 'sec_13f',
            source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${manager.cik}`,
          });
        });
      })
    );
  }

  await Promise.all(promises);

  return results.slice(0, limit);
}

// LinkedIn profile URL validator/normalizer
export function normalizeLinkedInUrl(url: string | null): string | null {
  if (!url) return null;

  // Handle various LinkedIn URL formats
  const patterns = [
    /linkedin\.com\/in\/([^/?#]+)/i,
    /linkedin\.com\/pub\/([^/?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.linkedin.com/in/${match[1]}`;
    }
  }

  // If URL looks like a LinkedIn URL, return as-is
  if (url.includes('linkedin.com')) {
    return url.startsWith('http') ? url : `https://${url}`;
  }

  return null;
}

// Email validation
export function isValidEmail(email: string | null): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
