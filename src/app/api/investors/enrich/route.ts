import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  ValidationError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';
import {
  searchInvestors,
  normalizeLinkedInUrl,
  isValidEmail,
} from '@/lib/enrichment';
import { logBulkInvestorImport } from '@/lib/activity';
import { z } from 'zod';

// Search for investors from public databases
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  sources: z.array(z.enum(['openbook', 'sec_13f', 'openvc'])).optional(),
  limit: z.number().min(1).max(200).optional(),
});

// POST /api/investors/enrich - Search public investor databases
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body: unknown = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid request', {
        body: parsed.error.issues.map(i => i.message),
      });
    }

    const { query, sources = ['openbook'], limit = 50 } = parsed.data;

    const results = await searchInvestors(query, sources, limit);

    return successResponse({
      query,
      sources,
      count: results.length,
      investors: results,
    });
  });
}

// Import schema for bulk importing from enrichment results
const importEnrichedSchema = z.object({
  investors: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email().optional().nullable(),
      firm: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      linkedin_url: z.string().url().optional().nullable(),
      check_size_min: z.number().optional().nullable(),
      check_size_max: z.number().optional().nullable(),
      stages: z.array(z.string()).optional(),
      sectors: z.array(z.string()).optional(),
      source: z.string().optional(),
      source_url: z.string().optional().nullable(),
    })
  ).min(1).max(500),
});

// PUT /api/investors/enrich - Import enriched investors to database
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get authenticated user
    const user = await requireAuth();

    const body: unknown = await request.json();
    const parsed = importEnrichedSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid import data', {
        body: parsed.error.issues.map(i => i.message),
      });
    }

    const supabase = createServiceClient();

    const toInsert = parsed.data.investors.map(inv => ({
      org_id: user.orgId,
      user_id: user.id,
      is_platform: false,
      name: inv.name,
      email: inv.email && isValidEmail(inv.email) ? inv.email : null,
      firm: inv.firm ?? null,
      title: inv.title ?? null,
      linkedin_url: normalizeLinkedInUrl(inv.linkedin_url ?? null),
      check_size_min: inv.check_size_min ?? null,
      check_size_max: inv.check_size_max ?? null,
      stages: inv.stages ?? [],
      sectors: inv.sectors ?? [],
      source: inv.source ?? 'enrichment',
      metadata: {
        source_url: inv.source_url,
        imported_at: new Date().toISOString(),
      },
    }));

    // Use upsert to avoid duplicates (match on user_id + name + firm)
    const { data, error } = await supabase
      .from('investors')
      .upsert(toInsert, {
        onConflict: 'user_id,name,firm',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to regular insert if upsert fails
      const { data: insertData, error: insertError } = await supabase
        .from('investors')
        .insert(toInsert)
        .select();

      if (insertError) {
        throw new Error('Failed to import investors');
      }

      // Log the enrichment import
      if (insertData && insertData.length > 0) {
        await logBulkInvestorImport(
          supabase,
          user.orgId,
          insertData.map((inv: { id: string; name: string }) => ({ id: inv.id, name: inv.name })),
          'enrichment'
        );
      }

      return successResponse({
        imported: insertData?.length ?? 0,
        investors: insertData,
      });
    }

    // Log the enrichment import
    if (data && data.length > 0) {
      await logBulkInvestorImport(
        supabase,
        user.orgId,
        data.map((inv: { id: string; name: string }) => ({ id: inv.id, name: inv.name })),
        'enrichment'
      );
    }

    return successResponse({
      imported: data?.length ?? 0,
      investors: data,
    });
  });
}
