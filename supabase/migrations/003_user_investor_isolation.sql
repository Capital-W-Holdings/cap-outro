-- Migration: 003_user_investor_isolation
-- Add user_id and is_platform columns to investors for user-level data isolation

-- Add user_id column to track which user created/owns the investor
ALTER TABLE investors ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add is_platform flag to mark platform-provided investors (shared with all users)
ALTER TABLE investors ADD COLUMN is_platform BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for efficient queries
CREATE INDEX idx_investors_user_id ON investors(user_id);
CREATE INDEX idx_investors_is_platform ON investors(is_platform) WHERE is_platform = TRUE;

-- Mark all existing investors as platform investors (the pre-seeded database)
UPDATE investors SET is_platform = TRUE WHERE user_id IS NULL;

-- Update RLS policy to allow users to see:
-- 1. Platform investors (is_platform = true)
-- 2. Their own investors (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can view org investors" ON investors;
DROP POLICY IF EXISTS "Users can manage org investors" ON investors;

-- New SELECT policy: See platform investors OR your own investors
CREATE POLICY "Users can view platform and own investors"
  ON investors FOR SELECT
  USING (
    is_platform = TRUE
    OR user_id = auth.uid()
    OR (user_id IS NULL AND org_id = get_user_org_id())
  );

-- New INSERT policy: Can only insert investors for yourself
CREATE POLICY "Users can create own investors"
  ON investors FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND org_id = get_user_org_id()
  );

-- New UPDATE policy: Can only update your own non-platform investors
CREATE POLICY "Users can update own investors"
  ON investors FOR UPDATE
  USING (
    user_id = auth.uid()
    AND is_platform = FALSE
  );

-- New DELETE policy: Can only delete your own non-platform investors
CREATE POLICY "Users can delete own investors"
  ON investors FOR DELETE
  USING (
    user_id = auth.uid()
    AND is_platform = FALSE
  );
