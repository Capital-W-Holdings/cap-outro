import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateSequence } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Sequence } from '@/types';

// GET /api/sequences - List sequences (optionally filtered by campaign)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const supabase = createServiceClient();

    // Note: sequences table doesn't have org_id directly, filter through campaign
    // For MVP, we fetch all sequences and filter client-side or via campaign_id param
    let query = supabase
      .from('sequences')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching sequences:', error);
      throw new Error('Failed to fetch sequences');
    }

    // Map to Sequence type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sequences: Sequence[] = (data ?? []).map((row: any) => ({
      id: row.id,
      campaign_id: row.campaign_id,
      name: row.name,
      status: row.status,
      created_at: row.created_at,
    }));

    return successResponse(sequences, {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/sequences - Create a new sequence
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateSequence);
    const supabase = createServiceClient();

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
      console.error('Supabase error creating sequence:', error);
      throw new Error('Failed to create sequence');
    }

    const newSequence: Sequence = {
      id: data.id,
      campaign_id: data.campaign_id,
      name: data.name,
      status: data.status,
      created_at: data.created_at,
    };

    return successResponse(newSequence);
  });
}
