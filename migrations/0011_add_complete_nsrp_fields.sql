-- Migration: Add complete NSRP fields to applicants table
-- Date: 2025-11-26
-- Description: Add all NSRP form fields including address, OFW status, job preferences, and professional licenses

-- Add new address field
ALTER TABLE applicants ADD COLUMN house_street_village TEXT;

-- Add disability specify field
ALTER TABLE applicants ADD COLUMN disability_specify TEXT;

-- Add employment fields
ALTER TABLE applicants ADD COLUMN months_unemployed INTEGER;

-- Add OFW fields
ALTER TABLE applicants ADD COLUMN owf_country TEXT;
ALTER TABLE applicants ADD COLUMN is_former_ofw INTEGER DEFAULT 0;
ALTER TABLE applicants ADD COLUMN former_ofw_country TEXT;
ALTER TABLE applicants ADD COLUMN return_to_ph_date TEXT;

-- Add 4Ps fields
ALTER TABLE applicants ADD COLUMN household_id TEXT;

-- Add job preference fields
ALTER TABLE applicants ADD COLUMN preferred_occupations TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN preferred_locations TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN preferred_overseas_countries TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN employment_type_4 TEXT;

-- Rename/add skills fields
-- SQLite doesn't support renaming columns easily, so we'll add new column and migrate data
ALTER TABLE applicants ADD COLUMN other_skills TEXT; -- JSON array
ALTER TABLE applicants ADD COLUMN other_skills_specify TEXT;
ALTER TABLE applicants ADD COLUMN professional_licenses TEXT; -- JSON array

-- Migrate old 'skills' data to 'other_skills' if exists
UPDATE applicants SET other_skills = skills WHERE skills IS NOT NULL;

-- Note: We keep 'skills' column for backward compatibility
-- In code, we'll use 'otherSkills' and 'professionalLicenses' as per NSRP standard

-- Remove old 'address' column (replace with house_street_village)
-- SQLite limitation: Can't drop columns, so we'll just stop using it in code
