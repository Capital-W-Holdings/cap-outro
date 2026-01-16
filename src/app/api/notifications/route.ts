import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Notification, ApiResponse, NotificationType } from '@/types';

// Lazy initialize Supabase client
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

// Mock user/org for development - in production this comes from auth
const MOCK_USER_ID = 'user_1';
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Generate notifications from actual activity
async function generateNotifications(supabase: SupabaseClient): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const now = new Date();

  // Get recent email opens (last 24 hours)
  const { data: recentOutreach } = await supabase
    .from('outreach')
    .select(`
      id,
      opened_at,
      replied_at,
      status,
      investor:investors(name, firm)
    `)
    .eq('org_id', MOCK_ORG_ID)
    .gte('opened_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
    .order('opened_at', { ascending: false })
    .limit(10);

  if (recentOutreach) {
    for (const outreach of recentOutreach) {
      // Supabase returns nested objects for joins
      const investorData = outreach.investor as unknown;
      const investor = investorData as { name: string; firm: string | null } | null;
      const investorName = investor?.name || 'An investor';
      const firmName = investor?.firm ? ` from ${investor.firm}` : '';

      if (outreach.replied_at) {
        notifications.push({
          id: `reply-${outreach.id}`,
          org_id: MOCK_ORG_ID,
          user_id: MOCK_USER_ID,
          type: 'email_replied',
          title: 'Email Reply Received',
          message: `${investorName}${firmName} replied to your email`,
          link: `/pipeline`,
          metadata: { outreach_id: outreach.id },
          is_read: false,
          created_at: outreach.replied_at,
        });
      } else if (outreach.opened_at) {
        notifications.push({
          id: `open-${outreach.id}`,
          org_id: MOCK_ORG_ID,
          user_id: MOCK_USER_ID,
          type: 'email_opened',
          title: 'Email Opened',
          message: `${investorName}${firmName} opened your email`,
          link: `/pipeline`,
          metadata: { outreach_id: outreach.id },
          is_read: false,
          created_at: outreach.opened_at,
        });
      }
    }
  }

  // Get recent pipeline stage changes
  const { data: recentPipelineChanges } = await supabase
    .from('pipeline')
    .select(`
      id,
      stage,
      updated_at,
      investor:investors(name, firm)
    `)
    .eq('org_id', MOCK_ORG_ID)
    .in('stage', ['meeting_scheduled', 'meeting_held', 'dd', 'term_sheet', 'committed'])
    .gte('updated_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('updated_at', { ascending: false })
    .limit(5);

  if (recentPipelineChanges) {
    const stageLabels: Record<string, string> = {
      meeting_scheduled: 'Meeting scheduled',
      meeting_held: 'Meeting completed',
      dd: 'Due diligence started',
      term_sheet: 'Term sheet received',
      committed: 'Commitment received',
    };

    for (const entry of recentPipelineChanges) {
      const investorData = entry.investor as unknown;
      const investor = investorData as { name: string; firm: string | null } | null;
      const investorName = investor?.name || 'An investor';
      const firmName = investor?.firm ? ` (${investor.firm})` : '';

      notifications.push({
        id: `pipeline-${entry.id}`,
        org_id: MOCK_ORG_ID,
        user_id: MOCK_USER_ID,
        type: 'stage_changed',
        title: stageLabels[entry.stage] || 'Stage Updated',
        message: `${investorName}${firmName}`,
        link: `/pipeline`,
        metadata: { pipeline_id: entry.id, stage: entry.stage },
        is_read: false,
        created_at: entry.updated_at,
      });
    }
  }

  // Get recent campaigns started
  const { data: recentCampaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, created_at')
    .eq('org_id', MOCK_ORG_ID)
    .eq('status', 'active')
    .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(3);

  if (recentCampaigns) {
    for (const campaign of recentCampaigns) {
      notifications.push({
        id: `campaign-${campaign.id}`,
        org_id: MOCK_ORG_ID,
        user_id: MOCK_USER_ID,
        type: 'campaign_started',
        title: 'Campaign Started',
        message: `"${campaign.name}" is now active`,
        link: `/campaigns`,
        metadata: { campaign_id: campaign.id },
        is_read: false,
        created_at: campaign.created_at,
      });
    }
  }

  // Sort all notifications by created_at (most recent first)
  notifications.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return notifications.slice(0, 20); // Return max 20 notifications
}

export async function GET(): Promise<NextResponse<ApiResponse<Notification[]>>> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Return sample notifications when database isn't configured
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const notifications = await generateNotifications(supabase);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const body = await request.json();
    const { notification_ids, mark_all_read } = body as {
      notification_ids?: string[];
      mark_all_read?: boolean
    };

    // In a full implementation, we'd store read states in a separate table
    // For now, just acknowledge the request
    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notifications',
        },
      },
      { status: 500 }
    );
  }
}

// Create a notification (for internal use / webhooks)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Notification>>> {
  try {
    const body = await request.json();
    const { type, title, message, link, metadata } = body as {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      metadata?: Record<string, unknown>;
    };

    if (!type || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Type, title, and message are required',
          },
        },
        { status: 400 }
      );
    }

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      org_id: MOCK_ORG_ID,
      user_id: MOCK_USER_ID,
      type,
      title,
      message,
      link: link || null,
      metadata: metadata || {},
      is_read: false,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create notification',
        },
      },
      { status: 500 }
    );
  }
}
