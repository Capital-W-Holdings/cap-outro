import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateCampaign } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Campaign } from '@/types';

// Default org for MVP - in production this comes from auth
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const status = searchParams.get('status');

    const supabase = createServiceClient();

    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('org_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }

    // Map to Campaign type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaigns: Campaign[] = (data ?? []).map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      name: row.name,
      status: row.status,
      raise_amount: row.raise_amount,
      raise_type: row.raise_type,
      sector: row.sector ?? [],
      deck_url: row.deck_url,
      settings: row.settings ?? {},
      created_at: row.created_at,
    }));

    return successResponse(campaigns, {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateCampaign);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        org_id: DEFAULT_ORG_ID,
        name: body.name,
        status: 'draft',
        raise_amount: body.raise_amount ?? null,
        raise_type: body.raise_type ?? null,
        sector: body.sector ?? [],
        deck_url: body.deck_url || null,
        settings: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }

    const newCampaign: Campaign = {
      id: data.id,
      org_id: data.org_id,
      name: data.name,
      status: data.status,
      raise_amount: data.raise_amount,
      raise_type: data.raise_type,
      sector: data.sector ?? [],
      deck_url: data.deck_url,
      settings: data.settings ?? {},
      created_at: data.created_at,
    };

    return successResponse(newCampaign);
  });
}
