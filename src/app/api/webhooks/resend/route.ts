import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Resend webhook event types
type ResendEventType = 
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    headers?: {
      'X-Tracking-Id'?: string;
    };
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

// Verify webhook signature
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const body = await request.text();
    
    // Verify signature in production
    if (webhookSecret && webhookSecret !== 'demo') {
      const headersList = await headers();
      const signature = headersList.get('svix-signature');
      
      if (!verifySignature(body, signature, webhookSecret)) {
        console.error('Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body) as ResendWebhookPayload;
    const { type, data } = payload;
    const trackingId = data.headers?.['X-Tracking-Id'];

    console.log(`📨 Resend webhook: ${type}`, { 
      emailId: data.email_id, 
      trackingId 
    });

    // Handle different event types
    switch (type) {
      case 'email.sent':
        // Email was sent successfully
        // TODO: Update outreach status to 'sent'
        if (trackingId) {
          console.log(`Email sent: ${trackingId}`);
        }
        break;

      case 'email.delivered':
        // Email was delivered to recipient's mailbox
        if (trackingId) {
          console.log(`Email delivered: ${trackingId}`);
        }
        break;

      case 'email.bounced':
        // Email bounced
        // TODO: Update outreach status to 'bounced'
        if (trackingId) {
          console.log(`Email bounced: ${trackingId}`);
          // In production:
          // await supabase
          //   .from('outreach')
          //   .update({ status: 'bounced' })
          //   .eq('tracking_id', trackingId);
        }
        break;

      case 'email.opened':
        // Email was opened (pixel loaded)
        // Note: This is also tracked by our own /api/tracking/open endpoint
        if (trackingId) {
          console.log(`Email opened (Resend): ${trackingId}`);
        }
        break;

      case 'email.clicked':
        // Link was clicked
        // Note: This is also tracked by our own /api/tracking/click endpoint
        if (trackingId && data.click) {
          console.log(`Email link clicked (Resend): ${trackingId}`, data.click.link);
        }
        break;

      case 'email.complained':
        // Recipient marked as spam
        // TODO: Add to suppression list
        if (trackingId) {
          console.log(`Email marked as spam: ${trackingId}`);
        }
        break;

      case 'email.delivery_delayed':
        // Delivery is delayed
        if (trackingId) {
          console.log(`Email delivery delayed: ${trackingId}`);
        }
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Acknowledge OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, svix-id, svix-timestamp, svix-signature',
    },
  });
}
