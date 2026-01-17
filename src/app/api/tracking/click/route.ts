import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const trackingId = request.nextUrl.searchParams.get('id');
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (trackingId) {
    try {
      const supabase = createServiceClient();

      // Update outreach record with click timestamp
      // Click status supersedes 'opened' and 'sent' but not 'replied'
      const { error } = await supabase
        .from('outreach')
        .update({
          status: 'clicked',
          clicked_at: new Date().toISOString(),
        })
        .eq('id', trackingId)
        .in('status', ['sent', 'opened']); // Don't downgrade from 'replied'

      if (error) {
        console.error('Error updating click tracking:', error);
      } else {
        console.log(`Link clicked: ${trackingId} -> ${targetUrl}`);
      }
    } catch (err) {
      console.error('Click tracking error:', err);
    }
  }

  // Redirect to original URL
  return NextResponse.redirect(targetUrl);
}
