import { z } from "zod";

// Common account-aware record fragment used across normalized tables
export const accountMetadataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string().optional().nullable(),
  createdAt: z.string(),
});

// Minimal User type for authentication/middleware
export type User = {
  id: string;
  email: string;
  role: "admin" | "employer" | "jobseeker" | "freelancer";
  name?: string;
  profileImage?: string | null;
};
// Admin Access Request Schema
export const adminAccessRequestSchema = z.object({
  id: z.string().optional(), // Assigned by backend
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  organization: z.string(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type AdminAccessRequest = z.infer<typeof adminAccessRequestSchema>;

// ===============================
// Applicant vs Jobseeker Type Usage
//
// - Applicant: Full NSRP registration/profile (used for detailed forms, admin, and employer views)
// - Jobseeker: Basic account info (used for login, authentication, and minimal dashboard/account needs)
//
// Always use Applicant for full profile fetches/updates (e.g., /api/applicants/:id), and Jobseeker for account basics (e.g., login, dashboard summary).
//
// When creating a new account, create a Jobseeker and then an Applicant profile as needed.
//
// Keep this mapping in mind for all UI, API, and storage code.
// ===============================

// Summary Card Schema with historical data
export const summaryCardSchema = z.object({
  value: z.number(),
  change: z.number(),
  trend: z.enum(["up", "down"]),
  history: z.array(z.number()),
});

export const summaryDataSchema = z.object({
  totalApplicants: summaryCardSchema,
  activeEmployers: summaryCardSchema,
  activeJobPosts: summaryCardSchema,
  pendingEmployerFeedback: summaryCardSchema,
  successfulReferrals: summaryCardSchema,
  activeFreelancers: summaryCardSchema,
  fourPsBeneficiaries: summaryCardSchema,
  ofwApplicants: summaryCardSchema,
});

// ===============================
// Table-aligned shapes (requested columns)
// ===============================

export const applicantTableSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  middle_name: z.string().optional().default(""),
  last_name: z.string(),
  suffix: z.enum(["Jr.", "Sr.", "II", "III", "IV", "None"]).default("None"),
  birth_date: z.string(),
  gender: z.enum(["Male", "Female", "Other"]).default("Other"),
  civil_status: z.enum(["Single", "Married", "Widowed", "Separated", "Divorced"]).default("Single"),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  education_level: z.enum(["High School", "Vocational", "College", "Bachelor's", "Master's", "Doctorate"]).optional(),
  course: z.string().optional().default(""),
  skills: z.string().optional().default(""),
  employment_status: z.enum(["Unemployed", "Employed", "Self-employed", "Student", "Retired"]).default("Unemployed"),
  registration_date: z.string().optional(),
  nsrp_registration_no: z.string().optional().default(""),
  profile_image: z.string().optional().default(""),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().default(false),
});
export type ApplicantTableRow = z.infer<typeof applicantTableSchema>;

export const employerTableSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  company_name: z.string().optional().default(""),
  company_type: z.enum(["Private", "Government", "NGO", "Cooperative", "Others"]).default("Private"),
  company_industry: z.enum(["IT", "Healthcare", "Education", "Engineering", "Sales", "Finance", "Others"]).default("Others"),
  company_size: z.enum(["Micro", "Small", "Medium", "Large"]).default("Micro"),
  company_registration_no: z.string().optional().default(""),
  company_description: z.string().optional().default(""),
  contact_person: z.string().optional().default(""),
  contact_position: z.string().optional().default(""),
  contact_email: z.string().optional().default(""),
  contact_phone: z.string().optional().default(""),
  status: z.enum(["active", "inactive", "pending", "suspended"]).default("active"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().default(false),
  profile_image: z.string().optional().default(""),
});
export type EmployerTableRow = z.infer<typeof employerTableSchema>;

export const jobTableSchema = z.object({
  id: z.string(),
  position_title: z.string(),
  description: z.string().optional().default(""),
  employer_id: z.string(),
  status: z.enum(["open", "closed", "archived", "draft"]).default("open"),
  employment_type: z.enum(["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Freelance"]).default("Full-time"),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  salary_period: z.enum(["Monthly", "Weekly", "Daily", "Hourly"]).default("Monthly"),
  location: z.string().optional().default(""),
  qualifications: z.string().optional().default(""),
  responsibilities: z.string().optional().default(""),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  archived: z.boolean().default(false),
  vacancies: z.number().optional().default(0),
  job_category: z.enum(["IT", "Healthcare", "Education", "Engineering", "Sales", "Marketing", "Finance", "Admin", "Service", "Others"]).default("Others"),
  nsrp_job_code: z.string().optional().default(""),
  job_compensation_type: z.enum(["Salary", "Commission", "Allowance", "Bonus", "Piece-rate", "Others"]).default("Salary"),
  job_compensation_details: z.string().optional().default(""),
  job_benefits: z.string().optional().default(""),
  job_requirements: z.string().optional().default(""),
  job_experience_level: z.enum(["Entry", "Mid", "Senior", "Managerial", "Executive"]).default("Entry"),
  job_education_level: z.enum(["High School", "Vocational", "College", "Bachelor's", "Master's", "Doctorate"]).optional(),
  job_shift: z.enum(["Day", "Night", "Rotating", "Split", "Graveyard"]).default("Day"),
  job_schedule: z.enum(["Regular", "Flexible", "Shifting", "Compressed", "Seasonal"]).default("Regular"),
  job_application_deadline: z.string().optional().default(""),
  job_contact_person: z.string().optional().default(""),
  job_contact_email: z.string().optional().default(""),
  job_contact_phone: z.string().optional().default(""),
});
export type JobTableRow = z.infer<typeof jobTableSchema>;

export type SummaryCard = z.infer<typeof summaryCardSchema>;
export type SummaryData = z.infer<typeof summaryDataSchema>;

// Recent Activities Schema
export const recentActivitySchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string().optional(),
});

export type RecentActivity = z.infer<typeof recentActivitySchema>;

