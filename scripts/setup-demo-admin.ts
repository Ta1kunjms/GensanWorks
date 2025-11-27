import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth";
import { initializeDatabase } from "../server/database";
import { adminsTable } from "../server/db";

async function setupDemoAdmin() {
  console.log("🔧 Setting up demo admin account...");

  try {
    const db = await initializeDatabase();

    // Check if admin already exists
    const existing = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, "admin@local.test"))
      .limit(1);

    if (existing.length > 0) {
      console.log("✓ Demo admin already exists: admin@local.test");
      process.exit(0);
    }

    // Create demo admin account
    console.log("Creating demo admin account...");
    const adminId = `admin_${Date.now()}`;
    await db.insert(adminsTable).values({
      id: adminId,
      name: "System Administrator",
      email: "admin@local.test",
      passwordHash: await hashPassword("adminpass"),
      role: "admin",
    });

    console.log("\n✅ Demo admin created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("─────────────────────────────");
    console.log("Email: admin@local.test");
    console.log("Password: adminpass");
    console.log("─────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up demo admin:", error);
    process.exit(1);
  }
}

// Run setup
setupDemoAdmin().catch(console.error);
