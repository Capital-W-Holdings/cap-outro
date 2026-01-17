// Core Entity Types

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'member';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type RaiseType = 'seed' | 'series_a' | 'series_b' | 'bridge' | 'note';
export type InvestorSource = 'import' | 'enrichment' | 'manual';
export type SequenceStatus = 'draft' | 'active' | 'paused';
export type StepType = 'email' | 'linkedin' | 'task' | 'wait';
export type OutreachType = 'email' | 'linkedin' | 'call' | 'meeting' | 'intro_request';
export type OutreachStatus = 'scheduled' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
export type PipelineStage = 
  | 'not_contacted' 
  | 'contacted' 
  | 'responded' 
  | 'meeting_scheduled' 
  | 'meeting_held' 
  | 'dd' 
  | 'term_sheet' 
  | 'committed' 
  | 'passed';
export type TemplateType = 'initial' | 'followup' | 'intro_request' | 'update';
export type RelationshipStrength = 'strong' | 'medium' | 'weak';
export type WarmPathSource = 'linkedin' | 'email' | 'manual';
export type EmailProvider = 'gmail' | 'outlook' | 'resend';
export type EmailAccountStatus = 'active' | 'disconnected' | 'error';
export type NotificationType =
  | 'email_opened'
  | 'email_replied'
  | 'email_bounced'
  | 'meeting_scheduled'
  | 'stage_changed'
  | 'campaign_started'
  | 'campaign_completed'
  | 'investor_added'
  | 'system';

export type ReferralStatus = 'pending' | 'signed_up' | 'converted' | 'expired';

// Referral
export interface Referral {
  id: string;
  org_id: string;
  referrer_user_id: string;
  code: string;
  email: string | null;
  name: string | null;
  status: ReferralStatus;
  signed_up_at: string | null;
  converted_at: string | null;
  reward_granted: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string | null;
}

// Organization
export interface OrganizationSettings {
  defaultTimezone?: string;
  emailSignature?: string;
  brandColor?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  settings: OrganizationSettings;
  created_at: string;
}

// User
export interface ConnectedAccount {
  provider: 'google' | 'linkedin';
  email: string;
  connected_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  name: string;
  role: UserRole;
  connected_accounts: ConnectedAccount[];
  created_at: string;
}

// Email Account (for sending emails)
export interface EmailAccount {
  id: string;
  user_id: string;
  org_id: string;
  provider: EmailProvider;
  email: string;
  name: string;
  is_default: boolean;
  status: EmailAccountStatus;
  daily_limit: number;
  emails_sent_today: number;
  last_used_at: string | null;
  access_token?: string; // Only returned when needed
  refresh_token?: string; // Only returned when needed
  token_expires_at?: string;
  created_at: string;
}

export interface EmailAccountStats {
  emails_sent_today: number;
  emails_sent_week: number;
  emails_sent_month: number;
  open_rate: number;
  reply_rate: number;
  bounce_rate: number;
}

// Notification
export interface Notification {
  id: string;
  org_id: string;
  user_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// Campaign
export interface CampaignSettings {
  sendingHours?: { start: number; end: number };
  timezone?: string;
  maxEmailsPerDay?: number;
}

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  status: CampaignStatus;
  raise_amount: number | null;
  raise_type: RaiseType | null;
  sector: string[];
  deck_url: string | null;
  settings: CampaignSettings;
  created_at: string;
}

// Investor
export interface WarmPath {
  investor_id: string;
  connection_name: string;
  connection_email: string | null;
  relationship_strength: RelationshipStrength;
  path_length: number;
  source: WarmPathSource;
}

export interface Investor {
  id: string;
  org_id: string;
  user_id: string | null;
  is_platform: boolean;
  name: string;
  email: string | null;
  firm: string | null;
  title: string | null;
  linkedin_url: string | null;
  check_size_min: number | null;
  check_size_max: number | null;
  stages: string[];
  sectors: string[];
  fit_score: number | null;
  warm_paths: WarmPath[];
  source: InvestorSource;
  created_at: string;
}

// Sequence
export interface Sequence {
  id: string;
  campaign_id: string;
  name: string;
  status: SequenceStatus;
  created_at: string;
}

export interface SequenceStep {
  id: string;
  sequence_id: string;
  order: number;
  type: StepType;
  delay_days: number;
  template_id: string | null;
  content: string | null;
  subject: string | null;
}

// Outreach
export interface Outreach {
  id: string;
  campaign_id: string;
  investor_id: string;
  sequence_id: string | null;
  step_id: string | null;
  enrollment_id: string | null;
  type: OutreachType;
  status: OutreachStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  content: string;
  subject: string | null;
  created_at: string;
}

// Sequence Enrollment
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface SequenceEnrollment {
  id: string;
  sequence_id: string;
  investor_id: string;
  campaign_id: string | null;
  org_id: string;
  status: EnrollmentStatus;
  current_step_order: number;
  next_send_at: string | null;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  // Optional joined data
  investor?: {
    id: string;
    name: string;
    email: string | null;
    firm: string | null;
  };
  sequence?: {
    id: string;
    name: string;
  };
}

// Pipeline
export interface PipelineEntry {
  id: string;
  campaign_id: string;
  investor_id: string;
  stage: PipelineStage;
  amount_soft: number | null;
  amount_committed: number | null;
  notes: string | null;
  last_activity_at: string;
  created_at: string;
  // Joined investor data (optional, populated via join)
  investor?: {
    id: string;
    name: string;
    firm: string | null;
    email: string | null;
    title: string | null;
  };
}

// Email Template
export interface EmailTemplate {
  id: string;
  org_id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: TemplateType;
  created_at: string;
}

// API Response Types
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

// Form/Input Types
export interface CreateCampaignInput {
  name: string;
  raise_amount?: number;
  raise_type?: RaiseType;
  sector?: string[];
  deck_url?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  status?: CampaignStatus;
  raise_amount?: number;
  raise_type?: RaiseType;
  sector?: string[];
  deck_url?: string;
}

export interface CreateInvestorInput {
  name: string;
  email?: string;
  firm?: string;
  title?: string;
  linkedin_url?: string;
  check_size_min?: number;
  check_size_max?: number;
  stages?: string[];
  sectors?: string[];
}

export interface BulkImportInvestorInput {
  name: string;
  email?: string;
  firm?: string;
  title?: string;
  linkedin_url?: string;
}

// Component State Types
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Stats Types
export interface CampaignStats {
  total_investors: number;
  contacted: number;
  responded: number;
  meetings: number;
  committed_amount: number;
  response_rate: number;
}

export interface PipelineStats {
  by_stage: Record<PipelineStage, number>;
  total_soft: number;
  total_committed: number;
  conversion_rate: number;
}
