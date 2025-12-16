-- Migration: Add applicant fields to users table
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN household_head TEXT;
ALTER TABLE users ADD COLUMN dependents_count INTEGER;
ALTER TABLE users ADD COLUMN job_preference TEXT;
ALTER TABLE users ADD COLUMN skills TEXT; -- or JSON if supported
ALTER TABLE users ADD COLUMN nsrp_number TEXT;
ALTER TABLE users ADD COLUMN nsrp_status TEXT;
ALTER TABLE users ADD COLUMN government_id_type TEXT;
ALTER TABLE users ADD COLUMN government_id_number TEXT;