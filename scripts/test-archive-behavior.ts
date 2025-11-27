import { initializeDatabase } from "../server/database";
import { jobsTable, jobVacanciesTable } from "../server/unified-schema";

async function testJobCounts() {
  try {
    const db = await initializeDatabase();
    
    const jobs = await db.select().from(jobsTable);
    const vacancies = await db.select().from(jobVacanciesTable);
    
    console.log('\n=== CURRENT DATABASE STATE ===');
    console.log(`Total jobs in DB: ${jobs.length}`);
    console.log(`Total vacancies in DB: ${vacancies.length}`);
    
    console.log('\n=== VACANCIES BREAKDOWN ===');
    const archivedVacancies = vacancies.filter(v => v.archived);
    const nonArchivedVacancies = vacancies.filter(v => !v.archived);
    console.log(`Non-archived vacancies: ${nonArchivedVacancies.length}`);
    console.log(`Archived vacancies: ${archivedVacancies.length}`);
    
    vacancies.forEach(v => {
      console.log(`  - ${v.positionTitle || 'Untitled'}: archived=${v.archived}`);
    });
    
    console.log('\n=== DASHBOARD COUNT (NEW BEHAVIOR) ===');
    console.log(`Total Job Posts (includes archived): ${jobs.length + vacancies.length}`);
    console.log('Note: Only DELETED posts reduce this count, archived posts still count');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testJobCounts();
