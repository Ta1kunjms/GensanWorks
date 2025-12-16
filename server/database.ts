import { drizzle } from "drizzle-orm/libsql";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { migrate as migrateSqlite } from "drizzle-orm/libsql/migrator";
import { migrate as migratePostgres } from "drizzle-orm/node-postgres/migrator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Pool } from "pg";
import { createClient } from "@libsql/client";
import * as schema from "./unified-schema";
import { adminsTable, employersTable, usersTable } from "./unified-schema";
import path from "path";
import fs from "fs";
// Resolve working directory for migrations and assets
const moduleDirname = typeof __dirname !== "undefined" ? __dirname : path.resolve(".");
// Resolve migrations folder robustly: prefer CWD/migrations (where the project is typically run)
// then fall back to module-relative path. This prevents missing-folder errors when CWD differs.
const resolveMigrationsFolder = () => {
  const candidates = [
    path.resolve(process.cwd(), "migrations"),
    path.resolve(moduleDirname, "../migrations"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  // If nothing exists, return the first candidate (CWD) so downstream logging shows a clear path.
  return candidates[0];
};

let db: any = null;
let migrated = false;
let sqliteClient: any = null;
let migrationPromise: Promise<void> | null = null;
let initPromise: Promise<any> | null = null;

async function seedTestAccounts(database: any) {
  const shouldSeed = process.env.NODE_ENV === "test" && process.env.SKIP_TEST_SEED !== "true";
  if (!shouldSeed) return;

  const adminEmail = "admin@local.test";
  const employerEmail = "employer01@gensanworks-demo.ph";
  const jobseekerEmail = "applicant001@demo.gensanworks.com";

  const adminPassword = "adminpass";
  const employerPassword = "EmployerDemoPass123!";
  const jobseekerPassword = "JobseekerDemoPass123!";

  const [adminHash, employerHash, jobseekerHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(employerPassword, 10),
    bcrypt.hash(jobseekerPassword, 10),
  ]);

  const now = new Date();

  // Select only essential columns to avoid missing legacy columns during fallback
  const existingAdmins = await database
    .select({ id: adminsTable.id })
    .from(adminsTable)
    .where(eq(adminsTable.email, adminEmail));
  if (existingAdmins.length === 0) {
    await database.insert(adminsTable).values({
      id: crypto.randomUUID(),
      email: adminEmail,
      passwordHash: adminHash,
      name: "Demo Admin",
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });
  }

  const existingEmployers = await database
    .select({ id: employersTable.id })
    .from(employersTable)
    .where(eq(employersTable.email, employerEmail));
  if (existingEmployers.length === 0) {
    await database.insert(employersTable).values({
      id: crypto.randomUUID(),
      establishmentName: "Demo Employer 01",
      barangay: "Lagao",
      municipality: "General Santos City",
      province: "South Cotabato",
      contactNumber: "09123456781",
      email: employerEmail,
      industryType: JSON.stringify(["Retail"]),
      passwordHash: employerHash,
      hasAccount: true,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  const existingUsers = await database
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, jobseekerEmail));
  if (existingUsers.length === 0) {
    await database.insert(usersTable).values({
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
      createdAt: now,
      updatedAt: now,
    } as any);
  }
}

async function applySqliteFallback(migrationsFolder: string) {
  if (!sqliteClient) return;

  const files = fs
    .readdirSync(migrationsFolder)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const warnings: string[] = [];

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf8");
    try {
      await sqliteClient.execute(sql);
    } catch (error) {
      // Some legacy migrations assume tables exist; skip non-fatal missing-table errors during fallback
      const message = (error as any)?.message || String(error);
      warnings.push(`${file}: ${message}`);
    }
  }

  migrated = true;
  if (warnings.length > 0) {
    console.warn(`Skipped ${warnings.length} fallback migrations (non-fatal). Example: ${warnings[0]}`);
  }
  console.log("✓ Applied migrations via SQL fallback");
}

async function ensureTablesPresent(migrationsFolder: string) {
  if (!sqliteClient) return;

  const requiredTables = ["admins", "employers", "users", "jobs", "applications", "referrals"];
  const missing: string[] = [];

  for (const table of requiredTables) {
    const result = await sqliteClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [table]
    );
    const exists = result?.rows?.length === 1;
    if (!exists) missing.push(table);
  }

  if (missing.length > 0) {
    console.warn(`Tables missing after migration: ${missing.join(", ")}. Applying fallback.`);
    if (fs.existsSync(migrationsFolder)) {
      await applySqliteFallback(migrationsFolder);
    } else {
      console.warn(`Migrations folder not found at ${migrationsFolder}; skipping fallback.`);
    }

    // Create minimal baseline schemas for critical auth tables if they are still absent
    const baselineTables: Record<string, string> = {
      admins: `CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin' NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
      employers: `CREATE TABLE IF NOT EXISTS employers (
        id TEXT PRIMARY KEY,
        establishment_name TEXT,
        barangay TEXT,
        municipality TEXT,
        province TEXT,
        contact_number TEXT,
        email TEXT,
        industry_type TEXT,
        password_hash TEXT,
        has_account INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
      users: `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        has_account INTEGER DEFAULT 0,
        role TEXT DEFAULT 'jobseeker' NOT NULL,
        name TEXT,
        surname TEXT NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT,
        suffix TEXT,
        birth_date TEXT,
        gender TEXT,
        date_of_birth TEXT,
        sex TEXT,
        religion TEXT,
        civil_status TEXT,
        height TEXT,
        weight TEXT,
        blood_type TEXT,
        contact_number TEXT,
        disability TEXT,
        disability_specify TEXT,
        address TEXT,
        house_street_village TEXT,
        barangay TEXT,
        municipality TEXT,
        province TEXT,
        zip_code TEXT,
        employment_status TEXT,
        employment_status_detail TEXT,
        self_employed_category TEXT,
        self_employed_category_other TEXT,
        unemployed_reason TEXT,
        unemployed_reason_other TEXT,
        unemployed_abroad_country TEXT,
        employment_type TEXT,
        employment_type_4 TEXT,
        months_unemployed INTEGER,
        is_ofw INTEGER DEFAULT 0,
        ofw_country TEXT,
        is_former_ofw INTEGER DEFAULT 0,
        former_ofw_country TEXT,
        return_to_ph_date TEXT,
        is_4ps_beneficiary INTEGER DEFAULT 0,
        household_id TEXT,
        nsrp_number TEXT,
        government_id_type TEXT,
        government_id_number TEXT,
        education_level TEXT,
        course TEXT,
        willing_to_relocate INTEGER DEFAULT 0,
        willing_to_work_overseas INTEGER DEFAULT 0,
        registration_date INTEGER,
        nsrp_registration_no TEXT,
        profile_image TEXT,
        archived INTEGER DEFAULT 0,
        job_preferences TEXT,
        preferred_occupations TEXT,
        preferred_locations TEXT,
        preferred_overseas_countries TEXT,
        education TEXT,
        technical_training TEXT,
        professional_licenses TEXT,
        language_proficiency TEXT,
        work_experience TEXT,
        other_skills TEXT,
        skills TEXT,
        other_skills_training TEXT,
        other_skills_specify TEXT,
        attachments TEXT,
        notes TEXT,
        registered_at INTEGER,
        last_login_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
      jobs: `CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        employer_id TEXT,
        status TEXT DEFAULT 'pending' NOT NULL,
        establishment_name TEXT,
        position_title TEXT NOT NULL,
        description TEXT,
        employment_type TEXT,
        location TEXT,
        salary_min REAL,
        salary_max REAL,
        salary_period TEXT,
        salary_amount REAL,
        salary_type TEXT,
        salary_period_raw TEXT,
        skills TEXT,
        industry_codes TEXT,
        minimum_education_required TEXT,
        main_skill_or_specialization TEXT,
        years_of_experience_required INTEGER,
        age_preference TEXT,
        salary TEXT,
        starting_salary_or_wage REAL,
        vacant_positions INTEGER,
        paid_employees INTEGER,
        job_status TEXT,
        contact TEXT,
        requirements TEXT,
        prepared_by_name TEXT,
        prepared_by_designation TEXT,
        prepared_by_contact TEXT,
        date_accomplished TEXT,
        attachments TEXT,
        account_metadata TEXT,
        barangay TEXT,
        municipality TEXT,
        province TEXT,
        archived INTEGER DEFAULT 0,
        archived_at INTEGER,
        qualifications TEXT,
        responsibilities TEXT,
        vacancies INTEGER,
        job_category TEXT,
        nsrp_job_code TEXT,
        job_compensation_type TEXT,
        job_compensation_details TEXT,
        job_benefits TEXT,
        job_requirements TEXT,
        job_experience_level TEXT,
        job_education_level TEXT,
        job_shift TEXT,
        job_schedule TEXT,
        job_application_deadline TEXT,
        job_contact_person TEXT,
        job_contact_email TEXT,
        job_contact_phone TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
      applications: `CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        applicant_id TEXT NOT NULL,
        applicant_name TEXT,
        employer_id TEXT,
        cover_letter TEXT,
        resume_url TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        feedback TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
      referrals: `CREATE TABLE IF NOT EXISTS referrals (
        referral_id TEXT PRIMARY KEY,
        applicant_id TEXT NOT NULL,
        applicant TEXT NOT NULL,
        employer_id TEXT,
        employer TEXT,
        vacancy_id TEXT,
        vacancy TEXT,
        barangay TEXT,
        job_category TEXT,
        date_referred TEXT,
        status TEXT DEFAULT 'Pending' NOT NULL,
        feedback TEXT,
        referral_slip_number TEXT,
        peso_officer_name TEXT,
        peso_officer_designation TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now')) NOT NULL
      );`,
    };

    for (const table of missing) {
      const ddl = baselineTables[table];
      if (ddl) {
        await sqliteClient.execute(ddl);
      }
    }
  }

  // Ensure critical columns exist (idempotent; SQLite adds columns when missing)
  const addMissingColumns = async (table: string, columnDefs: Record<string, string>) => {
    const info = await sqliteClient.execute(`PRAGMA table_info(${table})`);
    const existing = new Set((info?.rows || []).map((row: any) => row[1] || row?.name));
    for (const [column, definition] of Object.entries(columnDefs)) {
      if (!existing.has(column)) {
        await sqliteClient.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    }
  };

  const adminColumnDefs: Record<string, string> = {
    name: "TEXT",
    role: "TEXT DEFAULT 'admin'",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  const employerColumnDefs: Record<string, string> = {
    establishment_name: "TEXT",
    name: "TEXT",
    trade_name: "TEXT",
    house_street_village: "TEXT",
    barangay: "TEXT",
    municipality: "TEXT",
    province: "TEXT",
    complete_address: "TEXT",
    address_details: "TEXT",
    contact_number: "TEXT",
    contact_email: "TEXT",
    contact_person: "TEXT",
    alternate_contacts: "TEXT",
    email: "TEXT",
    phone: "TEXT",
    number_of_paid_employees: "INTEGER",
    number_of_vacant_positions: "INTEGER",
    industry_codes: "TEXT",
    industry_type: "TEXT",
    company_type: "TEXT",
    company_industry: "TEXT",
    company_size: "TEXT",
    srs_subscriber: "INTEGER DEFAULT 0",
    subscription_status: "TEXT",
    company_tin: "TEXT",
    company_registration_no: "TEXT",
    company_description: "TEXT",
    company_tax_id_number: "TEXT",
    business_permit_number: "TEXT",
    bir2303_number: "TEXT",
    requirements: "TEXT",
    attachments: "TEXT",
    chairperson_name: "TEXT",
    chairperson_contact: "TEXT",
    secretary_name: "TEXT",
    secretary_contact: "TEXT",
    barangay_chairperson: "TEXT",
    barangay_secretary: "TEXT",
    geographic_identification: "TEXT",
    prepared_by_name: "TEXT",
    prepared_by_designation: "TEXT",
    prepared_by_contact: "TEXT",
    date_accomplished: "TEXT",
    remarks: "TEXT",
    is_manpower_agency: "INTEGER DEFAULT 0",
    dole_certification_number: "TEXT",
    archived: "INTEGER DEFAULT 0",
    archived_at: "INTEGER",
    status: "TEXT",
    profile_image: "TEXT",
    password_hash: "TEXT",
    has_account: "INTEGER DEFAULT 0",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  const jobColumnDefs: Record<string, string> = {
    employer_id: "TEXT",
    status: "TEXT",
    establishment_name: "TEXT",
    position_title: "TEXT",
    description: "TEXT",
    employment_type: "TEXT",
    location: "TEXT",
    salary_min: "REAL",
    salary_max: "REAL",
    salary_period: "TEXT",
    salary_amount: "REAL",
    salary_type: "TEXT",
    salary_period_raw: "TEXT",
    skills: "TEXT",
    industry_codes: "TEXT",
    minimum_education_required: "TEXT",
    main_skill_or_specialization: "TEXT",
    years_of_experience_required: "INTEGER",
    age_preference: "TEXT",
    salary: "TEXT",
    starting_salary_or_wage: "REAL",
    vacant_positions: "INTEGER",
    paid_employees: "INTEGER",
    job_status: "TEXT",
    contact: "TEXT",
    requirements: "TEXT",
    prepared_by_name: "TEXT",
    prepared_by_designation: "TEXT",
    prepared_by_contact: "TEXT",
    date_accomplished: "TEXT",
    attachments: "TEXT",
    account_metadata: "TEXT",
    barangay: "TEXT",
    municipality: "TEXT",
    province: "TEXT",
    archived: "INTEGER DEFAULT 0",
    archived_at: "INTEGER",
    qualifications: "TEXT",
    responsibilities: "TEXT",
    vacancies: "INTEGER",
    job_category: "TEXT",
    nsrp_job_code: "TEXT",
    job_compensation_type: "TEXT",
    job_compensation_details: "TEXT",
    job_benefits: "TEXT",
    job_requirements: "TEXT",
    job_experience_level: "TEXT",
    job_education_level: "TEXT",
    job_shift: "TEXT",
    job_schedule: "TEXT",
    job_application_deadline: "TEXT",
    job_contact_person: "TEXT",
    job_contact_email: "TEXT",
    job_contact_phone: "TEXT",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  const applicationColumnDefs: Record<string, string> = {
    job_id: "TEXT",
    applicant_id: "TEXT",
    applicant_name: "TEXT",
    employer_id: "TEXT",
    cover_letter: "TEXT",
    resume_url: "TEXT",
    status: "TEXT",
    notes: "TEXT",
    feedback: "TEXT",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  const referralColumnDefs: Record<string, string> = {
    referral_id: "TEXT",
    applicant_id: "TEXT",
    applicant: "TEXT",
    employer_id: "TEXT",
    employer: "TEXT",
    vacancy_id: "TEXT",
    vacancy: "TEXT",
    barangay: "TEXT",
    job_category: "TEXT",
    date_referred: "TEXT",
    status: "TEXT",
    feedback: "TEXT",
    referral_slip_number: "TEXT",
    peso_officer_name: "TEXT",
    peso_officer_designation: "TEXT",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  const userColumnDefs: Record<string, string> = {
    name: "TEXT",
    registration_date: "INTEGER",
    has_account: "INTEGER DEFAULT 0",
    role: "TEXT DEFAULT 'jobseeker'",
    password_hash: "TEXT",
    surname: "TEXT",
    first_name: "TEXT",
    middle_name: "TEXT",
    last_name: "TEXT",
    suffix: "TEXT",
    birth_date: "TEXT",
    gender: "TEXT",
    date_of_birth: "TEXT",
    sex: "TEXT",
    religion: "TEXT",
    civil_status: "TEXT",
    height: "TEXT",
    weight: "TEXT",
    blood_type: "TEXT",
    contact_number: "TEXT",
    disability: "TEXT",
    disability_specify: "TEXT",
    address: "TEXT",
    house_street_village: "TEXT",
    barangay: "TEXT",
    municipality: "TEXT",
    province: "TEXT",
    zip_code: "TEXT",
    employment_status: "TEXT",
    employment_status_detail: "TEXT",
    self_employed_category: "TEXT",
    self_employed_category_other: "TEXT",
    unemployed_reason: "TEXT",
    unemployed_reason_other: "TEXT",
    unemployed_abroad_country: "TEXT",
    employment_type: "TEXT",
    employment_type_4: "TEXT",
    months_unemployed: "INTEGER",
    is_ofw: "INTEGER DEFAULT 0",
    ofw_country: "TEXT",
    is_former_ofw: "INTEGER DEFAULT 0",
    former_ofw_country: "TEXT",
    return_to_ph_date: "TEXT",
    is_4ps_beneficiary: "INTEGER DEFAULT 0",
    household_id: "TEXT",
    nsrp_number: "TEXT",
    government_id_type: "TEXT",
    government_id_number: "TEXT",
    education_level: "TEXT",
    course: "TEXT",
    willing_to_relocate: "INTEGER DEFAULT 0",
    willing_to_work_overseas: "INTEGER DEFAULT 0",
    nsrp_registration_no: "TEXT",
    profile_image: "TEXT",
    archived: "INTEGER DEFAULT 0",
    job_preferences: "TEXT",
    preferred_occupations: "TEXT",
    preferred_locations: "TEXT",
    preferred_overseas_countries: "TEXT",
    education: "TEXT",
    technical_training: "TEXT",
    professional_licenses: "TEXT",
    language_proficiency: "TEXT",
    work_experience: "TEXT",
    other_skills: "TEXT",
    skills: "TEXT",
    other_skills_training: "TEXT",
    other_skills_specify: "TEXT",
    attachments: "TEXT",
    notes: "TEXT",
    registered_at: "INTEGER",
    last_login_at: "INTEGER",
    created_at: "INTEGER",
    updated_at: "INTEGER",
  };

  await addMissingColumns("admins", adminColumnDefs);
  await addMissingColumns("employers", employerColumnDefs);
  await addMissingColumns("users", userColumnDefs);
  await addMissingColumns("jobs", jobColumnDefs);
  await addMissingColumns("applications", applicationColumnDefs);
  await addMissingColumns("referrals", referralColumnDefs);
}

async function ensureMigrations(database: any, isPostgres: boolean) {
  const migrationsFolder = resolveMigrationsFolder();

  // Even if migrations already ran, ensure SQLite column backfills are applied (idempotent)
  if (migrated) {
    if (!isPostgres) {
      await ensureTablesPresent(migrationsFolder);
    }
    return;
  }

  if (migrationPromise) {
    await migrationPromise;
    return;
  }
  migrationPromise = (async () => {
    try {
      if (isPostgres) {
        await migratePostgres(database, { migrationsFolder });
      } else {
        await migrateSqlite(database, { migrationsFolder });
      }
      migrated = true;
    } catch (error) {
      // If the database is already migrated (common in dev after a clean run), skip noisy fallback
      const code = (error as any)?.code;
      const message = (error as Error)?.message || "";
      if (!isPostgres && code === "SQLITE_ERROR" && message.includes("already exists")) {
        migrated = true;
        if (!isPostgres) {
          await ensureTablesPresent(migrationsFolder);
        }
        return;
      }
      // libsql can return SQLITE_OK as an exception after successful migrations; treat it as non-fatal
      if ((error as any)?.code === "SQLITE_OK") {
        console.warn("Database migration reported SQLITE_OK; continuing.");
        migrated = true;
        if (!isPostgres) {
          await ensureTablesPresent(migrationsFolder);
        }
        return;
      }
      console.warn("Primary migration failed; attempting SQL fallback:", error);
      if (!isPostgres) {
        await applySqliteFallback(migrationsFolder);
        // Even when primary migration fails, ensure column backfills run so downstream queries do not break
        await ensureTablesPresent(migrationsFolder);
        return;
      }
      console.error("Database migration failed:", error);
      throw error;
    }

    if (!isPostgres) {
      await ensureTablesPresent(migrationsFolder);
    }
  })();

  try {
    await migrationPromise;
  } finally {
    migrationPromise = null;
  }
}

export async function initializeDatabase() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const workerId = process.env.JEST_WORKER_ID || "0";
    // In tests, always isolate per worker to avoid Windows file locking and stale state
    const testDb = `file:./app.test.${workerId}.db`;
    const databaseUrl = process.env.NODE_ENV === "test"
      ? testDb
      : process.env.DATABASE_URL || "file:./app.db";
    const isPostgres = databaseUrl.startsWith("postgresql://");

    if (isPostgres) {
      // PostgreSQL setup
      const pool = new Pool({
        connectionString: databaseUrl,
      });
      db = drizzlePostgres(pool, { schema });
      console.log("✓ Connected to PostgreSQL");
    } else {
      // SQLite setup using libsql
      const dbPath = databaseUrl.replace("file:", "").trim();
      if (process.env.NODE_ENV === "test" && fs.existsSync(dbPath)) {
        try {
          fs.rmSync(dbPath);
        } catch (error) {
          console.warn(`Skipping test DB cleanup for ${dbPath}: ${(error as Error).message}`);
        }
      }
      const client = createClient({
        url: databaseUrl,
      });
      sqliteClient = client;
      try {
        await sqliteClient.execute("PRAGMA journal_mode=WAL;");
        await sqliteClient.execute("PRAGMA busy_timeout=5000;");
      } catch (error) {
        console.warn("SQLite PRAGMA setup skipped:", (error as Error).message);
      }
      // Enable Drizzle query logging to surface problematic SQL during tests
      const enableDrizzleLog = process.env.DRIZZLE_LOG === "true" || process.env.NODE_ENV === "test";
      db = drizzle(client, { schema, logger: enableDrizzleLog });
      console.log(`✓ Connected to SQLite at ${dbPath}`);
    }

    await ensureMigrations(db, isPostgres);
    await seedTestAccounts(db);

    return db;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export type Database = typeof db;
