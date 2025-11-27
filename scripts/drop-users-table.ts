import { initializeDatabase } from "../server/database";

async function dropUsersTable() {
  try {
    const db = await initializeDatabase();
    console.log("\n=== Dropping Users Table ===\n");
    
    await (db as any).run(`DROP TABLE IF EXISTS users`);
    
    console.log("✅ Users table dropped successfully!");
    console.log("\n🎉 Migration complete! All jobseekers are now in applicants table.\n");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

dropUsersTable();
