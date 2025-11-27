import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "file:./app.db";

// Determine dialect based on DATABASE_URL
const isPostgres = databaseUrl.startsWith("postgresql://");
const dialect = isPostgres ? "postgresql" : "sqlite";

export default defineConfig({
  out: "./migrations",
  schema: "./server/unified-schema.ts",
  dialect: dialect,
  dbCredentials: isPostgres
    ? { url: databaseUrl }
    : { url: databaseUrl },
});
