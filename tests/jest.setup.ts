process.env.NODE_ENV = process.env.NODE_ENV || "test";
// Use isolated DB for tests to avoid polluting dev data
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./app.test.db";
}
