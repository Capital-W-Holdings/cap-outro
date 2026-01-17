import { NextRequest, NextResponse } from 'next/server';
import { processSequenceEnrollments, getProcessingStats } from '@/lib/scheduler/sequence-processor';

/**
 * Verify the cron secret to ensure only Vercel Cron can call this endpoint
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development';
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/process-sequences - Get processing stats
 * Used for monitoring the queue status
 */
export async function GET(request: NextRequest) {
  // This endpoint can be called without auth for monitoring
  try {
    const stats = await getProcessingStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get processing stats',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/process-sequences - Process due sequence enrollments
 * This is called by Vercel Cron every 5 minutes
 */
export async function POST(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    const result = await processSequenceEnrollments();
    const duration = Date.now() - startTime;

    console.log(`Sequence processor completed in ${duration}ms:`, {
      processed: result.processed,
      sent: result.sent,
      errors: result.errors,
    });

    return NextResponse.json({
      success: true,
      data: {
        processed: result.processed,
        sent: result.sent,
        errors: result.errors,
        duration_ms: duration,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Sequence processor error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}
