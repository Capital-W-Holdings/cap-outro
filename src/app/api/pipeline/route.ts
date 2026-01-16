import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
} from '@/lib/api/utils';
import type { PipelineEntry, PipelineStage } from '@/types';

// Mock data for MVP
const mockPipeline: PipelineEntry[] = [
  {
    id: '1',
    campaign_id: '1',
    investor_id: '1',
    stage: 'contacted',
    amount_soft: null,
    amount_committed: null,
    notes: 'Sent initial outreach',
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    campaign_id: '1',
    investor_id: '2',
    stage: 'meeting_scheduled',
    amount_soft: 500000,
    amount_committed: null,
    notes: 'Call scheduled for next week',
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

// GET /api/pipeline - Get pipeline for a campaign
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');

    let filtered = mockPipeline;
    if (campaignId) {
      filtered = mockPipeline.filter(p => p.campaign_id === campaignId);
    }

    // Group by stage for Kanban view
    const stages: PipelineStage[] = [
      'not_contacted',
      'contacted',
      'responded',
      'meeting_scheduled',
      'meeting_held',
      'dd',
      'term_sheet',
      'committed',
      'passed',
    ];

    const byStage: Record<PipelineStage, PipelineEntry[]> = {} as Record<PipelineStage, PipelineEntry[]>;
    stages.forEach(stage => {
      byStage[stage] = filtered.filter(p => p.stage === stage);
    });

    // Calculate stats
    const stats = {
      total: filtered.length,
      by_stage: Object.fromEntries(
        stages.map(stage => [stage, byStage[stage].length])
      ) as Record<PipelineStage, number>,
      total_soft: filtered.reduce((sum, p) => sum + (p.amount_soft ?? 0), 0),
      total_committed: filtered.reduce((sum, p) => sum + (p.amount_committed ?? 0), 0),
    };

    return successResponse({
      entries: filtered,
      by_stage: byStage,
      stats,
    });
  });
}

// POST /api/pipeline - Add investor to pipeline
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json() as {
      campaign_id: string;
      investor_id: string;
      stage?: PipelineStage;
    };

    const newEntry: PipelineEntry = {
      id: `pipe-${Date.now()}`,
      campaign_id: body.campaign_id,
      investor_id: body.investor_id,
      stage: body.stage ?? 'not_contacted',
      amount_soft: null,
      amount_committed: null,
      notes: null,
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    mockPipeline.push(newEntry);

    return successResponse(newEntry);
  });
}
