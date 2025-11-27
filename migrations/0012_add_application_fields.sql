-- Add applicantId and coverLetter fields to applications table
-- Migration: 0012_add_application_fields.sql

-- Add applicantId column if it doesn't exist
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_id TEXT;

-- Add coverLetter column if it doesn't exist  
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;

-- Create index on applicantId for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);

-- Create composite index on jobId and applicantId to quickly check if user already applied
CREATE INDEX IF NOT EXISTS idx_applications_job_applicant ON applications(job_id, applicant_id);
