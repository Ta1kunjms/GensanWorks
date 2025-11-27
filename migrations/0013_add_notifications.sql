-- Migration: Add notifications table
-- drizzle-kit will wrap this appropriately for sqlite/postgres depending on config.

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  role TEXT,
  type TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Optional index for faster querying by user/role
CREATE INDEX IF NOT EXISTS idx_notifications_user_role ON notifications(user_id, role);
