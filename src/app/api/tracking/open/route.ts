import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const trackingId = request.nextUrl.searchParams.get('id');

  if (trackingId) {
    try {
      const supabase = createServiceClient();

      // Update outreach record with open timestamp
      // Only update to 'opened' if current status is 'sent'
      // Don't downgrade from 'clicked' or 'replied'
      const { error } = await supabase
        .from('outreach')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', trackingId)
        .eq('status', 'sent'); // Only update if still in 'sent' status

      if (error) {
        console.error('Error updating open tracking:', error);
      } else {
        console.log(`Email opened: ${trackingId}`);
      }
    } catch (err) {
      console.error('Tracking error:', err);
    }
  }

  // Return tracking pixel
  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
