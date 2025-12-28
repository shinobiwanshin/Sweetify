-- Ensure 'clerk_id' column exists (safe for existing DBs)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);

-- Partial unique index for clerk_id to enforce uniqueness only for non-null values
-- This solves portability issues across different databases
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id_unique
ON users(clerk_id)
WHERE clerk_id IS NOT NULL;

-- Ensure 'auth_type' column exists (added for dual-auth support)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS auth_type VARCHAR(255); -- nullable for backward compatibility
-- NOTE: For new deployments Hibernate will also create/validate this column if necessary