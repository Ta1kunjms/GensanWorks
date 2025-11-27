import { drizzle } from "drizzle-orm/libsql";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createClient } from "@libsql/client";
import * as schema from "./unified-schema";
import path from "path";

let db: any = null;

export async function initializeDatabase() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL || "file:./app.db";
  const isPostgres = databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    // PostgreSQL setup
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    db = drizzlePostgres(pool, { schema });
    console.log("✓ Connected to PostgreSQL");
  } else {
    // SQLite setup using libsql
    const dbPath = databaseUrl.replace("file:", "").trim();
    const client = createClient({
      url: databaseUrl,
    });
    db = drizzle(client, { schema });
    console.log(`✓ Connected to SQLite at ${dbPath}`);
  }

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export type Database = typeof db;
