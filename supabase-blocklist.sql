-- Optional: Blocklist for accounts that request removal or should not be analyzed

CREATE TABLE IF NOT EXISTS blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  reason TEXT, -- "user_request", "legal", "ethical", etc.
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_blocklist_username ON blocklist(username);

-- Function to check if account is blocked
CREATE OR REPLACE FUNCTION is_blocked(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocklist WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT is_blocked('someusername'); -- Returns true/false
