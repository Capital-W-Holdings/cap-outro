const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

export interface ApolloPersonSearchRequest {
  person_titles?: string[];
  q_organization_name?: string;
  person_name?: string;
}

export interface ApolloSearchResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

export interface ApolloPerson {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  title: string | null;
  headline: string | null;
  email: string | null;
  email_status: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  facebook_url: string | null;
  photo_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  organization: ApolloOrganization | null;
  employment_history: unknown[];
  phone_numbers: unknown[];
  seniority: string | null;
  departments: string[];
}

export interface ApolloOrganization {
  id: string;
  name: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  primary_domain: string | null;
  logo_url: string | null;
  industry: string | null;
  estimated_num_employees: number | null;
  founded_year: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface ApolloEnrichResponse {
  person: ApolloPerson | null;
}

export class ApolloClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, baseUrl?: string, timeoutMs?: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ?? APOLLO_BASE_URL;
    this.timeoutMs = timeoutMs ?? 30000;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': this.apiKey,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Apollo API request timeout');
      }
      throw error;
    }
  }

  async searchPerson(request: ApolloPersonSearchRequest): Promise<ApolloSearchResponse> {
    return this.makeRequest<ApolloSearchResponse>('/people/search', 'POST', {
      ...request,
      page: 1,
      per_page: 10,
    });
  }

  async enrichPerson(params: {
    email?: string;
    linkedin_url?: string;
    first_name?: string;
    last_name?: string;
    organization_name?: string;
  }): Promise<ApolloEnrichResponse> {
    return this.makeRequest<ApolloEnrichResponse>('/people/match', 'POST', params);
  }
}

// Mock client for development/testing
export class MockApolloClient extends ApolloClient {
  constructor() {
    super('mock-api-key');
  }

  async searchPerson(_request: ApolloPersonSearchRequest): Promise<ApolloSearchResponse> {
    return {
      people: [],
      pagination: {
        page: 1,
        per_page: 10,
        total_entries: 0,
        total_pages: 0,
      },
    };
  }

  async enrichPerson(params: {
    email?: string;
    linkedin_url?: string;
  }): Promise<ApolloEnrichResponse> {
    const mockPerson: ApolloPerson = {
      id: `mock-${Date.now()}`,
      first_name: 'Mock',
      last_name: 'Person',
      name: 'Mock Person',
      title: 'Partner',
      headline: 'Investment Partner at Mock Ventures',
      email: params.email ?? null,
      email_status: params.email ? 'verified' : null,
      linkedin_url: params.linkedin_url ?? null,
      twitter_url: null,
      github_url: null,
      facebook_url: null,
      photo_url: null,
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      organization: {
        id: 'mock-org',
        name: 'Mock Ventures',
        website_url: 'https://mockventures.com',
        linkedin_url: null,
        twitter_url: null,
        primary_domain: 'mockventures.com',
        logo_url: null,
        industry: 'Venture Capital',
        estimated_num_employees: 50,
        founded_year: 2015,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
      },
      employment_history: [],
      phone_numbers: [],
      seniority: 'executive',
      departments: ['executive'],
    };

    return {
      person: params.email || params.linkedin_url ? mockPerson : null,
    };
  }
}

export function getApolloClient(): ApolloClient {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    console.warn('Apollo API key not configured - using mock client');
    return new MockApolloClient();
  }
  return new ApolloClient(apiKey);
}
