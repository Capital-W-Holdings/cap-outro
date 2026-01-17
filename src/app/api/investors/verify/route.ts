import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utils';

// LinkedIn URL validation patterns
const VALID_LINKEDIN_PATTERNS = [
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
  /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/,
];

// Generic/fake LinkedIn URLs to flag
const SUSPICIOUS_LINKEDIN_PATTERNS = [
  /linkedin\.com\/in\/example/i,
  /linkedin\.com\/in\/test/i,
  /linkedin\.com\/in\/demo/i,
  /linkedin\.com\/in\/investor/i,
  /linkedin\.com\/in\/sample/i,
  /linkedin\.com\/in\/user/i,
  /linkedin\.com\/in\/profile/i,
  /linkedin\.com\/company\//i, // Company pages, not person profiles
];

// Generic/fake email patterns
const FAKE_EMAIL_PATTERNS = [
  /@example\.com$/i,
  /@test\.com$/i,
  /@demo\.com$/i,
  /@placeholder\.com$/i,
  /@fake\.com$/i,
  /^test@/i,
  /^demo@/i,
  /^example@/i,
  /^info@/i, // Generic info@ often not for individuals
  /^contact@/i, // Generic contact@
  /^hello@/i, // Generic hello@
  /^admin@/i, // Generic admin@
  /^support@/i, // Generic support@
  /^noreply@/i, // No-reply addresses
];

interface VerificationStats {
  total_investors: number;
  with_email: number;
  with_linkedin: number;
  verified_emails: number;
  unverified_emails: number;
  valid_linkedin_format: number;
  invalid_linkedin_format: number;
  suspicious_linkedin: number;
  suspicious_emails: number;
}

function isValidLinkedInUrl(url: string | null): boolean {
  if (!url) return false;
  return VALID_LINKEDIN_PATTERNS.some(pattern => pattern.test(url));
}

function isSuspiciousLinkedIn(url: string | null): boolean {
  if (!url) return false;
  return SUSPICIOUS_LINKEDIN_PATTERNS.some(pattern => pattern.test(url));
}

function isSuspiciousEmail(email: string | null): boolean {
  if (!email) return false;
  return FAKE_EMAIL_PATTERNS.some(pattern => pattern.test(email));
}

