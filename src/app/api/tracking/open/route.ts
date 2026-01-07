import { NextRequest, NextResponse } from 'next/server';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const trackingId = request.nextUrl.searchParams.get('id');

  if (trackingId) {
    // TODO: Update outreach record with open timestamp
    // In production:
    // const supabase = createServiceClient();
    // await supabase
    //   .from('outreach')
    //   .update({ 
    //     status: 'opened',
    //     opened_at: new Date().toISOString() 
    //   })
    //   .eq('tracking_id', trackingId)
    //   .is('opened_at', null); // Only update if not already opened

    console.log(`📬 Email opened: ${trackingId}`);
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
