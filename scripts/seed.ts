import { hashPassword } from "../server/auth";
import { initializeDatabase } from "../server/database";
import { adminsTable, usersTable, jobsTable, applicationsTable } from "../server/db";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    const db = await initializeDatabase();

    // Create admin account (demo credentials from login page)
    console.log("Creating admin account...");
    const adminId = `admin_${Date.now()}`;
    await db.insert(adminsTable).values({
      id: adminId,
      name: "System Administrator",
      email: "admin@local.test",
      passwordHash: await hashPassword("adminpass"),
      role: "admin",
    });
    console.log("✓ Admin created: admin@local.test (adminpass)");

    // Create sample employers
    console.log("Creating sample employers...");
    const employer1Id = `employer_${Date.now()}_1`;
    const employer2Id = `employer_${Date.now()}_2`;

    await db.insert(usersTable).values({
      id: employer1Id,
      name: "John Smith",
      email: "employer1@company.com",
      company: "Tech Solutions Inc",
      passwordHash: await hashPassword("EmployerPass123!"),
      role: "employer",
    });
    console.log("✓ Employer 1 created: employer1@company.com");

    await db.insert(usersTable).values({
      id: employer2Id,
      name: "Maria Garcia",
      email: "employer2@startup.com",
      company: "Innovation Startup Ltd",
      passwordHash: await hashPassword("EmployerPass456!"),
      role: "employer",
    });
    console.log("✓ Employer 2 created: employer2@startup.com");

    // Create sample jobseekers
    console.log("Creating sample jobseekers...");
    const jobseeker1Id = `jobseeker_${Date.now()}_1`;
    const jobseeker2Id = `jobseeker_${Date.now()}_2`;

    await db.insert(usersTable).values({
      id: jobseeker1Id,
      name: "Juan Dela Cruz",
      email: "jobseeker1@email.com",
      passwordHash: await hashPassword("JobseekerPass123!"),
      role: "jobseeker",
    });
    console.log("✓ Jobseeker 1 created: jobseeker1@email.com");

    await db.insert(usersTable).values({
      id: jobseeker2Id,
      name: "Maria Santos",
      email: "jobseeker2@email.com",
      passwordHash: await hashPassword("JobseekerPass456!"),
      role: "jobseeker",
    });
    console.log("✓ Jobseeker 2 created: jobseeker2@email.com");

    // Create sample jobs
    console.log("Creating sample jobs...");
    const job1Id = `job_${Date.now()}_1`;
    const job2Id = `job_${Date.now()}_2`;

    await db.insert(jobsTable).values({
      id: job1Id,
      employerId: employer1Id,
      title: "Senior Full Stack Developer",
      description: "We are looking for an experienced full stack developer",
      location: "Manila",
      salaryMin: 80000,
      salaryMax: 120000,
      status: "open",
    });
    console.log("✓ Job 1 created: Senior Full Stack Developer");

    await db.insert(jobsTable).values({
      id: job2Id,
      employerId: employer2Id,
      title: "UI/UX Designer",
      description: "Creative UI/UX designer needed for our startup",
      location: "Quezon City",
      salaryMin: 50000,
      salaryMax: 80000,
      status: "open",
    });
    console.log("✓ Job 2 created: UI/UX Designer");

    // Create sample applications
    console.log("Creating sample applications...");
    await db.insert(applicationsTable).values({
      id: `app_${Date.now()}_1`,
      jobId: job1Id,
      jobseekerIds: jobseeker1Id,
      status: "pending",
    });
    console.log("✓ Application 1 created");

    await db.insert(applicationsTable).values({
      id: `app_${Date.now()}_2`,
      jobId: job2Id,
      jobseekerIds: jobseeker2Id,
      status: "pending",
    });
    console.log("✓ Application 2 created");

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("─────────────────────────────");
    console.log("ADMIN (Demo):");
    console.log("  Email: admin@local.test");
    console.log("  Password: adminpass");
    console.log("\nEMPLOYER 1:");
    console.log("  Email: employer1@company.com");
    console.log("  Password: EmployerPass123!");
    console.log("\nEMPLOYER 2:");
    console.log("  Email: employer2@startup.com");
    console.log("  Password: EmployerPass456!");
    console.log("\nJOBSEEKER 1:");
    console.log("  Email: jobseeker1@email.com");
    console.log("  Password: JobseekerPass123!");
    console.log("\nJOBSEEKER 2:");
    console.log("  Email: jobseeker2@email.com");
    console.log("  Password: JobseekerPass456!");
    console.log("─────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase().catch(console.error);
