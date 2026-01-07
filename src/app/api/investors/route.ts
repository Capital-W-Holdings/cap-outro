import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateInvestor } from '@/lib/api/validators';
import type { Investor } from '@/types';

// Mock data for MVP
const mockInvestors: Investor[] = [
  {
    id: '1',
    org_id: 'org-1',
    name: 'Sarah Chen',
    email: 'sarah@acme.vc',
    firm: 'Acme Ventures',
    title: 'Partner',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    check_size_min: 500000,
    check_size_max: 2000000,
    stages: ['seed', 'series_a'],
    sectors: ['fintech', 'ai'],
    fit_score: 85,
    warm_paths: [],
    source: 'manual',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    org_id: 'org-1',
    name: 'Mike Johnson',
    email: 'mike@capitalpartners.com',
    firm: 'Capital Partners',
    title: 'Managing Director',
    linkedin_url: null,
    check_size_min: 1000000,
    check_size_max: 5000000,
    stages: ['series_a', 'series_b'],
    sectors: ['saas', 'enterprise'],
    fit_score: 72,
    warm_paths: [],
    source: 'import',
    created_at: new Date().toISOString(),
  },
];

// GET /api/investors - List all investors
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const search = searchParams.get('search') ?? '';

    // Filter by search term
    let filtered = mockInvestors;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = mockInvestors.filter(
        inv =>
          inv.name.toLowerCase().includes(lowerSearch) ||
          inv.firm?.toLowerCase().includes(lowerSearch) ||
          inv.email?.toLowerCase().includes(lowerSearch)
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return successResponse(paginated, {
      page,
      limit,
      total: filtered.length,
    });
  });
}

// POST /api/investors - Create a new investor
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateInvestor);

    const newInvestor: Investor = {
      id: `inv-${Date.now()}`,
      org_id: 'org-1',
      name: body.name,
      email: body.email || null,
      firm: body.firm ?? null,
      title: body.title ?? null,
      linkedin_url: body.linkedin_url || null,
      check_size_min: body.check_size_min ?? null,
      check_size_max: body.check_size_max ?? null,
      stages: body.stages ?? [],
      sectors: body.sectors ?? [],
      fit_score: null,
      warm_paths: [],
      source: 'manual',
      created_at: new Date().toISOString(),
    };

    mockInvestors.push(newInvestor);

    return successResponse(newInvestor);
  });
}
