import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("app.db");

// Helper functions for random data
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split("T")[0];
}

// Filipino names, addresses, jobs, etc.
const surnames = ["Santos", "Reyes", "Cruz", "Flores", "Garcia", "Dela Cruz", "Ramos", "Torres", "Gonzales", "Lopez", "Martinez", "Perez", "Castro", "Mendoza", "Rivera", "Alvarez", "Morales", "Gutierrez", "Bautista", "Padilla"];
const firstNames = ["Juan", "Maria", "Jose", "Ana", "Mark", "Grace", "John", "Paul", "Rose", "James", "Jessa", "Carlo", "Angel", "Kim", "Liza", "Rafael", "Cathy", "Miguel", "Ella", "Francis"];
const barangays = ["Lagao", "San Isidro", "City Heights", "Calumpang", "Fatima", "Bula", "Dadiangas East", "Dadiangas West", "Dadiangas North", "Dadiangas South", "Apopong", "Tambler", "Sinawal", "Conel", "Olympog", "Baluan", "Buayan", "Katangawan", "Labangal", "Mabuhay", "Upper Labay"];
const employers = ["KCC Mall", "SM City Gensan", "Robinsons Place", "General Santos Doctors Hospital", "East Asia Royale Hotel", "Notre Dame of Dadiangas University", "Mindanao State University", "San Miguel Foods", "Tuna Exporters Inc.", "Gensan Public Market", "Jollibee Foods Corp.", "Dole Philippines", "Coca-Cola Bottlers", "PLDT Gensan", "Gaisano Mall", "Unilever Gensan", "Puregold", "Sarangani Energy", "Gensan Shipyard", "Toyota Gensan", "Honda Gensan", "Mercury Drug", "7-Eleven Gensan", "Chowking Gensan", "Mang Inasal Gensan", "Greenwich Gensan", "Max's Restaurant", "Yellow Cab Pizza", "Starbucks Gensan", "McDonald's Gensan", "S&R Membership Shopping", "Wilcon Depot", "Ace Hardware", "SM Appliance Center", "Abenson Gensan", "South Cotabato Electric", "Gensan Water District", "PhilHealth Gensan", "Bureau of Customs", "Bureau of Internal Revenue", "Landbank Gensan", "Metrobank Gensan"];
const jobTitles = ["Sales Associate", "Cashier", "Nurse", "Teacher", "Security Guard", "Driver", "Cook", "Waiter", "Receptionist", "IT Staff", "HR Officer", "Accountant", "Engineer", "Janitor", "Mechanic", "Electrician", "Pharmacist", "Warehouse Staff", "Production Worker", "Customer Service Rep", "Marketing Assistant", "Store Manager", "Supervisor", "Barista", "Crew", "Delivery Rider", "Admin Assistant", "Purchasing Officer", "Maintenance Staff", "Chef", "Baker", "Graphic Designer", "Call Center Agent", "Medical Technologist", "Dentist", "Sales Manager", "Operations Manager", "Branch Manager"];
const industries = ["Retail", "Healthcare", "Education", "Hospitality", "Food Service", "Manufacturing", "Utilities", "Finance", "Government", "Transportation", "Agriculture", "Construction", "IT", "Telecom", "Energy", "Automotive", "Pharmaceutical", "Shipping", "Water", "Banking", "Public Service"];
const statuses = ["pending", "active", "draft", "closed", "rejected"];
const salaryPeriods = ["hourly", "daily", "weekly", "15days", "monthly"];
const civilStatuses = ["Single", "Married", "Widowed", "Separated"];
const sexes = ["Male", "Female", "Other"];
const educations = ["Elementary", "Secondary", "Tertiary", "Vocational", "College", "Graduate"];
const yesNo = ["Yes", "No"];

