import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { adaptCsv, type InvestorSource } from '@/lib/enrichment';

interface ImportRequest {
  csvContent: string;
  source: InvestorSource;
  filename: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { csvContent, source, filename } = body;

    if (!csvContent || !source || !filename) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: csvContent, source, filename' },
        { status: 400 }
      );
    }

    // Parse CSV
    const result = adaptCsv(csvContent, source);

    if (!result.success || result.investors.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse CSV',
          details: result.errors,
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // For demo: use a default org ID (in production, get from authenticated user)
    // First, get or create a demo organization
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'demo-org')
      .single();

    let orgId: string;

    if (existingOrg) {
      orgId = existingOrg.id;
    } else {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Demo Organization',
          slug: 'demo-org',
          plan: 'free',
        })
        .select('id')
        .single();

      if (orgError) {
        console.error('Failed to create org:', orgError);
        return NextResponse.json(
          { success: false, error: 'Failed to create organization' },
          { status: 500 }
        );
      }

      orgId = newOrg!.id;
    }

    // Create import batch record
    const { data: batch, error: batchError } = await supabase
      .from('import_batch')
      .insert({
        org_id: orgId,
        source,
        filename,
        total_rows: result.stats.totalRows,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (batchError) {
      console.error('Failed to create import batch:', batchError);
      return NextResponse.json(
        { success: false, error: 'Failed to create import batch' },
        { status: 500 }
      );
    }

    const batchId = batch!.id;

    // Process investors
    const investorsToInsert: Array<{
      org_id: string;
      name: string;
      email: string | null;
      firm: string | null;
      linkedin_url: string | null;
      source: string;
      metadata: Record<string, unknown>;
    }> = [];

    const rawRecordsToInsert: Array<{
      org_id: string;
      source: string;
      source_id: string;
      raw_name: string;
      raw_firm: string | null;
      raw_email: string | null;
      raw_linkedin_url: string | null;
      raw_metadata: Record<string, string>;
      import_batch_id: string;
    }> = [];

    for (const investor of result.investors) {
      // Check for duplicate by email or name+firm
      let existingInvestor = null;

      if (investor.email) {
        const { data } = await supabase
          .from('investors')
          .select('id')
          .eq('org_id', orgId)
          .eq('email', investor.email)
          .single();
        existingInvestor = data;
      }

      if (!existingInvestor && investor.firm) {
        const { data } = await supabase
          .from('investors')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', investor.name)
          .eq('firm', investor.firm)
          .single();
        existingInvestor = data;
      }

      if (!existingInvestor) {
        investorsToInsert.push({
          org_id: orgId,
          name: investor.name,
          email: investor.email,
          firm: investor.firm,
          linkedin_url: investor.linkedinUrl,
          source,
          metadata: {
            imported_at: new Date().toISOString(),
            import_batch_id: batchId,
            investor_type: investor.investorType,
          },
        });
      }

      // Always store raw record
      rawRecordsToInsert.push({
        org_id: orgId,
        source,
        source_id: investor.sourceId,
        raw_name: investor.name,
        raw_firm: investor.firm,
        raw_email: investor.email,
        raw_linkedin_url: investor.linkedinUrl,
        raw_metadata: investor.rawMetadata,
        import_batch_id: batchId,
      });
    }

    // Insert investors in batches
    let insertedCount = 0;
    let duplicateCount = result.investors.length - investorsToInsert.length;

    if (investorsToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('investors')
        .insert(investorsToInsert)
        .select('id');

      if (insertError) {
        console.error('Failed to insert investors:', insertError);
      } else {
        insertedCount = inserted?.length || 0;
      }
    }

    // Insert raw records (ignore duplicates)
    if (rawRecordsToInsert.length > 0) {
      const { error: rawError } = await supabase
        .from('investor_raw')
        .insert(rawRecordsToInsert)
        .select('id');

      if (rawError) {
        console.error('Failed to insert raw records:', rawError);
        // Non-fatal - continue
      }
    }

    // Update batch status
    await supabase
      .from('import_batch')
      .update({
        status: 'completed',
        processed_rows: result.stats.validRows,
        error_rows: result.stats.invalidRows,
        duplicate_rows: duplicateCount,
        completed_at: new Date().toISOString(),
        error_log: result.errors.length > 0 ? result.errors : null,
      })
      .eq('id', batchId);

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        stats: {
          totalRows: result.stats.totalRows,
          validRows: result.stats.validRows,
          invalidRows: result.stats.invalidRows,
          inserted: insertedCount,
          duplicates: duplicateCount,
        },
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get import batches
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('import_batch')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch import batches:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch import batches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Get batches error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
