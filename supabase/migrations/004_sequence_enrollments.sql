-- Migration: Sequence Enrollments
-- Description: Add sequence_enrollments table for tracking investors enrolled in sequences

-- Create sequence_enrollments table
CREATE TABLE IF NOT EXISTS sequence_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    -- Enrollment status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),

    -- Progress tracking
    current_step_order INTEGER DEFAULT 0,
    next_send_at TIMESTAMPTZ,

    -- Timestamps
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Unique constraint: one investor per sequence
    UNIQUE(sequence_id, investor_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_sequence_id ON sequence_enrollments(sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_investor_id ON sequence_enrollments(investor_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_status ON sequence_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next_send ON sequence_enrollments(next_send_at) WHERE status = 'active';

-- Add org_id to sequence_enrollments for RLS
ALTER TABLE sequence_enrollments ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- Trigger to auto-set org_id from sequence
CREATE OR REPLACE FUNCTION set_enrollment_org_id()
RETURNS TRIGGER AS $$
BEGIN
    SELECT org_id INTO NEW.org_id FROM sequences WHERE id = NEW.sequence_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_enrollment_org_id ON sequence_enrollments;
CREATE TRIGGER trigger_set_enrollment_org_id
    BEFORE INSERT ON sequence_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION set_enrollment_org_id();

-- RLS Policies
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view enrollments in their org"
    ON sequence_enrollments FOR SELECT
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create enrollments in their org"
    ON sequence_enrollments FOR INSERT
    WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update enrollments in their org"
    ON sequence_enrollments FOR UPDATE
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete enrollments in their org"
    ON sequence_enrollments FOR DELETE
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

-- Service role bypass for cron jobs
CREATE POLICY "Service role can access all enrollments"
    ON sequence_enrollments FOR ALL
    USING (auth.role() = 'service_role');

-- Add sequence_enrollment_id to outreach table for tracking which enrollment triggered the outreach
ALTER TABLE outreach ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES sequence_enrollments(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_outreach_enrollment_id ON outreach(enrollment_id);
