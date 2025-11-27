import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  json,
  serial,
  varchar
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  real as sqliteReal,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const isDev = process.env.NODE_ENV === "development";
const isSqlite = !process.env.DATABASE_URL?.startsWith("postgresql://");

// ============ ADMINS TABLE ============
export const adminsTable = isSqlite ? 
  sqliteTable("admins", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `admin_${Date.now()}`),
    name: sqliteText("name").notNull(),
    email: sqliteText("email").notNull().unique(),
    passwordHash: sqliteText("password_hash").notNull(),
    role: sqliteText("role", { enum: ["admin"] }).notNull().default("admin"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("admins", {
    id: text("id").primaryKey().$defaultFn(() => `admin_${Date.now()}`),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin"] }).notNull().default("admin"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ USERS TABLE (Jobseekers & Employers) ============
export const usersTable = isSqlite ?
  sqliteTable("users", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `user_${Date.now()}`),
    name: sqliteText("name").notNull(),
    email: sqliteText("email").notNull().unique(),
    passwordHash: sqliteText("password_hash").notNull(),
    role: sqliteText("role", { enum: ["jobseeker", "freelancer", "employer"] }).notNull(),
    company: sqliteText("company"),
    profileData: sqliteText("profile_data", { mode: "json" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => `user_${Date.now()}`),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["jobseeker", "freelancer", "employer"] }).notNull(),
    company: text("company"),
    profileData: json("profile_data"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ JOBS TABLE ============
export const jobsTable = isSqlite ?
  sqliteTable("jobs", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `job_${Date.now()}`),
    employerId: sqliteText("employer_id").notNull(),
    title: sqliteText("title").notNull(),
    description: sqliteText("description").notNull(),
    location: sqliteText("location"),
    salaryMin: sqliteInteger("salary_min"),
    salaryMax: sqliteInteger("salary_max"),
    // salaryPeriod: sqliteText("salary_period", { enum: ["hourly", "daily", "weekly", "15days", "monthly"] }).default("monthly"),
    // salaryAmount: sqliteInteger("salary_amount"),
    status: sqliteText("status", { enum: ["active", "closed", "draft"] }).notNull().default("active"),
    // archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    // archivedAt: sqliteInteger("archived_at", { mode: "timestamp" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("jobs", {
    id: text("id").primaryKey().$defaultFn(() => `job_${Date.now()}`),
    employerId: text("employer_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    location: text("location"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    // salaryPeriod: text("salary_period", { enum: ["hourly", "daily", "weekly", "15days", "monthly"] }).default("monthly"),
    // salaryAmount: integer("salary_amount"),
    status: text("status", { enum: ["active", "closed", "draft"] }).notNull().default("active"),
    // archived: boolean("archived").default(false),
    // archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ APPLICATIONS TABLE ============
export const applicationsTable = isSqlite ?
  sqliteTable("applications", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `app_${Date.now()}`),
    jobId: sqliteText("job_id").notNull(),
    // jobseekerEmail: sqliteText("jobseeker_email").notNull(),
    applicantName: sqliteText("applicant_name"),
    employerId: sqliteText("employer_id"),
    resumeUrl: sqliteText("resume_url"),
    status: sqliteText("status", { enum: ["pending", "reviewed", "accepted", "rejected", "Hired", "Rejected", "For Interview", "Withdrawn"] }).notNull().default("pending"),
    notes: sqliteText("notes"),
    feedback: sqliteText("feedback"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("applications", {
    id: text("id").primaryKey().$defaultFn(() => `app_${Date.now()}`),
    jobId: text("job_id").notNull(),
    // jobseekerEmail: text("jobseeker_email").notNull(),
    applicantName: text("applicant_name"),
    employerId: text("employer_id"),
    resumeUrl: text("resume_url"),
    status: text("status", { enum: ["pending", "reviewed", "accepted", "rejected", "Hired", "Rejected", "For Interview", "Withdrawn"] }).notNull().default("pending"),
    notes: text("notes"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ SESSIONS TABLE (Optional: for persistent sessions) ============
export const sessionsTable = isSqlite ?
  sqliteTable("sessions", {
    sid: sqliteText("sid").primaryKey(),
    sess: sqliteText("sess", { mode: "json" }).notNull(),
    expire: sqliteInteger("expire").notNull(),
  })
:
  pgTable("sessions", {
    sid: text("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: integer("expire").notNull(),
  });

// ============ APPLICANTS TABLE (NSRP Form) ============
export const applicantsTable = isSqlite ?
  sqliteTable("applicants", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `applicant_${Date.now()}`),
    surname: sqliteText("surname").notNull(),
    firstName: sqliteText("first_name").notNull(),
    middleName: sqliteText("middle_name"),
    suffix: sqliteText("suffix"),
    dateOfBirth: sqliteText("date_of_birth"),
    sex: sqliteText("sex"),
    religion: sqliteText("religion"),
    civilStatus: sqliteText("civil_status"),
    height: sqliteText("height"),
    contactNumber: sqliteText("contact_number"),
    email: sqliteText("email"),
    disability: sqliteText("disability"),
    disabilitySpecify: sqliteText("disability_specify"),
    address: sqliteText("address"),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    employmentStatus: sqliteText("employment_status"),
    employmentType: sqliteText("employment_type"),
    monthsUnemployed: sqliteInteger("months_unemployed"),
    isOfw: sqliteInteger("is_ofw", { mode: "boolean" }).default(false),
    owfCountry: sqliteText("owf_country"),
    isFormerOfw: sqliteInteger("is_former_ofw", { mode: "boolean" }).default(false),
    formerOFWCountry: sqliteText("former_ofw_country"),
    returnToPHDate: sqliteText("return_to_ph_date"),
    is4psBeneficiary: sqliteInteger("is_4ps_beneficiary", { mode: "boolean" }).default(false),
    householdID: sqliteText("household_id"),
    preferredOccupations: sqliteText("preferred_occupations", { mode: "json" }),
    preferredLocations: sqliteText("preferred_locations", { mode: "json" }),
    preferredOverseasCountries: sqliteText("preferred_overseas_countries", { mode: "json" }),
    employmentType4: sqliteText("employment_type_4"),
    education: sqliteText("education", { mode: "json" }),
    technicalTraining: sqliteText("technical_training", { mode: "json" }),
    professionalLicenses: sqliteText("professional_licenses", { mode: "json" }),
    languageProficiency: sqliteText("language_proficiency", { mode: "json" }),
    workExperience: sqliteText("work_experience", { mode: "json" }),
    skills: sqliteText("skills", { mode: "json" }),
    otherSkillsSpecify: sqliteText("other_skills_specify"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("applicants", {
    id: text("id").primaryKey().$defaultFn(() => `applicant_${Date.now()}`),
    surname: text("surname").notNull(),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    suffix: text("suffix"),
    dateOfBirth: text("date_of_birth"),
    sex: text("sex"),
    religion: text("religion"),
    civilStatus: text("civil_status"),
    height: text("height"),
    contactNumber: text("contact_number"),
    email: text("email"),
    disability: text("disability"),
    disabilitySpecify: text("disability_specify"),
    address: text("address"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    employmentStatus: text("employment_status"),
    employmentType: text("employment_type"),
    monthsUnemployed: integer("months_unemployed"),
    isOfw: boolean("is_ofw").default(false),
    owfCountry: text("owf_country"),
    isFormerOfw: boolean("is_former_ofw").default(false),
    formerOFWCountry: text("former_ofw_country"),
    returnToPHDate: text("return_to_ph_date"),
    is4psBeneficiary: boolean("is_4ps_beneficiary").default(false),
    householdID: text("household_id"),
    preferredOccupations: json("preferred_occupations"),
    preferredLocations: json("preferred_locations"),
    preferredOverseasCountries: json("preferred_overseas_countries"),
    employmentType4: text("employment_type_4"),
    education: json("education"),
    technicalTraining: json("technical_training"),
    professionalLicenses: json("professional_licenses"),
    languageProficiency: json("language_proficiency"),
    workExperience: json("work_experience"),
    skills: json("skills"),
    otherSkillsSpecify: text("other_skills_specify"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ EMPLOYERS TABLE (SRS Form 2) ============
export const employersTable = isSqlite ?
  sqliteTable("employers", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `employer_${Date.now()}`),
    establishmentName: sqliteText("establishment_name").notNull(),
    houseStreetVillage: sqliteText("house_street_village"),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    contactNumber: sqliteText("contact_number"),
    email: sqliteText("email"),
    numberOfPaidEmployees: sqliteInteger("number_of_paid_employees"),
    numberOfVacantPositions: sqliteInteger("number_of_vacant_positions"),
    industryType: sqliteText("industry_type", { mode: "json" }),
    srsSubscriber: sqliteInteger("srs_subscriber", { mode: "boolean" }).default(false),
    companyTin: sqliteText("company_tin"),
    businessPermitNumber: sqliteText("business_permit_number"),
    bir2303Number: sqliteText("bir2303_number"),
    chairpersonName: sqliteText("chairperson_name"),
    chairpersonContact: sqliteText("chairperson_contact"),
    secretaryName: sqliteText("secretary_name"),
    secretaryContact: sqliteText("secretary_contact"),
    preparedByName: sqliteText("prepared_by_name"),
    preparedByDesignation: sqliteText("prepared_by_designation"),
    preparedByContact: sqliteText("prepared_by_contact"),
    dateAccomplished: sqliteText("date_accomplished"),
    remarks: sqliteText("remarks"),
    isManpowerAgency: sqliteInteger("is_manpower_agency", { mode: "boolean" }).default(false),
    doleCertificationNumber: sqliteText("dole_certification_number"),
    archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    archivedAt: sqliteInteger("archived_at", { mode: "timestamp" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("employers", {
    id: text("id").primaryKey().$defaultFn(() => `employer_${Date.now()}`),
    establishmentName: text("establishment_name").notNull(),
    houseStreetVillage: text("house_street_village"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    contactNumber: text("contact_number"),
    email: text("email"),
    numberOfPaidEmployees: integer("number_of_paid_employees"),
    numberOfVacantPositions: integer("number_of_vacant_positions"),
    industryType: json("industry_type"),
    srsSubscriber: boolean("srs_subscriber").default(false),
    companyTin: text("company_tin"),
    businessPermitNumber: text("business_permit_number"),
    bir2303Number: text("bir2303_number"),
    chairpersonName: text("chairperson_name"),
    chairpersonContact: text("chairperson_contact"),
    secretaryName: text("secretary_name"),
    secretaryContact: text("secretary_contact"),
    preparedByName: text("prepared_by_name"),
    preparedByDesignation: text("prepared_by_designation"),
    preparedByContact: text("prepared_by_contact"),
    dateAccomplished: text("date_accomplished"),
    remarks: text("remarks"),
    isManpowerAgency: boolean("is_manpower_agency").default(false),
    doleCertificationNumber: text("dole_certification_number"),
    archived: boolean("archived").default(false),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ JOB VACANCIES TABLE (SRS Form 2A) ============
export const jobVacanciesTable = isSqlite ?
  sqliteTable("job_vacancies", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `vacancy_${Date.now()}`),
    employerId: sqliteText("employer_id").notNull(),
    establishmentName: sqliteText("establishment_name").notNull(),
    positionTitle: sqliteText("position_title").notNull(),
    numberOfVacancies: sqliteInteger("number_of_vacancies"),
    industryType: sqliteText("industry_type", { mode: "json" }),
    minimumEducationRequired: sqliteText("minimum_education_required"),
    mainSkillOrSpecialization: sqliteText("main_skill_or_specialization"),
    yearsOfExperienceRequired: sqliteInteger("years_of_experience_required"),
    agePreference: sqliteText("age_preference"),
    startingSalaryOrWage: sqliteReal("starting_salary_or_wage"),
    salaryType: sqliteText("salary_type"),
    jobStatus: sqliteText("job_status"),
    benefits: sqliteText("benefits", { mode: "json" }),
    additionalRequirements: sqliteText("additional_requirements"),
    jobDescription: sqliteText("job_description"),
    preparedByName: sqliteText("prepared_by_name"),
    preparedByDesignation: sqliteText("prepared_by_designation"),
    preparedByContact: sqliteText("prepared_by_contact"),
    dateAccomplished: sqliteText("date_accomplished"),
    archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    archivedAt: sqliteInteger("archived_at", { mode: "timestamp" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("job_vacancies", {
    id: text("id").primaryKey().$defaultFn(() => `vacancy_${Date.now()}`),
    employerId: text("employer_id").notNull(),
    establishmentName: text("establishment_name").notNull(),
    positionTitle: text("position_title").notNull(),
    numberOfVacancies: integer("number_of_vacancies"),
    industryType: json("industry_type"),
    minimumEducationRequired: text("minimum_education_required"),
    mainSkillOrSpecialization: text("main_skill_or_specialization"),
    yearsOfExperienceRequired: integer("years_of_experience_required"),
    agePreference: text("age_preference"),
    startingSalaryOrWage: integer("starting_salary_or_wage"),
    salaryType: text("salary_type"),
    jobStatus: text("job_status"),
    benefits: json("benefits"),
    additionalRequirements: text("additional_requirements"),
    jobDescription: text("job_description"),
    preparedByName: text("prepared_by_name"),
    preparedByDesignation: text("prepared_by_designation"),
    preparedByContact: text("prepared_by_contact"),
    dateAccomplished: text("date_accomplished"),
    archived: boolean("archived").default(false),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ REFERRALS TABLE ============
export const referralsTable = isSqlite ?
  sqliteTable("referrals", {
    referralId: sqliteText("referral_id").primaryKey().$defaultFn(() => `ref_${Date.now()}`),
    applicantId: sqliteText("applicant_id").notNull(),
    applicant: sqliteText("applicant").notNull(),
    employerId: sqliteText("employer_id"),
    employer: sqliteText("employer"),
    vacancyId: sqliteText("vacancy_id"),
    vacancy: sqliteText("vacancy"),
    barangay: sqliteText("barangay"),
    jobCategory: sqliteText("job_category"),
    dateReferred: sqliteText("date_referred"),
    status: sqliteText("status", { enum: ["pending", "hired", "rejected", "withdrawn"] }).notNull().default("pending"),
    feedback: sqliteText("feedback"),
    referralSlipNumber: sqliteText("referral_slip_number").unique(),
    pesoOfficerName: sqliteText("peso_officer_name"),
    pesoOfficerDesignation: sqliteText("peso_officer_designation"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("referrals", {
    referralId: text("referral_id").primaryKey().$defaultFn(() => `ref_${Date.now()}`),
    applicantId: text("applicant_id").notNull(),
    applicant: text("applicant").notNull(),
    employerId: text("employer_id"),
    employer: text("employer"),
    vacancyId: text("vacancy_id"),
    vacancy: text("vacancy"),
    barangay: text("barangay"),
    jobCategory: text("job_category"),
    dateReferred: text("date_referred"),
    status: text("status", { enum: ["pending", "hired", "rejected", "withdrawn"] }).notNull().default("pending"),
    feedback: text("feedback"),
    referralSlipNumber: text("referral_slip_number").unique(),
    pesoOfficerName: text("peso_officer_name"),
    pesoOfficerDesignation: text("peso_officer_designation"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============ NOTES TABLE ============
export const notesTable = isSqlite ?
  sqliteTable("notes", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `note_${Date.now()}`),
    title: sqliteText("title").notNull(),
    body: sqliteText("body").notNull(),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("notes", {
    id: text("id").primaryKey().$defaultFn(() => `note_${Date.now()}`),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

export type Admin = typeof adminsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Job = typeof jobsTable.$inferSelect;
export type Application = typeof applicationsTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Applicant = typeof applicantsTable.$inferSelect;
export type Employer = typeof employersTable.$inferSelect;
export type JobVacancy = typeof jobVacanciesTable.$inferSelect;
export type Referral = typeof referralsTable.$inferSelect;
export type Note = typeof notesTable.$inferSelect;

export type AdminInsert = typeof adminsTable.$inferInsert;
export type UserInsert = typeof usersTable.$inferInsert;
export type JobInsert = typeof jobsTable.$inferInsert;
export type ApplicationInsert = typeof applicationsTable.$inferInsert;
export type ApplicantInsert = typeof applicantsTable.$inferInsert;
export type EmployerInsert = typeof employersTable.$inferInsert;
export type JobVacancyInsert = typeof jobVacanciesTable.$inferInsert;
export type ReferralInsert = typeof referralsTable.$inferInsert;
export type NoteInsert = typeof notesTable.$inferInsert;
