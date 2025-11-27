import { createClient } from "@libsql/client";
import path from "path";

const dbPath = path.join(process.cwd(), "app.db");
const client = createClient({
  url: `file:${dbPath}`,
});

console.log("Starting migration: industry_type → industry_codes");

async function migrate() {
  try {
    // Check if industry_type column exists
    const tableInfo = await client.execute("PRAGMA table_info(job_vacancies)");
    const cols = tableInfo.rows as any[];
    const hasIndustryType = cols.some((col: any) => col[1] === "industry_type");
    const hasIndustryCodes = cols.some((col: any) => col[1] === "industry_codes");
    
    console.log(`Has industry_type column: ${hasIndustryType}`);
    console.log(`Has industry_codes column: ${hasIndustryCodes}`);

    if (hasIndustryType && !hasIndustryCodes) {
      console.log("Renaming industry_type to industry_codes...");
      await client.execute("ALTER TABLE job_vacancies RENAME COLUMN industry_type TO industry_codes;");
      console.log("✓ Column renamed successfully");
    } else if (hasIndustryCodes) {
      console.log("✓ industry_codes column already exists");
    }

    // Drop legacy columns if they exist
    const legacyColumns = ["number_of_vacancies", "salary_type", "benefits", "job_description", "additional_requirements"];
    
    for (const col of legacyColumns) {
      const hasColumn = cols.some((c: any) => c[1] === col);
      if (hasColumn) {
        console.log(`Dropping legacy column: ${col}`);
        await client.execute(`ALTER TABLE job_vacancies DROP COLUMN ${col};`);
        console.log(`✓ ${col} dropped`);
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
