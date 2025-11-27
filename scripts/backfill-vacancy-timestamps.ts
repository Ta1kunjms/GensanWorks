import { initializeDatabase, getDatabase } from "../server/database";
import { jobVacanciesTable } from "../server/unified-schema";
import { sql } from "drizzle-orm";

async function run() {
  await initializeDatabase();
  const db = getDatabase();
  const vacancies = await db.select().from(jobVacanciesTable);
  let updated = 0;
  for (const v of vacancies as any[]) {
    if (!v.createdAt || !v.updatedAt) {
      const now = new Date();
      await db.update(jobVacanciesTable)
        .set({
          createdAt: v.createdAt ?? now,
          updatedAt: v.updatedAt ?? now,
        })
        .where(sql`${jobVacanciesTable.id} = ${v.id}`);
      updated++;
    }
  }
  console.log(`Backfill complete. Updated ${updated} vacancy records.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
