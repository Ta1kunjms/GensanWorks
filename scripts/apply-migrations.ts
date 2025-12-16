import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import process from "process";
import { createClient } from "@libsql/client";

const BREAKPOINT = "--> statement-breakpoint";

function normalizeSql(content: string) {
  return content.replace(/\r\n/g, "\n");
}

function stripLeadingComments(chunk: string) {
  const lines = chunk.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.length === 0 ? false : !trimmed.startsWith("--");
  });
  return filtered.join("\n").trim();
}

function splitStatements(sql: string) {
  return sql
    .split(BREAKPOINT)
    .map((chunk) => stripLeadingComments(chunk))
    .filter((chunk) => chunk.length > 0);
}

async function ensureMigrationsTable(client: ReturnType<typeof createClient>) {
  await client.execute(`CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL
  );`);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "file:./app.db";
  const migrationsDir = path.resolve("migrations");
  const client = createClient({ url: dbUrl });

  await ensureMigrationsTable(client);

  const appliedHashes = new Set(
    (await client.execute({ sql: "SELECT hash FROM __drizzle_migrations" })).rows.map((row) => String(row.hash))
  );

  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => /^\d+[a-zA-Z0-9_-]*\.sql$/.test(file))
    .sort();

  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationsDir, fileName);
    const raw = readFileSync(filePath, "utf-8");
    const normalized = normalizeSql(raw);
    const statements = splitStatements(normalized);
    if (statements.length === 0) {
      continue;
    }

    const hash = createHash("sha256").update(normalized).digest("hex");
    if (appliedHashes.has(hash)) {
      console.log(`Skipping ${fileName} (already applied)`);
      continue;
    }

    console.log(`Applying ${fileName}...`);
    await client.execute("BEGIN TRANSACTION");
    try {
      for (const statement of statements) {
        await client.execute(statement);
      }
      await client.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, strftime('%s','now'))",
        args: [hash],
      });
      await client.execute("COMMIT");
      appliedHashes.add(hash);
      console.log(`Applied ${fileName}`);
    } catch (error) {
      await client.execute("ROLLBACK");
      console.error(`Failed while applying ${fileName}`);
      throw error;
    }
  }

  console.log("All migrations applied.");
}

main().catch((error) => {
  console.error("Migration application failed:", error);
  process.exit(1);
});
