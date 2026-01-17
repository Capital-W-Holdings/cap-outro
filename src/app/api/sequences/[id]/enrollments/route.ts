import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sequences/[id]/enrollments - List enrolled investors
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    // Verify sequence exists
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('id, name, org_id')
      .eq('id', sequenceId)
      .single();

    if (seqError || !sequence) {
      throw new NotFoundError('Sequence');
    }

    // Build query
    let query = supabase
      .from('sequence_enrollments')
      .select(`
        id,
        sequence_id,
        investor_id,
        campaign_id,
        org_id,
        status,
        current_step_order,
        next_send_at,
        enrolled_at,
        started_at,
        completed_at,
        investor:investors(id, name, email, firm)
      `, { count: 'exact' })
      .eq('sequence_id', sequenceId)
      .order('enrolled_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: enrollments, error, count } = await query;

    if (error) {
      console.error('Error fetching enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }

    return successResponse(enrollments || [], {
      page,
      limit,
      total: count || 0,
    });
  });
}

// PATCH /api/sequences/[id]/enrollments - Update enrollment status (bulk)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id: sequenceId } = await params;
    const body = await request.json();
    const { enrollment_ids, status } = body;

    if (!enrollment_ids || !Array.isArray(enrollment_ids) || enrollment_ids.length === 0) {
      throw new Error('enrollment_ids array is required');
    }

    if (!status || !['active', 'paused', 'cancelled'].includes(status)) {
      throw new Error('Valid status is required (active, paused, cancelled)');
    }

    const supabase = createServiceClient();

    const updateData: Record<string, string | null> = { status };

    // If completing, set completed_at
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('sequence_enrollments')
      .update(updateData)
      .eq('sequence_id', sequenceId)
      .in('id', enrollment_ids)
      .select();

    if (error) {
      console.error('Error updating enrollments:', error);
      throw new Error('Failed to update enrollments');
    }

    return successResponse({
      updated: data?.length || 0,
      message: `Updated ${data?.length || 0} enrollments to ${status}`,
    });
  });
}
