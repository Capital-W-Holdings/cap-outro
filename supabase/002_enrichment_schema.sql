-- Cap Outro Enrichment Schema
-- Migration: 002_enrichment_schema
-- Waterfall enrichment system for investor data

-- ===================
-- ENUMS
-- ===================
CREATE TYPE investor_source AS ENUM ('openvc', 'angellist', 'manual');
CREATE TYPE investor_type AS ENUM ('individual', 'fund', 'family_office', 'institutional');
CREATE TYPE job_type AS ENUM ('import', 'apollo_enrich', 'hunter_verify', 'sec_match', 'compute_score');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'dead_letter');
CREATE TYPE email_status AS ENUM ('unknown', 'valid', 'invalid', 'risky', 'disposable');

-- ===================
-- IMPORT BATCH
-- ===================
CREATE TABLE import_batch (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source investor_source NOT NULL,
  filename VARCHAR(255) NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  status job_status NOT NULL DEFAULT 'pending',
  error_log JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_batch_org ON import_batch(org_id);
CREATE INDEX idx_import_batch_status ON import_batch(status);

-- ===================
-- INVESTOR RAW (Original import records)
-- ===================
CREATE TABLE investor_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source investor_source NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  raw_name VARCHAR(255) NOT NULL,
  raw_firm VARCHAR(255),
  raw_email VARCHAR(255),
  raw_linkedin_url TEXT,
  raw_metadata JSONB,
  import_batch_id UUID NOT NULL REFERENCES import_batch(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, source, source_id)
);

CREATE INDEX idx_investor_raw_org ON investor_raw(org_id);
CREATE INDEX idx_investor_raw_batch ON investor_raw(import_batch_id);
CREATE INDEX idx_investor_raw_investor ON investor_raw(investor_id);

-- ===================
-- ENRICHMENT PROFILE
-- ===================
CREATE TABLE enrichment_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL UNIQUE REFERENCES investors(id) ON DELETE CASCADE,

  -- Apollo enrichment
  apollo_email VARCHAR(255),
  apollo_email_status VARCHAR(50),
  apollo_linkedin_url TEXT,
  apollo_linkedin_data JSONB,
  apollo_data JSONB,
  apollo_fetched_at TIMESTAMPTZ,

  -- Hunter verification
  hunter_email_status email_status NOT NULL DEFAULT 'unknown',
  hunter_email_score INTEGER,
  hunter_data JSONB,
  hunter_verified_at TIMESTAMPTZ,

  -- SEC 13F data
  sec_cik VARCHAR(20),
  sec_aum BIGINT,
  sec_filing_date DATE,
  sec_data JSONB,
  sec_fetched_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrichment_investor ON enrichment_profile(investor_id);
CREATE INDEX idx_enrichment_email_status ON enrichment_profile(hunter_email_status);

