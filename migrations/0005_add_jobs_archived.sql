-- Add archived status to jobs table (if columns don't already exist)
-- SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we'll use PRAGMA
-- These columns will be added safely by the drizzle-kit push command