// Notifications Schema
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(["system", "job", "application", "message"]),
  message: z.string(),
  createdAt: z.string(),
  read: z.boolean().optional().default(false),
});

export const notificationsResponseSchema = z.array(notificationSchema);
export type Notification = z.infer<typeof notificationSchema>;

// Chart Data Schemas
export const barChartDataSchema = z.object({
  barangays: z.array(z.string()),
  employed: z.array(z.number()),
  unemployed: z.array(z.number()),
  selfEmployed: z.array(z.number()),
  newEntrant: z.array(z.number()),
});

export const doughnutChartDataSchema = z.object({
  jobSeeker: z.number(),
  freelancer: z.number(),
});

export const lineChartDataSchema = z.object({
  months: z.array(z.string()),
  referred: z.array(z.number()),
  hired: z.array(z.number()),
  feedback: z.array(z.number()),
});

export type BarChartData = z.infer<typeof barChartDataSchema>;
export type DoughnutChartData = z.infer<typeof doughnutChartDataSchema>;
export type LineChartData = z.infer<typeof lineChartDataSchema>;

// Referral Table Schema
export const referralSchema = z.object({
  referralId: z.string(),
  applicant: z.string(),
  vacancy: z.string(),
  employer: z.string(),
  dateReferred: z.string(),
  status: z.enum(["Hired", "Pending", "Rejected", "For Interview", "Withdrawn"]),
  statusColor: z.string(),
  feedback: z.string(),
});

const validStatuses = ["Hired", "Pending", "Rejected", "For Interview", "Withdrawn"] as const;

export const referralFiltersSchema = z.object({
  barangay: z.string().optional(),
  employer: z.string().optional(),
  jobCategory: z.string().optional(),
  dateRange: z.string().optional(),
  status: z.string().optional().transform((val) => {
    // Normalize status for case-insensitive comparison
    if (!val || val === "all") return val;
    
    // Map lowercase input to proper title case
    const normalized = val.toLowerCase().trim();
    const statusMap: Record<string, string> = {
      "hired": "Hired",
      "pending": "Pending",
      "rejected": "Rejected",
      "for interview": "For Interview",
      "withdrawn": "Withdrawn",
    };
    
    const mappedStatus = statusMap[normalized];
    if (!mappedStatus) {
      throw new z.ZodError([{
        code: "custom",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        path: ["status"],
      }]);
    }
    
    return mappedStatus;
  }),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type Referral = z.infer<typeof referralSchema>;
export type ReferralFilters = z.infer<typeof referralFiltersSchema>;

// Notes example schema
export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

export const notesFiltersSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type Note = z.infer<typeof noteSchema>;
export type NotesFilters = z.infer<typeof notesFiltersSchema>;

// General site settings (landing content + contact)
export const generalSettingsSchema = z.object({
  siteName: z.string().min(1),
  siteDescription: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(3),
  address: z.string().min(1),
  heroHeadline: z.string().min(1),
  heroSubheadline: z.string().min(1),
  primaryCTA: z.string().min(1),
  secondaryCTA: z.string().min(1),
  aboutTitle: z.string().min(1),
  aboutBody: z.string().min(1),
  heroBackgroundImage: z.string().url(),
  seoKeywords: z.string().min(1),
});
export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

// Auth provider settings (Zod-first contract)

// Discriminated union for auth providers
export const googleProviderSchema = z.object({
  id: z.literal("google"),
  enabled: z.boolean().default(false),
  config: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    callbackUrl: z.string().optional(),
  }).default({}),
});

export const customProviderSchema = z.object({
  id: z.literal("custom"),
  enabled: z.boolean().default(false),
  config: z.object({
    displayName: z.string().optional(),
    issuer: z.string().optional(),
    clientId: z.string().optional(),
  }).default({}),
});

export const authProviderSchema = z.discriminatedUnion("id", [googleProviderSchema, customProviderSchema]);

export const authSettingsSchema = z.object({
  providers: z.array(authProviderSchema).default([]),
});

export type GoogleProvider = z.infer<typeof googleProviderSchema>;
export type CustomProvider = z.infer<typeof customProviderSchema>;
export type AuthProvider = z.infer<typeof authProviderSchema>;
export type AuthSettings = z.infer<typeof authSettingsSchema>;

// Jobseeker & Employer schemas
export const jobseekerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["jobseeker", "freelancer"]),
  createdAt: z.string(),
});

// Profile Image Upload Schema
const hasFileConstructor = typeof File !== "undefined";
const imagePayloadSchema = hasFileConstructor
  ? z.union([z.instanceof(File), z.string().min(1, "Image data is required")])
  : z.string().min(1, "Image data is required");

export const profileImageUploadSchema = z.object({
  image: imagePayloadSchema,
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export const profileImageResponseSchema = z.object({
  imageUrl: z.string().min(1),
});

// Password Change/Set Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(), // Not required if setting for first time
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ProfileImageUpload = z.infer<typeof profileImageUploadSchema>;
export type ProfileImageResponse = z.infer<typeof profileImageResponseSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;

export type Jobseeker = z.infer<typeof jobseekerSchema>;

export const jobseekerCreateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["jobseeker", "freelancer"]),
  password: z.string().min(6),
});

export type JobseekerCreate = z.infer<typeof jobseekerCreateSchema>;

// Job post and application schemas
export const jobPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  employerId: z.string(),
  company: z.string(),
  createdAt: z.string(),
  archived: z.boolean().optional(),
  archivedAt: z.string().nullable().optional(),
});

