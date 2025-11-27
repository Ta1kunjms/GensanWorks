import { z } from "zod";

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
});

export type SummaryCard = z.infer<typeof summaryCardSchema>;
export type SummaryData = z.infer<typeof summaryDataSchema>;

// Recent Activities Schema
export const recentActivitySchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string().optional(),
});

export type RecentActivity = z.infer<typeof recentActivitySchema>;

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

// Jobseeker & Employer schemas
export const jobseekerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["jobseeker", "freelancer"]),
  createdAt: z.string(),
});

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
  title: z.string(),
  description: z.string(),
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
  status: z.enum(["active", "draft", "closed"]).optional().default("active"),
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

// Admin schema
export const adminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.literal('admin'),
  createdAt: z.string(),
});

export const adminCreateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Admin = z.infer<typeof adminSchema>;
export type AdminCreate = z.infer<typeof adminCreateSchema>;

// NSRP Applicant Registration Schema
export const languageProficiencySchema = z.object({
  language: z.string(),
  read: z.boolean().optional(),
  write: z.boolean().optional(),
  speak: z.boolean().optional(),
  understand: z.boolean().optional(),
});

export const educationBackgroundSchema = z.object({
  level: z.string(), // Elementary, Secondary, Tertiary, etc.
  course: z.string().optional(),
  schoolName: z.string().optional(), // Name of school/university
  yearGraduated: z.string().optional(),
  strand: z.string().optional(), // For SHS
  levelReached: z.string().optional(),
});

export const technicalTrainingSchema = z.object({
  course: z.string(),
  hoursOfTraining: z.number().optional(),
  trainingInstitution: z.string().optional(),
  skillsAcquired: z.string().optional(),
  certificatesReceived: z.string().optional(),
});

export const professionalLicenseSchema = z.object({
  eligibility: z.string(),
  dateTaken: z.string().optional(),
  licenseNumber: z.string().optional(),
  validUntil: z.string().optional(),
});

export const workExperienceSchema = z.object({
  companyName: z.string(),
  address: z.string().optional(),
  position: z.string(),
  numberOfMonths: z.number().optional(),
  status: z.string().optional(), // Permanent, Contractual, Part-time, Probationary
});

export const applicantSchema = z.object({
  id: z.string().optional(),
  // Personal Information
  surname: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  dateOfBirth: z.string(),
  sex: z.enum(["Male", "Female"]),
  religion: z.string().optional(),
  civilStatus: z.enum(["Single", "Married", "Widowed"]),
  
  // Address
  houseStreetVillage: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  
  // Contact Info
  height: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  
  // Disability
  disability: z.enum(["None", "Visual", "Hearing", "Speech", "Physical", "Mental", "Others"]).optional(),
  disabilitySpecify: z.string().optional(),
  
  // Employment Status
  employmentStatus: z.enum(["Employed", "Self-employed", "Unemployed", "New Entrant/Fresh Graduate", "Finished Contract", "Resigned", "Retired", "Terminated/Laid off"]).optional(),
  employmentType: z.enum(["Wage employed", "Self-employed", "Fisherman/Fisherfolk", "Vendor/Retailer", "Home-based worker", "Transport", "Domestic Worker", "Freelancer", "Artisan/Craft Worker", "Others"]).optional(),
  monthsUnemployed: z.number().optional(),
  
  // OFW Status
  isOFW: z.boolean().optional(),
  owfCountry: z.string().optional(),
  isFormerOFW: z.boolean().optional(),
  formerOFWCountry: z.string().optional(),
  returnToPHDate: z.string().optional(),
  
  // 4Ps Beneficiary
  is4PSBeneficiary: z.boolean().optional(),
  householdID: z.string().optional(),
  
  // Job Preference
  preferredOccupations: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  preferredOverseasCountries: z.array(z.string()).optional(),
  employmentType4: z.enum(["Part-time", "Full-time"]).optional(),
  
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
  
  // Other Skills Acquired (checkboxes)
  otherSkills: z.array(z.enum([
    "Auto Mechanic", "Beautician", "Carpentry Work", "Computer Literate", "Domestic Chores", "Driver",
    "Electrician", "Embroidery", "Gardening", "Masonry", "Painter/Artist", "Painting Jobs",
    "Photography", "Plumbing", "Sewing Dresses", "Stenography", "Tailoring", "Others"
  ])).optional(),
  otherSkillsSpecify: z.string().optional(),
  
  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const applicantCreateSchema = applicantSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type LanguageProficiency = z.infer<typeof languageProficiencySchema>;
export type EducationBackground = z.infer<typeof educationBackgroundSchema>;
export type TechnicalTraining = z.infer<typeof technicalTrainingSchema>;
export type ProfessionalLicense = z.infer<typeof professionalLicenseSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
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

// Employer / Establishment Profile (SRS Form 2)
export const employerSchema = z.object({
  id: z.string().optional(),
  // Establishment Information
  establishmentName: z.string(),
  houseStreetVillage: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  
  // Employment Information
  numberOfPaidEmployees: z.number(),
  numberOfVacantPositions: z.number(),
  
  // Industry Type (can be multiple checkboxes)
  industryType: z.array(z.string()), // Array of industry codes
  
  // SRS Subscriber Status
  srsSubscriber: z.boolean().optional(),
  
  // Company Information
  companyTIN: z.string().optional(),
  businessPermitNumber: z.string().optional(),
  bir2303Number: z.string().optional(),
  
  // Geographic Identification
  chairpersonName: z.string().optional(),
  chairpersonContact: z.string().optional(),
  secretaryName: z.string().optional(),
  secretaryContact: z.string().optional(),
  
  // Prepared By
  preparedByName: z.string(),
  preparedByDesignation: z.string(),
  preparedByContact: z.string().optional(),
  dateAccomplished: z.string(), // YYYY-MM-DD
  
  // Remarks
  remarks: z.string().optional(),
  
  // For Manpower Agencies
  isManpowerAgency: z.boolean().optional(),
  doleCertificationNumber: z.string().optional(),
  
  // Attachments (file paths or URLs)
  srsFormFile: z.string().optional(),
  businessPermitFile: z.string().optional(),
  bir2303File: z.string().optional(),
  companyProfileFile: z.string().optional(),
  doleCertificationFile: z.string().optional(),
  
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
  establishmentName: z.string(),
  industryCodes: z.array(z.enum([
    '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17'
  ])).min(1, { message: 'At least one industry must be selected' }),
  positionTitle: z.string(),
  minimumEducationRequired: z.string(),
  mainSkillOrSpecialization: z.string().optional(),
  yearsOfExperienceRequired: z.number(),
  agePreference: z.string().optional(),
  startingSalaryOrWage: z.number(),
  // Added per request: counts for SRS Form 2A display
  vacantPositions: z.number().min(0, { message: 'Vacant positions must be >= 0' }),
  paidEmployees: z.number().min(0, { message: 'Paid employees must be >= 0' }),
  jobStatus: z.enum(['P','T','C']), // P=Permanent, T=Temporary, C=Contractual
  preparedByName: z.string(),
  preparedByDesignation: z.string(),
  preparedByContact: z.string().optional(),
  dateAccomplished: z.string(), // YYYY-MM-DD
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
  status: z.enum(["pending", "reviewed", "shortlisted", "interview", "accepted", "rejected"]).default("pending"),
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
  status: z.enum(["pending", "reviewed", "shortlisted", "interview", "accepted", "rejected"]).optional(),
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
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

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


