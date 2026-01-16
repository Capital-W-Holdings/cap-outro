import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateCampaign } from '@/lib/api/validators';
import type { Campaign } from '@/types';

// Mock data for MVP - will be replaced with Supabase
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

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // TODO: Get user from session
    const userId = request.headers.get('x-user-id');
    
    // For MVP, return mock data
    // In production, this would query Supabase with RLS
    if (!userId) {
      // Return mock for demo purposes
      return successResponse(mockCampaigns, {
        page: 1,
        limit: 10,
        total: mockCampaigns.length,
      });
    }

    // TODO: Query Supabase
    // const supabase = await createServerSupabaseClient();
    // const { data, error } = await supabase
    //   .from('campaigns')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    return successResponse(mockCampaigns, {
      page: 1,
      limit: 10,
      total: mockCampaigns.length,
    });
  });
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // TODO: Get user from session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      // For MVP demo, allow unauthenticated
      // throw new UnauthorizedError();
    }

    // Parse and validate request body
    const body = await parseBody(request, validateCreateCampaign);

    // Create new campaign
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      org_id: 'org-1', // TODO: Get from session
      name: body.name,
      status: 'draft',
      raise_amount: body.raise_amount ?? null,
      raise_type: body.raise_type ?? null,
      sector: body.sector ?? [],
      deck_url: body.deck_url || null,
      settings: {},
      created_at: new Date().toISOString(),
    };

    // TODO: Insert into Supabase
    // const supabase = await createServerSupabaseClient();
    // const { data, error } = await supabase
    //   .from('campaigns')
    //   .insert(newCampaign)
    //   .select()
    //   .single();

    // For MVP, just return the mock
    mockCampaigns.push(newCampaign);

    return successResponse(newCampaign);
  });
}
