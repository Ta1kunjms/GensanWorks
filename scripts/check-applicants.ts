import { getDatabase, initializeDatabase } from "../server/database";
import { applicantsTable, usersTable } from "../server/unified-schema";

async function checkApplicants() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log("\n=== APPLICANTS TABLE ===");
    const applicants = await db.select().from(applicantsTable);
    console.log(`Total applicants: ${applicants.length}`);
    applicants.forEach(app => {
      console.log(`- ${app.firstName} ${app.surname} (${app.email || 'no email'})`);
    });
    
    console.log("\n=== USERS TABLE ===");
    const users = await db.select().from(usersTable);
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  }
}

checkApplicants();
