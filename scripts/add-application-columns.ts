import { createClient } from '@libsql/client';

async function run() {
  const url = 'file:./app.db';
  const authToken = undefined;
  const client = createClient({ url, authToken });

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

  async function ensureIndex(name: string, createSql: string) {
    const idx = await client.execute(`SELECT name FROM sqlite_master WHERE type='index' AND name='${name}';`);
    const exists = Array.isArray(idx.rows) && idx.rows.some((r: any) => r.name === name);
    if (!exists) {
      console.log(`Creating index ${name}`);
      await client.execute(createSql);
    } else {
      console.log(`Index ${name} already exists`);
    }
  }

  try {
    await ensureColumn('applications', 'applicant_id', 'TEXT');
    await ensureColumn('applications', 'cover_letter', 'TEXT');

    await ensureIndex('idx_applications_applicant_id', `CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);`);
    await ensureIndex('idx_applications_job_applicant', `CREATE INDEX idx_applications_job_applicant ON applications(job_id, applicant_id);`);

    console.log('✓ Migration completed for applications table');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

run();
