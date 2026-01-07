'use client';

import { useFetch, useMutation } from './use-fetch';
import type { PipelineEntry, PipelineStage } from '@/types';
import type { UpdatePipelineInput } from '@/lib/api/validators';

interface PipelineData {
  entries: PipelineEntry[];
  by_stage: Record<PipelineStage, PipelineEntry[]>;
  stats: {
    total: number;
    by_stage: Record<PipelineStage, number>;
    total_soft: number;
    total_committed: number;
  };
}

export function usePipeline(campaignId?: string) {
  const url = campaignId 
    ? `/api/pipeline?campaign_id=${campaignId}` 
    : '/api/pipeline';
  return useFetch<PipelineData>(url);
}

export function useUpdatePipelineEntry(id: string) {
  return useMutation<PipelineEntry, UpdatePipelineInput>(
    `/api/pipeline/${id}`,
    'PATCH'
  );
}

export function useAddToPipeline() {
  return useMutation<PipelineEntry, { campaign_id: string; investor_id: string; stage?: PipelineStage }>(
    '/api/pipeline',
    'POST'
  );
}

export function useRemoveFromPipeline(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/pipeline/${id}`, 'DELETE');
}
