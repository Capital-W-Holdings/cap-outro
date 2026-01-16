import type { EmailProvider, EmailOptions, SendResult } from './types';

const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

interface GmailTokens {
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
}

export class GmailProvider implements EmailProvider {
  private accessToken: string;
  private refreshToken: string | null;
  private tokenExpiresAt: Date | null;
  private onTokenRefresh?: (tokens: { access_token: string; expires_at: string }) => Promise<void>;

  constructor(
    tokens: GmailTokens,
    onTokenRefresh?: (tokens: { access_token: string; expires_at: string }) => Promise<void>
  ) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiresAt = tokens.token_expires_at ? new Date(tokens.token_expires_at) : null;
    this.onTokenRefresh = onTokenRefresh;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return false;
    }

    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', await response.text());
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);

      // Notify caller of new tokens so they can be persisted
      if (this.onTokenRefresh) {
        await this.onTokenRefresh({
          access_token: this.accessToken,
          expires_at: this.tokenExpiresAt.toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return false;
    // Refresh 5 minutes before expiry
    return new Date() >= new Date(this.tokenExpiresAt.getTime() - 5 * 60 * 1000);
  }

  private async ensureValidToken(): Promise<boolean> {
    if (this.isTokenExpired()) {
      return await this.refreshAccessToken();
    }
    return true;
  }

  /**
   * Create a raw RFC 2822 email message
   */
  private createRawMessage(options: EmailOptions): string {
    const to = Array.isArray(options.to)
      ? options.to.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email)).join(', ')
      : options.to.name
      ? `${options.to.name} <${options.to.email}>`
      : options.to.email;

    const from = options.from
      ? options.from.name
        ? `${options.from.name} <${options.from.email}>`
        : options.from.email
      : '';

    const headers = [
      `To: ${to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
    ];

    if (from) {
      headers.unshift(`From: ${from}`);
    }

    if (options.replyTo) {
      const replyTo = options.replyTo.name
        ? `${options.replyTo.name} <${options.replyTo.email}>`
        : options.replyTo.email;
      headers.push(`Reply-To: ${replyTo}`);
    }

    // Add tracking header if provided
    if (options.trackingId) {
      headers.push(`X-Tracking-Id: ${options.trackingId}`);
    }

    const message = headers.join('\r\n') + '\r\n\r\n' + options.html;

    // Base64url encode the message
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async send(options: EmailOptions): Promise<SendResult> {
    // Ensure we have a valid token
    const tokenValid = await this.ensureValidToken();
    if (!tokenValid) {
      return {
        success: false,
        error: 'Failed to refresh authentication token. Please reconnect your Gmail account.',
      };
    }

    try {
      const rawMessage = this.createRawMessage(options);

      const response = await fetch(GMAIL_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: rawMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gmail API error:', errorData);

        // Check for specific errors
        if (response.status === 401) {
          // Try to refresh token and retry once
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.send(options);
          }
          return {
            success: false,
            error: 'Authentication expired. Please reconnect your Gmail account.',
          };
        }

        return {
          success: false,
          error: errorData.error?.message || `Gmail API error: ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error('Gmail send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }
}
