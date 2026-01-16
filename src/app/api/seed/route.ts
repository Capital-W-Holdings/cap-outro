import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ALL_PUBLIC_INVESTORS,
  TIER1_VCS,
  SEED_STAGE_VCS,
  GROWTH_INVESTORS,
  PE_FIRMS,
  HEDGE_FUNDS,
  FAMILY_OFFICES,
  CORPORATE_VCS,
  ANGEL_INVESTORS,
  FINTECH_VCS,
  HEALTHCARE_VCS,
  AI_VCS,
  CRYPTO_VCS,
  INVESTOR_COUNTS,
  type PublicInvestor,
} from '@/lib/enrichment/public-investor-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Map category to investor array
const CATEGORY_MAP: Record<string, PublicInvestor[]> = {
  all: ALL_PUBLIC_INVESTORS,
  tier1_vcs: TIER1_VCS,
  seed_stage: SEED_STAGE_VCS,
  growth: GROWTH_INVESTORS,
  pe: PE_FIRMS,
  hedge_funds: HEDGE_FUNDS,
  family_offices: FAMILY_OFFICES,
  cvcs: CORPORATE_VCS,
  angels: ANGEL_INVESTORS,
  fintech: FINTECH_VCS,
  healthcare: HEALTHCARE_VCS,
  ai: AI_VCS,
  crypto: CRYPTO_VCS,
};

/**
 * POST /api/seed - Seed database with public investor data
 *
 * All data sourced from publicly available information:
 * - SEC EDGAR 13F filings (sec.gov)
 * - OpenVC database (openvc.app)
 * - Company websites and press releases
 * - Crunchbase public data
 * - AngelList public profiles
 */
