-- Migration: 005_contact_verification
-- Add verification tracking fields to investors table

-- Add email verification fields
ALTER TABLE investors ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS email_verification_source VARCHAR(50); -- 'hunter', 'manual', 'import'

-- Add LinkedIn verification fields
ALTER TABLE investors ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS linkedin_verified_at TIMESTAMPTZ;

-- Create index for filtering by verification status
CREATE INDEX IF NOT EXISTS idx_investors_email_verified ON investors(email_verified) WHERE email_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_investors_linkedin_verified ON investors(linkedin_verified) WHERE linkedin_verified = TRUE;

-- Mark existing Hunter-enriched emails as verified (they came from Hunter API)
-- This would need to be run after identifying which emails came from Hunter
-- For now, we'll leave all as unverified and let the user verify through the UI

COMMENT ON COLUMN investors.email_verified IS 'Whether the email has been verified through Hunter.io or manual verification';
COMMENT ON COLUMN investors.email_verification_source IS 'Source of email verification: hunter, manual, import';
COMMENT ON COLUMN investors.linkedin_verified IS 'Whether the LinkedIn URL has been validated as a real profile';
