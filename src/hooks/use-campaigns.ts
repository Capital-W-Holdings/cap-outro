'use client';

import { useFetch, useMutation } from './use-fetch';
import type { Campaign } from '@/types';
import type { CreateCampaignInput, UpdateCampaignInput } from '@/lib/api/validators';

export interface CampaignStats {
  total_investors: number;
  contacted: number;
  responded: number;
  meetings: number;
  committed: number;
  passed: number;
  response_rate: number;
  meeting_rate: number;
  committed_amount: number;
  soft_amount: number;
  target_amount: number;
  percent_committed: number;
  outreach_sent: number;
  outreach_opened: number;
  outreach_clicked: number;
  open_rate: number;
  click_rate: number;
}

export function useCampaigns() {
  return useFetch<Campaign[]>('/api/campaigns');
}

export function useCampaign(id: string) {
  return useFetch<Campaign>(`/api/campaigns/${id}`);
}

export function useCampaignStats(id: string) {
  return useFetch<CampaignStats>(`/api/campaigns/${id}/stats`);
}

export function useCreateCampaign() {
  return useMutation<Campaign, CreateCampaignInput>('/api/campaigns', 'POST');
}

export function useUpdateCampaign(id: string) {
  return useMutation<Campaign, UpdateCampaignInput>(`/api/campaigns/${id}`, 'PATCH');
}

export function useDeleteCampaign(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/campaigns/${id}`, 'DELETE');
}
