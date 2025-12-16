-- Align tables to requested Applicants/Employers/Jobs columns (SQLite-friendly). If using Postgres, adjust accordingly.

-- Applicants (users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_date INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nsrp_registration_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS archived INTEGER;

-- Employers
ALTER TABLE employers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_industry TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_registration_no TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_period_raw TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vacancies INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nsrp_job_code TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_compensation_type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_compensation_details TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_benefits TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_requirements TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_experience_level TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_education_level TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_shift TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_schedule TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_application_deadline TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_contact_person TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_contact_email TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_contact_phone TEXT;
