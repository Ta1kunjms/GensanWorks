-- Add salary_period column to jobs table
ALTER TABLE jobs ADD COLUMN salary_period TEXT DEFAULT 'monthly';
