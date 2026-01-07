'use client';

import { useFetch, useMutation } from './use-fetch';
import type { Investor } from '@/types';
import type { CreateInvestorInput, BulkImportInput } from '@/lib/api/validators';

export function useInvestors(search?: string) {
  const url = search 
    ? `/api/investors?search=${encodeURIComponent(search)}` 
    : '/api/investors';
  return useFetch<Investor[]>(url);
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
