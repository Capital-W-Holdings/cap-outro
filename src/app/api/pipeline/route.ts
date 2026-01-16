import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  AppError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import type { PipelineEntry, PipelineStage } from '@/types';

// GET /api/pipeline - Get pipeline for a campaign
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');

    let query = supabase
      .from('pipeline')
      .select('*')
      .order('last_activity_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    const filtered = (data ?? []) as PipelineEntry[];

    // Group by stage for Kanban view
    const stages: PipelineStage[] = [
      'not_contacted',
      'contacted',
      'responded',
      'meeting_scheduled',
      'meeting_held',
      'dd',
      'term_sheet',
      'committed',
      'passed',
    ];

    const byStage: Record<PipelineStage, PipelineEntry[]> = {} as Record<PipelineStage, PipelineEntry[]>;
    stages.forEach(stage => {
      byStage[stage] = filtered.filter(p => p.stage === stage);
    });

    // Calculate stats
    const stats = {
      total: filtered.length,
      by_stage: Object.fromEntries(
        stages.map(stage => [stage, byStage[stage].length])
      ) as Record<PipelineStage, number>,
      total_soft: filtered.reduce((sum, p) => sum + (p.amount_soft ?? 0), 0),
      total_committed: filtered.reduce((sum, p) => sum + (p.amount_committed ?? 0), 0),
    };

    return successResponse({
      entries: filtered,
      by_stage: byStage,
      stats,
    });
  });
}

// POST /api/pipeline - Add investor to pipeline
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const body = await request.json() as {
      campaign_id: string;
      investor_id: string;
      stage?: PipelineStage;
    };

    const { data, error } = await supabase
      .from('pipeline')
      .insert({
        campaign_id: body.campaign_id,
        investor_id: body.investor_id,
        stage: body.stage ?? 'not_contacted',
        amount_soft: null,
        amount_committed: null,
        notes: null,
      })
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data);
  });
}
