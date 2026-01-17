import { NextRequest, NextResponse } from 'next/server';
import {
  successResponse,
  withErrorHandling,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';
import { analyzeInvestors, CleanupStats } from '@/lib/investor-verification';

// GET /api/investors/cleanup - Analyze investor data quality
export async function GET() {
  return withErrorHandling(async () => {
    await requireAuth();

    let supabase;
    try {
      supabase = createServiceClient();
    } catch (err) {
      console.error('Service client error:', err);
      throw new Error('Database connection not available. Check SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Fetch all investors (without is_platform column as it may not exist yet)
    // Use pagination to get all records
    const allInvestors: Array<{
      id: string;
      name: string;
      email: string | null;
      firm: string | null;
      title: string | null;
      linkedin_url: string | null;
      source: string | null;
    }> = [];

    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('investors')
        .select('id, name, email, firm, title, linkedin_url, source')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (batchError) {
        console.error('Error fetching investors batch:', batchError);
        throw new Error(`Failed to fetch investors: ${batchError.message}`);
      }

      if (batch && batch.length > 0) {
        allInvestors.push(...batch);
        page++;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    const investors = allInvestors;

    if (!investors || investors.length === 0) {
      return successResponse({
        message: 'No platform investors found',
        stats: {
          total: 0,
          verified: 0,
          unverified: 0,
          celebrities: 0,
          fakeEmails: 0,
          suspiciousFirms: 0,
          missingContact: 0,
          toDelete: 0,
          wouldRemain: 0,
        } as CleanupStats,
      });
    }

    // Analyze investors
    const analysis = analyzeInvestors(investors);

    // Get sample of unverified investors
    const unverifiedSample = analysis.unverified.slice(0, 20).map(inv => ({
      id: inv.id,
      name: inv.name,
      firm: inv.firm,
      email: inv.email,
      issues: analysis.verificationResults.get(inv.id)?.issues || [],
    }));

    return successResponse({
      message: `Analyzed ${investors.length} platform investors`,
      stats: analysis.stats,
      unverifiedSample,
      recommendation: analysis.stats.wouldRemain >= 5000
        ? `Safe to delete ${analysis.stats.toDelete} unverified investors. ${analysis.stats.wouldRemain} verified will remain.`
        : `WARNING: Only ${analysis.stats.wouldRemain} verified investors. Need to keep some unverified to maintain 5000 minimum.`,
    });
  });
}

interface CleanupResult {
  dryRun: boolean;
  message: string;
  deleted?: number;
  remaining?: number;
  stats?: CleanupStats;
  wouldDelete?: Array<{ id: string; name: string; firm: string | null; issues?: string[] }>;
  wouldKeepUnverified?: Array<{ id: string; name: string; firm: string | null; score: number }>;
}

// POST /api/investors/cleanup - Remove unverified investors
export async function POST(request: NextRequest): Promise<NextResponse> {
  return withErrorHandling(async () => {
    await requireAuth();

    const body = await request.json();
    const { dryRun = true, minToKeep = 5000 } = body;

    let supabase;
    try {
      supabase = createServiceClient();
    } catch (err) {
      console.error('Service client error:', err);
      throw new Error('Database connection not available. Check SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Fetch all investors with pagination
    const allInvestors: Array<{
      id: string;
      name: string;
      email: string | null;
      firm: string | null;
      title: string | null;
      linkedin_url: string | null;
      source: string | null;
    }> = [];

    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('investors')
        .select('id, name, email, firm, title, linkedin_url, source')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (batchError) {
        console.error('Error fetching investors batch:', batchError);
        throw new Error(`Failed to fetch investors: ${batchError.message}`);
      }

      if (batch && batch.length > 0) {
        allInvestors.push(...batch);
        page++;
        hasMore = batch.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    const investors = allInvestors;

    // Analyze investors
    const analysis = analyzeInvestors(investors);

    // Check if we have enough verified investors
    if (analysis.stats.verified < minToKeep) {
      // Need to keep some unverified to meet minimum
      const shortfall = minToKeep - analysis.stats.verified;

      // Sort unverified by score (keep highest scoring ones)
      const unverifiedWithScores = analysis.unverified.map(inv => ({
        investor: inv,
        score: analysis.verificationResults.get(inv.id)?.score || 0,
      }));
      unverifiedWithScores.sort((a, b) => b.score - a.score);

      // Keep the top-scoring unverified ones
      const toKeep = unverifiedWithScores.slice(0, shortfall);
      const toDelete = unverifiedWithScores.slice(shortfall);

      if (dryRun) {
        const result: CleanupResult = {
          dryRun: true,
          message: `Would keep ${analysis.stats.verified} verified + ${shortfall} best unverified = ${minToKeep} total`,
          stats: {
            ...analysis.stats,
            toDelete: toDelete.length,
            wouldRemain: minToKeep,
          },
          wouldDelete: toDelete.slice(0, 20).map(({ investor }) => ({
            id: investor.id,
            name: investor.name,
            firm: investor.firm,
          })),
          wouldKeepUnverified: toKeep.slice(0, 10).map(({ investor, score }) => ({
            id: investor.id,
            name: investor.name,
            firm: investor.firm,
            score,
          })),
        };
        return successResponse(result);
      }

      // Actually delete
      const idsToDelete = toDelete.map(({ investor }) => investor.id);

      if (idsToDelete.length > 0) {
        // Delete in batches of 100
        for (let i = 0; i < idsToDelete.length; i += 100) {
          const batch = idsToDelete.slice(i, i + 100);
          const { error: deleteError } = await supabase
            .from('investors')
            .delete()
            .in('id', batch);

          if (deleteError) {
            console.error('Error deleting investors batch:', deleteError);
            throw new Error(`Failed to delete investors at batch ${i}`);
          }
        }
      }

      const result: CleanupResult = {
        dryRun: false,
        message: `Deleted ${idsToDelete.length} unverified investors. ${minToKeep} investors remain.`,
        deleted: idsToDelete.length,
        remaining: minToKeep,
      };
      return successResponse(result);
    }

    // We have enough verified, delete all unverified
    const idsToDelete = analysis.unverified.map(inv => inv.id);

    if (dryRun) {
      const result: CleanupResult = {
        dryRun: true,
        message: `Would delete ${idsToDelete.length} unverified investors. ${analysis.stats.verified} verified would remain.`,
        stats: analysis.stats,
        wouldDelete: analysis.unverified.slice(0, 20).map(inv => ({
          id: inv.id,
          name: inv.name,
          firm: inv.firm,
          issues: analysis.verificationResults.get(inv.id)?.issues || [],
        })),
      };
      return successResponse(result);
    }

    // Actually delete
    if (idsToDelete.length > 0) {
      // Delete in batches of 100
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100);
        const { error: deleteError } = await supabase
          .from('investors')
          .delete()
          .in('id', batch);

        if (deleteError) {
          console.error('Error deleting investors batch:', deleteError);
          throw new Error(`Failed to delete investors at batch ${i}`);
        }
      }
    }

    const result: CleanupResult = {
      dryRun: false,
      message: `Deleted ${idsToDelete.length} unverified investors. ${analysis.stats.verified} verified investors remain.`,
      deleted: idsToDelete.length,
      remaining: analysis.stats.verified,
    };
    return successResponse(result);
  });
}
