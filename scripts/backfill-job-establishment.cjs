#!/usr/bin/env node
// Backfill jobs.establishment_name using employers.establishment_name where missing
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

const sql = `
  UPDATE jobs
  SET establishment_name = (
    SELECT establishment_name FROM employers e WHERE e.id = jobs.employer_id
  )
  WHERE (establishment_name IS NULL OR TRIM(establishment_name) = '')
    AND employer_id IS NOT NULL;
`;

db.serialize(() => {
  console.log(`Using database: ${dbPath}`);
  db.run('PRAGMA journal_mode=WAL;');
  db.run(sql, function (err) {
    if (err) {
      console.error('Backfill failed:', err.message);
    } else {
      console.log(`Backfill complete. Rows updated: ${this.changes}`);
    }
    db.close();
  });
});
