import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import type { Sequence, SequenceStep } from '@/types';
import { z } from 'zod';

// Mock data
const mockSequences: Sequence[] = [];
const mockSteps: SequenceStep[] = [
  {
    id: 'step-1',
    sequence_id: '1',
    order: 1,
    type: 'email',
    delay_days: 0,
    template_id: null,
    content: 'Hi {{investor_first_name}}, I wanted to reach out about our Series A...',
    subject: 'Quick intro - {{company_name}}',
  },
  {
    id: 'step-2',
    sequence_id: '1',
    order: 2,
    type: 'wait',
    delay_days: 3,
    template_id: null,
    content: null,
    subject: null,
  },
  {
    id: 'step-3',
    sequence_id: '1',
    order: 3,
    type: 'email',
    delay_days: 0,
    template_id: null,
    content: 'Hi {{investor_first_name}}, just following up on my previous email...',
    subject: 'Re: Quick intro - {{company_name}}',
  },
];

const updateSequenceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['draft', 'active', 'paused']).optional(),
});

const addStepSchema = z.object({
  order: z.number().int().positive(),
  type: z.enum(['email', 'linkedin', 'task', 'wait']),
  delay_days: z.number().int().min(0).default(0),
  template_id: z.string().uuid().optional(),
  content: z.string().max(10000).optional(),
  subject: z.string().max(200).optional(),
});

function validateUpdateSequence(data: unknown) {
  const result = updateSequenceSchema.safeParse(data);
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

function validateAddStep(data: unknown) {
  const result = addStepSchema.safeParse(data);
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

// GET /api/sequences/[id] - Get sequence with steps
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const sequence = mockSequences.find((s) => s.id === id);
    if (!sequence) {
      // Return mock sequence for demo
      const demoSequence: Sequence & { steps: SequenceStep[] } = {
        id: '1',
        campaign_id: '1',
        name: 'Initial Outreach',
        status: 'active',
        created_at: new Date().toISOString(),
        steps: mockSteps.filter((step) => step.sequence_id === '1'),
      };
      return successResponse(demoSequence);
    }

    const steps = mockSteps.filter((step) => step.sequence_id === id);
    
    return successResponse({ ...sequence, steps });
  });
}

// PATCH /api/sequences/[id] - Update sequence
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateSequence);
    
    const sequenceIndex = mockSequences.findIndex((s) => s.id === id);
    
    // For demo, create if not exists
    if (sequenceIndex === -1) {
      const newSequence: Sequence = {
        id,
        campaign_id: '1',
        name: body.name ?? 'Updated Sequence',
        status: body.status ?? 'draft',
        created_at: new Date().toISOString(),
      };
      mockSequences.push(newSequence);
      return successResponse(newSequence);
    }

    const existingSequence = mockSequences[sequenceIndex];
    if (!existingSequence) {
      throw new NotFoundError('Sequence');
    }

    const updatedSequence: Sequence = {
      ...existingSequence,
      ...body,
    };

    mockSequences[sequenceIndex] = updatedSequence;

    return successResponse(updatedSequence);
  });
}

// DELETE /api/sequences/[id] - Delete sequence
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const sequenceIndex = mockSequences.findIndex((s) => s.id === id);
    
    if (sequenceIndex !== -1) {
      mockSequences.splice(sequenceIndex, 1);
    }

    return successResponse({ deleted: true });
  });
}

// POST /api/sequences/[id] - Add step to sequence (using POST on the resource)
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateAddStep);

    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      sequence_id: id,
      order: body.order,
      type: body.type,
      delay_days: body.delay_days,
      template_id: body.template_id ?? null,
      content: body.content ?? null,
      subject: body.subject ?? null,
    };

    mockSteps.push(newStep);

    return successResponse(newStep);
  });
}
