
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
  uniqueIndex as pgUniqueIndex,
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  real as sqliteReal,
  blob as sqliteBlob,
  uniqueIndex as sqliteUniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


const isDev = process.env.NODE_ENV === "development";
const isSqlite = !process.env.DATABASE_URL?.startsWith("postgresql://");
// ============================================================================
// ADMIN ACCESS REQUESTS TABLE - Requests for admin access (persistent)
// ============================================================================
export const adminAccessRequestsTable = isSqlite ?
  sqliteTable("admin_access_requests", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `REQ-${Date.now()}`),
    name: sqliteText("name").notNull(),
    email: sqliteText("email").notNull(),
    phone: sqliteText("phone").notNull(),
    organization: sqliteText("organization").notNull(),
    status: sqliteText("status").notNull().default("pending"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
: pgTable("admin_access_requests", {
    id: text("id").primaryKey().$defaultFn(() => `REQ-${Date.now()}`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    organization: text("organization").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ...existing code...

/**
 * UNIFIED DATABASE SCHEMA
 * 
 * This is the single source of truth for ALL database tables and structures.
 * All tables are defined here in one place for easy management and debugging.
 * 
 * Tables included:
 * - admins: Admin users
 * - users: NSRP-compliant jobseekers (with login credentials)
 * - employers: SRS Form 2 - Employer establishments
 * - jobVacancies: SRS Form 2A - Job vacancies
 * - jobs: Job postings (legacy)
 * - applications: Job applications
 * - referrals: Referral slip tracking
 * - notes: Notes system
 * - sessions: Session management
 */



// ...existing code...

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
    email: sqliteText("email").notNull(),
    passwordHash: sqliteText("password_hash").notNull(),
    role: sqliteText("role", { enum: ["admin"] }).notNull().default("admin"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }, (table) => ({
    emailUniqueIdx: sqliteUniqueIndex("admins_email_unique").on(table.email),
  }))
:
  pgTable("admins", {
    id: text("id").primaryKey().$defaultFn(() => `admin_${Date.now()}`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin"] }).notNull().default("admin"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  }, (table) => ({
    emailUniqueIdx: pgUniqueIndex("admins_email_unique").on(table.email),
  }));

// ============================================================================
// USERS TABLE - NSRP-compliant jobseekers with login credentials
// ============================================================================
export const usersTable = isSqlite ?
  sqliteTable("users", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `user_${Date.now()}`),
    email: sqliteText("email").notNull(),
    passwordHash: sqliteText("password_hash").notNull(),
    name: sqliteText("name"),
    hasAccount: sqliteInteger("has_account", { mode: "boolean" }).default(false),
    role: sqliteText("role").notNull().default("jobseeker"),
    surname: sqliteText("surname").notNull(),
    firstName: sqliteText("first_name").notNull(),
    middleName: sqliteText("middle_name"),
    lastName: sqliteText("last_name"),
    suffix: sqliteText("suffix"),
    birthDate: sqliteText("birth_date"),
    gender: sqliteText("gender"),
    dateOfBirth: sqliteText("date_of_birth"),
    sex: sqliteText("sex"),
    religion: sqliteText("religion"),
    civilStatus: sqliteText("civil_status"),
    height: sqliteText("height"),
    weight: sqliteText("weight"),
    bloodType: sqliteText("blood_type"),
    contactNumber: sqliteText("contact_number"),
    disability: sqliteText("disability"),
    disabilitySpecify: sqliteText("disability_specify"),
    address: sqliteText("address"),
    houseStreetVillage: sqliteText("house_street_village"),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    zipCode: sqliteText("zip_code"),
    employmentStatus: sqliteText("employment_status"),
    employmentStatusDetail: sqliteText("employment_status_detail"),
    selfEmployedCategory: sqliteText("self_employed_category"),
    selfEmployedCategoryOther: sqliteText("self_employed_category_other"),
    unemployedReason: sqliteText("unemployed_reason"),
    unemployedReasonOther: sqliteText("unemployed_reason_other"),
    unemployedAbroadCountry: sqliteText("unemployed_abroad_country"),
    employmentType: sqliteText("employment_type"),
    employmentType4: sqliteText("employment_type_4"),
    monthsUnemployed: sqliteInteger("months_unemployed"),
    isOfw: sqliteInteger("is_ofw", { mode: "boolean" }).default(false),
    ofwCountry: sqliteText("ofw_country"),
    isFormerOfw: sqliteInteger("is_former_ofw", { mode: "boolean" }).default(false),
    formerOFWCountry: sqliteText("former_ofw_country"),
    returnToPHDate: sqliteText("return_to_ph_date"),
    is4psBeneficiary: sqliteInteger("is_4ps_beneficiary", { mode: "boolean" }).default(false),
    householdID: sqliteText("household_id"),
    nsrpNumber: sqliteText("nsrp_number"),
    governmentIdType: sqliteText("government_id_type"),
    governmentIdNumber: sqliteText("government_id_number"),
    educationLevel: sqliteText("education_level"),
    course: sqliteText("course"),
    willingToRelocate: sqliteInteger("willing_to_relocate", { mode: "boolean" }).default(false),
    willingToWorkOverseas: sqliteInteger("willing_to_work_overseas", { mode: "boolean" }).default(false),
    registrationDate: sqliteInteger("registration_date", { mode: "timestamp" }),
    nsrpRegistrationNo: sqliteText("nsrp_registration_no"),
    profileImage: sqliteText("profile_image"),
    archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    jobPreferences: sqliteText("job_preferences", { mode: "json" }),
    preferredOccupations: sqliteText("preferred_occupations", { mode: "json" }),
    preferredLocations: sqliteText("preferred_locations", { mode: "json" }),
    preferredOverseasCountries: sqliteText("preferred_overseas_countries", { mode: "json" }),
    education: sqliteText("education", { mode: "json" }),
    technicalTraining: sqliteText("technical_training", { mode: "json" }),
    professionalLicenses: sqliteText("professional_licenses", { mode: "json" }),
    languageProficiency: sqliteText("language_proficiency", { mode: "json" }),
    workExperience: sqliteText("work_experience", { mode: "json" }),
    otherSkills: sqliteText("other_skills", { mode: "json" }),
    skills: sqliteText("skills", { mode: "json" }),
    otherSkillsTraining: sqliteText("other_skills_training"),
    otherSkillsSpecify: sqliteText("other_skills_specify"),
    attachments: sqliteText("attachments", { mode: "json" }),
    notes: sqliteText("notes"),
    registeredAt: sqliteInteger("registered_at", { mode: "timestamp" }),
    lastLoginAt: sqliteInteger("last_login_at", { mode: "timestamp" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }, (table) => ({
    usersEmailUniqueIdx: sqliteUniqueIndex("users_email_unique").on(table.email),
    usersNsrpUniqueIdx: sqliteUniqueIndex("users_nsrp_unique").on(table.nsrpNumber),
  }))
:
  pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => `user_${Date.now()}`),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    hasAccount: boolean("has_account").default(false),
    role: text("role").notNull().default("jobseeker"),
    surname: text("surname").notNull(),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name"),
    suffix: text("suffix"),
    birthDate: text("birth_date"),
    gender: text("gender"),
    dateOfBirth: text("date_of_birth"),
    sex: text("sex"),
    religion: text("religion"),
    civilStatus: text("civil_status"),
    height: text("height"),
    weight: text("weight"),
    bloodType: text("blood_type"),
    contactNumber: text("contact_number"),
    disability: text("disability"),
    disabilitySpecify: text("disability_specify"),
    address: text("address"),
    houseStreetVillage: text("house_street_village"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    zipCode: text("zip_code"),
    employmentStatus: text("employment_status"),
    employmentStatusDetail: text("employment_status_detail"),
    selfEmployedCategory: text("self_employed_category"),
    selfEmployedCategoryOther: text("self_employed_category_other"),
    unemployedReason: text("unemployed_reason"),
    unemployedReasonOther: text("unemployed_reason_other"),
    unemployedAbroadCountry: text("unemployed_abroad_country"),
    employmentType: text("employment_type"),
    employmentType4: text("employment_type_4"),
    monthsUnemployed: integer("months_unemployed"),
    isOfw: boolean("is_ofw").default(false),
    ofwCountry: text("ofw_country"),
    isFormerOfw: boolean("is_former_ofw").default(false),
    formerOFWCountry: text("former_ofw_country"),
    returnToPHDate: text("return_to_ph_date"),
    is4psBeneficiary: boolean("is_4ps_beneficiary").default(false),
    householdID: text("household_id"),
    nsrpNumber: text("nsrp_number"),
    governmentIdType: text("government_id_type"),
    governmentIdNumber: text("government_id_number"),
    educationLevel: text("education_level"),
    course: text("course"),
    willingToRelocate: boolean("willing_to_relocate").default(false),
    willingToWorkOverseas: boolean("willing_to_work_overseas").default(false),
    registrationDate: timestamp("registration_date"),
    nsrpRegistrationNo: text("nsrp_registration_no"),
    profileImage: text("profile_image"),
    archived: boolean("archived").default(false),
    jobPreferences: json("job_preferences"),
    preferredOccupations: json("preferred_occupations"),
    preferredLocations: json("preferred_locations"),
    preferredOverseasCountries: json("preferred_overseas_countries"),
    education: json("education"),
    technicalTraining: json("technical_training"),
    professionalLicenses: json("professional_licenses"),
    languageProficiency: json("language_proficiency"),
    workExperience: json("work_experience"),
    otherSkills: json("other_skills"),
    skills: json("skills"),
    otherSkillsTraining: text("other_skills_training"),
    otherSkillsSpecify: text("other_skills_specify"),
    attachments: json("attachments"),
    notes: text("notes"),
    registeredAt: timestamp("registered_at"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  }, (table) => ({
    usersEmailUniqueIdx: pgUniqueIndex("users_email_unique").on(table.email),
    usersNsrpUniqueIdx: pgUniqueIndex("users_nsrp_unique").on(table.nsrpNumber),
  }));

// Legacy alias removed - use usersTable directly throughout codebase
// export const applicantsTable = usersTable; // DEPRECATED: Use usersTable instead

// ============================================================================
// EMPLOYERS TABLE - SRS Form 2: Employer establishments
// ============================================================================
export const employersTable = isSqlite ?
  sqliteTable("employers", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `employer_${Date.now()}`),
    establishmentName: sqliteText("establishment_name").notNull(),
    name: sqliteText("name"),
    tradeName: sqliteText("trade_name"),
    houseStreetVillage: sqliteText("house_street_village"),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    completeAddress: sqliteText("complete_address"),
    addressDetails: sqliteText("address_details", { mode: "json" }),
    contactNumber: sqliteText("contact_number"),
    contactEmail: sqliteText("contact_email"),
    contactPerson: sqliteText("contact_person", { mode: "json" }),
    alternateContacts: sqliteText("alternate_contacts", { mode: "json" }),
    email: sqliteText("email"),
    phone: sqliteText("phone"),
    numberOfPaidEmployees: sqliteInteger("number_of_paid_employees"),
    numberOfVacantPositions: sqliteInteger("number_of_vacant_positions"),
    industryCodes: sqliteText("industry_codes", { mode: "json" }),
    industryType: sqliteText("industry_type", { mode: "json" }),
    companyType: sqliteText("company_type"),
    companyIndustry: sqliteText("company_industry"),
    companySize: sqliteText("company_size"),
    srsSubscriber: sqliteInteger("srs_subscriber", { mode: "boolean" }).default(false),
    subscriptionStatus: sqliteText("subscription_status"),
    companyTin: sqliteText("company_tin"),
    companyRegistrationNo: sqliteText("company_registration_no"),
    companyDescription: sqliteText("company_description"),
    companyTaxIdNumber: sqliteText("company_tax_id_number"),
    businessPermitNumber: sqliteText("business_permit_number"),
    bir2303Number: sqliteText("bir2303_number"),
    requirements: sqliteText("requirements", { mode: "json" }),
    attachments: sqliteText("attachments", { mode: "json" }),
    chairpersonName: sqliteText("chairperson_name"),
    chairpersonContact: sqliteText("chairperson_contact"),
    secretaryName: sqliteText("secretary_name"),
    secretaryContact: sqliteText("secretary_contact"),
    barangayChairperson: sqliteText("barangay_chairperson"),
    chairpersonTelNumber: sqliteText("chairperson_tel_number"),
    barangaySecretary: sqliteText("barangay_secretary"),
    secretaryTelNumber: sqliteText("secretary_tel_number"),
    geographicIdentification: sqliteText("geographic_identification", { mode: "json" }),
    geographicCode: sqliteText("geographic_code"),
    telNumber: sqliteText("tel_number"),
    preparedByName: sqliteText("prepared_by_name"),
    preparedByDesignation: sqliteText("prepared_by_designation"),
    preparedByContact: sqliteText("prepared_by_contact"),
    dateAccomplished: sqliteText("date_accomplished"),
    remarks: sqliteText("remarks"),
    isManpowerAgency: sqliteInteger("is_manpower_agency", { mode: "boolean" }).default(false),
    doleCertificationNumber: sqliteText("dole_certification_number"),
    // File attachments (stored as JSON strings)
    srsFormFile: sqliteText("srs_form_file"),
    businessPermitFile: sqliteText("business_permit_file"),
    bir2303File: sqliteText("bir2303_file"),
    companyProfileFile: sqliteText("company_profile_file"),
    doleCertificationFile: sqliteText("dole_certification_file"),
    archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    archivedAt: sqliteInteger("archived_at", { mode: "timestamp" }),
    status: sqliteText("status"),
    profileImage: sqliteText("profile_image"),
    // Login credentials (optional - for employer portal access)
    passwordHash: sqliteText("password_hash"),
    hasAccount: sqliteInteger("has_account", { mode: "boolean" }).default(false),
    // Account approval status
    accountStatus: sqliteText("account_status").default("pending"),
    createdBy: sqliteText("created_by").default("self"),
    reviewedBy: sqliteText("reviewed_by"),
    reviewedAt: sqliteInteger("reviewed_at", { mode: "timestamp" }),
    rejectionReason: sqliteText("rejection_reason"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("employers", {
    id: text("id").primaryKey().$defaultFn(() => `employer_${Date.now()}`),
    establishmentName: text("establishment_name").notNull(),
    name: text("name"),
    tradeName: text("trade_name"),
    houseStreetVillage: text("house_street_village"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    completeAddress: text("complete_address"),
    addressDetails: json("address_details"),
    contactNumber: text("contact_number"),
    contactEmail: text("contact_email"),
    contactPerson: json("contact_person"),
    alternateContacts: json("alternate_contacts"),
    email: text("email"),
    phone: text("phone"),
    numberOfPaidEmployees: integer("number_of_paid_employees"),
    numberOfVacantPositions: integer("number_of_vacant_positions"),
    industryCodes: json("industry_codes"),
    industryType: json("industry_type"),
    companyType: text("company_type"),
    companyIndustry: text("company_industry"),
    companySize: text("company_size"),
    srsSubscriber: boolean("srs_subscriber").default(false),
    subscriptionStatus: text("subscription_status"),
    companyTin: text("company_tin"),
    companyRegistrationNo: text("company_registration_no"),
    companyDescription: text("company_description"),
    companyTaxIdNumber: text("company_tax_id_number"),
    businessPermitNumber: text("business_permit_number"),
    bir2303Number: text("bir2303_number"),
    requirements: json("requirements"),
    attachments: json("attachments"),
    chairpersonName: text("chairperson_name"),
    chairpersonContact: text("chairperson_contact"),
    secretaryName: text("secretary_name"),
    secretaryContact: text("secretary_contact"),
    barangayChairperson: text("barangay_chairperson"),
    chairpersonTelNumber: text("chairperson_tel_number"),
    barangaySecretary: text("barangay_secretary"),
    secretaryTelNumber: text("secretary_tel_number"),
    geographicIdentification: json("geographic_identification"),
    geographicCode: text("geographic_code"),
    telNumber: text("tel_number"),
    preparedByName: text("prepared_by_name"),
    preparedByDesignation: text("prepared_by_designation"),
    preparedByContact: text("prepared_by_contact"),
    dateAccomplished: text("date_accomplished"),
    remarks: text("remarks"),
    isManpowerAgency: boolean("is_manpower_agency").default(false),
    doleCertificationNumber: text("dole_certification_number"),
    // File attachments (stored as JSON strings)
    srsFormFile: text("srs_form_file"),
    businessPermitFile: text("business_permit_file"),
    bir2303File: text("bir2303_file"),
    companyProfileFile: text("company_profile_file"),
    doleCertificationFile: text("dole_certification_file"),
    archived: boolean("archived").default(false),
    archivedAt: timestamp("archived_at"),
    status: text("status"),
    profileImage: text("profile_image"),
    // Login credentials (optional - for employer portal access)
    passwordHash: text("password_hash"),
    hasAccount: boolean("has_account").default(false),
    // Account approval status
    accountStatus: text("account_status").default("pending"),
    createdBy: text("created_by").default("self"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });


// ============================================================================
// JOBS TABLE - SRS Form 2A: Job postings (unified, single definition)
// ============================================================================
export const jobsTable = isSqlite ?
  sqliteTable("jobs", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `job_${Date.now()}`),
    employerId: sqliteText("employer_id"),
    status: sqliteText("status").notNull().default("pending"),
    establishmentName: sqliteText("establishment_name"),
    positionTitle: sqliteText("position_title").notNull(),
    description: sqliteText("description"),
    employmentType: sqliteText("employment_type"),
    location: sqliteText("location"),
    salaryMin: sqliteReal("salary_min"),
    salaryMax: sqliteReal("salary_max"),
    salaryPeriod: sqliteText("salary_period"),
    salaryAmount: sqliteReal("salary_amount"),
    salaryType: sqliteText("salary_type"),
    salaryPeriodRaw: sqliteText("salary_period_raw"),
    skills: sqliteText("skills"),
    industryCodes: sqliteText("industry_codes", { mode: "json" }),
    minimumEducationRequired: sqliteText("minimum_education_required"),
    mainSkillOrSpecialization: sqliteText("main_skill_or_specialization"),
    yearsOfExperienceRequired: sqliteInteger("years_of_experience_required"),
    agePreference: sqliteText("age_preference"),
    salary: sqliteText("salary", { mode: "json" }),
    startingSalaryOrWage: sqliteReal("starting_salary_or_wage"),
    vacantPositions: sqliteInteger("vacant_positions"),
    paidEmployees: sqliteInteger("paid_employees"),
    jobStatus: sqliteText("job_status"),
    contact: sqliteText("contact", { mode: "json" }),
    requirements: sqliteText("requirements", { mode: "json" }),
    preparedByName: sqliteText("prepared_by_name"),
    preparedByDesignation: sqliteText("prepared_by_designation"),
    preparedByContact: sqliteText("prepared_by_contact"),
    dateAccomplished: sqliteText("date_accomplished"),
    attachments: sqliteText("attachments", { mode: "json" }),
    accountMetadata: sqliteText("account_metadata", { mode: "json" }),
    barangay: sqliteText("barangay"),
    municipality: sqliteText("municipality"),
    province: sqliteText("province"),
    archived: sqliteInteger("archived", { mode: "boolean" }).default(false),
    archivedAt: sqliteInteger("archived_at", { mode: "timestamp" }),
    qualifications: sqliteText("qualifications"),
    responsibilities: sqliteText("responsibilities"),
    vacancies: sqliteInteger("vacancies"),
    jobCategory: sqliteText("job_category"),
    nsrpJobCode: sqliteText("nsrp_job_code"),
    jobCompensationType: sqliteText("job_compensation_type"),
    jobCompensationDetails: sqliteText("job_compensation_details"),
    jobBenefits: sqliteText("job_benefits"),
    jobRequirements: sqliteText("job_requirements"),
    jobExperienceLevel: sqliteText("job_experience_level"),
    jobEducationLevel: sqliteText("job_education_level"),
    jobShift: sqliteText("job_shift"),
    jobSchedule: sqliteText("job_schedule"),
    jobApplicationDeadline: sqliteText("job_application_deadline"),
    jobContactPerson: sqliteText("job_contact_person"),
    jobContactEmail: sqliteText("job_contact_email"),
    jobContactPhone: sqliteText("job_contact_phone"),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("jobs", {
    id: text("id").primaryKey().$defaultFn(() => `job_${Date.now()}`),
    employerId: text("employer_id"),
    status: text("status").notNull().default("pending"),
    establishmentName: text("establishment_name"),
    positionTitle: text("position_title").notNull(),
    description: text("description"),
    employmentType: text("employment_type"),
    location: text("location"),
    salaryMin: pgReal("salary_min"),
    salaryMax: pgReal("salary_max"),
    salaryPeriod: text("salary_period"),
    salaryAmount: pgReal("salary_amount"),
    salaryType: text("salary_type"),
    salaryPeriodRaw: text("salary_period_raw"),
    skills: text("skills"),
    industryCodes: json("industry_codes"),
    minimumEducationRequired: text("minimum_education_required"),
    mainSkillOrSpecialization: text("main_skill_or_specialization"),
    yearsOfExperienceRequired: integer("years_of_experience_required"),
    agePreference: text("age_preference"),
    salary: json("salary"),
    startingSalaryOrWage: pgReal("starting_salary_or_wage"),
    vacantPositions: integer("vacant_positions"),
    paidEmployees: integer("paid_employees"),
    jobStatus: text("job_status"),
    contact: json("contact"),
    requirements: json("requirements"),
    preparedByName: text("prepared_by_name"),
    preparedByDesignation: text("prepared_by_designation"),
    preparedByContact: text("prepared_by_contact"),
    dateAccomplished: text("date_accomplished"),
    attachments: json("attachments"),
    accountMetadata: json("account_metadata"),
    barangay: text("barangay"),
    municipality: text("municipality"),
    province: text("province"),
    archived: boolean("archived").default(false),
    archivedAt: timestamp("archived_at"),
    qualifications: text("qualifications"),
    responsibilities: text("responsibilities"),
    vacancies: integer("vacancies"),
    jobCategory: text("job_category"),
    nsrpJobCode: text("nsrp_job_code"),
    jobCompensationType: text("job_compensation_type"),
    jobCompensationDetails: text("job_compensation_details"),
    jobBenefits: text("job_benefits"),
    jobRequirements: text("job_requirements"),
    jobExperienceLevel: text("job_experience_level"),
    jobEducationLevel: text("job_education_level"),
    jobShift: text("job_shift"),
    jobSchedule: text("job_schedule"),
    jobApplicationDeadline: text("job_application_deadline"),
    jobContactPerson: text("job_contact_person"),
    jobContactEmail: text("job_contact_email"),
    jobContactPhone: text("job_contact_phone"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// EMPLOYER REQUIREMENTS TABLE - Compliance checklist + uploads
// ============================================================================
export const employerRequirementsTable = isSqlite ?
  sqliteTable("employer_requirements", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `employer_req_${Date.now()}`),
    employerId: sqliteText("employer_id").notNull(),
    email: sqliteText("email"),
    passwordHash: sqliteText("password_hash"),
    requirementData: sqliteText("requirement_data", { mode: "json" }),
    srsFormSubmitted: sqliteInteger("srs_form_submitted", { mode: "boolean" }).default(false),
    srsFormAttachment: sqliteText("srs_form_attachment"),
    businessPermitSubmitted: sqliteInteger("business_permit_submitted", { mode: "boolean" }).default(false),
    businessPermitAttachment: sqliteText("business_permit_attachment"),
    bir2303Submitted: sqliteInteger("bir2303_submitted", { mode: "boolean" }).default(false),
    bir2303Attachment: sqliteText("bir2303_attachment"),
    companyProfileSubmitted: sqliteInteger("company_profile_submitted", { mode: "boolean" }).default(false),
    companyProfileAttachment: sqliteText("company_profile_attachment"),
    doleCertificationSubmitted: sqliteInteger("dole_certification_submitted", { mode: "boolean" }).default(false),
    doleCertificationAttachment: sqliteText("dole_certification_attachment"),
    otherDocuments: sqliteText("other_documents", { mode: "json" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("employer_requirements", {
    id: text("id").primaryKey().$defaultFn(() => `employer_req_${Date.now()}`),
    employerId: text("employer_id").notNull(),
    email: text("email"),
    passwordHash: text("password_hash"),
    requirementData: json("requirement_data"),
    srsFormSubmitted: boolean("srs_form_submitted").default(false),
    srsFormAttachment: text("srs_form_attachment"),
    businessPermitSubmitted: boolean("business_permit_submitted").default(false),
    businessPermitAttachment: text("business_permit_attachment"),
    bir2303Submitted: boolean("bir2303_submitted").default(false),
    bir2303Attachment: text("bir2303_attachment"),
    companyProfileSubmitted: boolean("company_profile_submitted").default(false),
    companyProfileAttachment: text("company_profile_attachment"),
    doleCertificationSubmitted: boolean("dole_certification_submitted").default(false),
    doleCertificationAttachment: text("dole_certification_attachment"),
    otherDocuments: json("other_documents"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  });

// ============================================================================
// JOB REQUIREMENTS TABLE - Job-specific checklist and uploads
// ============================================================================
export const jobRequirementsTable = isSqlite ?
  sqliteTable("job_requirements", {
    id: sqliteText("id").primaryKey().$defaultFn(() => `job_req_${Date.now()}`),
    jobId: sqliteText("job_id").notNull(),
    employerId: sqliteText("employer_id"),
    email: sqliteText("email"),
    passwordHash: sqliteText("password_hash"),
    requirementData: sqliteText("requirement_data", { mode: "json" }),
    referralSlipSubmitted: sqliteInteger("referral_slip_submitted", { mode: "boolean" }).default(false),
    referralSlipAttachment: sqliteText("referral_slip_attachment"),
    employmentContractSubmitted: sqliteInteger("employment_contract_submitted", { mode: "boolean" }).default(false),
    employmentContractAttachment: sqliteText("employment_contract_attachment"),
    medicalCertificateSubmitted: sqliteInteger("medical_certificate_submitted", { mode: "boolean" }).default(false),
    medicalCertificateAttachment: sqliteText("medical_certificate_attachment"),
    barangayClearanceSubmitted: sqliteInteger("barangay_clearance_submitted", { mode: "boolean" }).default(false),
    barangayClearanceAttachment: sqliteText("barangay_clearance_attachment"),
    policeClearanceSubmitted: sqliteInteger("police_clearance_submitted", { mode: "boolean" }).default(false),
    policeClearanceAttachment: sqliteText("police_clearance_attachment"),
    additionalDocuments: sqliteText("additional_documents", { mode: "json" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  })
:
  pgTable("job_requirements", {
    id: text("id").primaryKey().$defaultFn(() => `job_req_${Date.now()}`),
    jobId: text("job_id").notNull(),
    employerId: text("employer_id"),
    email: text("email"),
    passwordHash: text("password_hash"),
    requirementData: json("requirement_data"),
    referralSlipSubmitted: boolean("referral_slip_submitted").default(false),
    referralSlipAttachment: text("referral_slip_attachment"),
    employmentContractSubmitted: boolean("employment_contract_submitted").default(false),
    employmentContractAttachment: text("employment_contract_attachment"),
    medicalCertificateSubmitted: boolean("medical_certificate_submitted").default(false),
    medicalCertificateAttachment: text("medical_certificate_attachment"),
    barangayClearanceSubmitted: boolean("barangay_clearance_submitted").default(false),
    barangayClearanceAttachment: text("barangay_clearance_attachment"),
    policeClearanceSubmitted: boolean("police_clearance_submitted").default(false),
    policeClearanceAttachment: text("police_clearance_attachment"),
    additionalDocuments: json("additional_documents"),
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
// SKILL SUGGESTIONS TABLE - Shared skill/specialization suggestion catalog
// ============================================================================
export const skillSuggestionsTable = isSqlite ?
  sqliteTable(
    "skill_suggestions",
    {
      id: sqliteText("id").primaryKey().$defaultFn(() => `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      name: sqliteText("name").notNull(),
      normalizedName: sqliteText("normalized_name").notNull(),
      createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => ({
      normalizedNameUniqueIdx: sqliteUniqueIndex("skill_suggestions_normalized_unique").on(table.normalizedName),
    })
  )
:
  pgTable(
    "skill_suggestions",
    {
      id: text("id").primaryKey().$defaultFn(() => `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      name: text("name").notNull(),
      normalizedName: text("normalized_name").notNull(),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
      updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => ({
      normalizedNameUniqueIdx: pgUniqueIndex("skill_suggestions_normalized_unique").on(table.normalizedName),
    })
  );



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
    status: sqliteText("status", { enum: ["pending", "reviewed", "shortlisted", "interview", "hired", "rejected", "withdrawn"] }).notNull().default("pending"),
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
    status: text("status", { enum: ["pending", "reviewed", "shortlisted", "interview", "hired", "rejected", "withdrawn"] }).notNull().default("pending"),
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

// Users (jobseekers stored in unified users table)
export type User = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

// Legacy Applicant aliases (mapped to usersTable for backward compatibility)
export type Applicant = User;
export type ApplicantInsert = UserInsert;

// Employers
export type Employer = typeof employersTable.$inferSelect;
export type EmployerInsert = typeof employersTable.$inferInsert;



// Referrals
export type Referral = typeof referralsTable.$inferSelect;
export type ReferralInsert = typeof referralsTable.$inferInsert;

// Notes
export type Note = typeof notesTable.$inferSelect;
export type NoteInsert = typeof notesTable.$inferInsert;

// Skill suggestions
export type SkillSuggestion = typeof skillSuggestionsTable.$inferSelect;
export type SkillSuggestionInsert = typeof skillSuggestionsTable.$inferInsert;

// Jobs (legacy)
export type Job = typeof jobsTable.$inferSelect;
export type JobInsert = typeof jobsTable.$inferInsert;

// Applications
export type Application = typeof applicationsTable.$inferSelect;
export type ApplicationInsert = typeof applicationsTable.$inferInsert;
export type EmployerRequirement = typeof employerRequirementsTable.$inferSelect;
export type EmployerRequirementInsert = typeof employerRequirementsTable.$inferInsert;


export type JobRequirement = typeof jobRequirementsTable.$inferSelect;
export type JobRequirementInsert = typeof jobRequirementsTable.$inferInsert;
// Sessions
export type Session = typeof sessionsTable.$inferSelect;

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
  users: usersTable,
  employers: employersTable,
  employerRequirements: employerRequirementsTable,
  referrals: referralsTable,
  notes: notesTable,
  jobs: jobsTable,
  jobRequirements: jobRequirementsTable,
  applications: applicationsTable,
  sessions: sessionsTable,
  messages: messagesTable,
} as const;

export const isSqliteDB = isSqlite;