// GET /api/investors/verify - Audit current verification status
export async function GET() {
  try {
    await requireAuth();

    const supabase = createServiceClient();

    // Fetch all investors with contact info
    // Note: email_verified and linkedin_verified may not exist if migration hasn't run
    const { data: investors, error } = await supabase
      .from('investors')
      .select('id, name, email, linkedin_url');

    if (error) {
      console.error('Error fetching investors:', error);
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
    }

    if (!investors) {
      return NextResponse.json({ stats: null, message: 'No investors found' });
    }

    // Analyze verification status
    const stats: VerificationStats = {
      total_investors: investors.length,
      with_email: 0,
      with_linkedin: 0,
      verified_emails: 0,
      unverified_emails: 0,
      valid_linkedin_format: 0,
      invalid_linkedin_format: 0,
      suspicious_linkedin: 0,
      suspicious_emails: 0,
    };

    const invalidLinkedIns: Array<{ id: string; name: string; linkedin_url: string }> = [];
    const suspiciousLinkedIns: Array<{ id: string; name: string; linkedin_url: string }> = [];
    const suspiciousEmails: Array<{ id: string; name: string; email: string }> = [];
    const unverifiedEmails: Array<{ id: string; name: string; email: string }> = [];

    for (const investor of investors) {
      // Email analysis
      if (investor.email) {
        stats.with_email++;

        // Without verification columns, all emails are "unverified"
        stats.unverified_emails++;
        unverifiedEmails.push({
          id: investor.id,
          name: investor.name,
          email: investor.email,
        });

        if (isSuspiciousEmail(investor.email)) {
          stats.suspicious_emails++;
          suspiciousEmails.push({
            id: investor.id,
            name: investor.name,
            email: investor.email,
          });
        }
      }

      // LinkedIn analysis
      if (investor.linkedin_url) {
        stats.with_linkedin++;

        if (isValidLinkedInUrl(investor.linkedin_url)) {
          stats.valid_linkedin_format++;
        } else {
          stats.invalid_linkedin_format++;
          invalidLinkedIns.push({
            id: investor.id,
            name: investor.name,
            linkedin_url: investor.linkedin_url,
          });
        }

        if (isSuspiciousLinkedIn(investor.linkedin_url)) {
          stats.suspicious_linkedin++;
          suspiciousLinkedIns.push({
            id: investor.id,
            name: investor.name,
            linkedin_url: investor.linkedin_url,
          });
        }
      }
    }

    return NextResponse.json({
      stats,
      samples: {
        invalidLinkedIns: invalidLinkedIns.slice(0, 20),
        suspiciousLinkedIns: suspiciousLinkedIns.slice(0, 20),
        suspiciousEmails: suspiciousEmails.slice(0, 20),
        unverifiedEmails: unverifiedEmails.slice(0, 20),
      },
      recommendations: {
        cleanInvalidLinkedIns: invalidLinkedIns.length > 0,
        cleanSuspiciousLinkedIns: suspiciousLinkedIns.length > 0,
        cleanSuspiciousEmails: suspiciousEmails.length > 0,
        verifyUnverifiedEmails: stats.unverified_emails > 0,
      },
    });
  } catch (error) {
    console.error('Verification audit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/investors/verify - Clean up unverified/invalid contacts
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const {
      action = 'audit', // 'audit' | 'clean_invalid_linkedin' | 'clean_suspicious_linkedin' | 'clean_suspicious_emails' | 'clean_all'
      dryRun = true,
    } = body;

    const supabase = createServiceClient();

    // Fetch all investors
    const { data: investors, error } = await supabase
      .from('investors')
      .select('id, name, email, linkedin_url');

    if (error || !investors) {
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
    }

    let toUpdate: Array<{ id: string; updates: Record<string, unknown> }> = [];

    switch (action) {
      case 'clean_invalid_linkedin':
        // Remove invalid LinkedIn URLs (not proper format)
        for (const inv of investors) {
          if (inv.linkedin_url && !isValidLinkedInUrl(inv.linkedin_url)) {
            toUpdate.push({
              id: inv.id,
              updates: { linkedin_url: null },
            });
          }
        }
        break;

      case 'clean_suspicious_linkedin':
        // Remove suspicious/placeholder LinkedIn URLs
        for (const inv of investors) {
          if (inv.linkedin_url && isSuspiciousLinkedIn(inv.linkedin_url)) {
            toUpdate.push({
              id: inv.id,
              updates: { linkedin_url: null },
            });
          }
        }
        break;

      case 'clean_suspicious_emails':
        // Remove suspicious/fake emails
        for (const inv of investors) {
          if (inv.email && isSuspiciousEmail(inv.email)) {
            toUpdate.push({
              id: inv.id,
              updates: { email: null },
            });
          }
        }
        break;

      case 'clean_unverified_emails':
        // Remove ALL unverified emails (since we can't verify without Hunter)
        // This will remove all emails that weren't enriched through Hunter
        for (const inv of investors) {
          if (inv.email) {
            toUpdate.push({
              id: inv.id,
              updates: { email: null },
            });
          }
        }
        break;

      case 'clean_all':
        // Clean all invalid/suspicious contacts
        for (const inv of investors) {
          const updates: Record<string, unknown> = {};

          if (inv.linkedin_url && (!isValidLinkedInUrl(inv.linkedin_url) || isSuspiciousLinkedIn(inv.linkedin_url))) {
            updates.linkedin_url = null;
          }

          if (inv.email && isSuspiciousEmail(inv.email)) {
            updates.email = null;
          }

          if (Object.keys(updates).length > 0) {
            toUpdate.push({ id: inv.id, updates });
          }
        }
        break;

      case 'delete_no_contact':
        // Delete investors with no email AND no LinkedIn
        const toDelete: string[] = [];
        for (const inv of investors) {
          if (!inv.email && !inv.linkedin_url) {
            toDelete.push(inv.id);
          }
        }

        if (dryRun) {
          const samplesToDelete = toDelete.slice(0, 20).map(id => {
            const inv = investors.find((i: { id: string }) => i.id === id);
            return { id, name: inv?.name, firm: (inv as { firm?: string })?.firm };
          });
          return NextResponse.json({
            dryRun: true,
            action,
            wouldDelete: toDelete.length,
            samples: samplesToDelete,
          });
        }

        // Actually delete
        let deleted = 0;
        for (const id of toDelete) {
          const { error: deleteError } = await supabase
            .from('investors')
            .delete()
            .eq('id', id);

          if (!deleteError) {
            deleted++;
          }
        }

        return NextResponse.json({
          dryRun: false,
          action,
          deleted,
          total: toDelete.length,
          message: `Deleted ${deleted} investors with no contact info`,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        action,
        wouldUpdate: toUpdate.length,
        samples: toUpdate.slice(0, 20).map(u => ({
          id: u.id,
          investor: investors.find((i: { id: string }) => i.id === u.id)?.name,
          updates: u.updates,
        })),
      });
    }

    // Actually perform updates
    let updated = 0;
    for (const { id, updates } of toUpdate) {
      const { error: updateError } = await supabase
        .from('investors')
        .update(updates)
        .eq('id', id);

      if (!updateError) {
        updated++;
      }
    }

    return NextResponse.json({
      dryRun: false,
      action,
      updated,
      total: toUpdate.length,
      message: `Updated ${updated} of ${toUpdate.length} investors`,
    });
  } catch (error) {
    console.error('Verification cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
