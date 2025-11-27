import { eq } from "drizzle-orm";
import { initializeDatabase } from "./database";
import { adminsTable, applicantsTable, employersTable } from "./unified-schema";
import { verifyPassword } from "./auth";

let db: any = null;

export async function initStorageWithDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

// Override storage methods to use database
export async function getAdminByEmailWithPassword(email: string) {
  const db = await initStorageWithDatabase();
  const result = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, email.toLowerCase()))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getEmployerByEmailWithPassword(email: string) {
  const db = await initStorageWithDatabase();
  const result = await db
    .select()
    .from(employersTable)
    .where(eq(employersTable.email, email.toLowerCase()))
    .limit(1);

  if (result.length > 0 && result[0].passwordHash && result[0].hasAccount) {
    return {
      id: result[0].id,
      name: result[0].establishmentName,
      email: result[0].email,
      role: "employer",
      passwordHash: result[0].passwordHash,
    };
  }
  return null;
}

export async function getJobseekerByEmailWithPassword(email: string) {
  const db = await initStorageWithDatabase();
  const result = await db
    .select()
    .from(applicantsTable)
    .where(eq(applicantsTable.email, email.toLowerCase()))
    .limit(1);

  if (result.length > 0 && result[0].passwordHash && result[0].hasAccount) {
    // Format to match expected user structure
    return {
      id: result[0].id,
      name: `${result[0].firstName} ${result[0].surname}`.trim(),
      email: result[0].email,
      role: result[0].role || "jobseeker",
      passwordHash: result[0].passwordHash,
    };
  }
  return null;
}

/**
 * Normalize industry codes from old format (01-17) to new format (1-17)
 * This ensures backward compatibility with existing data
 */
export function normalizeIndustryCode(code: string): string {
  if (!code) return code;
  
  // Convert "01", "02", etc. to "1", "2", etc.
  // Also handles already-normalized codes
  const normalized = code.replace(/^0+(?=\d)/, '');
  
  // Ensure it's a valid industry code (1-17)
  const num = parseInt(normalized, 10);
  if (num >= 1 && num <= 17) {
    return num.toString();
  }
  
  return code; // Return original if invalid
}

/**
 * Normalize industry type array from database
 * Converts old format codes to new format
 */
export function normalizeIndustryTypes(industryTypes: any): string[] {
  if (!Array.isArray(industryTypes)) {
    return [];
  }
  return industryTypes.map(code => normalizeIndustryCode(code));
}
