import { initializeDatabase } from "../server/database";
import { adminsTable } from "../server/unified-schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    console.log("\n🔐 Creating Super Admin Account\n");

    // Initialize database
    console.log("⏳ Connecting to database...");
    const db = await initializeDatabase();

    // Default admin credentials for quick setup
    const adminData = {
      name: "Super Admin",
      email: "admin@gensan-works.com",
      password: "SuperAdmin@123",
    };

    // Check if email already exists
    console.log("⏳ Checking if email already exists...");
    const existingAdmin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, adminData.email));

    if (existingAdmin.length > 0) {
      console.log("\n✅ Admin account already exists!");
      console.log(`   Email: ${adminData.email}\n`);
      process.exit(0);
    }

    // Hash password
    console.log("⏳ Hashing password...");
    const passwordHash = await hashPassword(adminData.password);

    // Create admin
    console.log("⏳ Creating admin account...");
    await db.insert(adminsTable).values({
      id: `admin_${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      passwordHash,
      role: "admin",
    });

    console.log("\n✅ Super Admin account created successfully!\n");
    console.log("📋 Account Details:");
    console.log(`   Name:     ${adminData.name}`);
    console.log(`   Email:    ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role:     Admin\n`);
    console.log("🔑 You can now login with these credentials.\n");
    console.log("📍 Login URL: http://localhost:5000\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
