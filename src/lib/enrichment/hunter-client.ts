const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

export interface HunterEmailVerifyResponse {
  data: {
    email: string;
    status: string;
    result: string;
    score: number;
    regexp: boolean;
    gibberish: boolean;
    disposable: boolean;
    webmail: boolean;
    mx_records: boolean;
    smtp_server: boolean;
    smtp_check: boolean;
    accept_all: boolean;
    block: boolean;
    sources: unknown[];
  };
  meta: {
    params: { email: string };
  };
}

export interface HunterEmailFinderResponse {
  data: {
    email: string | null;
    first_name: string;
    last_name: string;
    score: number;
    domain: string;
    accept_all: boolean;
    position: string | null;
    company: string | null;
    sources: unknown[];
  };
  meta: {
    params: Record<string, string>;
  };
}

export interface HunterDomainSearchResponse {
  data: {
    domain: string;
    organization: string;
    emails: unknown[];
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
  };
}

export class HunterClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, baseUrl?: string, timeoutMs?: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ?? HUNTER_BASE_URL;
    this.timeoutMs = timeoutMs ?? 30000;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hunter API error: ${response.status} - ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Hunter API request timeout');
      }
      throw error;
    }
  }

  async verifyEmail(email: string): Promise<HunterEmailVerifyResponse> {
    return this.makeRequest<HunterEmailVerifyResponse>('/email-verifier', { email });
  }

  async findEmail(params: {
    domain: string;
    first_name: string;
    last_name: string;
  }): Promise<HunterEmailFinderResponse> {
    return this.makeRequest<HunterEmailFinderResponse>('/email-finder', {
      domain: params.domain,
      first_name: params.first_name,
      last_name: params.last_name,
    });
  }

  async searchDomain(
    domain: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<HunterDomainSearchResponse> {
    return this.makeRequest<HunterDomainSearchResponse>('/domain-search', {
      domain,
      limit: String(options.limit ?? 10),
      offset: String(options.offset ?? 0),
    });
  }
}

// Mock client for development/testing
export class MockHunterClient extends HunterClient {
  constructor() {
    super('mock-api-key');
  }

  async verifyEmail(email: string): Promise<HunterEmailVerifyResponse> {
    const isValid = email.includes('@') && !email.includes('fake') && !email.includes('test');

    return {
      data: {
        email,
        status: isValid ? 'valid' : 'invalid',
        result: isValid ? 'deliverable' : 'undeliverable',
        score: isValid ? 85 : 20,
        regexp: true,
        gibberish: false,
        disposable: email.includes('tempmail'),
        webmail: email.includes('gmail') || email.includes('yahoo'),
        mx_records: true,
        smtp_server: true,
        smtp_check: isValid,
        accept_all: false,
        block: false,
        sources: [],
      },
      meta: {
        params: { email },
      },
    };
  }

  async findEmail(params: {
    domain: string;
    first_name: string;
    last_name: string;
  }): Promise<HunterEmailFinderResponse> {
    const email = `${params.first_name.toLowerCase()}.${params.last_name.toLowerCase()}@${params.domain}`;

    return {
      data: {
        email,
        first_name: params.first_name,
        last_name: params.last_name,
        score: 75,
        domain: params.domain,
        accept_all: false,
        position: null,
        company: null,
        sources: [],
      },
      meta: {
        params,
      },
    };
  }

  async searchDomain(
    domain: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<HunterDomainSearchResponse> {
    return {
      data: {
        domain,
        organization: domain.split('.')[0] ?? domain,
        emails: [],
      },
      meta: {
        results: 0,
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
      },
    };
  }
}

export function getHunterClient(): HunterClient {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    console.warn('Hunter API key not configured - using mock client');
    return new MockHunterClient();
  }
  return new HunterClient(apiKey);
}