export const jobCreateSchema = z.object({
  employerId: z.string(),
  positionTitle: z.string(),
  description: z.string(),
  establishmentName: z.string().optional(),
  location: z.string(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryPeriod: z.enum(["hourly", "daily", "weekly", "15days", "monthly"]).optional().default("monthly"),
  salaryAmount: z.number().optional(),
  salaryType: z.string().optional(),
  jobStatus: z.string().optional(),
  minimumEducation: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  skills: z.string().optional(),
  industryCodes: z.array(z.string()).optional(),
  vacantPositions: z.number().optional(),
  paidEmployees: z.number().optional(),
  preparedByName: z.string().optional(),
  preparedByDesignation: z.string().optional(),
  preparedByContact: z.string().optional(),
  dateAccomplished: z.string().optional(),
  agePreference: z.string().optional(),
  barangay: z.string().optional(),
  municipality: z.string().optional(),
  province: z.string().optional(),
  status: z
    .enum(["pending", "active", "draft", "closed", "rejected"])
    .optional()
    .default("pending"),
});

export const applicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  applicantId: z.string(),
  applicantName: z.string(),
  createdAt: z.string(),
});

export type JobPost = z.infer<typeof jobPostSchema>;
export type JobCreate = z.infer<typeof jobCreateSchema>;
export type Application = z.infer<typeof applicationSchema>;

// NSRP-compliant employment status hierarchy
export const nsrpEmploymentStatusOptions = ["Employed", "Unemployed"] as const;
export const nsrpEmployedBranches = ["Wage employed", "Self-employed"] as const;
export const nsrpSelfEmploymentCategories = [
  "Fisherman/Fisherfolk",
  "Vendor/Retailer",
  "Home-based worker",
  "Transport",
  "Domestic Worker",
  "Freelancer",
  "Artisan/Craft Worker",
  "Others",
] as const;
export const nsrpUnemployedReasons = [
  "New Entrant/Fresh Graduate",
  "Finished Contract",
  "Resigned",
  "Retired",
  "Terminated/Laid off due to calamity",
  "Terminated/Laid off (local)",
  "Terminated/Laid off (abroad)",
  "Others",
] as const;

// Legacy employment status values kept for backward compatibility during transition
const legacyEmploymentStatusValues = [
  "Self-employed",
  "Unemployed",
  "New Entrant/Fresh Graduate",
  "Finished Contract",
  "Resigned",
  "Retired",
  "Terminated/Laid off",
  "Terminated/Laid off due to calamity",
  "Terminated/Laid off (local)",
  "Terminated/Laid off (abroad)",
] as const;

// Employment type options reused by job preference fields
export const nsrpEmploymentTypes = [
  ...nsrpEmployedBranches,
  ...nsrpSelfEmploymentCategories,
] as const;

const employmentStatusSchema = z.union([
  z.enum(nsrpEmploymentStatusOptions),
  z.enum(legacyEmploymentStatusValues),
]);

export type NsrpEmploymentStatus = typeof nsrpEmploymentStatusOptions[number];
export type NsrpEmployedBranch = typeof nsrpEmployedBranches[number];
export type NsrpSelfEmploymentCategory = typeof nsrpSelfEmploymentCategories[number];
export type NsrpUnemployedReason = typeof nsrpUnemployedReasons[number];
// Unify Job type for client/server (superset of JobPost and JobVacancy)
export type Job = {
  id: string;
  employerId: string;
  company: string;
  establishmentName?: string;
  positionTitle: string;
  title: string; // alias for API compatibility
  description: string;
  location?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: "hourly" | "daily" | "weekly" | "15days" | "monthly";
  salaryAmount?: number;
  salaryType?: string;
  jobStatus?: string;
  minimumEducation?: string;
  educationLevel?: string; // legacy alias used in some components
  yearsOfExperience?: number;
  skills?: string;
  status?: "pending" | "active" | "draft" | "closed" | "rejected";
  archived?: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  // JobVacancy-specific fields
  mainSkillOrSpecialization?: string;
  startingSalaryOrWage?: number;
  vacantPositions?: number;
  openings?: number; // legacy alias for vacant positions
  paidEmployees?: number;
  jobStatusPTC?: "P" | "T" | "C";
  preparedByName?: string;
  preparedByDesignation?: string;
  preparedByContact?: string;
  companyContact?: string;
  contactNumber?: string;
  dateAccomplished?: string;
  industryCodes?: string[];
  agePreference?: string;
  minimumEducationRequired?: string;
  yearsOfExperienceRequired?: number;
};

// Admin schema
export const adminRoleSchema = z.enum(["super_admin", "admin", "contributor", "viewer", "moderator"]);

export const adminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: adminRoleSchema,
  createdAt: z.string(),
});

export const adminCreateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: adminRoleSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Admin = z.infer<typeof adminSchema>;
export type AdminCreate = z.infer<typeof adminCreateSchema>;
export type AdminRole = z.infer<typeof adminRoleSchema>;

// NSRP Applicant Registration Schema
export const languageProficiencySchema = z.object({
  language: z.string(),
  dialect: z.string().optional(),
  read: z.boolean().optional(),
  write: z.boolean().optional(),
  speak: z.boolean().optional(),
  understand: z.boolean().optional(),
  remarks: z.string().optional(),
});

export const educationBackgroundSchema = z.object({
  level: z.string(), // Elementary, Secondary, Tertiary, etc.
  course: z.string().optional(),
  schoolName: z.string().optional(), // Name of school/university
  yearGraduated: z.string().optional(),
  strand: z.string().optional(), // For SHS
  levelReached: z.string().optional(),
  fromYear: z.string().optional(),
  toYear: z.string().optional(),
  honorsReceived: z.string().optional(),
  scholarshipOrGrant: z.string().optional(),
});

export const technicalTrainingSchema = z.object({
  course: z.string(),
  trainingType: z.string().optional(),
  hoursOfTraining: z.number().optional(),
  trainingInstitution: z.string().optional(),
  skillsAcquired: z.string().optional(),
  certificatesReceived: z.string().optional(),
  dateCompleted: z.string().optional(),
  sponsoredBy: z.string().optional(),
});

export const professionalLicenseSchema = z.object({
  eligibility: z.string(),
  dateTaken: z.string().optional(),
  licenseNumber: z.string().optional(),
  validUntil: z.string().optional(),
  issuedBy: z.string().optional(),
  rating: z.string().optional(),
  examPlace: z.string().optional(),
});

