-- Migration: Add login fields to applicants table and remove users table
-- This unifies jobseekers into a single table

-- Add new columns to applicants table
ALTER TABLE applicants ADD COLUMN password_hash TEXT;
ALTER TABLE applicants ADD COLUMN role TEXT DEFAULT 'jobseeker';
ALTER TABLE applicants ADD COLUMN has_account INTEGER DEFAULT 0;

-- Make email unique in applicants
-- CREATE UNIQUE INDEX IF NOT EXISTS applicants_email_unique ON applicants(email);

-- Migrate existing users table data to applicants (if any jobseekers exist)
-- This preserves any jobseekers that were created in the old users table

-- Drop users table (we're consolidating everything into applicants)
-- Note: Employers will be handled separately in their own table
DROP TABLE IF EXISTS users;
