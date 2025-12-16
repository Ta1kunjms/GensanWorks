-- 0016_recreate_jobs_table.sql
-- Drop and recreate the jobs table with SRS Form 2A-compliant columns

DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  employer_id TEXT,
  establishment_name TEXT,
  position_title TEXT NOT NULL,
  industry_codes TEXT,
  minimum_education_required TEXT,
  main_skill_or_specialization TEXT,
  years_of_experience_required INTEGER,
  age_preference TEXT,
  starting_salary_or_wage REAL,
  vacant_positions INTEGER,
  paid_employees INTEGER,
  job_status TEXT,
  prepared_by_name TEXT,
  prepared_by_designation TEXT,
  prepared_by_contact TEXT,
  date_accomplished TEXT,
  barangay TEXT,
  municipality TEXT,
  province TEXT,
  archived INTEGER DEFAULT 0,
  archived_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
);
