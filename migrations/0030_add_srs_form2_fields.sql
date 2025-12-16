-- Migration: Add missing SRS Form 2 fields to employers table
-- Date: 2025-12-14
-- Description: Adds geographic code, tel numbers for establishment and barangay officials to comply with SRS Form 2 requirements

-- Add geographic identification fields
ALTER TABLE employers ADD COLUMN geographic_code TEXT;
ALTER TABLE employers ADD COLUMN tel_number TEXT;

-- Add barangay officials tel numbers
ALTER TABLE employers ADD COLUMN chairperson_tel_number TEXT;
ALTER TABLE employers ADD COLUMN secretary_tel_number TEXT;
