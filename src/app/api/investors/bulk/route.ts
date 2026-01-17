import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateBulkImport } from '@/lib/api/validators';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';
import { normalizeLinkedInUrl, isValidEmail } from '@/lib/enrichment';
import { logBulkInvestorImport } from '@/lib/activity';
import { demoInvestors } from '@/lib/demo/investors';
import type { Investor } from '@/types';

// POST /api/investors/bulk - Bulk import investors
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get authenticated user
    const user = await requireAuth();
    const isDemoMode = user.id === 'demo-user-id';

    const body = await parseBody(request, validateBulkImport);
    const supabase = createServiceClient();

    const toInsert: Array<{
      org_id: string;
      user_id: string;
      is_platform: boolean;
      name: string;
      email: string | null;
      firm: string | null;
      title: string | null;
      linkedin_url: string | null;
      check_size_min: number | null;
      check_size_max: number | null;
      stages: string[];
      sectors: string[];
      source: string;
    }> = [];

    const errors: Array<{ row: number; error: string }> = [];

    body.investors.forEach((inv, index) => {
      try {
        // Validate email if provided
        const email = inv.email && isValidEmail(inv.email) ? inv.email : null;

        toInsert.push({
          org_id: user.orgId,
          user_id: user.id,
          is_platform: false,
          name: inv.name,
          email,
          firm: inv.firm ?? null,
          title: inv.title ?? null,
          linkedin_url: normalizeLinkedInUrl(inv.linkedin_url ?? null),
          check_size_min: null,
          check_size_max: null,
          stages: [],
          sectors: [],
          source: 'import',
        });
      } catch (err) {
        errors.push({
          row: index + 1,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    });

    // Batch insert to Supabase
    if (toInsert.length > 0) {
      const { data, error } = await supabase
        .from('investors')
        .insert(toInsert)
        .select();

      if (error) {
        console.error('Supabase bulk insert error:', error);

        // If in demo mode, store in memory instead
        if (isDemoMode) {
          const importedInvestors: Investor[] = [];

          for (const inv of toInsert) {
            const newInvestor: Investor = {
              id: `demo-inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              org_id: inv.org_id,
              user_id: inv.user_id,
              is_platform: inv.is_platform,
              name: inv.name,
              email: inv.email,
              firm: inv.firm,
              title: inv.title,
              linkedin_url: inv.linkedin_url,
              check_size_min: inv.check_size_min,
              check_size_max: inv.check_size_max,
              stages: inv.stages,
              sectors: inv.sectors,
              fit_score: null,
              warm_paths: [],
              source: inv.source as 'import' | 'enrichment' | 'manual',
              created_at: new Date().toISOString(),
            };

            demoInvestors.set(newInvestor.id, newInvestor);
            importedInvestors.push(newInvestor);
          }

          return successResponse({
            imported: importedInvestors.length,
            errors: 0,
            errorDetails: undefined,
          });
        }

        // Try inserting one by one to identify problematic records
        let successCount = 0;
        const successfulInvestors: Array<{ id: string; name: string }> = [];

        for (let i = 0; i < toInsert.length; i++) {
          const inv = toInsert[i];
          if (!inv) continue;
          const { data: singleData, error: singleError } = await supabase
            .from('investors')
            .insert(inv)
            .select('id, name')
            .single();

          if (singleError) {
            errors.push({
              row: i + 1,
              error: singleError.message,
            });
          } else {
            successCount++;
            if (singleData) {
              successfulInvestors.push({ id: singleData.id, name: singleData.name });
            }
          }
        }

        // Log the bulk import
        if (successfulInvestors.length > 0) {
          await logBulkInvestorImport(supabase, user.orgId, successfulInvestors, 'import');
        }

        return successResponse({
          imported: successCount,
          errors: errors.length,
          errorDetails: errors.length > 0 ? errors : undefined,
        });
      }

      // Log the bulk import
      if (data && data.length > 0) {
        await logBulkInvestorImport(
          supabase,
          user.orgId,
          data.map((inv: { id: string; name: string }) => ({ id: inv.id, name: inv.name })),
          'import'
        );
      }

      return successResponse({
        imported: data?.length ?? 0,
        errors: errors.length,
        errorDetails: errors.length > 0 ? errors : undefined,
      });
    }

    return successResponse({
      imported: 0,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  });
}