export const workExperienceSchema = z.object({
  companyName: z.string(),
  address: z.string().optional(),
  position: z.string(),
  numberOfMonths: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(), // Permanent, Contractual, Part-time, Probationary
  industry: z.string().optional(),
  monthlySalary: z.number().optional(),
  reasonForLeaving: z.string().optional(),
});

export const applicantAddressSchema = z.object({
  type: z.enum(["present", "permanent", "provincial", "overseas"]).optional(),
  houseNumber: z.string().optional(),
  street: z.string().optional(),
  subdivision: z.string().optional(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  region: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),
});

export const applicantContactInfoSchema = z.object({
  mobileNumber: z.string().optional(),
  telephoneNumber: z.string().optional(),
  alternatePhoneNumber: z.string().optional(),
  emailAddress: z.union([z.string().email(), z.literal("")]).optional(),
  alternateEmailAddress: z.string().email().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  preferredContactMethod: z.enum(["sms", "call", "email"]).optional(),
});

export const applicantGovernmentIdsSchema = z.object({
  sssNumber: z.string().optional(),
  gsisNumber: z.string().optional(),
  pagibigNumber: z.string().optional(),
  philHealthNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  nationalIdNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  driversLicenseNumber: z.string().optional(),
  votersIdNumber: z.string().optional(),
});

