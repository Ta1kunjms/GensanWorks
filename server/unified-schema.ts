/**
 * UNIFIED DATABASE SCHEMA
 * 
 * This is the single source of truth for ALL database tables and structures.
 * All tables are defined here in one place for easy management and debugging.
 * 
 * Tables included:
 * - admins: Admin users
 * - users: Jobseekers, Freelancers, Employers
 * - applicants: NSRP Form applicants
 * - employers: SRS Form 2 - Employer establishments
 * - jobVacancies: SRS Form 2A - Job vacancies
 * - jobs: Job postings (legacy)
 * - applications: Job applications
 * - referrals: Referral slip tracking
 * - notes: Notes system
 * - sessions: Session management
 */

import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  json,
  serial,
  varchar,
  real as pgReal,
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  real as sqliteReal,
  blob as sqliteBlob,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Determine database type from environment
const isDev = process.env.NODE_ENV === "development";
const isSqlite = !process.env.DATABASE_URL?.startsWith("postgresql://");

// ============================================================================
// NOTIFICATIONS TABLE - System/user notifications
// ============================================================================
export const notificationsTable = isSqlite ?
  sqliteTable("notifications", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `notif_${Date.now()}_${Math.random().toString(36).slice(2,8)}`),
    userId: sqliteText("user_id"), // optional direct user target
    role: sqliteText("role"), // admin | employer | jobseeker | freelancer
    type: sqliteText("type"), // system | job | application | message
    message: sqliteText("message").notNull(),
    read: sqliteInteger("read", { mode: "boolean" }).default(false),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("notifications", {
    id: text("id").primaryKey().$defaultFn(() => `notif_${Date.now()}_${Math.random().toString(36).slice(2,8)}`),
    userId: text("user_id"),
    role: text("role"),
    type: text("type"),
    message: text("message").notNull(),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// ADMINS TABLE - Admin users
// ============================================================================
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

// ============================================================================
// APPLICANTS TABLE - NSRP Form applicant registrations + Login credentials
// All jobseekers and freelancers are stored here with optional password
// ============================================================================
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
    email: sqliteText("email").unique(),
    // Address fields (NSRP)
    houseStreetVillage: sqliteText("house_street_village"),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    // Disability (NSRP)
    disability: sqliteText("disability"),
    disabilitySpecify: sqliteText("disability_specify"),
    // Employment Status (NSRP)
    employmentStatus: sqliteText("employment_status"),
    employmentType: sqliteText("employment_type"),
    monthsUnemployed: sqliteInteger("months_unemployed"),
    // OFW Status (NSRP)
    isOFW: sqliteInteger("is_ofw", { mode: "boolean" }).default(false),
    owfCountry: sqliteText("owf_country"),
    isFormerOFW: sqliteInteger("is_former_ofw", { mode: "boolean" }).default(false),
    formerOFWCountry: sqliteText("former_ofw_country"),
    returnToPHDate: sqliteText("return_to_ph_date"),
    // 4Ps Beneficiary (NSRP)
    is4PSBeneficiary: sqliteInteger("is_4ps_beneficiary", { mode: "boolean" }).default(false),
    householdID: sqliteText("household_id"),
    // Job Preferences (NSRP)
    preferredOccupations: sqliteText("preferred_occupations", { mode: "json" }),
    preferredLocations: sqliteText("preferred_locations", { mode: "json" }),
    preferredOverseasCountries: sqliteText("preferred_overseas_countries", { mode: "json" }),
    employmentType4: sqliteText("employment_type_4"),
    // NSRP Arrays
    languageProficiency: sqliteText("language_proficiency", { mode: "json" }),
    education: sqliteText("education", { mode: "json" }),
    technicalTraining: sqliteText("technical_training", { mode: "json" }),
    professionalLicenses: sqliteText("professional_licenses", { mode: "json" }),
    workExperience: sqliteText("work_experience", { mode: "json" }),
    otherSkills: sqliteText("other_skills", { mode: "json" }),
    otherSkillsSpecify: sqliteText("other_skills_specify"),
    // Login credentials (optional - only for self-registered accounts)
    passwordHash: sqliteText("password_hash"),
    role: sqliteText("role", { enum: ["jobseeker", "freelancer"] }).default("jobseeker"),
    hasAccount: sqliteInteger("has_account", { mode: "boolean" }).default(false),
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
    email: text("email").unique(),
    // Address fields (NSRP)
    houseStreetVillage: text("house_street_village"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    // Disability (NSRP)
    disability: text("disability"),
    disabilitySpecify: text("disability_specify"),
    // Employment Status (NSRP)
    employmentStatus: text("employment_status"),
    employmentType: text("employment_type"),
    monthsUnemployed: integer("months_unemployed"),
    // OFW Status (NSRP)
    isOFW: boolean("is_ofw").default(false),
    owfCountry: text("owf_country"),
    isFormerOFW: boolean("is_former_ofw").default(false),
    formerOFWCountry: text("former_ofw_country"),
    returnToPHDate: text("return_to_ph_date"),
    // 4Ps Beneficiary (NSRP)
    is4PSBeneficiary: boolean("is_4ps_beneficiary").default(false),
    householdID: text("household_id"),
    // Job Preferences (NSRP)
    preferredOccupations: json("preferred_occupations"),
    preferredLocations: json("preferred_locations"),
    preferredOverseasCountries: json("preferred_overseas_countries"),
    employmentType4: text("employment_type_4"),
    // NSRP Arrays
    languageProficiency: json("language_proficiency"),
    education: json("education"),
    technicalTraining: json("technical_training"),
    professionalLicenses: json("professional_licenses"),
    workExperience: json("work_experience"),
    otherSkills: json("other_skills"),
    otherSkillsSpecify: text("other_skills_specify"),
    // Login credentials (optional - only for self-registered accounts)
    passwordHash: text("password_hash"),
    role: text("role", { enum: ["jobseeker", "freelancer"] }).default("jobseeker"),
    hasAccount: boolean("has_account").default(false),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// EMPLOYERS TABLE - SRS Form 2: Employer establishments
// ============================================================================
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
    // Login credentials (optional - for employer portal access)
    passwordHash: sqliteText("password_hash"),
    hasAccount: sqliteInteger("has_account", { mode: "boolean" }).default(false),
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
    // Login credentials (optional - for employer portal access)
    passwordHash: text("password_hash"),
    hasAccount: boolean("has_account").default(false),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// JOB VACANCIES TABLE - SRS Form 2A: Job vacancy postings
// ============================================================================
export const jobVacanciesTable = isSqlite ?
  sqliteTable("job_vacancies", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `vacancy_${Date.now()}`),
    employerId: sqliteText("employer_id").notNull(),
    establishmentName: sqliteText("establishment_name").notNull(),
    positionTitle: sqliteText("position_title").notNull(),
    industryCodes: sqliteText("industry_codes", { mode: "json" }),
    minimumEducationRequired: sqliteText("minimum_education_required"),
    mainSkillOrSpecialization: sqliteText("main_skill_or_specialization"),
    yearsOfExperienceRequired: sqliteInteger("years_of_experience_required"),
    agePreference: sqliteText("age_preference"),
    startingSalaryOrWage: sqliteReal("starting_salary_or_wage"),
    vacantPositions: sqliteInteger("vacant_positions"),
    paidEmployees: sqliteInteger("paid_employees"),
    jobStatus: sqliteText("job_status"),
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
    industryCodes: json("industry_codes"),
    minimumEducationRequired: text("minimum_education_required"),
    mainSkillOrSpecialization: text("main_skill_or_specialization"),
    yearsOfExperienceRequired: integer("years_of_experience_required"),
    agePreference: text("age_preference"),
    startingSalaryOrWage: pgReal("starting_salary_or_wage"),
    vacantPositions: integer("vacant_positions"),
    paidEmployees: integer("paid_employees"),
    jobStatus: text("job_status"),
    preparedByName: text("prepared_by_name"),
    preparedByDesignation: text("prepared_by_designation"),
    preparedByContact: text("prepared_by_contact"),
    dateAccomplished: text("date_accomplished"),
    archived: boolean("archived").default(false),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// REFERRALS TABLE - Referral slip tracking
// ============================================================================
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
    status: sqliteText("status", { enum: ["Pending", "Hired", "Rejected", "For Interview", "Withdrawn"] }).notNull().default("Pending"),
    feedback: sqliteText("feedback"),
    referralSlipNumber: sqliteText("referral_slip_number"),
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
    status: text("status", { enum: ["Pending", "Hired", "Rejected", "For Interview", "Withdrawn"] }).notNull().default("Pending"),
    feedback: text("feedback"),
    referralSlipNumber: text("referral_slip_number"),
    pesoOfficerName: text("peso_officer_name"),
    pesoOfficerDesignation: text("peso_officer_designation"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// NOTES TABLE - Simple notes system
// ============================================================================
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

// ============================================================================
// JOBS TABLE - Legacy job postings (kept for compatibility)
// ============================================================================
export const jobsTable = isSqlite ?
  sqliteTable("jobs", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `job_${Date.now()}`),
    employerId: sqliteText("employer_id").notNull(),
    title: sqliteText("title").notNull(),
    description: sqliteText("description").notNull(),
    location: sqliteText("location"),
    salaryMin: sqliteInteger("salary_min"),
    salaryMax: sqliteInteger("salary_max"),
    status: sqliteText("status", { enum: ["active", "closed", "draft"] }).notNull().default("active"),
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
    status: text("status", { enum: ["active", "closed", "draft"] }).notNull().default("active"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// APPLICATIONS TABLE - Job applications
// ============================================================================
export const applicationsTable = isSqlite ?
  sqliteTable("applications", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `app_${Date.now()}`),
    jobId: sqliteText("job_id").notNull(),
    applicantId: sqliteText("applicant_id"),
    applicantName: sqliteText("applicant_name"),
    employerId: sqliteText("employer_id"),
    coverLetter: sqliteText("cover_letter"),
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
    applicantId: text("applicant_id"),
    applicantName: text("applicant_name"),
    employerId: text("employer_id"),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    status: text("status", { enum: ["pending", "reviewed", "accepted", "rejected", "Hired", "Rejected", "For Interview", "Withdrawn"] }).notNull().default("pending"),
    notes: text("notes"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// SESSIONS TABLE - Session storage for authentication
// ============================================================================
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

// ============================================================================
// TYPE EXPORTS
// These are used for TypeScript type checking and validation
// ============================================================================

// Admins
export type Admin = typeof adminsTable.$inferSelect;
export type AdminInsert = typeof adminsTable.$inferInsert;

// Applicants (now includes login credentials for jobseekers/freelancers)
export type Applicant = typeof applicantsTable.$inferSelect;
export type ApplicantInsert = typeof applicantsTable.$inferInsert;

// Employers
export type Employer = typeof employersTable.$inferSelect;
export type EmployerInsert = typeof employersTable.$inferInsert;

// Job Vacancies
export type JobVacancy = typeof jobVacanciesTable.$inferSelect;
export type JobVacancyInsert = typeof jobVacanciesTable.$inferInsert;

// Referrals
export type Referral = typeof referralsTable.$inferSelect;
export type ReferralInsert = typeof referralsTable.$inferInsert;

// Notes
export type Note = typeof notesTable.$inferSelect;
export type NoteInsert = typeof notesTable.$inferInsert;

// Jobs (legacy)
export type Job = typeof jobsTable.$inferSelect;
export type JobInsert = typeof jobsTable.$inferInsert;

// Applications
export type Application = typeof applicationsTable.$inferSelect;
export type ApplicationInsert = typeof applicationsTable.$inferInsert;

// Sessions
export type Session = typeof sessionsTable.$inferSelect;

// Note: User types removed - jobseekers are now stored in applicantsTable

// ============================================================================
// MESSAGES TABLE - Communication between employers and applicants
// ============================================================================
export const messagesTable = isSqlite ?
  sqliteTable("messages", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
    senderId: sqliteText("sender_id").notNull(),
    senderRole: sqliteText("sender_role", { enum: ["employer", "jobseeker", "freelancer"] }).notNull(),
    receiverId: sqliteText("receiver_id").notNull(),
    receiverRole: sqliteText("receiver_role", { enum: ["employer", "jobseeker", "freelancer"] }).notNull(),
    subject: sqliteText("subject"),
    content: sqliteText("content").notNull(),
    isRead: sqliteInteger("is_read", { mode: "boolean" }).default(false).notNull(),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
    senderId: text("sender_id").notNull(),
    senderRole: text("sender_role", { enum: ["employer", "jobseeker", "freelancer"] }).notNull(),
    receiverId: text("receiver_id").notNull(),
    receiverRole: text("receiver_role", { enum: ["employer", "jobseeker", "freelancer"] }).notNull(),
    subject: text("subject"),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// Messages types
export type Message = typeof messagesTable.$inferSelect;
export type MessageInsert = typeof messagesTable.$inferInsert;

// ============================================================================
// EXPORT ALL TABLES FOR DIRECT USE
// ============================================================================

export const tables = {
  admins: adminsTable,
  applicants: applicantsTable,
  employers: employersTable,
  jobVacancies: jobVacanciesTable,
  referrals: referralsTable,
  notes: notesTable,
  jobs: jobsTable,
  applications: applicationsTable,
  sessions: sessionsTable,
  messages: messagesTable,
} as const;

export const isSqliteDB = isSqlite;
