import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/admin/check-platform-investors - Check and fix platform investor status
export async function GET() {
  try {
    const supabase = createServiceClient();

    // Count total investors
    const { count: total, error: totalError } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      return NextResponse.json({
        success: false,
        error: `Failed to count investors: ${totalError.message}`,
      }, { status: 500 });
    }

    // Count platform investors
    const { count: platformCount, error: platformError } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .eq('is_platform', true);

    if (platformError) {
      // Column might not exist
      return NextResponse.json({
        success: false,
        error: `is_platform column may not exist: ${platformError.message}`,
        hint: 'Run migration 003_user_investor_isolation.sql',
      }, { status: 500 });
    }

    // Count investors with no user_id (candidates for platform)
    const { count: nullUserCount, error: nullError } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);

    return NextResponse.json({
      success: true,
      data: {
        total: total ?? 0,
        platform_investors: platformCount ?? 0,
        null_user_investors: nullUserCount ?? 0,
        message: (platformCount ?? 0) > 0
          ? `Found ${platformCount} platform investors`
          : 'No platform investors found. Run POST to mark existing investors as platform.',
      },
    });
  } catch (error) {
    console.error('Check platform investors error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST /api/admin/check-platform-investors - Mark existing investors as platform
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json().catch(() => ({}));
    const { dryRun = true } = body;

    // Find investors with no user_id that aren't marked as platform
    const { data: candidates, error: findError } = await supabase
      .from('investors')
      .select('id, name, firm')
      .is('user_id', null)
      .eq('is_platform', false)
      .limit(100);

    if (findError) {
      return NextResponse.json({
        success: false,
        error: `Failed to find candidates: ${findError.message}`,
      }, { status: 500 });
    }

    const candidateCount = candidates?.length ?? 0;

    if (candidateCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No investors to mark as platform',
      });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Would mark ${candidateCount} investors as platform (first 100)`,
        sample: candidates?.slice(0, 10),
      });
    }

    // Mark all investors with null user_id as platform
    const { data: updated, error: updateError } = await supabase
      .from('investors')
      .update({ is_platform: true })
      .is('user_id', null)
      .eq('is_platform', false)
      .select('id');

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: `Failed to update: ${updateError.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${updated?.length ?? 0} investors as platform`,
    });
  } catch (error) {
    console.error('Mark platform investors error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
