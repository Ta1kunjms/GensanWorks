-- Backfill missing createdAt and updatedAt timestamps
-- This migration ensures all records have valid timestamp values for proper date filtering

-- For applicants: set missing createdAt to current timestamp
UPDATE applicants 
SET created_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE created_at IS NULL OR created_at = 0;

UPDATE applicants 
SET updated_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE updated_at IS NULL OR updated_at = 0;

-- For employers: set missing createdAt to current timestamp
UPDATE employers 
SET created_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE created_at IS NULL OR created_at = 0;

UPDATE employers 
SET updated_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE updated_at IS NULL OR updated_at = 0;

-- For job_vacancies: set missing createdAt to current timestamp
UPDATE job_vacancies 
SET created_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE created_at IS NULL OR created_at = 0;

UPDATE job_vacancies 
SET updated_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE updated_at IS NULL OR updated_at = 0;

-- For jobs: set missing createdAt to current timestamp (if jobs table exists)
UPDATE jobs 
SET created_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE created_at IS NULL OR created_at = 0;

UPDATE jobs 
SET updated_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE updated_at IS NULL OR updated_at = 0;

-- For referrals: set missing createdAt to current timestamp
UPDATE referrals 
SET created_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE created_at IS NULL OR created_at = 0;

UPDATE referrals 
SET updated_at = CAST(CURRENT_TIMESTAMP * 1000 AS INTEGER)
WHERE updated_at IS NULL OR updated_at = 0;
