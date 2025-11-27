/**
 * Migration Script: Transfer data from MemStorage (data.json) to SQLite Database
 * Run with: npm run migrate:db
 */

import fs from 'fs';
import path from 'path';
import { getDatabase } from '../server/database';
import { jobsTable, employersTable, jobseekersTable, adminsTable } from '../server/db';

async function migrateData() {
  console.log('🔄 Starting data migration from MemStorage to SQLite...\n');

  try {
    const db = getDatabase();
    const dataFilePath = path.join(process.cwd(), 'server', 'data', 'data.json');

    // Check if data file exists
    if (!fs.existsSync(dataFilePath)) {
      console.log('✓ No data.json file found. Database already clean.');
      return;
    }

    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    // Migrate employers
    if (data.employers && data.employers.length > 0) {
      console.log(`📦 Migrating ${data.employers.length} employers...`);
      for (const employer of data.employers) {
        try {
          await db.insert(employersTable).values({
            id: employer.id,
            name: employer.name || employer.establishmentName,
            email: employer.email,
            establishmentName: employer.establishmentName,
            passwordHash: employer.passwordHash || employer.password,
            role: 'employer',
            createdAt: employer.createdAt || new Date().toISOString(),
            updatedAt: employer.updatedAt || new Date().toISOString(),
          }).onConflictDoNothing();
        } catch (e) {
          console.warn(`⚠️  Failed to migrate employer ${employer.id}:`, (e as any).message);
        }
      }
      console.log('✓ Employers migrated\n');
    }

    // Migrate jobseekers
    if (data.jobseekers && data.jobseekers.length > 0) {
      console.log(`📦 Migrating ${data.jobseekers.length} jobseekers...`);
      for (const seeker of data.jobseekers) {
        try {
          await db.insert(jobseekersTable).values({
            id: seeker.id,
            name: seeker.name,
            email: seeker.email,
            role: seeker.role || 'jobseeker',
            passwordHash: seeker.passwordHash || seeker.password,
            createdAt: seeker.createdAt || new Date().toISOString(),
            updatedAt: seeker.updatedAt || new Date().toISOString(),
          }).onConflictDoNothing();
        } catch (e) {
          console.warn(`⚠️  Failed to migrate jobseeker ${seeker.id}:`, (e as any).message);
        }
      }
      console.log('✓ Jobseekers migrated\n');
    }

    // Migrate admins
    if (data.admins && data.admins.length > 0) {
      console.log(`📦 Migrating ${data.admins.length} admins...`);
      for (const admin of data.admins) {
        try {
          await db.insert(adminsTable).values({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            passwordHash: admin.password || admin.passwordHash,
            role: 'admin',
            createdAt: admin.createdAt || new Date().toISOString(),
            updatedAt: admin.updatedAt || new Date().toISOString(),
          }).onConflictDoNothing();
        } catch (e) {
          console.warn(`⚠️  Failed to migrate admin ${admin.id}:`, (e as any).message);
        }
      }
      console.log('✓ Admins migrated\n');
    }

    // Migrate jobs with new fields
    if (data.jobs && data.jobs.length > 0) {
      console.log(`📦 Migrating ${data.jobs.length} job postings...`);
      for (const job of data.jobs) {
        try {
          await db.insert(jobsTable).values({
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryPeriod: job.salaryPeriod || 'monthly',
            salaryAmount: job.salaryAmount || 0,
            status: job.status || 'active',
            archived: false,
            employerId: job.employerId,
            salaryType: job.salaryType,
            jobStatus: job.jobStatus,
            minimumEducation: job.minimumEducation,
            yearsOfExperience: job.yearsOfExperience || 0,
            skills: job.skills || '',
            createdAt: job.createdAt || new Date().toISOString(),
            updatedAt: job.updatedAt || new Date().toISOString(),
            archivedAt: null,
          }).onConflictDoNothing();
        } catch (e) {
          console.warn(`⚠️  Failed to migrate job ${job.id}:`, (e as any).message);
        }
      }
      console.log('✓ Job postings migrated\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify data in database');
    console.log('2. Backup and delete server/data/data.json');
    console.log('3. Restart the application');
    console.log('4. All API endpoints now use SQLite database\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
