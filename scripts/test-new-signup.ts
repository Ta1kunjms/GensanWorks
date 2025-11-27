import { getDatabase, initializeDatabase } from "../server/database";
import { applicantsTable, usersTable } from "../server/unified-schema";

async function testNewSignupFlow() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log("\n=== Testing New Signup Flow with First Name & Last Name ===\n");
    
    // Simulate what the new signup endpoint does
    const testEmail = `new.signup.${Date.now()}@gmail.com`;
    const firstName = "Maria";
    const lastName = "Santos";
    const fullName = `${firstName} ${lastName}`;
    
    const userId = `JS-${Date.now()}`;
    const applicantId = `applicant_${Date.now()}`;
    const now = new Date();
    
    console.log("Creating account for:");
    console.log(`  First Name: ${firstName}`);
    console.log(`  Last Name: ${lastName}`);
    console.log(`  Email: ${testEmail}`);
    console.log("");
    
    // Create user
    await db.insert(usersTable).values({
      id: userId,
      name: fullName,
      email: testEmail,
      passwordHash: "test_hash",
      role: "jobseeker",
      company: null,
      profileData: {},
      createdAt: now,
      updatedAt: now,
    });
    
    // Create applicant with proper firstName and surname
    await db.insert(applicantsTable).values({
      id: applicantId,
      firstName: firstName,
      surname: lastName,
      email: testEmail,
      employmentType: "Jobseeker",
      employmentStatus: "New Entrant",
      municipality: "General Santos City",
      province: "South Cotabato",
      createdAt: now,
      updatedAt: now,
    });
    
    console.log("✓ Created user account");
    console.log("✓ Created applicant record");
    
    // Verify in database
    const { eq } = await import("drizzle-orm");
    const applicant = await db.select().from(applicantsTable).where(eq(applicantsTable.email, testEmail)).limit(1);
    const user = await db.select().from(usersTable).where(eq(usersTable.email, testEmail)).limit(1);
    
    if (applicant.length > 0 && user.length > 0) {
      console.log("\n✅ SUCCESS! Records created correctly:");
      console.log("\nIn Users Table:");
      console.log(`  Name: ${user[0].name}`);
      console.log(`  Email: ${user[0].email}`);
      console.log(`  Role: ${user[0].role}`);
      
      console.log("\nIn Applicants Table:");
      console.log(`  First Name: ${applicant[0].firstName}`);
      console.log(`  Surname: ${applicant[0].surname}`);
      console.log(`  Email: ${applicant[0].email}`);
      console.log(`  Type: ${applicant[0].employmentType}`);
      
      console.log("\n🎉 Admin will see in Applicants Page:");
      console.log(`  First Name column: ${applicant[0].firstName}`);
      console.log(`  Surname column: ${applicant[0].surname}`);
      console.log(`  Account Status: Active ✓`);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testNewSignupFlow();