function insertApplicant(i: number) {
  const id = randomUUID();

  // Special admin account for integration tests
  if (i === 0) {
    const passwordHash = bcrypt.hashSync("adminpass", 10);
    db.run(
      `INSERT INTO users (
        id, email, password_hash, role, surname, first_name, date_of_birth, sex, religion, civil_status,
        height, contact_number, barangay, municipality, province,
        employment_status, employment_type, months_unemployed,
        is_ofw, is_former_ofw, is_4ps_beneficiary,
        preferred_occupations, preferred_locations, preferred_overseas_countries,
        employment_type_4, education, technical_training, professional_licenses,
        language_proficiency, work_experience, skills,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`,
      [
        id,
        "admin@local.test",
        passwordHash,
        "jobseeker",
        "Admin",
        "User",
        randomDate(new Date(1980, 0, 1), new Date(1995, 0, 1)),
        "Male",
        "Catholic",
        "Single",
        "170",
        "09123456789",
        "Lagao",
        "General Santos City",
        "South Cotabato",
        "Employed",
        "Wage employed",
        0,
        0,
        0,
        0,
        "[\"Admin Work\"]",
        "General Santos City",
        "N/A",
        "",
        "Tertiary",
        "",
        "",
        "English, Filipino",
        "",
        "",
        Date.now(),
        Date.now(),
      ]
    );
    return;
  }

  // Special employer-linked jobseeker for integration tests
  if (i === 1) {
    const passwordHash = bcrypt.hashSync("JobseekerDemoPass123!", 10);
    db.run(
      `INSERT INTO users (
        id, email, password_hash, role, surname, first_name, date_of_birth, sex, religion, civil_status,
        height, contact_number, barangay, municipality, province,
        employment_status, employment_type, months_unemployed,
        is_ofw, is_former_ofw, is_4ps_beneficiary,
        preferred_occupations, preferred_locations, preferred_overseas_countries,
        employment_type_4, education, technical_training, professional_licenses,
        language_proficiency, work_experience, skills,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`,
      [
        randomUUID(),
        "applicant001@demo.gensanworks.com",
        passwordHash,
        "jobseeker",
        "Demo",
        "Applicant",
        randomDate(new Date(1990, 0, 1), new Date(2000, 0, 1)),
        "Female",
        "Catholic",
        "Single",
        "160",
        "09123456780",
        "Lagao",
        "General Santos City",
        "South Cotabato",
        "Unemployed",
        "Wage employed",
        6,
        0,
        0,
        1,
        "Office Staff",
        "General Santos City",
        "N/A",
        "",
        "College",
        "",
        "",
        "English, Filipino",
        "",
        "",
        Date.now(),
        Date.now(),
      ]
    );
    return;
  }

  // Generic random applicants
  db.run(`INSERT INTO users (
    id, email, password_hash, role, surname, first_name, middle_name, suffix, date_of_birth, sex, religion, civil_status, height, contact_number, disability, disability_specify, address, barangay, municipality, province, employment_status, employment_type, months_unemployed, is_ofw, ofw_country, is_former_ofw, former_ofw_country, return_to_ph_date, is_4ps_beneficiary, household_id, preferred_occupations, preferred_locations, preferred_overseas_countries, employment_type_4, education, technical_training, professional_licenses, language_proficiency, work_experience, skills, other_skills_specify, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )`, [
    id,
    `user${i}@gensan.com`,
    "hashedpassword",
    "jobseeker",
    randomFrom(surnames),
    randomFrom(firstNames),
    "",
    "",
    randomDate(new Date(1980, 0, 1), new Date(2005, 0, 1)),
    randomFrom(sexes),
    "Catholic",
    randomFrom(civilStatuses),
    String(randomInt(150, 190)),
    `09${randomInt(100000000, 999999999)}`,
    randomFrom(yesNo),
    "",
    `${randomInt(1, 100)} ${randomFrom(barangays)} St.", Gensan`,
    randomFrom(barangays),
    "General Santos City",
    "South Cotabato",
    randomFrom(["Employed", "Unemployed", "Self-employed"]),
    randomFrom(["Wage employed", "Self-employed"]),
    randomInt(0, 36),
    randomInt(0, 1),
    "Saudi Arabia",
    randomInt(0, 1),
    "UAE",
    randomDate(new Date(2015, 0, 1), new Date()),
    randomInt(0, 1),
    `HH${randomInt(1000,9999)}`,
    randomFrom(jobTitles),
    randomFrom(barangays),
    "Japan",
    "",
    randomFrom(educations),
    "TESDA NCII",
    "PRC License",
    "English, Filipino",
    "2 years at " + randomFrom(employers),
    randomFrom(jobTitles),
    "",
    Date.now(),
    Date.now()
  ]);
}

