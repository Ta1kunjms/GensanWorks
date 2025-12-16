CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'jobseeker' NOT NULL,
	`surname` text NOT NULL,
	`first_name` text NOT NULL,
	`middle_name` text,
	`suffix` text,
	`date_of_birth` text,
	`sex` text,
	`religion` text,
	`civil_status` text,
	`height` text,
	`weight` text,
	`blood_type` text,
	`contact_number` text,
	`disability` text,
	`disability_specify` text,
	`address` text,
	`barangay` text,
	`municipality` text,
	`province` text,
	`zip_code` text,
	`employment_status` text,
	`employment_type` text,
	`employment_type_4` text,
	`months_unemployed` integer,
	`is_ofw` integer DEFAULT false,
	`ofw_country` text,
	`is_former_ofw` integer DEFAULT false,
	`former_ofw_country` text,
	`return_to_ph_date` text,
	`is_4ps_beneficiary` integer DEFAULT false,
	`household_id` text,
	`nsrp_number` text,
	`government_id_type` text,
	`government_id_number` text,
	`willing_to_relocate` integer DEFAULT false,
	`willing_to_work_overseas` integer DEFAULT false,
	`job_preferences` text,
	`preferred_occupations` text,
	`preferred_locations` text,
	`preferred_overseas_countries` text,
	`education` text,
	`technical_training` text,
	`professional_licenses` text,
	`language_proficiency` text,
	`work_experience` text,
	`skills` text,
	`other_skills_specify` text,
	`attachments` text,
	`notes` text,
	`registered_at` integer,
	`last_login_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_nsrp_unique` ON `users` (`nsrp_number`);--> statement-breakpoint
DROP TABLE `applicant_education`;--> statement-breakpoint
DROP TABLE `applicant_languages`;--> statement-breakpoint
DROP TABLE `applicant_licenses`;--> statement-breakpoint
DROP TABLE `applicant_skills`;--> statement-breakpoint
DROP TABLE `applicant_trainings`;--> statement-breakpoint
DROP TABLE `applicant_work_experience`;--> statement-breakpoint
DROP TABLE `applicants`;