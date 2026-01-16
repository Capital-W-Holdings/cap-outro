'use client';

import { useFetch, useMutation } from './use-fetch';
import type { Outreach, OutreachType, OutreachStatus } from '@/types';

interface OutreachFilters {
  campaign_id?: string;
  investor_id?: string;
  status?: OutreachStatus;
}

export function useOutreach(filters?: OutreachFilters) {
  const params = new URLSearchParams();
  if (filters?.campaign_id) params.set('campaign_id', filters.campaign_id);
  if (filters?.investor_id) params.set('investor_id', filters.investor_id);
  if (filters?.status) params.set('status', filters.status);
  
  const queryString = params.toString();
  const url = queryString ? `/api/outreach?${queryString}` : '/api/outreach';
  
  return useFetch<Outreach[]>(url);
}

export function useOutreachItem(id: string) {
  return useFetch<Outreach>(`/api/outreach/${id}`);
}

export function useCreateOutreach() {
  return useMutation<Outreach, {
    campaign_id: string;
    investor_id: string;
    sequence_id?: string;
    step_id?: string;
    type: OutreachType;
    content: string;
    subject?: string;
    scheduled_at?: string;
    send_now?: boolean;
    email_account_id?: string;
  }>('/api/outreach', 'POST');
}

export function useUpdateOutreach(id: string) {
  return useMutation<Outreach, {
    status?: OutreachStatus;
    content?: string;
    subject?: string;
    scheduled_at?: string;
  }>(`/api/outreach/${id}`, 'PATCH');
}

export function useSendOutreach(id: string) {
  return useMutation<Outreach>(`/api/outreach/${id}`, 'POST');
}

export function useDeleteOutreach(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/outreach/${id}`, 'DELETE');
}
