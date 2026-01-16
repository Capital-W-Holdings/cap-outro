-- Cap Outro Database Schema Update
-- Migration: 002_add_missing_columns
-- Adds org_id to sequences/pipeline for direct filtering and creates referrals table

-- ===================
-- ADD ORG_ID TO SEQUENCES
-- ===================
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill org_id from campaigns
UPDATE sequences s
SET org_id = c.org_id
FROM campaigns c
WHERE s.campaign_id = c.id AND s.org_id IS NULL;

-- Make org_id NOT NULL after backfill (for new records)
-- Note: In production, run backfill first, then alter
-- ALTER TABLE sequences ALTER COLUMN org_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sequences_org ON sequences(org_id);

-- ===================
-- ADD ORG_ID TO PIPELINE
-- ===================
ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill org_id from campaigns
UPDATE pipeline p
SET org_id = c.org_id
FROM campaigns c
WHERE p.campaign_id = c.id AND p.org_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_pipeline_org ON pipeline(org_id);

-- ===================
-- REFERRALS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_user_id VARCHAR(255) NOT NULL, -- User ID from auth provider
  code VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'expired')),
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  reward_granted BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_org ON referrals(org_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Referrals: org-scoped for viewing own referrals
CREATE POLICY "Users can view org referrals"
  ON referrals FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org referrals"
  ON referrals FOR ALL
  USING (org_id = get_user_org_id());

-- Public lookup by code (for referral links)
CREATE POLICY "Public can lookup referral codes"
  ON referrals FOR SELECT
  USING (true); -- Allow public to verify codes

-- Updated_at trigger
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===================
-- EMAIL ACCOUNTS TABLE (for Gmail OAuth)
-- ===================
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL, -- User ID from auth provider
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook', 'resend')),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error')),
  daily_limit INTEGER NOT NULL DEFAULT 100,
  emails_sent_today INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_org ON email_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_status ON email_accounts(status);

-- Enable RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Email accounts: org-scoped
CREATE POLICY "Users can view org email accounts"
  ON email_accounts FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org email accounts"
  ON email_accounts FOR ALL
  USING (org_id = get_user_org_id());

-- Updated_at trigger
CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===================
-- NOTIFICATIONS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255), -- User ID from auth provider, NULL for org-wide
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'email_opened', 'email_replied', 'email_bounced',
    'meeting_scheduled', 'stage_changed',
    'campaign_started', 'campaign_completed',
    'investor_added', 'system'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(org_id, user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications: user and org scoped
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (org_id = get_user_org_id() AND (user_id IS NULL OR user_id = auth.uid()::text));

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (org_id = get_user_org_id() AND (user_id IS NULL OR user_id = auth.uid()::text));

-- ===================
-- DEFAULT ORGANIZATION FOR MVP
-- ===================
INSERT INTO organizations (id, name, slug, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org', 'pro')
ON CONFLICT (id) DO NOTHING;
