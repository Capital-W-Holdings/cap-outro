import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
} from '@/lib/api/utils';

interface CampaignStats {
  total_investors: number;
  contacted: number;
  responded: number;
  meetings: number;
  committed: number;
  passed: number;
  response_rate: number;
  meeting_rate: number;
  committed_amount: number;
  soft_amount: number;
  target_amount: number;
  percent_committed: number;
  outreach_sent: number;
  outreach_opened: number;
  outreach_clicked: number;
  open_rate: number;
  click_rate: number;
}

// Mock stats for MVP
const mockStats: Record<string, CampaignStats> = {
  '1': {
    total_investors: 47,
    contacted: 32,
    responded: 18,
    meetings: 12,
    committed: 4,
    passed: 8,
    response_rate: 56.25,
    meeting_rate: 37.5,
    committed_amount: 2500000,
    soft_amount: 4200000,
    target_amount: 10000000,
    percent_committed: 25,
    outreach_sent: 78,
    outreach_opened: 52,
    outreach_clicked: 31,
    open_rate: 66.67,
    click_rate: 39.74,
  },
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id]/stats - Get campaign statistics
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const stats = mockStats[id];
    
    if (!stats) {
      // Return default stats for demo
      const defaultStats: CampaignStats = {
        total_investors: 0,
        contacted: 0,
        responded: 0,
        meetings: 0,
        committed: 0,
        passed: 0,
        response_rate: 0,
        meeting_rate: 0,
        committed_amount: 0,
        soft_amount: 0,
        target_amount: 5000000,
        percent_committed: 0,
        outreach_sent: 0,
        outreach_opened: 0,
        outreach_clicked: 0,
        open_rate: 0,
        click_rate: 0,
      };
      return successResponse(defaultStats);
    }

    return successResponse(stats);
  });
}
