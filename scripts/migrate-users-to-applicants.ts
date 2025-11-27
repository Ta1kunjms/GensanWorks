import { getDatabase, initializeDatabase } from "../server/database";
import { applicantsTable } from "../server/unified-schema";
import { eq } from "drizzle-orm";

async function migrateUsersToApplicants() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log("\n=== Migrating Users to Applicants Table ===\n");
    
    // Get all users from the users table (before it's dropped)
    let users: any[] = [];
    try {
      const result: any = await db.all(`SELECT * FROM users`);
      users = result || [];
      console.log(`Found ${users.length} users to migrate`);
    } catch (e) {
      console.log("No users table found or already migrated");
      return;
    }
    
    let migrated = 0;
    let skipped = 0;
    
    for (const user of users) {
      // Only migrate jobseekers and freelancers (not employers)
      if (user.role !== "jobseeker" && user.role !== "freelancer") {
        console.log(`Skipping ${user.email} - role: ${user.role}`);
        skipped++;
        continue;
      }
      
      // Check if applicant with this email already exists
      const existing = await db.select().from(applicantsTable)
        .where(eq(applicantsTable.email, user.email))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing applicant with login credentials
        console.log(`Updating existing applicant: ${user.email}`);
        await db.update(applicantsTable)
          .set({
            passwordHash: user.password_hash,
            role: user.role,
            hasAccount: true,
            updatedAt: new Date(),
          })
          .where(eq(applicantsTable.email, user.email));
        migrated++;
      } else {
        // Create new applicant from user data
        console.log(`Creating new applicant from user: ${user.email}`);
        const nameParts = user.name.trim().split(' ');
        const firstName = nameParts[0] || user.name;
        const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        await db.insert(applicantsTable).values({
          firstName: firstName,
          surname: surname,
          email: user.email,
          passwordHash: user.password_hash,
          role: user.role,
          hasAccount: true,
          employmentType: user.role === "freelancer" ? "Freelancer" : "Jobseeker",
          employmentStatus: "New Entrant",
          municipality: "General Santos City",
          province: "South Cotabato",
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: new Date(),
        });
        migrated++;
      }
    }
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\nNow run: npm run db:push`);
    console.log(`And confirm to drop the users table.\n`);
    
  } catch (error) {
    console.error("Migration error:", error);
  }
}

migrateUsersToApplicants();
