-- Migration: Drop and recreate jobs table to use position_title instead of title
DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  employer_id TEXT NOT NULL,
  position_title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
