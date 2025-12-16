import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import process from "process";
import { createClient } from "@libsql/client";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "file:./app.db";
  const migrationsDir = path.resolve("migrations");
  const client = createClient({ url: dbUrl });

  const files = readdirSync(migrationsDir)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  const existingResult = await client.execute({
    sql: "SELECT hash FROM __drizzle_migrations",
  });
  const existingHashes = new Set(existingResult.rows.map((row) => String(row.hash)));

  let inserted = 0;
  for (const fileName of files) {
    const filePath = path.join(migrationsDir, fileName);
    const sql = readFileSync(filePath, "utf-8");
    const hash = createHash("sha256").update(sql).digest("hex");
    if (existingHashes.has(hash)) {
      continue;
    }

    await client.execute({
      sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, strftime('%s','now'))",
      args: [hash],
    });
    inserted += 1;
    console.log(`Registered migration ${fileName}`);
  }

  if (inserted === 0) {
    console.log("No new migrations needed to register.");
  } else {
    console.log(`Registered ${inserted} migrations.`);
  }
}

main().catch((error) => {
  console.error("Failed to backfill drizzle migrations:", error);
  process.exit(1);
});
