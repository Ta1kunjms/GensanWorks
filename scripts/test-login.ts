import { eq } from "drizzle-orm";
import { verifyPassword } from "../server/auth";
import { initializeDatabase } from "../server/database";
import { adminsTable } from "../server/db";

async function testLogin() {
  console.log("🔐 Testing login flow...");

  try {
    const db = await initializeDatabase();

    // Step 1: Get admin by email
    console.log("\n1️⃣ Getting admin by email (admin@local.test)...");
    const admin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, "admin@local.test"))
      .limit(1);

    if (admin.length === 0) {
      console.log("❌ Admin not found");
      process.exit(1);
    }

    console.log("✓ Admin found:", admin[0].email);
    console.log("  Has passwordHash:", !!admin[0].passwordHash);

    // Step 2: Verify password
    console.log("\n2️⃣ Verifying password (adminpass)...");
    const isValid = await verifyPassword("adminpass", admin[0].passwordHash!);
    
    if (isValid) {
      console.log("✓ Password is valid!");
      console.log("\n✅ Login would succeed!");
    } else {
      console.log("❌ Password verification failed");
      console.log("  Entered password: adminpass");
      console.log("  Stored hash: ", admin[0].passwordHash);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testLogin().catch(console.error);
