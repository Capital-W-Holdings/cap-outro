import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdateReferral } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Referral } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/referrals/[id] - Get single referral
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Referral');
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

// PATCH /api/referrals/[id] - Update referral status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateReferral);
    const supabase = createServiceClient();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;

      // Auto-set timestamps based on status
      if (body.status === 'signed_up') {
        updateData.signed_up_at = new Date().toISOString();
      } else if (body.status === 'converted') {
        updateData.converted_at = new Date().toISOString();
      }
    }

    if (body.reward_granted !== undefined) {
      updateData.reward_granted = body.reward_granted;
    }

    const { data, error } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Referral');
      }
      console.error('Supabase error updating referral:', error);
      throw new Error('Failed to update referral');
    }

    const updatedReferral: Referral = {
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

    return successResponse(updatedReferral);
  });
}

// DELETE /api/referrals/[id] - Delete referral
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // Check if referral exists
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Referral');
    }

    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting referral:', error);
      throw new Error('Failed to delete referral');
    }

    return successResponse({ deleted: true });
  });
}
