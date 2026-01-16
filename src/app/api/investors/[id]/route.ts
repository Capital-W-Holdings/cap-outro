import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  ForbiddenError,
  parseBody,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';
import { createValidator } from '@/lib/api/validators';
import { z } from 'zod';
import type { Investor } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update investor schema
const updateInvestorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  firm: z.string().max(100).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  check_size_min: z.number().positive().optional().nullable(),
  check_size_max: z.number().positive().optional().nullable(),
  stages: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  fit_score: z.number().min(0).max(100).optional().nullable(),
});

const validateUpdateInvestor = createValidator(updateInvestorSchema);

// GET /api/investors/[id] - Get a single investor
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = createServiceClient();

    // User can only view platform investors or their own investors
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .eq('id', id)
      .or(`is_platform.eq.true,user_id.eq.${user.id}`)
      .single();

    if (error || !data) {
      throw new NotFoundError('Investor');
    }

    const investor: Investor = {
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

    return successResponse(investor);
  });
}

// PATCH /api/investors/[id] - Update an investor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const body = await parseBody(request, validateUpdateInvestor);
    const supabase = createServiceClient();

    // First check if the investor exists and user owns it
    const { data: existing } = await supabase
      .from('investors')
      .select('id, user_id, is_platform')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Investor');
    }

    // Cannot edit platform investors or investors owned by other users
    if (existing.is_platform) {
      throw new ForbiddenError('Cannot edit platform investors');
    }
    if (existing.user_id !== user.id) {
      throw new ForbiddenError('You can only edit your own investors');
    }

    // Build update object, only including defined fields
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.firm !== undefined) updates.firm = body.firm;
    if (body.title !== undefined) updates.title = body.title;
    if (body.linkedin_url !== undefined) updates.linkedin_url = body.linkedin_url;
    if (body.check_size_min !== undefined) updates.check_size_min = body.check_size_min;
    if (body.check_size_max !== undefined) updates.check_size_max = body.check_size_max;
    if (body.stages !== undefined) updates.stages = body.stages;
    if (body.sectors !== undefined) updates.sectors = body.sectors;
    if (body.fit_score !== undefined) updates.fit_score = body.fit_score;

    const { data, error } = await supabase
      .from('investors')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Investor');
    }

    const investor: Investor = {
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

    return successResponse(investor);
  });
}

// DELETE /api/investors/[id] - Delete an investor
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = createServiceClient();

    // First check if the investor exists and user owns it
    const { data: existing } = await supabase
      .from('investors')
      .select('id, user_id, is_platform')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Investor');
    }

    // Cannot delete platform investors or investors owned by other users
    if (existing.is_platform) {
      throw new ForbiddenError('Cannot delete platform investors');
    }
    if (existing.user_id !== user.id) {
      throw new ForbiddenError('You can only delete your own investors');
    }

    const { error } = await supabase
      .from('investors')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new NotFoundError('Investor');
    }

    return successResponse({ deleted: true });
  });
}
