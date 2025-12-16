-- 0023_add_applicant_registration_date.sql
-- Track initial registration timestamp for all applicants/jobseekers
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

ALTER TABLE applicants ADD COLUMN registration_date TEXT;

UPDATE applicants
SET registration_date = COALESCE(
  registration_date,
  CASE
    WHEN typeof(created_at) = 'integer' THEN datetime(created_at / 1000, 'unixepoch')
    ELSE COALESCE(created_at, CURRENT_TIMESTAMP)
  END
);

COMMIT;
PRAGMA foreign_keys = ON;
