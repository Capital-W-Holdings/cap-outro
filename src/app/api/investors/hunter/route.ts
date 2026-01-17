import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { HunterClient, getDomainForFirm, parseName } from '@/lib/hunter';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

// POST /api/investors/hunter - Enrich investor(s) with contact data from Hunter.io
export async function POST(request: NextRequest) {
  try {
    if (!HUNTER_API_KEY) {
      return NextResponse.json(
        { error: 'Hunter.io API key not configured. Add HUNTER_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { investor_ids, limit = 10 } = body;

    if (!investor_ids || !Array.isArray(investor_ids) || investor_ids.length === 0) {
      return NextResponse.json(
        { error: 'investor_ids array is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const hunter = new HunterClient(HUNTER_API_KEY);

    // Get investors to enrich
    const { data: investors, error: fetchError } = await supabase
      .from('investors')
      .select('id, name, firm, email, linkedin_url')
      .in('id', investor_ids.slice(0, limit));

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
    }

    const results: Array<{
      id: string;
      name: string;
      success: boolean;
      email?: string;
      linkedin_url?: string;
      error?: string;
    }> = [];

    // Enrich each investor
    for (const investor of investors || []) {
      // Skip if already has email
      if (investor.email) {
        results.push({
          id: investor.id,
          name: investor.name,
          success: true,
          email: investor.email,
          linkedin_url: investor.linkedin_url,
        });
        continue;
      }

      // Get domain for the firm
      const domain = getDomainForFirm(investor.firm || '');
      if (!domain) {
        results.push({
          id: investor.id,
          name: investor.name,
          success: false,
          error: `No domain mapping for firm: ${investor.firm}`,
        });
        continue;
      }

      // Parse name
      const { firstName, lastName } = parseName(investor.name);

      // Find email using Hunter.io
      const enrichResult = await hunter.findEmail(firstName, lastName, domain);

      if (enrichResult.success && enrichResult.email) {
        // Update investor in database - mark as verified since it came from Hunter
        const updateData: Record<string, unknown> = {
          email: enrichResult.email,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          email_verification_source: 'hunter',
        };

        // Also update LinkedIn if found and not already set
        if (enrichResult.linkedin_url && !investor.linkedin_url) {
          updateData.linkedin_url = enrichResult.linkedin_url;
          updateData.linkedin_verified = true;
          updateData.linkedin_verified_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('investors')
          .update(updateData)
          .eq('id', investor.id);

        results.push({
          id: investor.id,
          name: investor.name,
          success: !updateError,
          email: enrichResult.email,
          linkedin_url: enrichResult.linkedin_url || investor.linkedin_url,
          error: updateError?.message,
        });
      } else {
        results.push({
          id: investor.id,
          name: investor.name,
          success: false,
          error: enrichResult.error || 'Email not found',
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Get account info
    const accountInfo = await hunter.getAccountInfo();

    return NextResponse.json({
      success: true,
      results,
      enriched: results.filter((r) => r.success && r.email).length,
      failed: results.filter((r) => !r.success).length,
      remaining_searches: accountInfo?.remaining,
    });
  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/investors/hunter - Get enrichment status and remaining searches
export async function GET() {
  try {
    if (!HUNTER_API_KEY) {
      return NextResponse.json({
        configured: false,
        message: 'Hunter.io API key not configured. Add HUNTER_API_KEY to environment variables.',
      });
    }

    const hunter = new HunterClient(HUNTER_API_KEY);
    const accountInfo = await hunter.getAccountInfo();

    const supabase = createServiceClient();

    // Count investors needing enrichment (no email)
    const { count: needsEnrichment } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .is('email', null);

    const { count: hasEmail } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);

    const { count: hasLinkedIn } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .not('linkedin_url', 'is', null);

    return NextResponse.json({
      configured: true,
      remaining_searches: accountInfo?.remaining || 0,
      total_used: accountInfo?.total || 0,
      stats: {
        investors_needing_enrichment: needsEnrichment || 0,
        investors_with_email: hasEmail || 0,
        investors_with_linkedin: hasLinkedIn || 0,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
