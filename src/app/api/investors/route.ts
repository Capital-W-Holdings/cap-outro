import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
  AppError,
} from '@/lib/api/utils';
import { validateCreateInvestor } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/investors - List all investors
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const search = searchParams.get('search') ?? '';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('investors')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      // Sanitize search input to prevent SQL injection via special characters
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`name.ilike.%${sanitizedSearch}%,firm.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

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

// POST /api/investors - Create a new investor
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const body = await parseBody(request, validateCreateInvestor);

    const { data, error } = await supabase
      .from('investors')
      .insert({
        org_id: DEMO_ORG_ID,
        name: body.name,
        email: body.email || null,
        firm: body.firm ?? null,
        title: body.title ?? null,
        linkedin_url: body.linkedin_url || null,
        check_size_min: body.check_size_min ?? null,
        check_size_max: body.check_size_max ?? null,
        stages: body.stages ?? [],
        sectors: body.sectors ?? [],
        fit_score: null,
        warm_paths: [],
        source: 'manual',
      })
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data);
  });
}
