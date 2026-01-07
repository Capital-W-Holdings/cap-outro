import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import { sendEmail, prepareTrackedEmail } from '@/lib/email';
import type { Outreach } from '@/types';
import { z } from 'zod';

// Mock data reference
const mockOutreach: Outreach[] = [];

const updateOutreachSchema = z.object({
  status: z.enum(['scheduled', 'sent', 'opened', 'clicked', 'replied', 'bounced']).optional(),
  content: z.string().max(10000).optional(),
  subject: z.string().max(200).optional(),
  scheduled_at: z.string().datetime().optional(),
});

function validateUpdateOutreach(data: unknown) {
  const result = updateOutreachSchema.safeParse(data);
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/outreach/[id] - Get single outreach
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const outreach = mockOutreach.find((o) => o.id === id);
    
    if (!outreach) {
      throw new NotFoundError('Outreach');
    }

    return successResponse(outreach);
  });
}

// PATCH /api/outreach/[id] - Update outreach
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateOutreach);
    
    const outreachIndex = mockOutreach.findIndex((o) => o.id === id);
    
    if (outreachIndex === -1) {
      throw new NotFoundError('Outreach');
    }

    const existingOutreach = mockOutreach[outreachIndex];
    if (!existingOutreach) {
      throw new NotFoundError('Outreach');
    }

    const updatedOutreach: Outreach = {
      ...existingOutreach,
      ...body,
    };

    mockOutreach[outreachIndex] = updatedOutreach;

    return successResponse(updatedOutreach);
  });
}

// DELETE /api/outreach/[id] - Delete/cancel outreach
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const outreachIndex = mockOutreach.findIndex((o) => o.id === id);
    
    if (outreachIndex !== -1) {
      mockOutreach.splice(outreachIndex, 1);
    }

    return successResponse({ deleted: true });
  });
}

// POST /api/outreach/[id] - Send scheduled outreach now
export async function POST(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const outreachIndex = mockOutreach.findIndex((o) => o.id === id);
    
    if (outreachIndex === -1) {
      throw new NotFoundError('Outreach');
    }

    const outreach = mockOutreach[outreachIndex];
    if (!outreach) {
      throw new NotFoundError('Outreach');
    }

    if (outreach.status !== 'scheduled') {
      throw new ValidationError('Can only send scheduled outreach');
    }

    if (outreach.type === 'email') {
      const trackingId = crypto.randomUUID();
      const investorEmail = 'investor@example.com'; // TODO: Get from DB
      
      const trackedContent = prepareTrackedEmail(outreach.content, trackingId);
      
      const result = await sendEmail({
        to: { email: investorEmail },
        subject: outreach.subject ?? 'No Subject',
        html: trackedContent,
        trackingId,
      });

      if (result.success) {
        outreach.status = 'sent';
        outreach.sent_at = new Date().toISOString();
      } else {
        throw new ValidationError(`Failed to send: ${result.error}`);
      }
    } else {
      // For non-email types, just mark as sent
      outreach.status = 'sent';
      outreach.sent_at = new Date().toISOString();
    }

    mockOutreach[outreachIndex] = outreach;

    return successResponse(outreach);
  });
}
