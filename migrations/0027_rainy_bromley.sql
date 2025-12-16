CREATE TABLE `applicant_education` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`level` text,
	`course` text,
	`school_name` text,
	`year_graduated` text,
	`strand` text,
	`level_reached` text,
	`from_year` text,
	`to_year` text,
	`honors_received` text,
	`scholarship_or_grant` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_languages` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`language` text NOT NULL,
	`dialect` text,
	`read` integer,
	`write` integer,
	`speak` integer,
	`understand` integer,
	`remarks` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`eligibility` text,
	`date_taken` text,
	`license_number` text,
	`valid_until` text,
	`issued_by` text,
	`rating` text,
	`exam_place` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`skill_name` text,
	`skill_type` text,
	`other_details` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_trainings` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`course` text,
	`training_type` text,
	`hours_of_training` integer,
	`training_institution` text,
	`skills_acquired` text,
	`certificates_received` text,
	`date_completed` text,
	`sponsored_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_work_experience` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`company_name` text,
	`address` text,
	`position` text,
	`number_of_months` integer,
	`start_date` text,
	`end_date` text,
	`status` text,
	`industry` text,
	`monthly_salary` real,
	`reason_for_leaving` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employer_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`employer_id` text NOT NULL,
	`email` text,
	`password_hash` text,
	`requirement_data` text,
	`srs_form_submitted` integer DEFAULT false,
	`srs_form_attachment` text,
	`business_permit_submitted` integer DEFAULT false,
	`business_permit_attachment` text,
	`bir2303_submitted` integer DEFAULT false,
	`bir2303_attachment` text,
	`company_profile_submitted` integer DEFAULT false,
	`company_profile_attachment` text,
	`dole_certification_submitted` integer DEFAULT false,
	`dole_certification_attachment` text,
	`other_documents` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`employer_id` text,
	`email` text,
	`password_hash` text,
	`requirement_data` text,
	`referral_slip_submitted` integer DEFAULT false,
	`referral_slip_attachment` text,
	`employment_contract_submitted` integer DEFAULT false,
	`employment_contract_attachment` text,
	`medical_certificate_submitted` integer DEFAULT false,
	`medical_certificate_attachment` text,
	`barangay_clearance_submitted` integer DEFAULT false,
	`barangay_clearance_attachment` text,
	`police_clearance_submitted` integer DEFAULT false,
	`police_clearance_attachment` text,
	`additional_documents` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `applicants` ADD `name` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `profile_image` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `address` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `household_head` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `dependents_count` integer;--> statement-breakpoint
ALTER TABLE `applicants` ADD `job_preference` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `registration_date` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `nsrp_number` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `nsrp_status` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `government_id_type` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `government_id_number` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `trade_name` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `complete_address` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `address_details` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `contact_email` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `contact_person` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `alternate_contacts` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `industry_codes` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `subscription_status` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `company_tax_id_number` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `requirements` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `attachments` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `barangay_chairperson` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `barangay_secretary` text;--> statement-breakpoint
ALTER TABLE `employers` ADD `geographic_identification` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `description` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `location` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary_min` real;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary_max` real;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary_period` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary_amount` real;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary_type` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `salary` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `contact` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `requirements` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `attachments` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `account_metadata` text;