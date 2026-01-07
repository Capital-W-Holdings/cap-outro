import type { EmailProvider, EmailOptions, SendResult } from './types';

const RESEND_API_URL = 'https://api.resend.com/emails';

export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom?: string) {
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom ?? 'Cap Outro <noreply@capoutro.com>';
  }

  async send(options: EmailOptions): Promise<SendResult> {
    try {
      const to = Array.isArray(options.to) 
        ? options.to.map((r) => r.name ? `${r.name} <${r.email}>` : r.email)
        : [options.to.name ? `${options.to.name} <${options.to.email}>` : options.to.email];

      const from = options.from 
        ? `${options.from.name ?? ''} <${options.from.email}>`.trim()
        : this.defaultFrom;

      const body: Record<string, unknown> = {
        from,
        to,
        subject: options.subject,
        html: options.html,
      };

      if (options.text) {
        body.text = options.text;
      }

      if (options.replyTo) {
        body.reply_to = options.replyTo.name 
          ? `${options.replyTo.name} <${options.replyTo.email}>`
          : options.replyTo.email;
      }

      if (options.tags && options.tags.length > 0) {
        body.tags = options.tags.map((tag) => ({ name: tag, value: 'true' }));
      }

      // Add tracking headers if trackingId provided
      if (options.trackingId) {
        body.headers = {
          'X-Tracking-Id': options.trackingId,
        };
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json() as { id?: string; message?: string };

      if (!response.ok) {
        return {
          success: false,
          error: data.message ?? `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
