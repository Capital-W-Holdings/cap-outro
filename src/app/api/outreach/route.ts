import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import { sendEmail, prepareTrackedEmail, GmailProvider } from '@/lib/email';
import { createServiceClient } from '@/lib/supabase/server';
import type { Outreach, OutreachStatus, EmailProvider } from '@/types';
import { z } from 'zod';

// Mock data for MVP (used when database isn't available)
const mockOutreach: Outreach[] = [];

const createOutreachSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  investor_id: z.string().uuid('Invalid investor ID'),
  sequence_id: z.string().uuid().optional(),
  step_id: z.string().uuid().optional(),
  type: z.enum(['email', 'linkedin', 'call', 'meeting', 'intro_request']),
  content: z.string().min(1, 'Content is required').max(10000),
  subject: z.string().max(200).optional(),
  scheduled_at: z.string().datetime().optional(),
  send_now: z.boolean().optional(),
  email_account_id: z.string().uuid().optional(),
});

function validateCreateOutreach(data: unknown) {
  const result = createOutreachSchema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    });
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// GET /api/outreach - List outreach (filtered by campaign, investor, or status)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign_id');
    const investorId = searchParams.get('investor_id');
    const status = searchParams.get('status') as OutreachStatus | null;

    let filtered = mockOutreach;
    
    if (campaignId) {
      filtered = filtered.filter((o) => o.campaign_id === campaignId);
    }
    if (investorId) {
      filtered = filtered.filter((o) => o.investor_id === investorId);
    }
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    return successResponse(filtered, {
      page: 1,
      limit: 50,
      total: filtered.length,
    });
  });
}

// POST /api/outreach - Create and optionally send outreach
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateOutreach);
    const supabase = createServiceClient();

    const trackingId = crypto.randomUUID();

    // Get the investor to get their email
    let investorEmail: string | null = null;
    let investorName: string | null = null;

    const { data: investor } = await supabase
      .from('investors')
      .select('email, name')
      .eq('id', body.investor_id)
      .single();

    if (investor) {
      investorEmail = investor.email;
      investorName = investor.name;
    }

    // Get the email account for sending
    let fromEmail: string | null = null;
    let fromName: string | null = null;
    let emailAccountId: string | null = null;
    let emailAccountProvider: EmailProvider | null = null;
    let emailAccountTokens: { access_token: string; refresh_token: string | null; token_expires_at: string | null } | null = null;

    if (body.email_account_id) {
      const { data: emailAccount } = await supabase
        .from('email_accounts')
        .select('id, email, name, provider, emails_sent_today, daily_limit, access_token, refresh_token, token_expires_at')
        .eq('id', body.email_account_id)
        .single();

      if (emailAccount) {
        fromEmail = emailAccount.email;
        fromName = emailAccount.name;
        emailAccountId = emailAccount.id;
        emailAccountProvider = emailAccount.provider as EmailProvider;

        if (emailAccount.access_token) {
          emailAccountTokens = {
            access_token: emailAccount.access_token,
            refresh_token: emailAccount.refresh_token,
            token_expires_at: emailAccount.token_expires_at,
          };
        }

        // Check daily limit
        if (emailAccount.emails_sent_today >= emailAccount.daily_limit) {
          throw new ValidationError('Daily email limit reached for this account', {
            email_account_id: ['Daily limit reached'],
          });
        }
      }
    }

    const newOutreach: Outreach = {
      id: `outreach-${Date.now()}`,
      campaign_id: body.campaign_id,
      investor_id: body.investor_id,
      sequence_id: body.sequence_id ?? null,
      step_id: body.step_id ?? null,
      type: body.type,
      status: body.send_now ? 'sent' : 'scheduled',
      scheduled_at: body.scheduled_at ?? null,
      sent_at: body.send_now ? new Date().toISOString() : null,
      opened_at: null,
      replied_at: null,
      content: body.content,
      subject: body.subject ?? null,
      created_at: new Date().toISOString(),
    };

    // If sending now and it's an email, actually send it
    if (body.send_now && body.type === 'email') {
      if (!investorEmail) {
        throw new ValidationError('Investor does not have an email address', {
          investor_id: ['No email address found'],
        });
      }

      // Prepare email with tracking
      const trackedContent = prepareTrackedEmail(body.content, trackingId);

      const emailOptions = {
        to: { email: investorEmail, name: investorName ?? undefined },
        from: fromEmail ? { email: fromEmail, name: fromName ?? undefined } : undefined,
        subject: body.subject ?? 'No Subject',
        html: trackedContent,
        trackingId,
      };

      let result;

      // Use Gmail provider for Gmail accounts with OAuth tokens
      if (emailAccountProvider === 'gmail' && emailAccountTokens) {
        const gmailProvider = new GmailProvider(
          emailAccountTokens,
          async (newTokens) => {
            // Update tokens in database when refreshed
            if (emailAccountId) {
              await supabase
                .from('email_accounts')
                .update({
                  access_token: newTokens.access_token,
                  token_expires_at: newTokens.expires_at,
                })
                .eq('id', emailAccountId);
            }
          }
        );
        result = await gmailProvider.send(emailOptions);
      } else {
        // Use default Resend provider
        result = await sendEmail(emailOptions);
      }

      if (!result.success) {
        console.error('Failed to send email:', result.error);
        newOutreach.status = 'scheduled'; // Keep as scheduled if send failed
        newOutreach.sent_at = null;
      } else {
        // Update email account sent count
        if (emailAccountId) {
          const { data: currentAccount } = await supabase
            .from('email_accounts')
            .select('emails_sent_today')
            .eq('id', emailAccountId)
            .single();

          if (currentAccount) {
            await supabase
              .from('email_accounts')
              .update({
                emails_sent_today: currentAccount.emails_sent_today + 1,
                last_used_at: new Date().toISOString(),
              })
              .eq('id', emailAccountId);
          }
        }
      }
    }

    mockOutreach.push(newOutreach);

    return successResponse(newOutreach);
  });
}
