import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
} from '@/lib/api/utils';
import type { Investor } from '@/types';

// Mock data reference
const mockInvestors: Investor[] = [];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/investors/[id] - Get a single investor
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const investor = mockInvestors.find(i => i.id === id);
    
    if (!investor) {
      throw new NotFoundError('Investor');
    }

    return successResponse(investor);
  });
}

// PATCH /api/investors/[id] - Update an investor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body: unknown = await request.json();
    
    const investorIndex = mockInvestors.findIndex(i => i.id === id);
    
    if (investorIndex === -1) {
      throw new NotFoundError('Investor');
    }

    const existingInvestor = mockInvestors[investorIndex];
    if (!existingInvestor) {
      throw new NotFoundError('Investor');
    }

    const updatedInvestor: Investor = {
      ...existingInvestor,
      ...(body as Partial<Investor>),
    };

    mockInvestors[investorIndex] = updatedInvestor;

    return successResponse(updatedInvestor);
  });
}

// DELETE /api/investors/[id] - Delete an investor
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const investorIndex = mockInvestors.findIndex(i => i.id === id);
    
    if (investorIndex === -1) {
      throw new NotFoundError('Investor');
    }

    mockInvestors.splice(investorIndex, 1);

    return successResponse({ deleted: true });
  });
}
