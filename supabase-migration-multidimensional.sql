-- Migration: Add multi-dimensional scoring fields
-- Run this in your Supabase SQL Editor to add new scoring dimensions

-- Step 1: Drop existing views (we'll recreate them later)
DROP VIEW IF EXISTS leaderboard_overall CASCADE;
DROP VIEW IF EXISTS leaderboard_by_industry CASCADE;
DROP VIEW IF EXISTS leaderboard_high_value CASCADE;

-- Step 2: Add new score columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS noise_score INTEGER CHECK (noise_score >= 0 AND noise_score <= 100),
ADD COLUMN IF NOT EXISTS engagement_quality_score INTEGER CHECK (engagement_quality_score >= 0 AND engagement_quality_score <= 100),
ADD COLUMN IF NOT EXISTS authenticity_score INTEGER CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
ADD COLUMN IF NOT EXISTS signal_to_ego_ratio DECIMAL(4,2) CHECK (signal_to_ego_ratio >= 0 AND signal_to_ego_ratio <= 1);

-- Step 3: Create index on SER for leaderboard queries (high SER = valuable accounts)
CREATE INDEX IF NOT EXISTS idx_analyses_ser ON analyses(signal_to_ego_ratio DESC);

-- Step 4: Recreate leaderboard views with new columns

-- Update leaderboard view to include SER
CREATE VIEW leaderboard_overall AS
SELECT
  p.username,
  p.display_name,
  p.profile_image_url,
  a.overall_score,
  a.ego_score,
  a.value_score,
  a.noise_score,
  a.engagement_quality_score,
  a.authenticity_score,
  a.signal_to_ego_ratio,
  a.tier,
  a.tier_emoji,
  a.analysis_date
FROM analyses a
JOIN profiles p ON a.profile_id = p.id
ORDER BY a.signal_to_ego_ratio DESC, a.analysis_date DESC;

-- Create new view: High Value accounts (sorted by SER)
CREATE VIEW leaderboard_high_value AS
SELECT
  p.username,
  p.display_name,
  p.profile_image_url,
  a.value_score,
  a.ego_score,
  a.noise_score,
  a.signal_to_ego_ratio,
  a.tier,
  a.tier_emoji,
  a.industry,
  a.analysis_date
FROM analyses a
JOIN profiles p ON a.profile_id = p.id
WHERE a.signal_to_ego_ratio IS NOT NULL
ORDER BY a.signal_to_ego_ratio DESC, a.analysis_date DESC;

-- Update industry leaderboard to include SER
CREATE VIEW leaderboard_by_industry AS
SELECT
  p.username,
  p.display_name,
  p.profile_image_url,
  a.industry,
  a.overall_score,
  a.ego_score,
  a.value_score,
  a.noise_score,
  a.signal_to_ego_ratio,
  a.tier,
  a.tier_emoji,
  a.analysis_date,
  ROW_NUMBER() OVER (PARTITION BY a.industry ORDER BY a.signal_to_ego_ratio DESC) as rank
FROM analyses a
JOIN profiles p ON a.profile_id = p.id
WHERE a.industry IS NOT NULL
ORDER BY a.industry, rank;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN analyses.noise_score IS 'Score for platitudes, engagement farming, and low-value content (0-100)';
COMMENT ON COLUMN analyses.engagement_quality_score IS 'Quality of interactions - meaningful replies vs performative engagement (0-100)';
COMMENT ON COLUMN analyses.authenticity_score IS 'Consistency, genuine expertise, walking the talk (0-100)';
COMMENT ON COLUMN analyses.signal_to_ego_ratio IS 'Composite metric: Value / (Ego + Noise + 1), normalized 0-1. Higher = more valuable';

-- Migration complete!
-- Next steps:
-- 1. Analyze a new account to test the new scoring
-- 2. Use the bot CLI: npm run bot insights
