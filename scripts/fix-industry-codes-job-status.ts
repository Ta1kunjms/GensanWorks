import { createClient } from '@libsql/client';

const DATABASE_URL = process.env.DATABASE_URL || 'file:./app.db';

async function main() {
  const client = createClient({ url: DATABASE_URL });

  console.log('Fetching all job vacancies...');
  const result = await client.execute('SELECT id, industry_codes, job_status FROM job_vacancies');
  
  console.log(`Found ${result.rows.length} vacancies to check`);

  for (const row of result.rows) {
    const id = row.id as string;
    let industryCodes = row.industry_codes as string | null;
    let jobStatus = row.job_status as string | null;
    let needsUpdate = false;
    let newIndustryCodes: string | null = industryCodes;
    let newJobStatus: string | null = jobStatus;

    // Fix industry codes
    if (industryCodes) {
      try {
        // Handle double-stringified JSON
        let parsed = JSON.parse(industryCodes);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        
        if (Array.isArray(parsed)) {
          // Pad industry codes to 2 digits
          const paddedCodes = parsed.map(code => {
            const codeStr = String(code);
            return codeStr.length === 1 ? `0${codeStr}` : codeStr;
          });
          
          // Check if any code needed padding
          if (JSON.stringify(parsed) !== JSON.stringify(paddedCodes)) {
            newIndustryCodes = JSON.stringify(paddedCodes);
            needsUpdate = true;
            console.log(`  ${id}: industry codes ${JSON.stringify(parsed)} → ${newIndustryCodes}`);
          }
        }
      } catch (e) {
        console.error(`  ${id}: failed to parse industry_codes: ${industryCodes}`);
      }
    }

    // Fix job status
    if (jobStatus) {
      let newStatus = jobStatus;
      if (jobStatus === 'Permanent') newStatus = 'P';
      else if (jobStatus === 'Temporary') newStatus = 'T';
      else if (jobStatus === 'Contractual') newStatus = 'C';
      
      if (newStatus !== jobStatus) {
        newJobStatus = newStatus;
        needsUpdate = true;
        console.log(`  ${id}: job status "${jobStatus}" → "${newStatus}"`);
      }
    }

    // Update if needed
    if (needsUpdate) {
      await client.execute({
        sql: 'UPDATE job_vacancies SET industry_codes = ?, job_status = ? WHERE id = ?',
        args: [newIndustryCodes, newJobStatus, id]
      });
    }
  }

  console.log('\n✓ Migration complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
