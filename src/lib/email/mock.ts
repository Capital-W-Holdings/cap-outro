import type { EmailProvider, EmailOptions, SendResult } from './types';

/**
 * Mock email provider for development and testing
 * Logs emails to console instead of sending
 */
export class MockEmailProvider implements EmailProvider {
  private sentEmails: EmailOptions[] = [];

  async send(options: EmailOptions): Promise<SendResult> {
    // Log to console
    console.log('📧 Mock Email Sent:');
    console.log('  To:', Array.isArray(options.to) 
      ? options.to.map((r) => r.email).join(', ')
      : options.to.email
    );
    console.log('  Subject:', options.subject);
    console.log('  Tracking ID:', options.trackingId ?? 'none');
    console.log('---');

    // Store for inspection
    this.sentEmails.push(options);

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock message ID
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return {
      success: true,
      messageId,
    };
  }

  // For testing: get all sent emails
  getSentEmails(): EmailOptions[] {
    return this.sentEmails;
  }

  // For testing: clear sent emails
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}
