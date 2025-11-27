/**
 * Migration script to add COMPLETE NSRP fields to applicants table
 * Run: npx tsx scripts/migrate-nsrp-fields.ts
 */

import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'app.db');
const client = createClient({ url: `file:${dbPath}` });

console.log('🔄 Running COMPLETE NSRP fields migration...');

async function runQuery(sql: string, description: string) {
  try {
    await client.execute(sql);
    console.log(`✅ ${description}`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      console.log(`⚠️  ${description}:`, e.message);
    } else {
      console.log(`ℹ️  ${description} (already exists)`);
    }
  }
}

async function migrate() {
  console.log('\n📝 Adding address field...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN house_street_village TEXT;`, 'Added house_street_village column');

  console.log('\n📝 Adding disability fields...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN disability_specify TEXT;`, 'Added disability_specify column');
  
  console.log('\n📝 Adding employment details...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN months_unemployed INTEGER;`, 'Added months_unemployed column');
  
  console.log('\n📝 Adding OFW details...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN owf_country TEXT;`, 'Added owf_country column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN is_former_ofw INTEGER DEFAULT 0;`, 'Added is_former_ofw column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN former_ofw_country TEXT;`, 'Added former_ofw_country column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN return_to_ph_date TEXT;`, 'Added return_to_ph_date column');
  
  console.log('\n📝 Adding 4Ps beneficiary details...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN household_id TEXT;`, 'Added household_id column');
  
  console.log('\n📝 Adding job preferences...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN preferred_occupations TEXT;`, 'Added preferred_occupations column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN preferred_locations TEXT;`, 'Added preferred_locations column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN preferred_overseas_countries TEXT;`, 'Added preferred_overseas_countries column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN employment_type_4 TEXT;`, 'Added employment_type_4 column');
  
  console.log('\n📝 Adding NSRP skills fields...');
  await runQuery(`ALTER TABLE applicants ADD COLUMN professional_licenses TEXT;`, 'Added professional_licenses column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN other_skills TEXT;`, 'Added other_skills column');
  await runQuery(`ALTER TABLE applicants ADD COLUMN other_skills_specify TEXT;`, 'Added other_skills_specify column');
  
  console.log('\n📝 Migrating old skills data...');
  try {
    await client.execute(`UPDATE applicants SET other_skills = skills WHERE skills IS NOT NULL AND other_skills IS NULL;`);
    console.log('✅ Migrated skills to other_skills');
  } catch (e: any) {
    console.log('⚠️  Skills migration:', e.message);
  }
  
  console.log('\n📝 Setting default values for existing records...');
  try {
    await client.execute(`UPDATE applicants SET is_former_ofw = 0 WHERE is_former_ofw IS NULL;`);
    await client.execute(`UPDATE applicants SET preferred_occupations = '[]' WHERE preferred_occupations IS NULL;`);
    await client.execute(`UPDATE applicants SET preferred_locations = '[]' WHERE preferred_locations IS NULL;`);
    await client.execute(`UPDATE applicants SET preferred_overseas_countries = '[]' WHERE preferred_overseas_countries IS NULL;`);
    await client.execute(`UPDATE applicants SET professional_licenses = '[]' WHERE professional_licenses IS NULL;`);
    await client.execute(`UPDATE applicants SET other_skills = '[]' WHERE other_skills IS NULL;`);
    console.log('✅ Set default values for existing records');
  } catch (e: any) {
    console.log('⚠️  Error setting defaults:', e.message);
  }
  
  console.log('\n✅ COMPLETE NSRP Migration completed successfully!');
  console.log('📋 All NSRP fields are now available for jobseeker profiles.');
  console.log('🎯 Fields added: house_street_village, disability_specify, OFW fields, 4Ps fields,');
  console.log('   job preferences, professional_licenses, other_skills, other_skills_specify');
}

migrate().catch(console.error).finally(() => client.close());
