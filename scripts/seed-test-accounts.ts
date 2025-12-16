import bcrypt from "bcryptjs";
import crypto from "crypto";
import { initializeDatabase } from "../server/database";
import { usersTable, employersTable, adminsTable } from "../server/unified-schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = await initializeDatabase();

  const adminEmail = "admin@local.test";
  const employerEmail = "employer01@gensanworks-demo.ph";
  const jobseekerEmail = "applicant001@demo.gensanworks.com";

  const adminPassword = "adminpass";
  const employerPassword = "EmployerDemoPass123!";
  const jobseekerPassword = "JobseekerDemoPass123!";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const employerHash = await bcrypt.hash(employerPassword, 10);
  const jobseekerHash = await bcrypt.hash(jobseekerPassword, 10);

  // Upsert admin in adminsTable
  const existingAdmins = await db.select().from(adminsTable).where(eq(adminsTable.email, adminEmail));
  if (existingAdmins.length === 0) {
    await db.insert(adminsTable).values({
      id: crypto.randomUUID(),
      email: adminEmail,
      passwordHash: adminHash,
      name: "Demo Admin",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Upsert employer in employersTable
  const existingEmployers = await db.select().from(employersTable).where(eq(employersTable.email, employerEmail));
  if (existingEmployers.length === 0) {
    await db.insert(employersTable).values({
      id: crypto.randomUUID(),
      establishmentName: "Demo Employer 01",
      barangay: "Lagao",
      municipality: "General Santos City",
      province: "South Cotabato",
      contactNumber: "09123456781",
      email: employerEmail,
      industryType: "Retail",
      passwordHash: employerHash,
      hasAccount: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  // Upsert jobseeker in usersTable
  const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, jobseekerEmail));
  if (existingUsers.length === 0) {
    await db.insert(usersTable).values({
      id: crypto.randomUUID(),
      email: jobseekerEmail,
      passwordHash: jobseekerHash,
      role: "jobseeker",
      surname: "Applicant",
      firstName: "Demo",
      barangay: "Lagao",
      municipality: "General Santos City",
      province: "South Cotabato",
      employmentStatus: "Unemployed",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  console.log("Test accounts seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
