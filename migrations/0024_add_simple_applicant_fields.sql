-- Migration: Add simplified applicant profile columns for seeding
-- Description: Adds name/address/government-id/nsrp/job-preference helper columns

ALTER TABLE applicants ADD name TEXT;
ALTER TABLE applicants ADD address TEXT;
ALTER TABLE applicants ADD skills TEXT;
ALTER TABLE applicants ADD nsrp_number TEXT;
ALTER TABLE applicants ADD nsrp_status TEXT;
ALTER TABLE applicants ADD government_id_type TEXT;
ALTER TABLE applicants ADD government_id_number TEXT;
ALTER TABLE applicants ADD job_preference TEXT;
ALTER TABLE applicants ADD household_head TEXT;
ALTER TABLE applicants ADD dependents_count INTEGER DEFAULT 0;