export async function POST(request: NextRequest) {
  try {
    const { category = 'all', orgId } = await request.json();

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    // Get investors for the selected category
    const investorsToSeed = CATEGORY_MAP[category] || ALL_PUBLIC_INVESTORS;

    // Convert to our investor format
    const investorRecords = investorsToSeed.map(inv => ({
      org_id: orgId,
      name: inv.name,
      firm: inv.firm,
      check_size_min: inv.checkSizeMin || null,
      check_size_max: inv.checkSizeMax || null,
      stages: inv.stages || [],
      sectors: inv.sectors || [],
      fit_score: calculateFitScore(inv),
      source: 'import' as const,
      linkedin_url: inv.linkedinUrl || null,
      email: inv.email || null,
      metadata: {
        type: inv.type,
        aum: inv.aum,
        cik: inv.cik,
        location: inv.location,
        website: inv.website,
        source: inv.source,
        sourceUrl: inv.sourceUrl,
        notable_investments: inv.notable_investments,
        imported_at: new Date().toISOString(),
      },
    }));

    // Upsert investors (avoid duplicates by name within org)
    let successCount = 0;
    const errors: string[] = [];

    // Insert in batches of 50
    for (let i = 0; i < investorRecords.length; i += 50) {
      const batch = investorRecords.slice(i, i + 50);

      const { error } = await supabase
        .from('investors')
        .upsert(batch, {
          onConflict: 'org_id,name',
          ignoreDuplicates: true,
        });

      if (error) {
        errors.push(error.message);
      } else {
        successCount += batch.length;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      count: successCount,
      category,
      message: `Seeded ${successCount} investors from ${category === 'all' ? 'all categories' : category}`,
      sources: [
        'SEC EDGAR 13F filings (sec.gov)',
        'OpenVC database (openvc.app)',
        'Company websites',
        'Crunchbase public data',
        'AngelList public profiles',
      ],
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed investors', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed - Get available seed data sources and counts
 */
export async function GET() {
  return NextResponse.json({
    categories: [
      { id: 'all', name: 'All Investors', count: INVESTOR_COUNTS.total, description: 'Complete database of all public investors' },
      { id: 'tier1_vcs', name: 'Tier 1 VCs', count: INVESTOR_COUNTS.tier1_vcs, description: 'Top Silicon Valley venture capital firms (Sequoia, a16z, Accel, etc.)' },
      { id: 'seed_stage', name: 'Seed Stage VCs', count: INVESTOR_COUNTS.seed_stage, description: 'Pre-seed and seed focused investors (First Round, Y Combinator, etc.)' },
      { id: 'growth', name: 'Growth Investors', count: INVESTOR_COUNTS.growth, description: 'Series B+ and growth stage investors (Insight, Tiger Global, etc.)' },
      { id: 'pe', name: 'Private Equity', count: INVESTOR_COUNTS.pe, description: 'Major PE firms (Blackstone, KKR, Carlyle, etc.)' },
      { id: 'hedge_funds', name: 'Hedge Funds', count: INVESTOR_COUNTS.hedge_funds, description: 'Hedge funds with VC/growth arms (Citadel, Two Sigma, etc.)' },
      { id: 'family_offices', name: 'Family Offices', count: INVESTOR_COUNTS.family_offices, description: 'Family offices and wealth managers' },
      { id: 'cvcs', name: 'Corporate VCs', count: INVESTOR_COUNTS.cvcs, description: 'Corporate venture arms (GV, Intel Capital, etc.)' },
      { id: 'angels', name: 'Angel Investors', count: INVESTOR_COUNTS.angels, description: 'Notable angel investors and super angels' },
      { id: 'fintech', name: 'Fintech Focused', count: INVESTOR_COUNTS.fintech, description: 'Fintech-specialized investors (Ribbit, QED, etc.)' },
      { id: 'healthcare', name: 'Healthcare/Bio', count: INVESTOR_COUNTS.healthcare, description: 'Healthcare and biotech investors (ARCH, Flagship, etc.)' },
      { id: 'ai', name: 'AI/ML Focused', count: INVESTOR_COUNTS.ai, description: 'AI and machine learning focused funds' },
      { id: 'crypto', name: 'Crypto/Web3', count: INVESTOR_COUNTS.crypto, description: 'Crypto and Web3 investors (a16z crypto, Paradigm, etc.)' },
    ],
    total: INVESTOR_COUNTS.total,
    sources: [
      { name: 'SEC EDGAR', url: 'https://www.sec.gov/cgi-bin/browse-edgar', description: '13F quarterly filings from institutional investors' },
      { name: 'OpenVC', url: 'https://openvc.app', description: 'Open database of VC firms and investors' },
      { name: 'Crunchbase', url: 'https://www.crunchbase.com', description: 'Public company and investor data' },
      { name: 'AngelList', url: 'https://angel.co', description: 'Angel investor profiles and investments' },
      { name: 'Company Websites', description: 'Direct from investor portfolio pages' },
    ],
    preview: {
      tier1: TIER1_VCS.slice(0, 5).map(formatPreview),
      seed: SEED_STAGE_VCS.slice(0, 5).map(formatPreview),
      growth: GROWTH_INVESTORS.slice(0, 5).map(formatPreview),
      angels: ANGEL_INVESTORS.slice(0, 5).map(formatPreview),
    },
  });
}

// Helper functions

function calculateFitScore(inv: PublicInvestor): number {
  let score = 50;

  // Type scoring
  if (inv.type === 'vc') score += 25;
  else if (inv.type === 'angel') score += 20;
  else if (inv.type === 'accelerator') score += 20;
  else if (inv.type === 'cvc') score += 15;
  else if (inv.type === 'family_office') score += 15;
  else if (inv.type === 'pe') score += 5;

  // AUM scoring (larger = more resources)
  if (inv.aum) {
    if (inv.aum > 50000000000) score += 10;
    else if (inv.aum > 10000000000) score += 7;
    else if (inv.aum > 1000000000) score += 5;
  }

  // Stage preference (early stage = higher score for startups)
  if (inv.stages.includes('seed') || inv.stages.includes('pre_seed')) {
    score += 5;
  }

  return Math.min(score, 100);
}

function formatPreview(inv: PublicInvestor) {
  return {
    name: inv.name,
    firm: inv.firm,
    type: inv.type,
    aum: inv.aum ? formatAUM(inv.aum) : null,
    stages: inv.stages.slice(0, 3),
    source: inv.source,
  };
}

function formatAUM(aum: number): string {
  if (aum >= 1000000000000) return `$${(aum / 1000000000000).toFixed(1)}T`;
  if (aum >= 1000000000) return `$${(aum / 1000000000).toFixed(1)}B`;
  if (aum >= 1000000) return `$${(aum / 1000000).toFixed(0)}M`;
  return `$${aum.toLocaleString()}`;
}
