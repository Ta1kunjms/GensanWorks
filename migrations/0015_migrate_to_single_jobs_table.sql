-- 0015_migrate_to_single_jobs_table.sql
-- Drop jobVacanciesTable and migrate all SRS Form 2A fields to jobsTable

-- 1. Drop jobVacanciesTable if exists
DROP TABLE IF EXISTS jobVacanciesTable;

-- 2. Remove all data from jobsTable for a fresh start
DELETE FROM jobsTable;

-- 3. Add SRS Form 2A fields to jobsTable (if not already present)
ALTER TABLE jobsTable ADD positionTitle TEXT;
ALTER TABLE jobsTable ADD minimumEducationRequired TEXT;
ALTER TABLE jobsTable ADD mainSkillOrSpecialization TEXT;
ALTER TABLE jobsTable ADD yearsOfExperienceRequired INTEGER;
ALTER TABLE jobsTable ADD agePreference TEXT;
ALTER TABLE jobsTable ADD startingSalaryOrWage REAL;
ALTER TABLE jobsTable ADD jobStatus TEXT;
ALTER TABLE jobsTable ADD establishmentName TEXT;
ALTER TABLE jobsTable ADD industryCodes TEXT;
ALTER TABLE jobsTable ADD barangay TEXT;
ALTER TABLE jobsTable ADD municipality TEXT;
ALTER TABLE jobsTable ADD province TEXT;
ALTER TABLE jobsTable ADD preparedByName TEXT;
ALTER TABLE jobsTable ADD preparedByDesignation TEXT;
ALTER TABLE jobsTable ADD preparedByContact TEXT;
ALTER TABLE jobsTable ADD dateAccomplished TEXT;
