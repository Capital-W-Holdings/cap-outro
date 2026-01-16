import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import type { SequenceStep } from '@/types';

interface RouteParams {
  params: Promise<{ id: string; stepId: string }>;
}

// PATCH /api/sequences/[id]/steps/[stepId] - Update a step
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId, stepId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Verify step exists and belongs to this sequence
    const { data: existing } = await supabase
      .from('sequence_steps')
      .select('id')
      .eq('id', stepId)
      .eq('sequence_id', sequenceId)
      .single();

    if (!existing) {
      throw new NotFoundError('Sequence step');
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.delay_days !== undefined) updateData.delay_days = body.delay_days;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.template_id !== undefined) updateData.template_id = body.template_id;
    if (body.order !== undefined) updateData.order = body.order;

    const { data, error } = await supabase
      .from('sequence_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating step:', error);
      throw new Error('Failed to update step');
    }

    const updatedStep: SequenceStep = {
      id: data.id,
      sequence_id: data.sequence_id,
      order: data.order,
      type: data.type,
      delay_days: data.delay_days,
      template_id: data.template_id,
      content: data.content,
      subject: data.subject,
    };

    return successResponse(updatedStep);
  });
}

// DELETE /api/sequences/[id]/steps/[stepId] - Delete a step
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId, stepId } = await params;
    const supabase = createServiceClient();

    // Verify step exists and belongs to this sequence
    const { data: existing } = await supabase
      .from('sequence_steps')
      .select('id, order')
      .eq('id', stepId)
      .eq('sequence_id', sequenceId)
      .single();

    if (!existing) {
      throw new NotFoundError('Sequence step');
    }

    // Delete the step
    const { error } = await supabase
      .from('sequence_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      console.error('Supabase error deleting step:', error);
      throw new Error('Failed to delete step');
    }

    // Reorder remaining steps
    const { data: remainingSteps } = await supabase
      .from('sequence_steps')
      .select('id, order')
      .eq('sequence_id', sequenceId)
      .gt('order', existing.order)
      .order('order', { ascending: true });

    if (remainingSteps && remainingSteps.length > 0) {
      for (const step of remainingSteps) {
        await supabase
          .from('sequence_steps')
          .update({ order: step.order - 1 })
          .eq('id', step.id);
      }
    }

    return successResponse({ deleted: true });
  });
}
