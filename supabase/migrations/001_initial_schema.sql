-- Cap Outro Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================
-- ORGANIZATIONS
-- ===================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ===================
-- USERS
-- ===================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  connected_accounts JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ===================
-- CAMPAIGNS
-- ===================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  raise_amount BIGINT,
  raise_type VARCHAR(20) CHECK (raise_type IN ('seed', 'series_a', 'series_b', 'bridge', 'note')),
  sector TEXT[] NOT NULL DEFAULT '{}',
  deck_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ===================
-- INVESTORS
-- ===================
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  firm VARCHAR(100),
  title VARCHAR(100),
  linkedin_url TEXT,
  check_size_min BIGINT,
  check_size_max BIGINT,
  stages TEXT[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  warm_paths JSONB NOT NULL DEFAULT '[]',
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('import', 'enrichment', 'manual')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investors_org ON investors(org_id);
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_investors_firm ON investors(firm);
CREATE INDEX idx_investors_fit_score ON investors(fit_score DESC);

-- ===================
-- EMAIL TEMPLATES
-- ===================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  type VARCHAR(20) NOT NULL DEFAULT 'initial' CHECK (type IN ('initial', 'followup', 'intro_request', 'update')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_org ON email_templates(org_id);
CREATE INDEX idx_templates_type ON email_templates(type);

-- ===================
-- SEQUENCES
-- ===================
CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sequences_campaign ON sequences(campaign_id);
CREATE INDEX idx_sequences_status ON sequences(status);

-- ===================
-- SEQUENCE STEPS
-- ===================
CREATE TABLE sequence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'linkedin', 'task', 'wait')),
  delay_days INTEGER NOT NULL DEFAULT 0,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  content TEXT,
  subject VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sequence_id, "order")
);

CREATE INDEX idx_steps_sequence ON sequence_steps(sequence_id);

-- ===================
-- OUTREACH
-- ===================
CREATE TABLE outreach (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL,
  step_id UUID REFERENCES sequence_steps(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'linkedin', 'call', 'meeting', 'intro_request')),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'opened', 'clicked', 'replied', 'bounced')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  content TEXT NOT NULL,
  subject VARCHAR(200),
  tracking_id UUID UNIQUE DEFAULT uuid_generate_v4(),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outreach_campaign ON outreach(campaign_id);
CREATE INDEX idx_outreach_investor ON outreach(investor_id);
CREATE INDEX idx_outreach_sequence ON outreach(sequence_id);
CREATE INDEX idx_outreach_status ON outreach(status);
CREATE INDEX idx_outreach_scheduled ON outreach(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_outreach_tracking ON outreach(tracking_id);

-- ===================
-- PIPELINE
-- ===================
CREATE TABLE pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  stage VARCHAR(30) NOT NULL DEFAULT 'not_contacted' CHECK (stage IN (
    'not_contacted', 'contacted', 'responded', 'meeting_scheduled', 
    'meeting_held', 'dd', 'term_sheet', 'committed', 'passed'
  )),
  amount_soft BIGINT,
  amount_committed BIGINT,
  notes TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, investor_id)
);

CREATE INDEX idx_pipeline_campaign ON pipeline(campaign_id);
CREATE INDEX idx_pipeline_investor ON pipeline(investor_id);
CREATE INDEX idx_pipeline_stage ON pipeline(stage);

-- ===================
-- ACTIVITY LOG
-- ===================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_log(org_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations: users can only see their own org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (id = get_user_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
  ));

-- Users: can see users in their org
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage org members"
  ON users FOR ALL
  USING (org_id = get_user_org_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Campaigns: org-scoped
CREATE POLICY "Users can view org campaigns"
  ON campaigns FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org campaigns"
  ON campaigns FOR ALL
  USING (org_id = get_user_org_id());

-- Investors: org-scoped
CREATE POLICY "Users can view org investors"
  ON investors FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org investors"
  ON investors FOR ALL
  USING (org_id = get_user_org_id());

-- Email Templates: org-scoped
CREATE POLICY "Users can view org templates"
  ON email_templates FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org templates"
  ON email_templates FOR ALL
  USING (org_id = get_user_org_id());

-- Sequences: via campaign org
CREATE POLICY "Users can view org sequences"
  ON sequences FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = sequences.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org sequences"
  ON sequences FOR ALL
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = sequences.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

-- Sequence Steps: via sequence -> campaign -> org
CREATE POLICY "Users can view org sequence steps"
  ON sequence_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sequences 
    JOIN campaigns ON campaigns.id = sequences.campaign_id 
    WHERE sequences.id = sequence_steps.sequence_id AND campaigns.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org sequence steps"
  ON sequence_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sequences 
    JOIN campaigns ON campaigns.id = sequences.campaign_id 
    WHERE sequences.id = sequence_steps.sequence_id AND campaigns.org_id = get_user_org_id()
  ));

-- Outreach: via campaign org
CREATE POLICY "Users can view org outreach"
  ON outreach FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = outreach.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org outreach"
  ON outreach FOR ALL
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = outreach.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

-- Pipeline: via campaign org
CREATE POLICY "Users can view org pipeline"
  ON pipeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = pipeline.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org pipeline"
  ON pipeline FOR ALL
  USING (EXISTS (
    SELECT 1 FROM campaigns WHERE campaigns.id = pipeline.campaign_id AND campaigns.org_id = get_user_org_id()
  ));

-- Activity Log: org-scoped
CREATE POLICY "Users can view org activity"
  ON activity_log FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "System can insert activity"
  ON activity_log FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

-- ===================
-- TRIGGERS
-- ===================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON sequence_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_outreach_updated_at BEFORE UPDATE ON outreach FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pipeline_updated_at BEFORE UPDATE ON pipeline FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- FUNCTIONS
-- ===================

-- Function to create new user with organization
CREATE OR REPLACE FUNCTION create_user_with_org(
  user_id UUID,
  user_email VARCHAR,
  user_name VARCHAR,
  org_name VARCHAR
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  org_slug VARCHAR;
BEGIN
  -- Generate slug from org name
  org_slug := LOWER(REGEXP_REPLACE(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := org_slug || '-' || SUBSTRING(user_id::TEXT, 1, 8);
  
  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;
  
  -- Create user as owner
  INSERT INTO users (id, org_id, email, name, role)
  VALUES (user_id, new_org_id, user_email, user_name, 'owner');
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get campaign stats
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_investors', COUNT(DISTINCT p.investor_id),
    'contacted', COUNT(DISTINCT p.investor_id) FILTER (WHERE p.stage != 'not_contacted'),
    'responded', COUNT(DISTINCT p.investor_id) FILTER (WHERE p.stage IN ('responded', 'meeting_scheduled', 'meeting_held', 'dd', 'term_sheet', 'committed')),
    'meetings', COUNT(DISTINCT p.investor_id) FILTER (WHERE p.stage IN ('meeting_held', 'dd', 'term_sheet', 'committed')),
    'committed_amount', COALESCE(SUM(p.amount_committed), 0),
    'soft_amount', COALESCE(SUM(p.amount_soft), 0)
  ) INTO stats
  FROM pipeline p
  WHERE p.campaign_id = campaign_uuid;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
