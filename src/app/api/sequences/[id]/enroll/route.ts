import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  BadRequestError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { demoEnrollments } from '@/lib/demo/enrollments';
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

    // Try database insert first
    const { data, error } = await supabase
      .from('sequence_enrollments')
      .upsert(enrollments, {
        onConflict: 'sequence_id,investor_id',
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error('Error enrolling investors (using demo fallback):', error);

      // Fallback to demo mode - store in memory
      const existingEnrollments = demoEnrollments.get(sequenceId) || [];
      const newEnrollments: SequenceEnrollment[] = [];

      for (const enrollment of enrollments) {
        // Check if already enrolled
        const exists = existingEnrollments.some(e => e.investor_id === enrollment.investor_id);
        if (!exists) {
          newEnrollments.push({
            id: `demo-enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...enrollment,
            completed_at: null,
          } as SequenceEnrollment);
        }
      }

      demoEnrollments.set(sequenceId, [...existingEnrollments, ...newEnrollments]);

      return successResponse({
        enrolled: newEnrollments.length,
        total_requested: investor_ids.length,
        message: `Successfully enrolled ${newEnrollments.length} investors (demo mode)`,
      });
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
