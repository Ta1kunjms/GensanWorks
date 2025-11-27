import { initializeDatabase, getDatabase } from "../server/database";
import { jobsTable } from "../server/unified-schema";
import { sql } from "drizzle-orm";

async function run() {
  await initializeDatabase();
  const db = getDatabase();
  const jobs = await db.select().from(jobsTable);
  let updated = 0;
  for (const j of jobs as any[]) {
    if (!j.createdAt || !j.updatedAt) {
      const now = new Date();
      await db.update(jobsTable)
        .set({
          createdAt: j.createdAt ?? now,
          updatedAt: j.updatedAt ?? now,
        })
        .where(sql`${jobsTable.id} = ${j.id}`);
      updated++;
    }
  }
  console.log(`Backfill complete. Updated ${updated} job records.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
