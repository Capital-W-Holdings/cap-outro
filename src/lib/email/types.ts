export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  trackingId?: string;
  tags?: string[];
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<SendResult>;
}

// Template variables that can be interpolated
export interface TemplateVariables {
  investor_name?: string;
  investor_first_name?: string;
  investor_firm?: string;
  founder_name?: string;
  company_name?: string;
  raise_amount?: string;
  raise_type?: string;
  deck_url?: string;
  calendar_link?: string;
  [key: string]: string | undefined;
}
