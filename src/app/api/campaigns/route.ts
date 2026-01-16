import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
  AppError,
} from '@/lib/api/utils';
import { validateCreateCampaign } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';

// Demo org ID for unauthenticated users
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data ?? [], {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const body = await parseBody(request, validateCreateCampaign);

    // Ensure demo org exists
    await ensureDemoOrg(supabase);

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        org_id: DEMO_ORG_ID,
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
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data);
  });
}

// Helper to ensure demo organization exists
async function ensureDemoOrg(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', DEMO_ORG_ID)
    .single();

  if (!data) {
    await supabase.from('organizations').insert({
      id: DEMO_ORG_ID,
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: 'free',
    });
  }
}
