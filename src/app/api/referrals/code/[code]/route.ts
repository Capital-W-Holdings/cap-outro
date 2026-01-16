import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import type { Referral } from '@/types';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/referrals/code/[code] - Look up referral by code (public endpoint for referral links)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { code } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      throw new NotFoundError('Referral code');
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('referrals')
        .update({ status: 'expired' })
        .eq('id', data.id);

      throw new NotFoundError('Referral code has expired');
    }

    // Return limited info for public access
    const referral: Partial<Referral> = {
      id: data.id,
      code: data.code,
      status: data.status,
      expires_at: data.expires_at,
    };

    return successResponse(referral);
  });
}

// POST /api/referrals/code/[code] - Record a referral signup
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { code } = await params;
    const body = await request.json() as { email?: string; name?: string };
    const supabase = createServiceClient();

    // Find the referral
    const { data: existing, error: findError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (findError || !existing) {
      throw new NotFoundError('Referral code');
    }

    // Check if expired
    if (existing.expires_at && new Date(existing.expires_at) < new Date()) {
      throw new NotFoundError('Referral code has expired');
    }

    // Check if already used
    if (existing.status !== 'pending') {
      throw new Error('Referral code has already been used');
    }

    // Update the referral with signup info
    const { data, error } = await supabase
      .from('referrals')
      .update({
        status: 'signed_up',
        signed_up_at: new Date().toISOString(),
        email: body.email || existing.email,
        name: body.name || existing.name,
        metadata: {
          ...existing.metadata,
          signup_recorded_at: new Date().toISOString(),
        },
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error recording referral signup:', error);
      throw new Error('Failed to record referral');
    }

    const referral: Referral = {
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

    return successResponse(referral);
  });
}
