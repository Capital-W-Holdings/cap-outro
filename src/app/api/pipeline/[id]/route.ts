import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdatePipeline } from '@/lib/api/validators';
import type { PipelineEntry } from '@/types';

// Mock data reference
const mockPipeline: PipelineEntry[] = [];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pipeline/[id] - Get a single pipeline entry
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const entry = mockPipeline.find(p => p.id === id);
    
    if (!entry) {
      throw new NotFoundError('Pipeline entry');
    }

    return successResponse(entry);
  });
}

// PATCH /api/pipeline/[id] - Update pipeline entry (move stage, update amounts)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdatePipeline);
    
    const entryIndex = mockPipeline.findIndex(p => p.id === id);
    
    if (entryIndex === -1) {
      throw new NotFoundError('Pipeline entry');
    }

    const existingEntry = mockPipeline[entryIndex];
    if (!existingEntry) {
      throw new NotFoundError('Pipeline entry');
    }

    const updatedEntry: PipelineEntry = {
      ...existingEntry,
      ...body,
      last_activity_at: new Date().toISOString(),
    };

    mockPipeline[entryIndex] = updatedEntry;

    return successResponse(updatedEntry);
  });
}

// DELETE /api/pipeline/[id] - Remove from pipeline
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const entryIndex = mockPipeline.findIndex(p => p.id === id);
    
    if (entryIndex === -1) {
      throw new NotFoundError('Pipeline entry');
    }

    mockPipeline.splice(entryIndex, 1);

    return successResponse({ deleted: true });
  });
}
