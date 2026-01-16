import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdateCampaign } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import type { Campaign } from '@/types';

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

    const campaign: Campaign = {
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

    return successResponse(campaign);
  });
}

// PATCH /api/campaigns/[id] - Update a campaign
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateCampaign);
    const supabase = createServiceClient();

    // Build update object, handling empty string -> null for deck_url
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.raise_amount !== undefined) updateData.raise_amount = body.raise_amount;
    if (body.raise_type !== undefined) updateData.raise_type = body.raise_type;
    if (body.sector !== undefined) updateData.sector = body.sector;
    if (body.deck_url !== undefined) updateData.deck_url = body.deck_url === '' ? null : body.deck_url;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Campaign');
      }
      console.error('Supabase error updating campaign:', error);
      throw new Error('Failed to update campaign');
    }

    const campaign: Campaign = {
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

    return successResponse(campaign);
  });
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // First check if campaign exists
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Campaign');
    }

    // Delete the campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting campaign:', error);
      throw new Error('Failed to delete campaign');
    }

    return successResponse({ deleted: true });
  });
}
