import { initializeDatabase } from "../server/database";
import { adminsTable } from "../server/unified-schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

async function createDemoAdmin() {
  try {
    console.log("\n🔐 Creating Demo Admin Account\n");

    // Initialize database
    console.log("⏳ Connecting to database...");
    const db = await initializeDatabase();

    // Demo admin credentials (matching login page)
    const adminData = {
      name: "Demo Admin",
      email: "admin@local.test",
      password: "adminpass",
    };

    // Check if email already exists
    console.log("⏳ Checking if email already exists...");
    const existingAdmin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, adminData.email));

    if (existingAdmin.length > 0) {
      console.log("\n✅ Demo admin account already exists!");
      console.log(`   Email: ${adminData.email}\n`);
      process.exit(0);
    }

    // Hash password
    console.log("⏳ Hashing password...");
    const passwordHash = await hashPassword(adminData.password);

    // Create admin
    console.log("⏳ Creating demo admin account...");
    await db.insert(adminsTable).values({
      id: `admin_${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      passwordHash,
      role: "admin",
    });

    console.log("\n✅ Demo Admin account created successfully!\n");
    console.log("📋 Account Details:");
    console.log(`   Name:     ${adminData.name}`);
    console.log(`   Email:    ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log("\n⚠️  These are DEMO credentials. Change them in production!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating demo admin:", error);
    process.exit(1);
  }
}

createDemoAdmin();
