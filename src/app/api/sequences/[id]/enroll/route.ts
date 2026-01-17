import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  BadRequestError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import type { SequenceEnrollment } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/sequences/[id]/enroll - Enroll investors in a sequence
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId } = await params;
    const body = await request.json();
    const { investor_ids, campaign_id } = body;

    if (!investor_ids || !Array.isArray(investor_ids) || investor_ids.length === 0) {
      throw new BadRequestError('investor_ids array is required');
    }

    const supabase = createServiceClient();

    // Verify sequence exists
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('id, org_id, status')
      .eq('id', sequenceId)
      .single();

    if (seqError || !sequence) {
      throw new NotFoundError('Sequence');
    }

    // Get the first step to calculate initial next_send_at
    const { data: firstStep } = await supabase
      .from('sequence_steps')
      .select('delay_days')
      .eq('sequence_id', sequenceId)
      .order('order', { ascending: true })
      .limit(1)
      .single();

    const delayDays = firstStep?.delay_days || 0;
    const nextSendAt = new Date();
    nextSendAt.setDate(nextSendAt.getDate() + delayDays);

    // Prepare enrollment records
    const enrollments = investor_ids.map((investorId: string) => ({
      sequence_id: sequenceId,
      investor_id: investorId,
      campaign_id: campaign_id || null,
      org_id: sequence.org_id,
      status: 'active',
      current_step_order: 0,
      next_send_at: nextSendAt.toISOString(),
      enrolled_at: new Date().toISOString(),
      started_at: sequence.status === 'active' ? new Date().toISOString() : null,
    }));

    // Insert enrollments (upsert to handle duplicates gracefully)
    const { data, error } = await supabase
      .from('sequence_enrollments')
      .upsert(enrollments, {
        onConflict: 'sequence_id,investor_id',
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error('Error enrolling investors:', error);
      throw new Error('Failed to enroll investors');
    }

    return successResponse({
      enrolled: data?.length || 0,
      total_requested: investor_ids.length,
      message: `Successfully enrolled ${data?.length || 0} investors`,
    });
  });
}

// DELETE /api/sequences/[id]/enroll - Remove investors from a sequence
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId } = await params;
    const body = await request.json();
    const { investor_ids } = body;

    if (!investor_ids || !Array.isArray(investor_ids) || investor_ids.length === 0) {
      throw new BadRequestError('investor_ids array is required');
    }

    const supabase = createServiceClient();

    // Delete enrollments
    const { error } = await supabase
      .from('sequence_enrollments')
      .delete()
      .eq('sequence_id', sequenceId)
      .in('investor_id', investor_ids);

    if (error) {
      console.error('Error removing enrollments:', error);
      throw new Error('Failed to remove investors from sequence');
    }

    return successResponse({
      removed: investor_ids.length,
      message: `Removed ${investor_ids.length} investors from sequence`,
    });
  });
}
