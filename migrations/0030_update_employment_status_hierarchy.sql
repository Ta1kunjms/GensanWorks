ALTER TABLE `users` ADD COLUMN `employment_status_detail` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `self_employed_category` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `self_employed_category_other` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `unemployed_reason` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `unemployed_reason_other` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `unemployed_abroad_country` text;
--> statement-breakpoint

UPDATE `users`
SET
  `employment_status_detail` = CASE
    WHEN `employment_status` IN ('Employed', 'Wage employed') THEN 'Wage employed'
    WHEN `employment_status` IN ('Self-employed', 'Fisherman/Fisherfolk', 'Vendor/Retailer', 'Home-based worker', 'Transport', 'Domestic Worker', 'Freelancer', 'Artisan/Craft Worker', 'Others') THEN 'Self-employed'
    ELSE `employment_status_detail`
  END,
  `self_employed_category` = CASE
    WHEN `employment_status` IN ('Fisherman/Fisherfolk', 'Vendor/Retailer', 'Home-based worker', 'Transport', 'Domestic Worker', 'Freelancer', 'Artisan/Craft Worker', 'Others') THEN `employment_status`
    ELSE `self_employed_category`
  END,
  `unemployed_reason` = CASE
    WHEN `employment_status` IN (
      'New Entrant/Fresh Graduate',
      'Finished Contract',
      'Resigned',
      'Retired',
      'Terminated/Laid off',
      'Terminated/Laid off due to calamity',
      'Terminated/Laid off (local)',
      'Terminated/Laid off (abroad)',
      'Terminated/Laid off abroad'
    ) THEN CASE
      WHEN `employment_status` = 'Terminated/Laid off' THEN 'Terminated/Laid off (local)'
      WHEN `employment_status` = 'Terminated/Laid off abroad' THEN 'Terminated/Laid off (abroad)'
      ELSE `employment_status`
    END
    ELSE `unemployed_reason`
  END,
  `employment_status` = CASE
    WHEN `employment_status` IN (
      'Employed',
      'Wage employed',
      'Self-employed',
      'Fisherman/Fisherfolk',
      'Vendor/Retailer',
      'Home-based worker',
      'Transport',
      'Domestic Worker',
      'Freelancer',
      'Artisan/Craft Worker',
      'Others'
    ) THEN 'Employed'
    WHEN `employment_status` IN (
      'Unemployed',
      'New Entrant/Fresh Graduate',
      'Finished Contract',
      'Resigned',
      'Retired',
      'Terminated/Laid off',
      'Terminated/Laid off due to calamity',
      'Terminated/Laid off (local)',
      'Terminated/Laid off (abroad)',
      'Terminated/Laid off abroad'
    ) THEN 'Unemployed'
    ELSE `employment_status`
  END;
--> statement-breakpoint

UPDATE `users`
SET `self_employed_category` = CASE
  WHEN `self_employed_category` IS NULL AND `employment_type` IN (
    'Fisherman/Fisherfolk',
    'Vendor/Retailer',
    'Home-based worker',
    'Transport',
    'Domestic Worker',
    'Freelancer',
    'Artisan/Craft Worker',
    'Others'
  ) THEN `employment_type`
  ELSE `self_employed_category`
END
WHERE `self_employed_category` IS NULL;
--> statement-breakpoint
