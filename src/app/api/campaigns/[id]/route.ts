import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdateCampaign } from '@/lib/api/validators';
import type { Campaign } from '@/types';

// Mock data - same reference as parent route for consistency
// In production, this would query Supabase
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    org_id: 'org-1',
    name: 'Series A Raise',
    status: 'active',
    raise_amount: 5000000,
    raise_type: 'series_a',
    sector: ['fintech', 'ai'],
    deck_url: 'https://example.com/deck.pdf',
    settings: {},
    created_at: new Date().toISOString(),
  },
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    // TODO: Query Supabase
    const campaign = mockCampaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    return successResponse(campaign);
  });
}

// PATCH /api/campaigns/[id] - Update a campaign
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    // Parse and validate request body
    const body = await parseBody(request, validateUpdateCampaign);

    // Find campaign
    const campaignIndex = mockCampaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw new NotFoundError('Campaign');
    }

    // Update campaign
    const existingCampaign = mockCampaigns[campaignIndex];
    if (!existingCampaign) {
      throw new NotFoundError('Campaign');
    }

    const updatedCampaign: Campaign = {
      ...existingCampaign,
      ...body,
      deck_url: body.deck_url === '' ? null : (body.deck_url ?? existingCampaign.deck_url),
    };

    mockCampaigns[campaignIndex] = updatedCampaign;

    // TODO: Update in Supabase
    // const supabase = await createServerSupabaseClient();
    // const { data, error } = await supabase
    //   .from('campaigns')
    //   .update(body)
    //   .eq('id', id)
    //   .select()
    //   .single();

    return successResponse(updatedCampaign);
  });
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;

    // Find campaign
    const campaignIndex = mockCampaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw new NotFoundError('Campaign');
    }

    // Remove campaign
    mockCampaigns.splice(campaignIndex, 1);

    // TODO: Delete from Supabase
    // const supabase = await createServerSupabaseClient();
    // const { error } = await supabase
    //   .from('campaigns')
    //   .delete()
    //   .eq('id', id);

    return successResponse({ deleted: true });
  });
}
