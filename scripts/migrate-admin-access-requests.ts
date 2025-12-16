import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { getDatabase } from "../server/database";

async function main() {
  const db = getDatabase();
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migration complete");
}

main().catch(console.error);