-- ===================
-- RELIABILITY SCORE
-- ===================
CREATE TABLE reliability_score (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL UNIQUE REFERENCES investors(id) ON DELETE CASCADE,

  composite_score INTEGER NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
  tier VARCHAR(10) NOT NULL CHECK (tier IN ('A', 'B', 'C', 'D', 'F')),

  -- Score components
  data_completeness_score INTEGER NOT NULL DEFAULT 0,
  contact_validity_score INTEGER NOT NULL DEFAULT 0,
  regulatory_score INTEGER NOT NULL DEFAULT 0,
  close_behavior_score INTEGER NOT NULL DEFAULT 0,

  factors JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reliability_investor ON reliability_score(investor_id);
CREATE INDEX idx_reliability_tier ON reliability_score(tier);
CREATE INDEX idx_reliability_score ON reliability_score(composite_score DESC);

-- ===================
-- CLOSE BEHAVIOR RECORDS
-- ===================
CREATE TABLE close_behavior_record (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,

  deal_id VARCHAR(100),
  deal_name VARCHAR(255),
  committed_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  committed_amount BIGINT NOT NULL,
  actual_amount BIGINT,
  outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('closed', 'partial', 'ghosted', 'withdrew', 'pending')),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_close_behavior_org ON close_behavior_record(org_id);
CREATE INDEX idx_close_behavior_investor ON close_behavior_record(investor_id);
CREATE INDEX idx_close_behavior_outcome ON close_behavior_record(outcome);

-- ===================
-- ENRICHMENT JOB QUEUE
-- ===================
CREATE TABLE enrichment_job (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  import_batch_id UUID REFERENCES import_batch(id) ON DELETE CASCADE,

  job_type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 0,

  payload JSONB,
  result JSONB,
  error_message TEXT,
  error_code VARCHAR(50),

  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrichment_job_org ON enrichment_job(org_id);
CREATE INDEX idx_enrichment_job_status ON enrichment_job(status, scheduled_for);
CREATE INDEX idx_enrichment_job_investor ON enrichment_job(investor_id);
CREATE INDEX idx_enrichment_job_batch ON enrichment_job(import_batch_id);

-- ===================
-- API CALL LOG (for rate limiting and debugging)
-- ===================
CREATE TABLE api_call_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_hash VARCHAR(64),
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_call_org ON api_call_log(org_id);
CREATE INDEX idx_api_call_service ON api_call_log(service, created_at DESC);
CREATE INDEX idx_api_call_hash ON api_call_log(service, request_hash);

-- ===================
-- ROW LEVEL SECURITY
-- ===================
ALTER TABLE import_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE reliability_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE close_behavior_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_log ENABLE ROW LEVEL SECURITY;

-- Import Batch policies
CREATE POLICY "Users can view org import batches"
  ON import_batch FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org import batches"
  ON import_batch FOR ALL
  USING (org_id = get_user_org_id());

-- Investor Raw policies
CREATE POLICY "Users can view org raw investors"
  ON investor_raw FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org raw investors"
  ON investor_raw FOR ALL
  USING (org_id = get_user_org_id());

-- Enrichment Profile policies (via investor)
CREATE POLICY "Users can view org enrichment profiles"
  ON enrichment_profile FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM investors WHERE investors.id = enrichment_profile.investor_id AND investors.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org enrichment profiles"
  ON enrichment_profile FOR ALL
  USING (EXISTS (
    SELECT 1 FROM investors WHERE investors.id = enrichment_profile.investor_id AND investors.org_id = get_user_org_id()
  ));

-- Reliability Score policies (via investor)
CREATE POLICY "Users can view org reliability scores"
  ON reliability_score FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM investors WHERE investors.id = reliability_score.investor_id AND investors.org_id = get_user_org_id()
  ));

CREATE POLICY "Users can manage org reliability scores"
  ON reliability_score FOR ALL
  USING (EXISTS (
    SELECT 1 FROM investors WHERE investors.id = reliability_score.investor_id AND investors.org_id = get_user_org_id()
  ));

-- Close Behavior policies
CREATE POLICY "Users can view org close behaviors"
  ON close_behavior_record FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org close behaviors"
  ON close_behavior_record FOR ALL
  USING (org_id = get_user_org_id());

-- Enrichment Job policies
CREATE POLICY "Users can view org enrichment jobs"
  ON enrichment_job FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage org enrichment jobs"
  ON enrichment_job FOR ALL
  USING (org_id = get_user_org_id());

-- API Call Log policies
CREATE POLICY "Users can view org api calls"
  ON api_call_log FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert org api calls"
  ON api_call_log FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

-- ===================
-- TRIGGERS
-- ===================
CREATE TRIGGER update_enrichment_profile_updated_at
  BEFORE UPDATE ON enrichment_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reliability_score_updated_at
  BEFORE UPDATE ON reliability_score
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrichment_job_updated_at
  BEFORE UPDATE ON enrichment_job
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- FUNCTIONS
-- ===================

