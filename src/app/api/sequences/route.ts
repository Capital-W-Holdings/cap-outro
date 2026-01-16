import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
  ValidationError,
  AppError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createSequenceSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

function validateCreateSequence(data: unknown) {
  const result = createSequenceSchema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    });
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// GET /api/sequences - List sequences (optionally filtered by campaign)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');

    let query = supabase
      .from('sequences')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data ?? [], {
      page: 1,
      limit: 20,
      total: count ?? 0,
    });
  });
}

// POST /api/sequences - Create a new sequence
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const body = await parseBody(request, validateCreateSequence);

    const { data, error } = await supabase
      .from('sequences')
      .insert({
        campaign_id: body.campaign_id,
        name: body.name,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data);
  });
}
