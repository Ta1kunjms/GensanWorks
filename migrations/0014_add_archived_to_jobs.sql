-- 0014_add_archived_to_jobs.sql
-- Add archived and archivedAt columns to jobsTable for consistent archiving
ALTER TABLE jobsTable ADD COLUMN archived INTEGER DEFAULT 0;
ALTER TABLE jobsTable ADD COLUMN archivedAt INTEGER;
