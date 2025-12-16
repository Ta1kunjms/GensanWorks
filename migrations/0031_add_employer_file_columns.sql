-- Migration: Add file upload columns to employers table
-- Date: 2025-12-14
-- Description: Adds columns for storing file metadata (SRS Form, Business Permit, BIR 2303, Company Profile, DOLE Certification)

-- Add file attachment columns (store JSON metadata as text)
ALTER TABLE employers ADD COLUMN srs_form_file TEXT;
ALTER TABLE employers ADD COLUMN business_permit_file TEXT;
ALTER TABLE employers ADD COLUMN bir2303_file TEXT;
ALTER TABLE employers ADD COLUMN company_profile_file TEXT;
ALTER TABLE employers ADD COLUMN dole_certification_file TEXT;
