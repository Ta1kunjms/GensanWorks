-- Add createdAt timestamp to any applicants missing it
UPDATE applicants 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL OR created_at = 0;
