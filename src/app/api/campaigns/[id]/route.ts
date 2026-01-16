import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
  AppError,
} from '@/lib/api/utils';
import { validateUpdateCampaign } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Campaign');
    }

    return successResponse(data);
  });
}

// PATCH /api/campaigns/[id] - Update a campaign
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();
    const body = await parseBody(request, validateUpdateCampaign);

    const { data, error } = await supabase
      .from('campaigns')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    if (!data) {
      throw new NotFoundError('Campaign');
    }

    return successResponse(data);
  });
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse({ deleted: true });
  });
}
