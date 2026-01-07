'use client';

import { useFetch, useMutation } from './use-fetch';
import type { Sequence, SequenceStep, SequenceStatus } from '@/types';

interface SequenceWithSteps extends Sequence {
  steps: SequenceStep[];
}

export function useSequences(campaignId?: string) {
  const url = campaignId 
    ? `/api/sequences?campaign_id=${campaignId}` 
    : '/api/sequences';
  return useFetch<Sequence[]>(url);
}

export function useSequence(id: string) {
  return useFetch<SequenceWithSteps>(`/api/sequences/${id}`);
}

export function useCreateSequence() {
  return useMutation<Sequence, { campaign_id: string; name: string }>(
    '/api/sequences',
    'POST'
  );
}

export function useUpdateSequence(id: string) {
  return useMutation<Sequence, { name?: string; status?: SequenceStatus }>(
    `/api/sequences/${id}`,
    'PATCH'
  );
}

export function useDeleteSequence(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/sequences/${id}`, 'DELETE');
}

export function useAddSequenceStep(sequenceId: string) {
  return useMutation<SequenceStep, {
    order: number;
    type: 'email' | 'linkedin' | 'task' | 'wait';
    delay_days?: number;
    template_id?: string;
    content?: string;
    subject?: string;
  }>(`/api/sequences/${sequenceId}`, 'POST');
}
