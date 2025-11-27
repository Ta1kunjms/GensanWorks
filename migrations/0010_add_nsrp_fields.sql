-- Migration: Add additional NSRP (National Service and Referral Program) fields to applicants table
-- Date: 2025-11-26
-- Purpose: Enable complete NSRP form data storage for jobseeker profiles

-- Add disability specification
ALTER TABLE applicants ADD COLUMN disability_specify TEXT;

-- Add employment details
ALTER TABLE applicants ADD COLUMN months_unemployed INTEGER;

-- Add OFW (Overseas Filipino Worker) details
ALTER TABLE applicants ADD COLUMN owf_country TEXT;
ALTER TABLE applicants ADD COLUMN is_former_ofw INTEGER DEFAULT 0;
ALTER TABLE applicants ADD COLUMN former_ofw_country TEXT;
ALTER TABLE applicants ADD COLUMN return_to_ph_date TEXT;

-- Add 4Ps beneficiary details
ALTER TABLE applicants ADD COLUMN household_id TEXT;

-- Add job preferences
ALTER TABLE applicants ADD COLUMN preferred_occupations TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN preferred_locations TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN preferred_overseas_countries TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN employment_type_4 TEXT; -- Part-time or Full-time

-- Add professional licenses
ALTER TABLE applicants ADD COLUMN professional_licenses TEXT; -- JSON array

-- Add additional skills specification
ALTER TABLE applicants ADD COLUMN other_skills_specify TEXT;

-- Update existing records to have default values
UPDATE applicants SET is_former_ofw = 0 WHERE is_former_ofw IS NULL;
UPDATE applicants SET preferred_occupations = '[]' WHERE preferred_occupations IS NULL;
UPDATE applicants SET preferred_locations = '[]' WHERE preferred_locations IS NULL;
UPDATE applicants SET preferred_overseas_countries = '[]' WHERE preferred_overseas_countries IS NULL;
UPDATE applicants SET professional_licenses = '[]' WHERE professional_licenses IS NULL;
