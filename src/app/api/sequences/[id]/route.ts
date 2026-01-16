import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdateSequence, validateCreateSequenceStep } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Sequence, SequenceStep } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sequences/[id] - Get sequence with steps
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // Get sequence
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (seqError || !sequence) {
      throw new NotFoundError('Sequence');
    }

    // Get steps for this sequence
    const { data: steps, error: stepsError } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', id)
      .order('order', { ascending: true });

    if (stepsError) {
      console.error('Supabase error fetching sequence steps:', stepsError);
      throw new Error('Failed to fetch sequence steps');
    }

    const sequenceWithSteps: Sequence & { steps: SequenceStep[] } = {
      id: sequence.id,
      campaign_id: sequence.campaign_id,
      name: sequence.name,
      status: sequence.status,
      created_at: sequence.created_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: (steps ?? []).map((step: any) => ({
        id: step.id,
        sequence_id: step.sequence_id,
        order: step.order,
        type: step.type,
        delay_days: step.delay_days,
        template_id: step.template_id,
        content: step.content,
        subject: step.subject,
      })),
    };

    return successResponse(sequenceWithSteps);
  });
}

// PATCH /api/sequences/[id] - Update sequence
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateSequence);
    const supabase = createServiceClient();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;

    const { data, error } = await supabase
      .from('sequences')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Sequence');
      }
      console.error('Supabase error updating sequence:', error);
      throw new Error('Failed to update sequence');
    }

    const updatedSequence: Sequence = {
      id: data.id,
      campaign_id: data.campaign_id,
      name: data.name,
      status: data.status,
      created_at: data.created_at,
    };

    return successResponse(updatedSequence);
  });
}

// DELETE /api/sequences/[id] - Delete sequence
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // Check if sequence exists
    const { data: existing } = await supabase
      .from('sequences')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Sequence');
    }

    // Delete associated steps first (if not using cascade)
    await supabase
      .from('sequence_steps')
      .delete()
      .eq('sequence_id', id);

    // Delete the sequence
    const { error } = await supabase
      .from('sequences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting sequence:', error);
      throw new Error('Failed to delete sequence');
    }

    return successResponse({ deleted: true });
  });
}

// POST /api/sequences/[id] - Add step to sequence
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateCreateSequenceStep);
    const supabase = createServiceClient();

    // Verify sequence exists
    const { data: sequence } = await supabase
      .from('sequences')
      .select('id')
      .eq('id', id)
      .single();

    if (!sequence) {
      throw new NotFoundError('Sequence');
    }

    const { data, error } = await supabase
      .from('sequence_steps')
      .insert({
        sequence_id: id,
        order: body.order,
        type: body.type,
        delay_days: body.delay_days ?? 0,
        template_id: body.template_id ?? null,
        content: body.content ?? null,
        subject: body.subject ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating sequence step:', error);
      throw new Error('Failed to add step to sequence');
    }

    const newStep: SequenceStep = {
      id: data.id,
      sequence_id: data.sequence_id,
      order: data.order,
      type: data.type,
      delay_days: data.delay_days,
      template_id: data.template_id,
      content: data.content,
      subject: data.subject,
    };

    return successResponse(newStep);
  });
}
