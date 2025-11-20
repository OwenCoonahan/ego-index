-- Ego Index Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table: stores analyzed Twitter profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  followers_count INTEGER,
  following_count INTEGER,
  tweet_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table: stores ego analysis results
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Core scores
  ego_score INTEGER NOT NULL CHECK (ego_score >= 0 AND ego_score <= 100),
  value_score INTEGER NOT NULL CHECK (value_score >= 0 AND value_score <= 100),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Detailed metrics
  main_character_score INTEGER CHECK (main_character_score >= 0 AND main_character_score <= 100),
  humble_brag_score INTEGER CHECK (humble_brag_score >= 0 AND humble_brag_score <= 100),
  self_promotion_score INTEGER CHECK (self_promotion_score >= 0 AND self_promotion_score <= 100),

  -- Industry classification
  industry TEXT,

  -- Analysis insights
  tier TEXT NOT NULL, -- e.g., "The Ghost", "Humble Contributor", "Main Character Energy"
  tier_emoji TEXT NOT NULL,
  summary TEXT NOT NULL,

  -- Tweet analysis
  most_egotistical_tweet_id TEXT,
  most_egotistical_tweet_text TEXT,
  most_egotistical_tweet_score INTEGER,

  least_egotistical_tweet_id TEXT,
  least_egotistical_tweet_text TEXT,
  least_egotistical_tweet_score INTEGER,

  -- Metadata
  tweets_analyzed INTEGER NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_analyses_profile_id ON analyses(profile_id);

-- Create index on industry for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_analyses_industry ON analyses(industry);

-- Create index on overall_score for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON analyses(overall_score DESC);

-- Leaderboard view: top scores overall
CREATE OR REPLACE VIEW leaderboard_overall AS
SELECT
  p.username,
  p.display_name,
  p.profile_image_url,
  a.overall_score,
  a.ego_score,
  a.value_score,
  a.tier,
  a.tier_emoji,
  a.analysis_date
FROM analyses a
JOIN profiles p ON a.profile_id = p.id
ORDER BY a.overall_score DESC, a.analysis_date DESC;

-- Leaderboard view: by industry
CREATE OR REPLACE VIEW leaderboard_by_industry AS
SELECT
  p.username,
  p.display_name,
  p.profile_image_url,
  a.industry,
  a.overall_score,
  a.ego_score,
  a.value_score,
  a.tier,
  a.tier_emoji,
  a.analysis_date,
  ROW_NUMBER() OVER (PARTITION BY a.industry ORDER BY a.overall_score DESC) as rank
FROM analyses a
JOIN profiles p ON a.profile_id = p.id
WHERE a.industry IS NOT NULL
ORDER BY a.industry, rank;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