export const applicantFamilyMemberSchema = z.object({
  relation: z.enum(["father", "mother", "spouse", "guardian", "sibling", "child", "other"]),
  name: z.string(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const applicantDependentSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  birthdate: z.string().optional(),
  schoolingStatus: z.string().optional(),
});

export const applicantReferenceSchema = z.object({
  name: z.string(),
  relationship: z.string().optional(),
  contactNumber: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

export const applicantDocumentRequirementSchema = z.object({
  documentType: z.string(),
  submitted: z.boolean().optional(),
  dateSubmitted: z.string().optional(),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const applicantJobPreferenceSchema = z.object({
  preferredOccupations: z.array(z.string()).optional(),
  preferredLocationsLocal: z.array(z.string()).optional(),
  preferredLocationsOverseas: z.array(z.string()).optional(),
  preferredEmploymentTypes: z.array(z.string()).optional(),
  preferredIndustrySectors: z.array(z.string()).optional(),
  salaryExpectation: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
    period: z.enum(["daily", "weekly", "monthly", "annually"]).optional(),
  }).optional(),
  readyToWorkWithinDays: z.number().optional(),
  willingToWorkImmediately: z.boolean().optional(),
  hasPreferredShift: z.boolean().optional(),
  shiftPreferences: z.array(z.enum(["day", "night", "graveyard", "flexible"])).optional(),
  preferredOverseasCountries: z.array(z.string()).optional(),
});

export const applicantAccountMetadataSchema = accountMetadataSchema.partial().extend({
  role: z.enum(["jobseeker", "freelancer"]).optional(),
  hasAccount: z.boolean().optional(),
  lastLogin: z.string().optional(),
});

export const requirementAttachmentSchema = z.object({
  id: z.string().optional(),
  documentType: z.string(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  mimeType: z.string().optional(),
  submittedAt: z.string().optional(),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export const requirementChecklistItemSchema = z.object({
  required: z.boolean().default(true),
  submitted: z.boolean().optional(),
  submittedAt: z.string().optional(),
  referenceNumber: z.string().optional(),
  attachment: requirementAttachmentSchema.optional(),
  remarks: z.string().optional(),
});

export const employerRequirementChecklistSchema = z.object({
  srsForm: requirementChecklistItemSchema.optional(),
  businessPermit: requirementChecklistItemSchema.optional(),
  birForm2303: requirementChecklistItemSchema.optional(),
  companyProfile: requirementChecklistItemSchema.optional(),
  doleAccreditation: requirementChecklistItemSchema.optional(),
  others: z.array(requirementAttachmentSchema).optional(),
});

export const employerContactSchema = z.object({
  personName: z.string(),
  designation: z.string().optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
});

export const employerAccountMetadataSchema = accountMetadataSchema.partial().extend({
  role: z.literal("employer").optional(),
  hasAccount: z.boolean().optional(),
  lastLogin: z.string().optional(),
});

export const jobSalarySchema = z.object({
  amount: z.number(),
  currency: z.string().default("PHP"),
  period: z.enum(["daily", "weekly", "semi-monthly", "monthly", "annually"]).default("monthly"),
});

export const jobContactSchema = z.object({
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
  personName: z.string().optional(),
});

export const jobRequirementChecklistSchema = z.object({
  referralSlip: requirementChecklistItemSchema.optional(),
  employmentContract: requirementChecklistItemSchema.optional(),
  medicalCertificate: requirementChecklistItemSchema.optional(),
  barangayClearance: requirementChecklistItemSchema.optional(),
  policeClearance: requirementChecklistItemSchema.optional(),
  additionalDocuments: z.array(requirementAttachmentSchema).optional(),
});

export const jobAccountMetadataSchema = accountMetadataSchema.partial().extend({
  role: z.literal("job").optional(),
});

export const employerGeographicIdentificationSchema = z.object({
  province: z.string(),
  municipality: z.string(),
  barangay: z.string(),
  geographicCode: z.string().optional(),
  sheetNumber: z.string().optional(),
  totalSheets: z.string().optional(),
  barangayChairperson: z.string().optional(),
  barangaySecretary: z.string().optional(),
  chairpersonContact: z.string().optional(),
  secretaryContact: z.string().optional(),
});

export const employerStatsSchema = z.object({
  numberOfPaidEmployees: z.number().nonnegative(),
  numberOfVacantPositions: z.number().nonnegative(),
});

export const applicantSchema = z.object({
  id: z.string().optional(),
  account: applicantAccountMetadataSchema.optional(),

  // Personal Information
  surname: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  name: z.string().optional(),
  dateOfBirth: z.string(),
  placeOfBirth: z.string().optional(),
  age: z.number().optional(),
  sex: z.enum(["Male", "Female"]),
  religion: z.string().optional(),
  civilStatus: z.enum(["Single", "Married", "Widowed"]),
  nationality: z.string().optional(),
  citizenship: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.string().optional(),

  // Address (legacy flat fields kept for backward compatibility)
  houseStreetVillage: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  address: z.string().optional(),
  // Structured addresses per NSRP form
  presentAddress: applicantAddressSchema.optional(),
  permanentAddress: applicantAddressSchema.optional(),
  additionalAddresses: z.array(applicantAddressSchema).optional(),

  // Contact Info
  contactNumber: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  contactInformation: applicantContactInfoSchema.optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  profileImage: z.string().optional(),

  // Government Identification Numbers
  governmentIds: applicantGovernmentIdsSchema.optional(),
  governmentIdType: z.enum(["SSS", "PhilHealth", "Pag-IBIG", "TIN", "UMID", "GSIS", "Driver's License", "National ID"]).optional(),
  governmentIdNumber: z.string().optional(),

  // Disability
  disability: z.enum(["None", "Visual", "Hearing", "Speech", "Physical", "Mental", "Others"]).optional(),
  disabilitySpecify: z.string().optional(),
  isPersonWithDisability: z.boolean().optional(),
  isIndigenousPeople: z.boolean().optional(),
  isSoloParent: z.boolean().optional(),

  // Employment Status (NSRP hierarchy)
  employmentStatus: employmentStatusSchema.optional(),
  employmentStatusDetail: z.enum(nsrpEmployedBranches).optional(),
  selfEmployedCategory: z.enum(nsrpSelfEmploymentCategories).optional(),
  selfEmployedCategoryOther: z.string().optional(),
  unemployedReason: z.enum(nsrpUnemployedReasons).optional(),
  unemployedReasonOther: z.string().optional(),
  unemployedAbroadCountry: z.string().optional(),
  employmentType: z.enum(nsrpEmploymentTypes).optional(),
  monthsUnemployed: z.number().optional(),

  // Willingness
  willingToRelocate: z.boolean().optional(),
  willingToWorkOverseas: z.boolean().optional(),

  // OFW Status
  isOFW: z.boolean().optional(),
  owfCountry: z.string().optional(),
  isFormerOFW: z.boolean().optional(),
  formerOFWCountry: z.string().optional(),
  returnToPHDate: z.string().optional(),

  // 4Ps Beneficiary
  is4PSBeneficiary: z.boolean().optional(),
  householdID: z.string().optional(),

  // Family & Dependents
  familyMembers: z.array(applicantFamilyMemberSchema).optional(),
  dependents: z.array(applicantDependentSchema).optional(),
  householdHead: z.enum(["Yes", "No"]).optional(),
  dependentsCount: z.number().int().nonnegative().optional(),

  // Job Preference
  preferredOccupations: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  preferredOverseasCountries: z.array(z.string()).optional(),
  employmentType4: z.enum(nsrpEmploymentTypes).optional(),
  jobPreferences: applicantJobPreferenceSchema.optional(),
  jobPreference: z.enum(["Full-Time", "Part-Time", "Contractual", "Seasonal", "Internship", "Flexible", "Project-Based"]).optional(),
  nsrpNumber: z.string().optional(),
  nsrpStatus: z.enum(["Active", "Inactive", "Pending"]).optional(),

  // Language/Dialect Proficiency
  languageProficiency: z.array(languageProficiencySchema).optional(),

  // Educational Background
  education: z.array(educationBackgroundSchema).optional(),

  // Technical/Vocational Training
  technicalTraining: z.array(technicalTrainingSchema).optional(),

  // Professional License
  professionalLicenses: z.array(professionalLicenseSchema).optional(),

  // Work Experience (last 10 years)
  workExperience: z.array(workExperienceSchema).optional(),

  // References / Character Witnesses
  references: z.array(applicantReferenceSchema).optional(),

  // Other Skills Acquired (checkboxes)
  otherSkills: z.array(
    z.enum([
      "Auto Mechanic",
      "Beautician",
      "Carpentry Work",
      "Computer Literate",
      "Domestic Chores",
      "Driver",
      "Electrician",
      "Embroidery",
      "Gardening",
      "Masonry",
      "Painter/Artist",
      "Painting Jobs",
      "Photography",
      "Plumbing",
      "Sewing Dresses",
      "Stenography",
      "Tailoring",
      "Others",
    ])
  ).optional(),
  skills: z.array(z.string()).optional(),
  otherSkillsTraining: z.union([z.string(), z.array(z.string())]).optional(),
  otherSkillsSpecify: z.string().optional(),

  // Document Requirements Tracking
  documentRequirements: z.array(applicantDocumentRequirementSchema).optional(),

  // Sign-off / Prepared by
  preparedBy: z.string().optional(),
  preparedByDesignation: z.string().optional(),
  dateAccomplished: z.string().optional(),

  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  registrationDate: z.string().optional(),
});

export const applicantCreateSchema = applicantSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type LanguageProficiency = z.infer<typeof languageProficiencySchema>;
export type EducationBackground = z.infer<typeof educationBackgroundSchema>;
export type TechnicalTraining = z.infer<typeof technicalTrainingSchema>;
export type ProfessionalLicense = z.infer<typeof professionalLicenseSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type ApplicantAddress = z.infer<typeof applicantAddressSchema>;
export type ApplicantContactInfo = z.infer<typeof applicantContactInfoSchema>;
export type ApplicantGovernmentIds = z.infer<typeof applicantGovernmentIdsSchema>;
export type ApplicantFamilyMember = z.infer<typeof applicantFamilyMemberSchema>;
export type ApplicantDependent = z.infer<typeof applicantDependentSchema>;
export type ApplicantReference = z.infer<typeof applicantReferenceSchema>;
export type ApplicantDocumentRequirement = z.infer<typeof applicantDocumentRequirementSchema>;
export type ApplicantJobPreference = z.infer<typeof applicantJobPreferenceSchema>;
export type ApplicantAccountMetadata = z.infer<typeof applicantAccountMetadataSchema>;
export type RequirementAttachment = z.infer<typeof requirementAttachmentSchema>;
export type RequirementChecklistItem = z.infer<typeof requirementChecklistItemSchema>;
export type EmployerRequirementChecklist = z.infer<typeof employerRequirementChecklistSchema>;
export type EmployerContact = z.infer<typeof employerContactSchema>;
export type EmployerAccountMetadata = z.infer<typeof employerAccountMetadataSchema>;
export type EmployerGeographicIdentification = z.infer<typeof employerGeographicIdentificationSchema>;
export type JobSalary = z.infer<typeof jobSalarySchema>;
export type JobContact = z.infer<typeof jobContactSchema>;
export type JobRequirementChecklist = z.infer<typeof jobRequirementChecklistSchema>;
export type JobAccountMetadata = z.infer<typeof jobAccountMetadataSchema>;
export type Applicant = z.infer<typeof applicantSchema>;
export type ApplicantCreate = z.infer<typeof applicantCreateSchema>;

// ============ SRS JOB POSTING FORMS ============

// Industry Codes (01-17 per SRS Form)
export const industryCodesSchema = z.enum([
  "01", // Agriculture
  "02", // Fishing
  "03", // Mining and Quarrying
  "04", // Manufacturing
  "05", // Electrical, Gas and Water Supply
  "06", // Construction
  "07", // Wholesale and Retail Trade
  "08", // Hotels and Restaurant
  "09", // Transport, Storage and Communication
  "10", // Financial Intermediation
  "11", // Real Estate, Renting and Business Activities
  "12", // Public Administration and Defense
  "13", // Education
  "14", // Health and Social Work
  "15", // Other Community, Social and Personal Service Activities
  "16", // Activities of Private Households as Employers
  "17", // Extra-Territorial Organizations and Bodies
]);

export const industryNameMap: Record<string, string> = {
  "01": "Agriculture",
  "02": "Fishing",
  "03": "Mining and Quarrying",
  "04": "Manufacturing",
  "05": "Electrical, Gas and Water Supply",
  "06": "Construction",
  "07": "Wholesale and Retail Trade",
  "08": "Hotels and Restaurant",
  "09": "Transport, Storage and Communication",
  "10": "Financial Intermediation",
  "11": "Real Estate, Renting and Business Activities",
  "12": "Public Administration and Defense",
  "13": "Education",
  "14": "Health and Social Work",
  "15": "Other Community, Social and Personal Service Activities",
  "16": "Activities of Private Households as Employers",
  "17": "Extra-Territorial Organizations and Bodies",
};

// Frequently used PSIC detailed industry codes encountered in generated datasets
const psicDetailedNameMap: Record<string, string> = {
  "0161": "Support activities for crop production",
  "2599": "Manufacture of other fabricated metal products n.e.c.",
  "2815": "Manufacture of bearings, gears, gearing and driving elements",
  "2825": "Manufacture of lifting and handling equipment",
  "3312": "Repair of machinery",
  "4220": "Construction of utility projects",
  "4321": "Electrical installation",
  "4620": "Wholesale of agricultural raw materials and live animals",
  "5110": "Passenger air transport",
  "5210": "Warehousing and storage",
  "5221": "Service activities incidental to land transportation",
  "5224": "Cargo handling",
  "5229": "Other transportation support activities",
  "6201": "Computer programming activities",
  "6202": "Computer consultancy and computer facilities management activities",
  "6110": "Wired telecommunications activities",
  "6920": "Accounting, bookkeeping and auditing activities",
  "7010": "Activities of head offices",
  "7110": "Architectural and engineering activities",
  "7810": "Activities of employment placement agencies",
  "7830": "Other human resources provision",
  "8220": "Activities of call centres",
  "8299": "Other business support service activities n.e.c.",
  "8610": "Hospital activities",
  "8690": "Other human health activities",
  "9511": "Repair of computers and peripheral equipment",
};

// Division-level PSIC fallbacks to avoid displaying "Unknown" when only the first two digits are known
const psicDivisionNameMap: Record<string, string> = {
  "25": "Manufacture of fabricated metal products",
  "28": "Manufacture of machinery and equipment",
  "33": "Repair and installation of machinery and equipment",
  "42": "Civil engineering",
  "43": "Specialised construction activities",
  "46": "Wholesale trade, except of motor vehicles and motorcycles",
  "52": "Warehousing and support activities for transportation",
  "61": "Telecommunications",
  "62": "Computer programming, consultancy and related activities",
  "69": "Legal and accounting activities",
  "70": "Activities of head offices; management consultancy",
  "71": "Architectural and engineering activities; technical testing and analysis",
  "78": "Employment activities",
  "82": "Office administrative, office support and other business support activities",
  "86": "Human health activities",
  "95": "Repair of computers and personal and household goods",
};

export const resolveIndustryName = (code?: string | null): string | undefined => {
  if (!code) return undefined;
  const normalized = code.trim();
  if (!normalized) return undefined;
  return (
    industryNameMap[normalized] ||
    psicDetailedNameMap[normalized] ||
    psicDivisionNameMap[normalized.slice(0, 2)]
  );
};

// Employer / Establishment Profile (SRS Form 2)
export const employerSchema = z.object({
  id: z.string().optional(),
  account: employerAccountMetadataSchema.optional(),

  // Establishment Information
  establishmentName: z.string(),
  tradeName: z.string().optional(),
  houseStreetVillage: z.string().optional(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  completeAddress: z.string().optional(),
  addressDetails: applicantAddressSchema.optional(),
  geographicIdentification: employerGeographicIdentificationSchema.optional(),
  email: z.string().email().optional(),

  // Contacts
  contactPerson: employerContactSchema,
  alternateContacts: z.array(employerContactSchema).optional(),
  contactNumber: z.string().optional(),
  contactEmail: z.string().email().optional(),

  // Employment Information
  numberOfPaidEmployees: z.number().nonnegative(),
  numberOfVacantPositions: z.number().nonnegative(),

  // Industry Codes (SRS Form 2 list)
  industryCodes: z.array(industryCodesSchema).min(1),
  industryType: z.array(z.string()).optional(), // legacy support

  // Subscription & Remarks
  srsSubscriber: z.boolean().optional(),
  subscriptionStatus: z.enum(["subscriber", "non-subscriber", "undecided"]).optional(),
  remarks: z.string().optional(),

  // Company Information / Compliance
  companyTIN: z.string().optional(),
  companyTaxIdNumber: z.string().optional(),
  businessPermitNumber: z.string().optional(),
  bir2303Number: z.string().optional(),
  isManpowerAgency: z.boolean().optional(),
  doleCertificationNumber: z.string().optional(),
  requirements: employerRequirementChecklistSchema.optional(),

  // Barangay officials in charge of listing (legacy + new names)
  chairpersonName: z.string().optional(),
  chairpersonContact: z.string().optional(),
  secretaryName: z.string().optional(),
  secretaryContact: z.string().optional(),
  barangayChairperson: z.string().optional(),
  chairpersonTelNumber: z.string().optional(),
  barangaySecretary: z.string().optional(),
  secretaryTelNumber: z.string().optional(),
  
  // Geographic Identification (SRS Form 2)
  geographicCode: z.string().optional(),
  telNumber: z.string().optional(),

  // Prepared By block
  preparedByName: z.string(),
  preparedByDesignation: z.string(),
  preparedByContact: z.string().optional(),
  dateAccomplished: z.string(), // YYYY-MM-DD

  // Attachments (file paths or URLs)
  attachments: z.array(requirementAttachmentSchema).optional(),
  srsFormFile: z.string().optional(),
  businessPermitFile: z.string().optional(),
  bir2303File: z.string().optional(),
  companyProfileFile: z.string().optional(),
  doleCertificationFile: z.string().optional(),

  archived: z.boolean().optional(),
  archivedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // Multi-company support
  additionalEstablishments: z.array(z.object({
    establishmentName: z.string(),
    tradeName: z.string().optional(),
    houseStreetVillage: z.string().optional(),
    barangay: z.string(),
    municipality: z.string(),
    province: z.string(),
    completeAddress: z.string().optional(),
    addressDetails: applicantAddressSchema.optional(),
    geographicIdentification: employerGeographicIdentificationSchema.optional(),
    email: z.string().email().optional(),
    contactPerson: employerContactSchema,
    alternateContacts: z.array(employerContactSchema).optional(),
    contactNumber: z.string().optional(),
    contactEmail: z.string().email().optional(),
    numberOfPaidEmployees: z.number().nonnegative().optional(),
    numberOfVacantPositions: z.number().nonnegative().optional(),
    industryCodes: z.array(industryCodesSchema).min(1).optional(),
    industryType: z.array(z.string()).optional(),
    srsSubscriber: z.boolean().optional(),
    subscriptionStatus: z.enum(["subscriber", "non-subscriber", "undecided"]).optional(),
    remarks: z.string().optional(),
    companyTIN: z.string().optional(),
    companyTaxIdNumber: z.string().optional(),
    businessPermitNumber: z.string().optional(),
    bir2303Number: z.string().optional(),
    isManpowerAgency: z.boolean().optional(),
    doleCertificationNumber: z.string().optional(),
    requirements: employerRequirementChecklistSchema.optional(),
    chairpersonName: z.string().optional(),
    chairpersonContact: z.string().optional(),
    secretaryName: z.string().optional(),
    secretaryContact: z.string().optional(),
    barangayChairperson: z.string().optional(),
    barangaySecretary: z.string().optional(),
    preparedByName: z.string().optional(),
    preparedByDesignation: z.string().optional(),
    preparedByContact: z.string().optional(),
    dateAccomplished: z.string().optional(),
    attachments: z.array(requirementAttachmentSchema).optional(),
    srsFormFile: z.string().optional(),
    businessPermitFile: z.string().optional(),
    bir2303File: z.string().optional(),
    companyProfileFile: z.string().optional(),
    doleCertificationFile: z.string().optional(),
    archived: z.boolean().optional(),
    archivedAt: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })).optional(),
});

export const employerCreateSchema = employerSchema.omit({ id: true, createdAt: true, updatedAt: true });


// SRS Form 2A Industry Codes (fixed)
export const industryCodes = [
  { code: '01', label: 'Agriculture' },
  { code: '02', label: 'Fishing' },
  { code: '03', label: 'Mining and Quarrying' },
  { code: '04', label: 'Manufacturing' },
  { code: '05', label: 'Electrical, Gas and Water Supply' },
  { code: '06', label: 'Construction' },
  { code: '07', label: 'Wholesale and Retail Trade' },
  { code: '08', label: 'Hotels and Restaurant' },
  { code: '09', label: 'Transport, Storage and Communication' },
  { code: '10', label: 'Financial Intermediation' },
  { code: '11', label: 'Real Estate, Renting and Business Activities' },
  { code: '12', label: 'Public Administration and Defense' },
  { code: '13', label: 'Education' },
  { code: '14', label: 'Health and Social Work' },
  { code: '15', label: 'Other Community, Social and Personal Service Activities' },
  { code: '16', label: 'Activities of Private Households as Employers and Undifferentiated Production Activities of Private Household' },
  { code: '17', label: 'Extra-Territorial Organizations and Bodies' },
];

export const jobVacancySchema = z.object({
  id: z.string().optional(),
  employerId: z.string(),
  account: jobAccountMetadataSchema.optional(),
  establishmentName: z.string(),
  industryCodes: z.array(industryCodesSchema).min(1, { message: 'At least one industry must be selected' }),
  positionTitle: z.string(),
  description: z.string().optional(),
  minimumEducationRequired: z.string(),
  mainSkillOrSpecialization: z.string().optional(),
  yearsOfExperienceRequired: z.number().nonnegative(),
  agePreference: z.string().optional(),
  salary: jobSalarySchema,
  startingSalaryOrWage: z.number().optional(),
  // Added per request: counts for SRS Form 2A display
  vacantPositions: z.number().min(0, { message: 'Vacant positions must be >= 0' }),
  paidEmployees: z.number().min(0, { message: 'Paid employees must be >= 0' }),
  jobStatus: z.enum(['P','T','C']), // P=Permanent, T=Temporary, C=Contractual
  contact: jobContactSchema.optional(),
  requirements: jobRequirementChecklistSchema.optional(),
  preparedByName: z.string(),
  preparedByDesignation: z.string(),
  preparedByContact: z.string().optional(),
  dateAccomplished: z.string(), // YYYY-MM-DD
  attachments: z.array(requirementAttachmentSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const jobVacancyCreateSchema = jobVacancySchema.omit({ id: true, createdAt: true, updatedAt: true });

export type IndustryCode = z.infer<typeof industryCodesSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type EmployerCreate = z.infer<typeof employerCreateSchema>;
export type JobVacancy = z.infer<typeof jobVacancySchema>;
export type JobVacancyCreate = z.infer<typeof jobVacancyCreateSchema>;

// Job Vacancy Filters for /api/job-vacancies
export const jobVacancyFiltersSchema = z.object({
  search: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  educationLevel: z.string().optional(),
  minExperience: z.number().optional(),
  maxExperience: z.number().optional(),
  industry: z.string().optional(),
  jobStatus: z.string().optional(),
  salaryType: z.string().optional(),
  sortBy: z.enum(["date", "salary", "relevance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type JobVacancyFilters = z.infer<typeof jobVacancyFiltersSchema>;

// ============ ENHANCED AUTHENTICATION & USER MANAGEMENT ============

// Signup Schemas for different roles
export const jobseekerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["jobseeker", "freelancer"]),
  // Optional profile info during signup
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const employerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("employer"),
  company: z.string().min(2, "Company name is required"),
  // Optional company info during signup
  contactNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  industryType: z.array(z.string()).optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
});

export const adminSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("admin"),
});

// Profile Update Schemas
export const jobseekerProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  education: z.array(educationBackgroundSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  resume: z.string().optional(), // URL or file path
  profilePicture: z.string().optional(),
});

export const employerProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().min(2).optional(),
  contactNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  industryType: z.array(z.string()).optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  companyDescription: z.string().optional(),
  website: z.string().url().optional(),
  companyLogo: z.string().optional(),
});

// User Profile Schemas (what's returned from API)
export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "employer", "jobseeker", "freelancer"]),
  company: z.string().optional(),
  profileData: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobseekerSignup = z.infer<typeof jobseekerSignupSchema>;
export type EmployerSignup = z.infer<typeof employerSignupSchema>;
export type AdminSignup = z.infer<typeof adminSignupSchema>;
export type JobseekerProfileUpdate = z.infer<typeof jobseekerProfileUpdateSchema>;
export type EmployerProfileUpdate = z.infer<typeof employerProfileUpdateSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

// ============ APPLICATION MANAGEMENT ============

export const jobApplicationSchema = z.object({
  id: z.string().optional(),
  jobId: z.string(),
  applicantId: z.string(),
  coverLetter: z.string().optional(),
  status: z.enum(["pending", "reviewed", "accepted", "rejected", "hired", "for_interview", "withdrawn"]).default("pending"),
  appliedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const jobApplicationCreateSchema = jobApplicationSchema.omit({ 
  id: true, 
  appliedAt: true, 
  updatedAt: true,
  status: true 
});

export const jobApplicationUpdateSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected", "hired", "for_interview", "withdrawn"]).optional(),
  notes: z.string().optional(),
});

export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type JobApplicationCreate = z.infer<typeof jobApplicationCreateSchema>;
export type JobApplicationUpdate = z.infer<typeof jobApplicationUpdateSchema>;

// ============ ADMIN STAKEHOLDER MANAGEMENT ============

export const stakeholderFilterSchema = z.object({
  role: z.enum(["jobseeker", "freelancer", "employer"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  search: z.string().optional(), // Search by name or email
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  sortBy: z.enum(["createdAt", "name", "email"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const applicantFilterSchema = z.object({
  employmentStatus: z.string().optional(),
  barangay: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(5000).optional(),
  offset: z.number().min(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
  }
);

export const employerFilterSchema = z.object({
  industryType: z.string().optional(),
  municipality: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type StakeholderFilter = z.infer<typeof stakeholderFilterSchema>;
export type ApplicantFilter = z.infer<typeof applicantFilterSchema>;
export type EmployerFilter = z.infer<typeof employerFilterSchema>;

// ============ DASHBOARD STATISTICS ============

export const dashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalJobseekers: z.number(),
  totalEmployers: z.number(),
  totalJobs: z.number(),
  totalApplications: z.number(),
  activeJobs: z.number(),
  pendingApplications: z.number(),
  recentActivity: z.array(recentActivitySchema),
});

export const employerDashboardStatsSchema = z.object({
  totalJobPostings: z.number(),
  activeJobPostings: z.number(),
  totalApplications: z.number(),
  pendingApplications: z.number(),
  shortlistedCandidates: z.number(),
  hiredCandidates: z.number(),
  recentApplications: z.array(jobApplicationSchema),
});

export const jobseekerDashboardStatsSchema = z.object({
  totalApplications: z.number(),
  pendingApplications: z.number(),
  shortlistedApplications: z.number(),
  acceptedApplications: z.number(),
  rejectedApplications: z.number(),
  profileCompleteness: z.number(), // Percentage
  recommendedJobs: z.array(jobPostSchema),
});

export const publicStatsSchema = z.object({
  jobseekersRegistered: z.number(),
  employersParticipating: z.number(),
  jobsMatched: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type EmployerDashboardStats = z.infer<typeof employerDashboardStatsSchema>;
export type JobseekerDashboardStats = z.infer<typeof jobseekerDashboardStatsSchema>;
export type PublicStats = z.infer<typeof publicStatsSchema>;


