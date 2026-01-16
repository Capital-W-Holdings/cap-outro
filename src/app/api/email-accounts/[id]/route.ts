import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { EmailAccount, ApiResponse } from '@/types';

// Lazy initialize Supabase client
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<EmailAccount>>> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Database not configured',
          },
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('email_accounts')
      .select('id, user_id, org_id, provider, email, name, is_default, status, daily_limit, emails_sent_today, last_used_at, created_at')
      .eq('id', params.id)
      .eq('org_id', MOCK_ORG_ID)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Email account not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching email account:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<EmailAccount>>> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Database not configured',
          },
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, is_default, status, daily_limit } = body;

    // If setting as default, unset other defaults first
    if (is_default === true) {
      await supabase
        .from('email_accounts')
        .update({ is_default: false })
        .eq('org_id', MOCK_ORG_ID)
        .neq('id', params.id);
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (status !== undefined) updateData.status = status;
    if (daily_limit !== undefined) updateData.daily_limit = daily_limit;

    const { data, error } = await supabase
      .from('email_accounts')
      .update(updateData)
      .eq('id', params.id)
      .eq('org_id', MOCK_ORG_ID)
      .select('id, user_id, org_id, provider, email, name, is_default, status, daily_limit, emails_sent_today, last_used_at, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Email account not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating email account:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Database not configured',
          },
        },
        { status: 500 }
      );
    }

    // Check if this is the default account
    const { data: account } = await supabase
      .from('email_accounts')
      .select('is_default')
      .eq('id', params.id)
      .eq('org_id', MOCK_ORG_ID)
      .single();

    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', params.id)
      .eq('org_id', MOCK_ORG_ID);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to disconnect email account',
          },
        },
        { status: 500 }
      );
    }

    // If deleted account was default, set another as default
    if (account?.is_default) {
      const { data: remaining } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('org_id', MOCK_ORG_ID)
        .limit(1)
        .single();

      if (remaining) {
        await supabase
          .from('email_accounts')
          .update({ is_default: true })
          .eq('id', remaining.id);
      }
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting email account:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
