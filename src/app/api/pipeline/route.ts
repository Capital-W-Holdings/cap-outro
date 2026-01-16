import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  ValidationError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import type { PipelineEntry, PipelineStage } from '@/types';

const ALL_STAGES: PipelineStage[] = [
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

// GET /api/pipeline - Get pipeline for a campaign
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');

    const supabase = createServiceClient();

    // Note: pipeline table doesn't have org_id directly, filter through campaign
    // For MVP, we fetch all entries and filter by campaign_id param
    let query = supabase
      .from('pipeline')
      .select(`
        *,
        investor:investors(id, name, firm, email, title)
      `)
      .order('last_activity_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching pipeline:', error);
      throw new Error('Failed to fetch pipeline');
    }

    // Map to PipelineEntry type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: PipelineEntry[] = (data ?? []).map((row: any) => ({
      id: row.id,
      campaign_id: row.campaign_id,
      investor_id: row.investor_id,
      stage: row.stage,
      amount_soft: row.amount_soft,
      amount_committed: row.amount_committed,
      notes: row.notes,
      last_activity_at: row.last_activity_at,
      created_at: row.created_at,
      // Include investor data if available
      investor: row.investor,
    }));

    // Group by stage for Kanban view
    const byStage: Record<PipelineStage, PipelineEntry[]> = {} as Record<PipelineStage, PipelineEntry[]>;
    ALL_STAGES.forEach((stage) => {
      byStage[stage] = entries.filter((p) => p.stage === stage);
    });

    // Calculate stats
    const stats = {
      total: entries.length,
      by_stage: Object.fromEntries(
        ALL_STAGES.map((stage) => [stage, byStage[stage].length])
      ) as Record<PipelineStage, number>,
      total_soft: entries.reduce((sum, p) => sum + (p.amount_soft ?? 0), 0),
      total_committed: entries.reduce((sum, p) => sum + (p.amount_committed ?? 0), 0),
    };

    return successResponse({
      entries,
      by_stage: byStage,
      stats,
    });
  });
}

// POST /api/pipeline - Add investor to pipeline
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json() as {
      campaign_id: string;
      investor_id: string;
      stage?: PipelineStage;
    };

    if (!body.campaign_id || !body.investor_id) {
      throw new ValidationError('campaign_id and investor_id are required');
    }

    const supabase = createServiceClient();

    // Check if entry already exists
    const { data: existing } = await supabase
      .from('pipeline')
      .select('id')
      .eq('campaign_id', body.campaign_id)
      .eq('investor_id', body.investor_id)
      .single();

    if (existing) {
      throw new ValidationError('Investor is already in this campaign pipeline');
    }

    const { data, error } = await supabase
      .from('pipeline')
      .insert({
        campaign_id: body.campaign_id,
        investor_id: body.investor_id,
        stage: body.stage ?? 'not_contacted',
        amount_soft: null,
        amount_committed: null,
        notes: null,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating pipeline entry:', error);
      throw new Error('Failed to add investor to pipeline');
    }

    const newEntry: PipelineEntry = {
      id: data.id,
      campaign_id: data.campaign_id,
      investor_id: data.investor_id,
      stage: data.stage,
      amount_soft: data.amount_soft,
      amount_committed: data.amount_committed,
      notes: data.notes,
      last_activity_at: data.last_activity_at,
      created_at: data.created_at,
    };

    return successResponse(newEntry);
  });
}
