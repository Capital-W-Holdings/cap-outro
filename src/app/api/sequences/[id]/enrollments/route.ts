import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { demoEnrollments } from '@/lib/demo/enrollments';

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

    // Verify sequence exists (but allow demo mode fallback)
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('id, name, org_id')
      .eq('id', sequenceId)
      .single();

    const isDemoMode = seqError || !sequence;

    // If demo mode, check demo enrollments first
    if (isDemoMode) {
      let demoData = demoEnrollments.get(sequenceId) || [];

      // Filter by status if provided
      if (status) {
        demoData = demoData.filter(e => e.status === status);
      }

      // Get investor data for demo enrollments
      const investorIds = demoData.map(e => e.investor_id);
      if (investorIds.length > 0) {
        const { data: investors } = await supabase
          .from('investors')
          .select('id, name, email, firm')
          .in('id', investorIds);

        // Attach investor data to enrollments
        demoData = demoData.map(enrollment => ({
          ...enrollment,
          investor: investors?.find((i: { id: string }) => i.id === enrollment.investor_id) || null,
        }));
      }

      // Apply pagination
      const paginatedData = demoData.slice(offset, offset + limit);

      return successResponse(paginatedData, {
        page,
        limit,
        total: demoData.length,
      });
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
      console.error('Error fetching enrollments (using demo fallback):', error);

      // Fallback to demo mode
      let demoData = demoEnrollments.get(sequenceId) || [];

      // Filter by status if provided
      if (status) {
        demoData = demoData.filter(e => e.status === status);
      }

      // Get investor data for demo enrollments
      const investorIds = demoData.map(e => e.investor_id);
      if (investorIds.length > 0) {
        const { data: investors } = await supabase
          .from('investors')
          .select('id, name, email, firm')
          .in('id', investorIds);

        // Attach investor data to enrollments
        demoData = demoData.map(enrollment => ({
          ...enrollment,
          investor: investors?.find((i: { id: string }) => i.id === enrollment.investor_id) || null,
        }));
      }

      // Apply pagination
      const paginatedData = demoData.slice(offset, offset + limit);

      return successResponse(paginatedData, {
        page,
        limit,
        total: demoData.length,
      });
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
      console.error('Error updating enrollments (using demo fallback):', error);

      // Fallback to demo mode
      const existingEnrollments = demoEnrollments.get(sequenceId) || [];
      let updatedCount = 0;

      const updatedEnrollments = existingEnrollments.map(enrollment => {
        if (enrollment_ids.includes(enrollment.id)) {
          updatedCount++;
          return {
            ...enrollment,
            status: status as 'active' | 'paused' | 'completed' | 'cancelled',
            completed_at: status === 'completed' ? new Date().toISOString() : enrollment.completed_at,
          };
        }
        return enrollment;
      });

      demoEnrollments.set(sequenceId, updatedEnrollments);

      return successResponse({
        updated: updatedCount,
        message: `Updated ${updatedCount} enrollments to ${status} (demo mode)`,
      });
    }

    return successResponse({
      updated: data?.length || 0,
      message: `Updated ${data?.length || 0} enrollments to ${status}`,
    });
  });
}
