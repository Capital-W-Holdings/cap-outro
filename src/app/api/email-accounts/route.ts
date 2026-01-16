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

// Mock user/org for development - in production this comes from auth
const MOCK_USER_ID = 'user_1';
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(): Promise<NextResponse<ApiResponse<EmailAccount[]>>> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const { data, error } = await supabase
      .from('email_accounts')
      .select('id, user_id, org_id, provider, email, name, is_default, status, daily_limit, emails_sent_today, last_used_at, created_at')
      .eq('org_id', MOCK_ORG_ID)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet, return empty array
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<EmailAccount>>> {
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
    const { provider, email, name, access_token, refresh_token, token_expires_at } = body;

    if (!provider || !email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider and email are required',
          },
        },
        { status: 400 }
      );
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('org_id', MOCK_ORG_ID)
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'This email account is already connected',
          },
        },
        { status: 400 }
      );
    }

    // Check if this should be the default (first account)
    const { count } = await supabase
      .from('email_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', MOCK_ORG_ID);

    const isDefault = (count ?? 0) === 0;

    const { data, error } = await supabase
      .from('email_accounts')
      .insert({
        user_id: MOCK_USER_ID,
        org_id: MOCK_ORG_ID,
        provider,
        email,
        name: name || email.split('@')[0],
        is_default: isDefault,
        status: 'active',
        daily_limit: provider === 'gmail' ? 500 : provider === 'outlook' ? 300 : 1000,
        emails_sent_today: 0,
        access_token,
        refresh_token,
        token_expires_at,
      })
      .select('id, user_id, org_id, provider, email, name, is_default, status, daily_limit, emails_sent_today, last_used_at, created_at')
      .single();

    if (error) {
      console.error('Error creating email account:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to connect email account',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error creating email account:', error);
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
