import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateInvestor } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';
import { logInvestorCreated } from '@/lib/activity';
import type { Investor } from '@/types';

// GET /api/investors - List all investors with filtering
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get authenticated user
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '3500', 10);
    const search = searchParams.get('search') ?? '';

    // Filter parameters
    const stages = searchParams.get('stages')?.split(',').filter(Boolean) ?? [];
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) ?? [];
    const checkSizeMin = searchParams.get('check_size_min');
    const checkSizeMax = searchParams.get('check_size_max');
    const fitScoreMin = searchParams.get('fit_score_min');
    const fitScoreMax = searchParams.get('fit_score_max');
    const contactMethod = searchParams.get('contact_method');
    const sortBy = searchParams.get('sort_by') ?? 'created_at';
    const sortOrder = searchParams.get('sort_order') ?? 'desc';

    const supabase = createServiceClient();

    // Build query - show platform investors OR user's own investors
    // In demo mode, show all platform investors
    const isDemoMode = user.id === 'demo-user-id';
    let query = supabase
      .from('investors')
      .select('*', { count: 'exact' });

    if (isDemoMode) {
      query = query.eq('is_platform', true);
    } else {
      query = query.or(`is_platform.eq.true,user_id.eq.${user.id}`);
    }

    // Filter by contact method - default to only showing investors with real contact info
    if (contactMethod === 'email') {
      // Only investors with personal email
      query = query.not('email', 'is', null);
    } else if (contactMethod === 'linkedin') {
      // Only investors with LinkedIn
      query = query.not('linkedin_url', 'is', null);
    } else if (contactMethod === 'both') {
      // Investors with both email and LinkedIn
      query = query.not('email', 'is', null).not('linkedin_url', 'is', null);
    } else if (contactMethod === 'all') {
      // Show all investors including those without contact info
    } else {
      // Default: only show investors with real contact info (email OR LinkedIn)
      query = query.or('email.neq.null,linkedin_url.neq.null');
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,firm.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply stage filter (array contains any)
    if (stages.length > 0) {
      query = query.overlaps('stages', stages);
    }

    // Apply sector filter (array contains any)
    if (sectors.length > 0) {
      query = query.overlaps('sectors', sectors);
    }

    // Apply check size filters
    if (checkSizeMin) {
      query = query.gte('check_size_max', parseInt(checkSizeMin, 10));
    }
    if (checkSizeMax) {
      query = query.lte('check_size_min', parseInt(checkSizeMax, 10));
    }

    // Apply fit score filters
    if (fitScoreMin) {
      query = query.gte('fit_score', parseInt(fitScoreMin, 10));
    }
    if (fitScoreMax) {
      query = query.lte('fit_score', parseInt(fitScoreMax, 10));
    }

    // Apply sorting
    const validSortColumns = ['name', 'firm', 'fit_score', 'created_at', 'check_size_max'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch investors');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const investors: Investor[] = (data ?? []).map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      user_id: row.user_id,
      is_platform: row.is_platform ?? false,
      name: row.name,
      email: row.email,
      firm: row.firm,
      title: row.title,
      linkedin_url: row.linkedin_url,
      check_size_min: row.check_size_min,
      check_size_max: row.check_size_max,
      stages: row.stages ?? [],
      sectors: row.sectors ?? [],
      fit_score: row.fit_score,
      warm_paths: row.warm_paths ?? [],
      source: row.source,
      created_at: row.created_at,
    }));

    return successResponse(investors, {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/investors - Create a new investor
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get authenticated user
    const user = await requireAuth();

    const body = await parseBody(request, validateCreateInvestor);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('investors')
      .insert({
        org_id: user.orgId,
        user_id: user.id,
        is_platform: false,
        name: body.name,
        email: body.email || null,
        firm: body.firm ?? null,
        title: body.title ?? null,
        linkedin_url: body.linkedin_url || null,
        check_size_min: body.check_size_min ?? null,
        check_size_max: body.check_size_max ?? null,
        stages: body.stages ?? [],
        sectors: body.sectors ?? [],
        source: 'manual',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to create investor');
    }

    // Log the investor creation
    await logInvestorCreated(supabase, user.orgId, data.id, data.name, 'manual', {
      email: data.email,
      firm: data.firm,
      title: data.title,
      linkedin_url: data.linkedin_url,
    });

    const newInvestor: Investor = {
      id: data.id,
      org_id: data.org_id,
      user_id: data.user_id,
      is_platform: data.is_platform ?? false,
      name: data.name,
      email: data.email,
      firm: data.firm,
      title: data.title,
      linkedin_url: data.linkedin_url,
      check_size_min: data.check_size_min,
      check_size_max: data.check_size_max,
      stages: data.stages ?? [],
      sectors: data.sectors ?? [],
      fit_score: data.fit_score,
      warm_paths: data.warm_paths ?? [],
      source: data.source,
      created_at: data.created_at,
    };

    return successResponse(newInvestor);
  });
}
