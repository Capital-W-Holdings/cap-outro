import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Mock org/user for development
const MOCK_USER_ID = 'user_1';
const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://capoutro.com';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Get query params
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  // Get cookies
  const storedState = request.cookies.get('google_oauth_state')?.value;
  const redirectUrl = request.cookies.get('google_oauth_redirect')?.value || '/settings';

  // Handle errors from Google
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Google authentication failed: ' + error)}`
    );
  }

  // Verify state
  if (!state || state !== storedState) {
    console.error('State mismatch:', { state, storedState });
    return NextResponse.redirect(
      `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Invalid state parameter')}`
    );
  }

  // Check for code
  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}${redirectUrl}?error=${encodeURIComponent('No authorization code received')}`
    );
  }

  // Check configuration
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Google OAuth not configured')}`
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Failed to exchange authorization code')}`
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Failed to get user info')}`
      );
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Store in database
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.redirect(
        `${baseUrl}${redirectUrl}?error=${encodeURIComponent('Database not configured')}`
      );
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('org_id', MOCK_ORG_ID)
      .eq('email', userInfo.email)
      .single();

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    if (existing) {
      // Update existing account
      await supabase
        .from('email_accounts')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokenExpiresAt,
          status: 'active',
          name: userInfo.name,
        })
        .eq('id', existing.id);
    } else {
      // Check if this should be default
      const { count } = await supabase
        .from('email_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', MOCK_ORG_ID);

      const isDefault = (count ?? 0) === 0;

      // Create new account
      await supabase.from('email_accounts').insert({
        user_id: MOCK_USER_ID,
        org_id: MOCK_ORG_ID,
        provider: 'gmail',
        email: userInfo.email,
        name: userInfo.name,
        is_default: isDefault,
        status: 'active',
        daily_limit: 500,
        emails_sent_today: 0,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokenExpiresAt,
      });
    }

    // Redirect back to settings with success message
    const response = NextResponse.redirect(
      `${baseUrl}${redirectUrl}?success=${encodeURIComponent(`Connected ${userInfo.email}`)}`
    );

    // Clear OAuth cookies
    response.cookies.delete('google_oauth_state');
    response.cookies.delete('google_oauth_redirect');

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      `${baseUrl}${redirectUrl}?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
}
