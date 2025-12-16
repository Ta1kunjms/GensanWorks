import { storage } from '../server/storage';
import { jobsTable } from '../server/unified-schema';
import { eq } from 'drizzle-orm';

async function moveApprovedJobsToNeedsReview() {
  const db = await storage.getDb();
  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.status, 'approved'));
  if (!jobs.length) {
    console.log('No jobs with status "approved" found.');
    return;
  }
  const now = new Date();
  for (const job of jobs) {
    await db.update(jobsTable)
      .set({ status: 'pending', updatedAt: now })
      .where(eq(jobsTable.id, job.id));
    console.log(`Moved job ${job.id} (${job.positionTitle}) to 'pending' (Needs Review)`);
  }
  console.log(`Moved ${jobs.length} jobs to 'pending' (Needs Review).`);
}

moveApprovedJobsToNeedsReview().catch((err) => {
  console.error('Error moving jobs:', err);
  process.exit(1);
});
