import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdatePipeline } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { PipelineEntry } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pipeline/[id] - Get a single pipeline entry
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('pipeline')
      .select(`
        *,
        investor:investors(id, name, firm, email, title)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Pipeline entry');
    }

    const entry: PipelineEntry = {
      id: data.id,
      campaign_id: data.campaign_id,
      investor_id: data.investor_id,
      stage: data.stage,
      amount_soft: data.amount_soft,
      amount_committed: data.amount_committed,
      notes: data.notes,
      last_activity_at: data.last_activity_at,
      created_at: data.created_at,
      investor: data.investor,
    };

    return successResponse(entry);
  });
}

// PATCH /api/pipeline/[id] - Update pipeline entry (move stage, update amounts)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdatePipeline);
    const supabase = createServiceClient();

    // Build update object
    const updateData: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
    };

    if (body.stage !== undefined) updateData.stage = body.stage;
    if (body.amount_soft !== undefined) updateData.amount_soft = body.amount_soft;
    if (body.amount_committed !== undefined) updateData.amount_committed = body.amount_committed;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabase
      .from('pipeline')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Pipeline entry');
      }
      console.error('Supabase error updating pipeline:', error);
      throw new Error('Failed to update pipeline entry');
    }

    const entry: PipelineEntry = {
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

    return successResponse(entry);
  });
}

// DELETE /api/pipeline/[id] - Remove from pipeline
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // First check if entry exists
    const { data: existing } = await supabase
      .from('pipeline')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Pipeline entry');
    }

    const { error } = await supabase
      .from('pipeline')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting pipeline entry:', error);
      throw new Error('Failed to remove from pipeline');
    }

    return successResponse({ deleted: true });
  });
}
