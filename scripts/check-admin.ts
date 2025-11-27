import { eq } from "drizzle-orm";
import { initializeDatabase } from "../server/database";
import { adminsTable } from "../server/db";

async function checkAdmin() {
  console.log("🔍 Checking admin table...");

  try {
    const db = await initializeDatabase();

    // Get all admins
    const admins = await db.select().from(adminsTable);
    console.log("\n📋 All admins in database:");
    console.log(JSON.stringify(admins, null, 2));

    // Check for admin@local.test specifically
    const localAdmin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, "admin@local.test"))
      .limit(1);

    if (localAdmin.length > 0) {
      console.log("\n✓ Found admin@local.test:");
      console.log("  ID:", localAdmin[0].id);
      console.log("  Name:", localAdmin[0].name);
      console.log("  Email:", localAdmin[0].email);
      console.log("  Role:", localAdmin[0].role);
      console.log("  Has passwordHash:", !!localAdmin[0].passwordHash);
    } else {
      console.log("\n✗ admin@local.test NOT found in database");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAdmin().catch(console.error);