function insertEmployer(i: number) {
  const id = randomUUID();

  // Special employer for integration tests
  if (i === 0) {
    const passwordHash = bcrypt.hashSync("EmployerDemoPass123!", 10);
    db.run(
      `INSERT INTO employers (
        id, establishment_name, house_street_village, barangay, municipality, province,
        contact_number, email, number_of_paid_employees, number_of_vacant_positions,
        industry_type, srs_subscriber, company_tin, business_permit_number, bir2303_number,
        chairperson_name, chairperson_contact, secretary_name, secretary_contact,
        prepared_by_name, prepared_by_designation, prepared_by_contact,
        date_accomplished, remarks, is_manpower_agency, dole_certification_number,
        archived, archived_at, password_hash, has_account,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )`,
      [
        id,
        "Demo Employer 01",
        `123 Lagao St.", Gensan`,
        "Lagao",
        "General Santos City",
        "South Cotabato",
        "09123456781",
        "employer01@gensanworks-demo.ph",
        50,
        5,
        "Retail",
        1,
        "TIN123456",
        "BP12345",
        "BIR12345",
        "Juan Dela Cruz",
        "09123456782",
        "Maria Santos",
        "09123456783",
        "Pedro Reyes",
        "HR Manager",
        "09123456784",
        randomDate(new Date(2020, 0, 1), new Date()),
        "",
        0,
        "DOLE12345",
        0,
        null,
        passwordHash,
        1,
        Date.now(),
        Date.now(),
      ]
    );
    return;
  }

  // Generic random employers
  db.run(`INSERT INTO employers (
    id, establishment_name, house_street_village, barangay, municipality, province, contact_number, email, number_of_paid_employees, number_of_vacant_positions, industry_type, srs_subscriber, company_tin, business_permit_number, bir2303_number, chairperson_name, chairperson_contact, secretary_name, secretary_contact, prepared_by_name, prepared_by_designation, prepared_by_contact, date_accomplished, remarks, is_manpower_agency, dole_certification_number, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )`, [
    id,
    employers[i % employers.length],
    `${randomInt(1, 100)} ${randomFrom(barangays)} St.", Gensan`,
    randomFrom(barangays),
    "General Santos City",
    "South Cotabato",
    `09${randomInt(100000000, 999999999)}`,
    `employer${i}@gensan.com`,
    randomInt(10, 500),
    randomInt(1, 50),
    randomFrom(industries),
    randomInt(0, 1),
    `TIN${randomInt(100000,999999)}`,
    `BP${randomInt(10000,99999)}`,
    `BIR${randomInt(10000,99999)}`,
    randomFrom(firstNames) + " " + randomFrom(surnames),
    `09${randomInt(100000000, 999999999)}`,
    randomFrom(firstNames) + " " + randomFrom(surnames),
    `09${randomInt(100000000, 999999999)}`,
    randomFrom(firstNames) + " " + randomFrom(surnames),
    "Manager",
    `09${randomInt(100000000, 999999999)}`,
    randomDate(new Date(2020, 0, 1), new Date()),
    "",
    randomInt(0, 1),
    `DOLE${randomInt(10000,99999)}`,
    Date.now(),
    Date.now()
  ]);
}

function insertJob(i: number) {
  const id = randomUUID();
  db.run(`INSERT INTO jobs (
    id, employer_id, position_title, description, location, salary_min, salary_max, status, salary_period, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )`, [
    id,
    null, // Will be updated after employers are seeded
    randomFrom(jobTitles),
    `Job opening for ${randomFrom(jobTitles)} at ${randomFrom(employers)}`,
    randomFrom(barangays),
    randomInt(12000, 35000),
    randomInt(35001, 60000),
    randomFrom(statuses),
    randomFrom(salaryPeriods),
    Date.now(),
    Date.now()
  ]);
}

// Seed applicants
for (let i = 0; i < 567; i++) {
  insertApplicant(i);
}
// Seed employers
for (let i = 0; i < 40; i++) {
  insertEmployer(i);
}
// Seed jobs
for (let i = 0; i < 37; i++) {
  insertJob(i);
}

db.close();
