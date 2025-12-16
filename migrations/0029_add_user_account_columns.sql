ALTER TABLE `users` ADD COLUMN `has_account` integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `house_street_village` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `other_skills` text;
