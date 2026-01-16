import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import type { Sequence } from '@/types';
import { z } from 'zod';

// Mock data for MVP
const mockSequences: Sequence[] = [
  {
    id: '1',
    campaign_id: '1',
    name: 'Initial Outreach',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    campaign_id: '1',
    name: 'Follow-up Sequence',
    status: 'draft',
    created_at: new Date().toISOString(),
  },
];

const createSequenceSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

function validateCreateSequence(data: unknown) {
  const result = createSequenceSchema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    });
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// GET /api/sequences - List sequences (optionally filtered by campaign)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');

    let filtered = mockSequences;
    if (campaignId) {
      filtered = mockSequences.filter((s) => s.campaign_id === campaignId);
    }

    return successResponse(filtered, {
      page: 1,
      limit: 20,
      total: filtered.length,
    });
  });
}

// POST /api/sequences - Create a new sequence
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateSequence);

    const newSequence: Sequence = {
      id: `seq-${Date.now()}`,
      campaign_id: body.campaign_id,
      name: body.name,
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    mockSequences.push(newSequence);

    return successResponse(newSequence);
  });
}
