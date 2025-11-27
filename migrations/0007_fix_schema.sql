-- Fix referrals table and add missing columns to job_vacancies
-- This migration recreates the referrals table with all columns properly defined
-- and adds archived columns to job_vacancies

PRAGMA foreign_keys=OFF;

-- Drop referrals indices if they exist
DROP INDEX IF EXISTS idx_referrals_slip_number;
DROP INDEX IF EXISTS referrals_referral_slip_number_unique;

-- Recreate referrals table with correct schema (no unique constraint on slip_number)
CREATE TABLE `__new_referrals` (
	`referral_id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`applicant` text NOT NULL,
	`employer_id` text,
	`employer` text,
	`vacancy_id` text,
	`vacancy` text,
	`barangay` text,
	`job_category` text,
	`date_referred` text,
	`status` text DEFAULT 'Pending' NOT NULL,
	`feedback` text,
	`referral_slip_number` text,
	`peso_officer_name` text,
	`peso_officer_designation` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migrate existing referrals data if the old table exists
INSERT INTO `__new_referrals` SELECT * FROM `referrals` WHERE 1=0;

-- Drop old referrals table
DROP TABLE IF EXISTS `referrals`;

-- Rename new table to referrals
ALTER TABLE `__new_referrals` RENAME TO `referrals`;

-- Add archived columns to job_vacancies if they don't exist
ALTER TABLE `job_vacancies` ADD COLUMN `archived` integer DEFAULT false;
ALTER TABLE `job_vacancies` ADD COLUMN `archived_at` integer;

PRAGMA foreign_keys=ON;
