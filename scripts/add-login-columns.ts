import { initializeDatabase } from "../server/database";

async function addColumnsToApplicants() {
  try {
    const db = await initializeDatabase();
    
    console.log("\n=== Adding Login Columns to Applicants Table ===\n");
    
    try {
      await (db as any).run(`ALTER TABLE applicants ADD COLUMN password_hash TEXT`);
      console.log("✓ Added password_hash column");
    } catch (e: any) {
      if (e.message.includes("duplicate column")) {
        console.log("⏭️  password_hash column already exists");
      } else {
        throw e;
      }
    }
    
    try {
      await (db as any).run(`ALTER TABLE applicants ADD COLUMN role TEXT DEFAULT 'jobseeker'`);
      console.log("✓ Added role column");
    } catch (e: any) {
      if (e.message.includes("duplicate column")) {
        console.log("⏭️  role column already exists");
      } else {
        throw e;
      }
    }
    
    try {
      await (db as any).run(`ALTER TABLE applicants ADD COLUMN has_account INTEGER DEFAULT 0`);
      console.log("✓ Added has_account column");
    } catch (e: any) {
      if (e.message.includes("duplicate column")) {
        console.log("⏭️  has_account column already exists");
      } else {
        throw e;
      }
    }
    
    console.log("\n✅ All columns added successfully!");
    console.log("Now run: npx tsx scripts/migrate-users-to-applicants.ts\n");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

addColumnsToApplicants();
