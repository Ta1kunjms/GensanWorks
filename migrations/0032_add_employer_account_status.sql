-- Add account status and created_by tracking to employers table
-- accountStatus: 'active' (can post jobs), 'pending' (awaiting approval), 'rejected' (denied)
-- createdBy: 'admin' (created by admin), 'self' (self-registered)

ALTER TABLE employers ADD COLUMN account_status TEXT DEFAULT 'pending';
ALTER TABLE employers ADD COLUMN created_by TEXT DEFAULT 'self';
ALTER TABLE employers ADD COLUMN reviewed_by TEXT;
ALTER TABLE employers ADD COLUMN reviewed_at INTEGER;
ALTER TABLE employers ADD COLUMN rejection_reason TEXT;

-- Set existing employers to 'active' status (backward compatibility)
UPDATE employers SET account_status = 'active' WHERE account_status IS NULL OR account_status = 'pending';
