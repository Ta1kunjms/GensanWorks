import { createClient } from '@libsql/client';

async function run() {
  const url = 'file:./app.db';
  const authToken = undefined;
  const client = createClient({ url, authToken });

  // Helper: add column if not exists (SQLite lacks IF NOT EXISTS for ALTER TABLE ADD COLUMN validation)
  async function ensureColumn(table: string, column: string, type: string) {
    const pragma = await client.execute(`PRAGMA table_info(${table});`);
    const exists = Array.isArray(pragma.rows) && pragma.rows.some((r: any) => r.name === column);
    if (!exists) {
      console.log(`Adding column ${column} to ${table}`);
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
    } else {
      console.log(`Column ${column} already exists on ${table}`);
    }
  }

  try {
    await ensureColumn('job_vacancies', 'vacant_positions', 'INTEGER');
    await ensureColumn('job_vacancies', 'paid_employees', 'INTEGER');
    console.log('✓ Migration completed for vacant_positions & paid_employees');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

run();
