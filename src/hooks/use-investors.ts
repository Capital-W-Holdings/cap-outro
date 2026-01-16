'use client';

import { useFetch, useMutation } from './use-fetch';
import type { Investor } from '@/types';
import type { CreateInvestorInput, BulkImportInput } from '@/lib/api/validators';

// Filter options for investor search
export type ContactMethod = 'email' | 'linkedin' | 'both';

export interface InvestorFilters {
  search?: string;
  stages?: string[];
  sectors?: string[];
  check_size_min?: number;
  check_size_max?: number;
  fit_score_min?: number;
  fit_score_max?: number;
  contact_method?: ContactMethod;
  sort_by?: 'name' | 'firm' | 'fit_score' | 'created_at' | 'check_size_max';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

function buildInvestorQueryString(filters: InvestorFilters): string {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.stages && filters.stages.length > 0) {
    params.set('stages', filters.stages.join(','));
  }
  if (filters.sectors && filters.sectors.length > 0) {
    params.set('sectors', filters.sectors.join(','));
  }
  if (filters.check_size_min !== undefined) {
    params.set('check_size_min', String(filters.check_size_min));
  }
  if (filters.check_size_max !== undefined) {
    params.set('check_size_max', String(filters.check_size_max));
  }
  if (filters.fit_score_min !== undefined) {
    params.set('fit_score_min', String(filters.fit_score_min));
  }
  if (filters.fit_score_max !== undefined) {
    params.set('fit_score_max', String(filters.fit_score_max));
  }
  if (filters.contact_method) {
    params.set('contact_method', filters.contact_method);
  }
  if (filters.sort_by) {
    params.set('sort_by', filters.sort_by);
  }
  if (filters.sort_order) {
    params.set('sort_order', filters.sort_order);
  }
  if (filters.page) {
    params.set('page', String(filters.page));
  }
  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function useInvestors(filters: InvestorFilters = {}) {
  const url = `/api/investors${buildInvestorQueryString(filters)}`;
  return useFetch<Investor[]>(url);
}

// Legacy compatibility - simple search
export function useInvestorsSearch(search?: string) {
  return useInvestors({ search });
}

export function useInvestor(id: string) {
  return useFetch<Investor>(`/api/investors/${id}`);
}

export function useCreateInvestor() {
  return useMutation<Investor, CreateInvestorInput>('/api/investors', 'POST');
}

export function useBulkImportInvestors() {
  return useMutation<{ imported: number; errors: number }, BulkImportInput>(
    '/api/investors/bulk',
    'POST'
  );
}

export function useDeleteInvestor(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/investors/${id}`, 'DELETE');
}

export function useUpdateInvestor(id: string) {
  return useMutation<Investor, Partial<CreateInvestorInput>>(
    `/api/investors/${id}`,
    'PATCH'
  );
}

// Enrichment hooks
export interface EnrichmentSearchInput {
  query: string;
  sources?: ('openbook' | 'sec_13f' | 'openvc')[];
  limit?: number;
}

export interface EnrichedInvestor {
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
  source: string;
  source_url: string | null;
}

export interface EnrichmentSearchResult {
  query: string;
  sources: string[];
  count: number;
  investors: EnrichedInvestor[];
}

export function useSearchPublicInvestors() {
  return useMutation<EnrichmentSearchResult, EnrichmentSearchInput>(
    '/api/investors/enrich',
    'POST'
  );
}

export interface ImportEnrichedInput {
  investors: EnrichedInvestor[];
}

export function useImportEnrichedInvestors() {
  return useMutation<{ imported: number; investors: Investor[] }, ImportEnrichedInput>(
    '/api/investors/enrich',
    'PUT'
  );
}

// Common filter options
export const STAGE_OPTIONS = [
  { value: 'Pre-Seed', label: 'Pre-Seed' },
  { value: 'Seed', label: 'Seed' },
  { value: 'Series A', label: 'Series A' },
  { value: 'Series B', label: 'Series B' },
  { value: 'Series C', label: 'Series C+' },
  { value: 'Growth', label: 'Growth' },
];

export const SECTOR_OPTIONS = [
  { value: 'Technology', label: 'Technology' },
  { value: 'AI', label: 'AI/ML' },
  { value: 'Fintech', label: 'Fintech' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'SaaS', label: 'SaaS' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Consumer', label: 'Consumer' },
  { value: 'Climate', label: 'Climate' },
  { value: 'Crypto', label: 'Crypto/Web3' },
  { value: 'Biotech', label: 'Biotech' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Deep Tech', label: 'Deep Tech' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
];

export const CHECK_SIZE_OPTIONS = [
  { value: '100000', label: '$100K' },
  { value: '250000', label: '$250K' },
  { value: '500000', label: '$500K' },
  { value: '1000000', label: '$1M' },
  { value: '2500000', label: '$2.5M' },
  { value: '5000000', label: '$5M' },
  { value: '10000000', label: '$10M' },
  { value: '25000000', label: '$25M+' },
];

export const CONTACT_METHOD_OPTIONS: { value: ContactMethod; label: string }[] = [
  { value: 'email', label: 'Email Only' },
  { value: 'linkedin', label: 'LinkedIn Only' },
  { value: 'both', label: 'Both' },
];
