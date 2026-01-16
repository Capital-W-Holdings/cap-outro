import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateReferral } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Referral } from '@/types';
import crypto from 'crypto';

// Default org/user for MVP - in production this comes from auth
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_USER_ID = 'user_1';

// Generate a unique referral code using crypto
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// GET /api/referrals - List user's referrals
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const status = searchParams.get('status');

    const supabase = createServiceClient();

    let query = supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('org_id', DEFAULT_ORG_ID)
      .eq('referrer_user_id', DEFAULT_USER_ID)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching referrals:', error);
      throw new Error('Failed to fetch referrals');
    }

    // Map to Referral type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const referrals: Referral[] = (data ?? []).map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      referrer_user_id: row.referrer_user_id,
      code: row.code,
      email: row.email,
      name: row.name,
      status: row.status,
      signed_up_at: row.signed_up_at,
      converted_at: row.converted_at,
      reward_granted: row.reward_granted,
      metadata: row.metadata ?? {},
      created_at: row.created_at,
      expires_at: row.expires_at,
    }));

    // Calculate stats
    const stats = {
      total: count ?? 0,
      pending: referrals.filter((r) => r.status === 'pending').length,
      signed_up: referrals.filter((r) => r.status === 'signed_up').length,
      converted: referrals.filter((r) => r.status === 'converted').length,
      rewards_earned: referrals.filter((r) => r.reward_granted).length,
    };

    return successResponse({
      referrals,
      stats,
    }, {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/referrals - Create a new referral link
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateReferral);
    const supabase = createServiceClient();

    // Generate unique code
    let code = generateReferralCode();

    // Ensure code is unique
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) break;
      code = generateReferralCode();
      attempts++;
    }

    if (attempts >= 5) {
      throw new Error('Failed to generate unique referral code');
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        org_id: DEFAULT_ORG_ID,
        referrer_user_id: DEFAULT_USER_ID,
        code,
        email: body.email || null,
        name: body.name || null,
        status: 'pending',
        reward_granted: false,
        metadata: {},
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating referral:', error);
      throw new Error('Failed to create referral');
    }

    const newReferral: Referral = {
      id: data.id,
      org_id: data.org_id,
      referrer_user_id: data.referrer_user_id,
      code: data.code,
      email: data.email,
      name: data.name,
      status: data.status,
      signed_up_at: data.signed_up_at,
      converted_at: data.converted_at,
      reward_granted: data.reward_granted,
      metadata: data.metadata ?? {},
      created_at: data.created_at,
      expires_at: data.expires_at,
    };

    return successResponse(newReferral);
  });
}