-- Function to compute reliability score
CREATE OR REPLACE FUNCTION compute_reliability_score(investor_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  data_score INTEGER := 0;
  contact_score INTEGER := 0;
  regulatory_score INTEGER := 0;
  behavior_score INTEGER := 0;
  total_score INTEGER := 0;
  inv RECORD;
  enrich RECORD;
  behavior_stats RECORD;
BEGIN
  -- Get investor data
  SELECT * INTO inv FROM investors WHERE id = investor_uuid;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Get enrichment profile
  SELECT * INTO enrich FROM enrichment_profile WHERE investor_id = investor_uuid;

  -- Data completeness score (25 points max)
  IF inv.name IS NOT NULL THEN data_score := data_score + 5; END IF;
  IF inv.email IS NOT NULL THEN data_score := data_score + 5; END IF;
  IF inv.firm IS NOT NULL THEN data_score := data_score + 5; END IF;
  IF inv.linkedin_url IS NOT NULL THEN data_score := data_score + 5; END IF;
  IF FOUND AND enrich.apollo_data IS NOT NULL THEN data_score := data_score + 5; END IF;

  -- Contact validity score (25 points max)
  IF FOUND THEN
    IF enrich.hunter_email_status = 'valid' THEN
      contact_score := 25;
    ELSIF enrich.hunter_email_status = 'risky' THEN
      contact_score := 15;
    ELSIF enrich.hunter_email_status = 'unknown' THEN
      contact_score := 10;
    END IF;
  ELSE
    contact_score := 10; -- default if no enrichment
  END IF;

  -- Regulatory/SEC score (25 points max)
  IF FOUND AND enrich.sec_cik IS NOT NULL THEN
    regulatory_score := 25;
  ELSIF FOUND AND enrich.sec_aum IS NOT NULL THEN
    regulatory_score := 20;
  ELSE
    regulatory_score := 10;
  END IF;

  -- Close behavior score (25 points max)
  SELECT
    COUNT(*) as total_deals,
    COUNT(*) FILTER (WHERE outcome = 'closed') as closed_deals,
    COUNT(*) FILTER (WHERE outcome = 'ghosted') as ghosted_deals
  INTO behavior_stats
  FROM close_behavior_record
  WHERE investor_id = investor_uuid;

  IF behavior_stats.total_deals > 0 THEN
    behavior_score := LEAST(25,
      (behavior_stats.closed_deals::FLOAT / behavior_stats.total_deals * 25)::INTEGER
      - (behavior_stats.ghosted_deals * 5)
    );
    behavior_score := GREATEST(0, behavior_score);
  ELSE
    behavior_score := 15; -- neutral score for unknown
  END IF;

  total_score := data_score + contact_score + regulatory_score + behavior_score;

  -- Upsert reliability score
  INSERT INTO reliability_score (
    investor_id, composite_score, tier,
    data_completeness_score, contact_validity_score, regulatory_score, close_behavior_score,
    factors, computed_at
  ) VALUES (
    investor_uuid, total_score,
    CASE
      WHEN total_score >= 80 THEN 'A'
      WHEN total_score >= 60 THEN 'B'
      WHEN total_score >= 40 THEN 'C'
      WHEN total_score >= 20 THEN 'D'
      ELSE 'F'
    END,
    data_score, contact_score, regulatory_score, behavior_score,
    jsonb_build_object(
      'data_completeness', data_score,
      'contact_validity', contact_score,
      'regulatory', regulatory_score,
      'close_behavior', behavior_score
    ),
    NOW()
  )
  ON CONFLICT (investor_id) DO UPDATE SET
    composite_score = EXCLUDED.composite_score,
    tier = EXCLUDED.tier,
    data_completeness_score = EXCLUDED.data_completeness_score,
    contact_validity_score = EXCLUDED.contact_validity_score,
    regulatory_score = EXCLUDED.regulatory_score,
    close_behavior_score = EXCLUDED.close_behavior_score,
    factors = EXCLUDED.factors,
    computed_at = NOW(),
    updated_at = NOW();

  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get enrichment stats
CREATE OR REPLACE FUNCTION get_enrichment_stats(org_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_investors', (SELECT COUNT(*) FROM investors WHERE org_id = org_uuid),
    'enriched_apollo', (
      SELECT COUNT(*) FROM enrichment_profile ep
      JOIN investors i ON i.id = ep.investor_id
      WHERE i.org_id = org_uuid AND ep.apollo_data IS NOT NULL
    ),
    'verified_emails', (
      SELECT COUNT(*) FROM enrichment_profile ep
      JOIN investors i ON i.id = ep.investor_id
      WHERE i.org_id = org_uuid AND ep.hunter_email_status = 'valid'
    ),
    'sec_matched', (
      SELECT COUNT(*) FROM enrichment_profile ep
      JOIN investors i ON i.id = ep.investor_id
      WHERE i.org_id = org_uuid AND ep.sec_cik IS NOT NULL
    ),
    'pending_jobs', (
      SELECT COUNT(*) FROM enrichment_job WHERE org_id = org_uuid AND status = 'pending'
    ),
    'score_distribution', (
      SELECT json_build_object(
        'A', COUNT(*) FILTER (WHERE tier = 'A'),
        'B', COUNT(*) FILTER (WHERE tier = 'B'),
        'C', COUNT(*) FILTER (WHERE tier = 'C'),
        'D', COUNT(*) FILTER (WHERE tier = 'D'),
        'F', COUNT(*) FILTER (WHERE tier = 'F')
      )
      FROM reliability_score rs
      JOIN investors i ON i.id = rs.investor_id
      WHERE i.org_id = org_uuid
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
