-- Migration: Align job_vacancies with SRS Form 2A
-- SQLite/Postgres compatible where possible; adjust types per engine.

-- Add new column for fixed industry codes
ALTER TABLE job_vacancies ADD COLUMN industry_codes TEXT;

-- Backfill from existing industry_type if present
UPDATE job_vacancies
SET industry_codes = (
  CASE
    WHEN industry_type IS NULL THEN '[]'
    WHEN json_extract(industry_type, '$') IS NOT NULL THEN industry_type
    ELSE '[]'
  END
);

-- Drop legacy columns not in strict SRS Form 2A (if they exist)
-- These statements may fail if column doesn't exist; wrap in TRY/CATCH in tooling or run manually as needed
-- Number of vacancies (not on strict form)
-- ALTER TABLE job_vacancies DROP COLUMN number_of_vacancies;
-- Salary type (not on strict form)
-- ALTER TABLE job_vacancies DROP COLUMN salary_type;
-- Benefits, additional requirements, job description (not on strict form)
-- ALTER TABLE job_vacancies DROP COLUMN benefits;
-- ALTER TABLE job_vacancies DROP COLUMN additional_requirements;
-- ALTER TABLE job_vacancies DROP COLUMN job_description;

-- Note: drizzle with SQLite may require table rebuild to drop columns. Keep data until a full rebuild is run.
