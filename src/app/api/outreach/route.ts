import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import { sendEmail, prepareTrackedEmail } from '@/lib/email';
import type { Outreach, OutreachStatus } from '@/types';
import { z } from 'zod';

// Mock data for MVP
const mockOutreach: Outreach[] = [
  {
    id: '1',
    campaign_id: '1',
    investor_id: '1',
    sequence_id: '1',
    step_id: 'step-1',
    type: 'email',
    status: 'sent',
    scheduled_at: null,
    sent_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    opened_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    replied_at: null,
    content: 'Hi Sarah, I wanted to reach out about our Series A...',
    subject: 'Quick intro - Cap Outro',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    campaign_id: '1',
    investor_id: '2',
    sequence_id: null,
    step_id: null,
    type: 'email',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    sent_at: null,
    opened_at: null,
    replied_at: null,
    content: 'Hi Mike, following up on our previous conversation...',
    subject: 'Following up - Cap Outro',
    created_at: new Date().toISOString(),
  },
];

const createOutreachSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  investor_id: z.string().uuid('Invalid investor ID'),
  sequence_id: z.string().uuid().optional(),
  step_id: z.string().uuid().optional(),
  type: z.enum(['email', 'linkedin', 'call', 'meeting', 'intro_request']),
  content: z.string().min(1, 'Content is required').max(10000),
  subject: z.string().max(200).optional(),
  scheduled_at: z.string().datetime().optional(),
  send_now: z.boolean().optional(),
});

function validateCreateOutreach(data: unknown) {
  const result = createOutreachSchema.safeParse(data);
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

// GET /api/outreach - List outreach (filtered by campaign, investor, or status)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');
    const investorId = searchParams.get('investor_id');
    const status = searchParams.get('status') as OutreachStatus | null;

    let filtered = mockOutreach;
    
    if (campaignId) {
      filtered = filtered.filter((o) => o.campaign_id === campaignId);
    }
    if (investorId) {
      filtered = filtered.filter((o) => o.investor_id === investorId);
    }
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    return successResponse(filtered, {
      page: 1,
      limit: 50,
      total: filtered.length,
    });
  });
}

// POST /api/outreach - Create and optionally send outreach
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateOutreach);

    const trackingId = crypto.randomUUID();
    
    const newOutreach: Outreach = {
      id: `outreach-${Date.now()}`,
      campaign_id: body.campaign_id,
      investor_id: body.investor_id,
      sequence_id: body.sequence_id ?? null,
      step_id: body.step_id ?? null,
      type: body.type,
      status: body.send_now ? 'sent' : 'scheduled',
      scheduled_at: body.scheduled_at ?? null,
      sent_at: body.send_now ? new Date().toISOString() : null,
      opened_at: null,
      replied_at: null,
      content: body.content,
      subject: body.subject ?? null,
      created_at: new Date().toISOString(),
    };

    // If sending now and it's an email, actually send it
    if (body.send_now && body.type === 'email') {
      // TODO: Get investor email from database
      const investorEmail = 'investor@example.com'; // Mock
      
      // Prepare email with tracking
      const trackedContent = prepareTrackedEmail(body.content, trackingId);
      
      const result = await sendEmail({
        to: { email: investorEmail },
        subject: body.subject ?? 'No Subject',
        html: trackedContent,
        trackingId,
      });

      if (!result.success) {
        console.error('Failed to send email:', result.error);
        newOutreach.status = 'scheduled'; // Keep as scheduled if send failed
        newOutreach.sent_at = null;
      }
    }

    mockOutreach.push(newOutreach);

    return successResponse(newOutreach);
  });
}
