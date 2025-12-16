CREATE TABLE IF NOT EXISTS `referrals` (
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
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
