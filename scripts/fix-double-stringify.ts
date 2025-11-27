import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./app.db' });

async function fix() {
  await client.execute({
    sql: 'UPDATE job_vacancies SET industry_codes = ? WHERE id = ?',
    args: ['["04"]', 'vacancy_1764176977628']
  });
  console.log('Fixed double-stringified industry codes');
}

fix().then(() => process.exit()).catch(e => { console.error(e); process.exit(1); });
