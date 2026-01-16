import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Scopes needed for sending emails
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://capoutro.com';

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured. Please add GOOGLE_CLIENT_ID to environment variables.' },
      { status: 500 }
    );
  }

  // Generate a state token for security
  const state = crypto.randomUUID();

  // Store state in a cookie for verification
  const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/settings';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Always show consent to get refresh token
    state: state,
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Create response that redirects to Google
  const response = NextResponse.redirect(authUrl);

  // Store state and redirect URL in cookies
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  response.cookies.set('google_oauth_redirect', redirectUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}
