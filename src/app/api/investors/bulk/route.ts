import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateBulkImport } from '@/lib/api/validators';
import type { Investor } from '@/types';

// POST /api/investors/bulk - Bulk import investors
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateBulkImport);

    const imported: Investor[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    body.investors.forEach((inv, index) => {
      try {
        const newInvestor: Investor = {
          id: `inv-${Date.now()}-${index}`,
          org_id: 'org-1',
          name: inv.name,
          email: inv.email || null,
          firm: inv.firm ?? null,
          title: inv.title ?? null,
          linkedin_url: inv.linkedin_url || null,
          check_size_min: null,
          check_size_max: null,
          stages: [],
          sectors: [],
          fit_score: null,
          warm_paths: [],
          source: 'import',
          created_at: new Date().toISOString(),
        };
        imported.push(newInvestor);
      } catch (err) {
        errors.push({
          row: index + 1,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    });

    // TODO: Insert all into Supabase
    // const supabase = await createServerSupabaseClient();
    // const { data, error } = await supabase
    //   .from('investors')
    //   .insert(imported)
    //   .select();

    return successResponse({
      imported: imported.length,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  });
}
