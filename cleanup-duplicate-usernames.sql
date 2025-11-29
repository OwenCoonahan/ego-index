-- Cleanup script for duplicate usernames with different casing
-- This fixes profiles that were saved with mixed case but have no analyses

-- Step 1: Find profiles without analyses (should be ~32 rows)
SELECT p.id, p.username, p.display_name, p.created_at
FROM profiles p
LEFT JOIN analyses a ON a.profile_id = p.id
WHERE a.id IS NULL
ORDER BY p.created_at DESC;

-- Step 2: Find potential case-insensitive duplicates
-- This shows profiles that differ only in case
SELECT
  LOWER(username) as lowercase_username,
  COUNT(*) as count,
  STRING_AGG(username, ', ') as variants
FROM profiles
GROUP BY LOWER(username)
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 3: Delete profiles without analyses
-- WARNING: Only run this after verifying Step 1 and Step 2 results!
-- Uncomment the line below to execute:
-- DELETE FROM profiles p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM analyses a WHERE a.profile_id = p.id
-- );

-- Step 4: Normalize existing usernames to lowercase
-- WARNING: Only run after Step 3 is complete!
-- Uncomment the line below to execute:
-- UPDATE profiles SET username = LOWER(username);

-- Step 5: Verify cleanup
-- After running steps 3 and 4, this should show the correct count
SELECT
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM analyses) as total_analyses,
  (SELECT COUNT(*) FROM profiles p WHERE NOT EXISTS (
    SELECT 1 FROM analyses a WHERE a.profile_id = p.id
  )) as profiles_without_analyses;
