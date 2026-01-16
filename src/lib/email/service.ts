import type { EmailProvider, EmailOptions, SendResult, TemplateVariables } from './types';
import { ResendProvider } from './resend';
import { MockEmailProvider } from './mock';

let emailProvider: EmailProvider | null = null;

/**
 * Get the email provider instance
 * Uses Resend in production, Mock in development
 */
export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey && resendApiKey !== 'demo') {
      emailProvider = new ResendProvider(resendApiKey);
    } else {
      console.log('⚠️ Using mock email provider (no RESEND_API_KEY set)');
      emailProvider = new MockEmailProvider();
    }
  }
  
  return emailProvider;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  const provider = getEmailProvider();
  return provider.send(options);
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Interpolate template variables into content
 * Variables are wrapped in double curly braces: {{variable_name}}
 */
export function interpolateTemplate(
  content: string,
  variables: TemplateVariables
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      // Escape key to prevent ReDoS attacks from malicious variable names
      const escapedKey = escapeRegExp(key);
      const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
  }

  // Remove any remaining unmatched variables
  result = result.replace(/\{\{\s*\w+\s*\}\}/g, '');

  return result;
}

/**
 * Extract variable names from a template
 */
export function extractTemplateVariables(content: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (varName && !variables.includes(varName)) {
      variables.push(varName);
    }
  }
  
  return variables;
}

/**
 * Add tracking pixel to HTML email content
 */
export function addTrackingPixel(html: string, trackingId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const pixelUrl = `${baseUrl}/api/tracking/open?id=${trackingId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`;
  
  // Insert before closing body tag, or append if no body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  
  return html + pixel;
}

/**
 * Wrap links for click tracking
 */
export function wrapLinksForTracking(html: string, trackingId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  
  // Match href attributes
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  
  return html.replace(linkRegex, (_match, url) => {
    const trackedUrl = `${baseUrl}/api/tracking/click?id=${trackingId}&url=${encodeURIComponent(url)}`;
    return `href="${trackedUrl}"`;
  });
}

/**
 * Prepare email content with tracking
 */
export function prepareTrackedEmail(
  html: string,
  trackingId: string,
  options: { trackOpens?: boolean; trackClicks?: boolean } = {}
): string {
  let result = html;
  
  if (options.trackOpens !== false) {
    result = addTrackingPixel(result, trackingId);
  }
  
  if (options.trackClicks !== false) {
    result = wrapLinksForTracking(result, trackingId);
  }
  
  return result;
}
