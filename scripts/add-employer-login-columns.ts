import { createClient } from "@libsql/client";

async function addEmployerLoginColumns() {
  const client = createClient({ url: "file:./app.db" });
  const db = client;

  console.log("Adding login columns to employers table...");

  try {
    // Add passwordHash column (TEXT, nullable)
    await db.execute(`
      ALTER TABLE employers 
      ADD COLUMN password_hash TEXT;
    `);
    console.log("✓ Added password_hash column");

    // Add hasAccount column (INTEGER for boolean, default 0)
    await db.execute(`
      ALTER TABLE employers 
      ADD COLUMN has_account INTEGER DEFAULT 0;
    `);
    console.log("✓ Added has_account column");

    console.log("✓ Successfully added login columns to employers table");
  } catch (error: any) {
    if (error.message.includes("duplicate column")) {
      console.log("⚠ Columns already exist, skipping...");
    } else {
      throw error;
    }
  }
}

addEmployerLoginColumns().catch(console.error);
