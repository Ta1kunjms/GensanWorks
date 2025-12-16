-- 0022_add_job_comp_fields.sql
-- Extend jobs table to support location and salary range fields used by employer/admin flows
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

ALTER TABLE jobs ADD COLUMN location TEXT;
ALTER TABLE jobs ADD COLUMN salary_min REAL;
ALTER TABLE jobs ADD COLUMN salary_max REAL;
ALTER TABLE jobs ADD COLUMN salary_period TEXT;
ALTER TABLE jobs ADD COLUMN salary_amount REAL;
ALTER TABLE jobs ADD COLUMN salary_type TEXT;
ALTER TABLE jobs ADD COLUMN skills TEXT;

COMMIT;
PRAGMA foreign_keys=on;
