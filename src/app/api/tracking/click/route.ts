import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const trackingId = request.nextUrl.searchParams.get('id');
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (trackingId) {
    // TODO: Update outreach record with click timestamp
    // In production:
    // const supabase = createServiceClient();
    // await supabase
    //   .from('outreach')
    //   .update({ 
    //     status: 'clicked',
    //     clicked_at: new Date().toISOString() 
    //   })
    //   .eq('tracking_id', trackingId);

    console.log(`🔗 Link clicked: ${trackingId} -> ${targetUrl}`);
  }

  // Redirect to original URL
  return NextResponse.redirect(targetUrl);
}
