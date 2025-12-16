
import bcrypt from 'bcryptjs';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { initializeDatabase } from './database';
import fs from 'fs';
import path from 'path';
import {
  adminsTable,
  usersTable,
  employersTable,
  jobsTable,
  applicationsTable,
  notesTable,
  referralsTable,
  adminAccessRequestsTable,
} from './unified-schema';
import type {
  RecentActivity,
  BarChartData,
  DoughnutChartData,
  LineChartData,
  Referral,
  ReferralFilters,
  Note,
  NotesFilters,
  Jobseeker,
  Employer,
  JobPost,
  Application,
  Applicant,
  Job,
  GeneralSettings,
} from '@shared/schema';




// ...existing code...

// Add this method inside DatabaseStorage class:
//
//   async getSkillsReport() {
//     const db = await this.getDb();
//     // Fetch all applicants' skills and otherSkills fields
//     const applicants = await db.select().from(usersTable);
//     const skillCounts = new Map();
//     const allSkillsSet = new Set();
//     for (const applicant of applicants) {
//       // skills: comma-separated or JSON array, otherSkills: JSON array
//       let skillsArr = [];
//       if (typeof applicant.skills === 'string') {
//         try {
//           // Try JSON parse first
//           const parsed = JSON.parse(applicant.skills);
//           if (Array.isArray(parsed)) skillsArr = skillsArr.concat(parsed);
//         } catch {
//           // Fallback: split by comma
//           skillsArr = skillsArr.concat(applicant.skills.split(',').map(s => s.trim()));
//         }
//       }
//       if (Array.isArray(applicant.otherSkills)) {
//         skillsArr = skillsArr.concat(applicant.otherSkills);
//       } else if (typeof applicant.otherSkills === 'string') {
//         try {
//           const parsed = JSON.parse(applicant.otherSkills);
//           if (Array.isArray(parsed)) skillsArr = skillsArr.concat(parsed);
//         } catch {
//           // fallback: comma split
//           skillsArr = skillsArr.concat(applicant.otherSkills.split(',').map(s => s.trim()));
//         }
//       }
//       for (const skill of skillsArr) {
//         if (!skill) continue;
//         allSkillsSet.add(skill);
//         skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
//       }
//     }
//     // Top 20 skills

export type EmploymentStatusBucket = "employed" | "unemployed" | "selfEmployed" | "newEntrant";

const normalizeStatusValue = (raw: unknown): string => {
  if (raw === undefined || raw === null) {
    return "";
  }
  return String(raw)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const classifyLegacyStatus = (rawStatus: unknown): EmploymentStatusBucket | null => {
  const normalized = normalizeStatusValue(rawStatus);
  if (!normalized) {
    return null;
  }

  const contains = (needle: string) => normalized.includes(needle);

  if (
    contains("self employ") ||
    contains("entrepreneur") ||
    contains("business owner") ||
    contains("freelanc")
  ) {
    return "selfEmployed";
  }

  if (
    contains("new entrant") ||
    contains("fresh graduate") ||
    contains("first time job") ||
    contains("first time worker") ||
    contains("new worker") ||
    contains("student") ||
    contains("recent graduate")
  ) {
    return "newEntrant";
  }

  if (
    contains("unemploy") ||
    contains("underemploy") ||
    contains("jobless") ||
    contains("no work") ||
    contains("without work")
  ) {
    return "unemployed";
  }

  if (
    (contains("wage") && contains("employ")) ||
    (contains("employed") && !contains("unemploy")) ||
    contains("with work") ||
    contains("currently working") ||
    contains("working full time") ||
    contains("working part time")
  ) {
    return "employed";
  }

  return null;
};

// Normalize applicant payload keys/types to match DB column names before writing.
const normalizeApplicantForDb = (payload: Partial<Applicant>): Record<string, unknown> => {
  const jsonFields = [
    "education",
    "technicalTraining",
    "professionalLicenses",
    "languageProficiency",
    "workExperience",
    "otherSkills",
    "skills",
    "otherSkillsTraining",
    "otherSkillsSpecify",
    "jobPreferences",
    "preferredOccupations",
    "preferredLocations",
    "preferredOverseasCountries",
    "attachments",
    "familyMembers",
    "dependents",
    "references",
    "documentRequirements",
    "presentAddress",
    "permanentAddress",
    "additionalAddresses",
    "contactInformation",
    "governmentIds",
  ];

  const normalized: Record<string, unknown> = { ...payload };

  const normalizeDateOnly = (value: unknown): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      // If already YYYY-MM-DD, keep as-is.
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    }
    const dt = new Date(value as any);
    if (Number.isNaN(dt.getTime())) return undefined;
    return dt.toISOString().slice(0, 10);
  };

  // Boolean flag alignment (DB columns are lower-case "ofw" / "4ps")
  if ("isOFW" in payload) normalized.isOfw = Boolean((payload as any).isOFW);
  if ("isFormerOFW" in payload) normalized.isFormerOfw = Boolean((payload as any).isFormerOFW);
  if ("is4PSBeneficiary" in payload) normalized.is4psBeneficiary = Boolean((payload as any).is4PSBeneficiary);

  // Date/timestamp normalization
  // Keep birth dates as date-only strings (YYYY-MM-DD) to avoid timezone drift and SQLite text binding issues.
  if ("dateOfBirth" in payload) {
    const dob = normalizeDateOnly((payload as any).dateOfBirth);
    if (dob) normalized.dateOfBirth = dob;
    else delete normalized.dateOfBirth;
  }
  if ("birthDate" in payload) {
    const bd = normalizeDateOnly((payload as any).birthDate);
    if (bd) normalized.birthDate = bd;
    else delete normalized.birthDate;
  }

  const timestampFields = ["registrationDate", "registeredAt", "lastLoginAt", "createdAt", "updatedAt"] as const;
  for (const key of timestampFields) {
    if (key in payload) {
      const raw = (payload as any)[key];
      const dt = raw ? new Date(raw as any) : null;
      normalized[key] = dt && !Number.isNaN(dt.getTime()) ? dt : undefined;
    }
  }

  // Ensure JSON fields are stored as objects/arrays (Drizzle json mode handles serialization)
  for (const key of jsonFields) {
    if (key in payload) {
      const val = (payload as any)[key];
      if (val === undefined) continue;
      if (typeof val === "string") {
        // If already a JSON string, keep as-is; otherwise stringify primitives
        try {
          JSON.parse(val);
          normalized[key] = val;
        } catch {
          normalized[key] = JSON.stringify(val);
        }
      } else if (val !== null && typeof val === "object") {
        // Store objects/arrays as JSON strings to satisfy SQLite binding
        normalized[key] = JSON.stringify(val);
      } else {
        normalized[key] = val;
      }
    }
  }

  return normalized;
};

export const classifyEmploymentStatus = (source: unknown): EmploymentStatusBucket | null => {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const data = source as Record<string, unknown>;
    const status = normalizeStatusValue(data.employmentStatus ?? data.employment_status);
    const detail = normalizeStatusValue(data.employmentStatusDetail ?? data.employment_status_detail);
    const category = normalizeStatusValue(data.selfEmployedCategory ?? data.self_employed_category);
    const reason = normalizeStatusValue(data.unemployedReason ?? data.unemployed_reason);
    const fallbackType = normalizeStatusValue(data.employmentType ?? data.employment_type);

    if (status === "employed" || status === "wage employed") {
      if (detail === "self employed" || category) {
        return "selfEmployed";
      }
      return "employed";
    }

    if (status === "unemployed") {
      if (reason === "new entrant/fresh graduate") {
        return "newEntrant";
      }
      return "unemployed";
    }

    if (detail === "self employed" || category) {
      return "selfEmployed";
    }

    if (reason === "new entrant/fresh graduate") {
      return "newEntrant";
    }

    if (status) {
      return classifyLegacyStatus(status);
    }

    if (fallbackType) {
      return classifyLegacyStatus(fallbackType);
    }
  }

  return classifyLegacyStatus(source);
};

export interface SummaryCardWithHistory {
  value: number;
  change: number;
  trend: "up" | "down";
  history: number[];
}

export interface SummaryDataWithHistory {
  totalApplicants: SummaryCardWithHistory;
  activeEmployers: SummaryCardWithHistory;
  activeJobPosts: SummaryCardWithHistory;
  pendingEmployerFeedback: SummaryCardWithHistory;
  successfulReferrals: SummaryCardWithHistory;
  activeFreelancers: SummaryCardWithHistory;
  fourPsBeneficiaries: SummaryCardWithHistory;
  ofwApplicants: SummaryCardWithHistory;
}

export interface IStorage {
  getSummaryData(startDate?: string, endDate?: string): Promise<SummaryDataWithHistory>;
  getRecentActivities(): Promise<RecentActivity[]>;
  getBarChartData(startDate?: string, endDate?: string): Promise<BarChartData>;
  getDoughnutChartData(startDate?: string, endDate?: string): Promise<DoughnutChartData>;
  getLineChartData(startDate?: string, endDate?: string): Promise<LineChartData>;
  getReferrals(filters?: ReferralFilters): Promise<Referral[]>;
  getNotes(filters?: NotesFilters): Promise<Note[]>;
  getSkillsReport?(startDate?: string, endDate?: string): Promise<{
    topSkills: { skill: string; count: number }[];
    expectedSkillsShortage: { skill: string; count: number }[];
  }>;
  updateApplicant(id: string, updates: Partial<Applicant>): Promise<Applicant | null>;
  updateEmployer(id: string, updates: Partial<Employer>): Promise<Employer | null>;
  addJobseeker(payload: { name: string; email: string; role: 'jobseeker' | 'freelancer'; passwordHash: string }): Promise<Jobseeker>;
  getJobseekers(): Promise<Jobseeker[]>;
  addEmployer?(employer: Employer): Promise<Employer>;
  getEmployers?(): Promise<Employer[]>;
  addJobPost(employerId: string, company: string, payload: {
    employerId: string;
    status?: "active" | "draft" | "closed";
    positionTitle: string;
    description: string;
    location: string;
    salaryPeriod: "monthly" | "hourly" | "daily" | "weekly" | "15days";
    salaryMin?: number;
    salaryMax?: number;
    salaryAmount?: number;
    salaryType?: string;
    jobStatus?: string;
    minimumEducation?: string;
    yearsOfExperience?: number;
    skills?: string;
  }): Promise<JobPost>;
  addJobPostFull?(jobData: any): Promise<any>;
  getJobPosts(): Promise<JobPost[]>;
  deleteJobPost?(jobId: string): Promise<void>;
  saveJobs?(jobs: any[]): Promise<void>;
  applyToJob(jobId: string, applicant: { id: string; name: string }, coverLetter?: string): Promise<Application>;
  getApplicantsForJob(jobId: string): Promise<Application[]>;
  getApplicationsByJobseeker?(applicantId: string): Promise<any[]>;
  addAdmin(payload: { name: string; email: string; passwordHash?: string; role?: string }): Promise<any>;
  getAdmins(): Promise<any[]>;
  addApplicant?(applicant: Applicant): Promise<Applicant>;
  getApplicants?(): Promise<Applicant[]>;
  deleteApplicant?(id: string): Promise<void>;
  deleteApplicants?(ids: string[]): Promise<void>;
  // Removed: addJobVacancy, getJobVacancies
  addAdminAccessRequest?(request: { name: string; email: string; phone: string; organization: string }): Promise<any>;
  getAdminAccessRequests?(): Promise<any[]>;
  updateAdminAccessRequest?(id: string, updates: { status: string }): Promise<any>;
  // General settings
  getGeneralSettings?(): Promise<import("@shared/schema").GeneralSettings>;
  updateGeneralSettings?(settings: import("@shared/schema").GeneralSettings): Promise<import("@shared/schema").GeneralSettings>;
  // Auth settings
  getAuthSettings?(): Promise<import("@shared/schema").AuthSettings>;
  updateAuthSettings?(settings: import("@shared/schema").AuthSettings): Promise<import("@shared/schema").AuthSettings>;

  // Jobseeker profile image and password
  saveJobseekerProfileImage(userId: string, file: any): Promise<string>;
  changeJobseekerPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

export class DatabaseStorage implements IStorage {
  private db: any = null;
  // private adminAccessRequests: Map<string, any> = new Map();

  // Save jobseeker profile image (store the provided data URL string)
  async saveJobseekerProfileImage(userId: string, imagePayload: any): Promise<string> {
    const db = await this.getDb();
    const now = new Date();
    const imageValue = typeof imagePayload === "string"
      ? imagePayload
      : imagePayload?.image || imagePayload?.data || null;

    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
    const imageToPersist = typeof imageValue === "string" && imageValue.trim().length > 0
      ? imageValue
      : fallback;

    await db
      .update(usersTable)
      .set({ profileImage: imageToPersist, updatedAt: now })
      .where(eq(usersTable.id, userId));

    return imageToPersist;
  }

  // Change or set jobseeker password
  async changeJobseekerPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = await this.getDb();
      // Find user by ID
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!user) return { success: false, message: "User not found" };
      // If user has a password, check currentPassword
      if (user.passwordHash) {
        const valid = await bcrypt.compare(currentPassword || '', user.passwordHash);
        if (!valid) return { success: false, message: "Current password is incorrect" };
      }
      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 10);
      await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, userId));
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error('Error changing jobseeker password:', error);
      return { success: false, message: "Failed to update password" };
    }
  }
  private generalSettings: GeneralSettings = {
    siteName: "GensanWorks",
    siteDescription: "Official Job Assistance Platform of PESO â€“ General Santos City",
    contactEmail: "admin@gensanworks.com",
    contactPhone: "+63 283 889 5200",
    address: "General Santos City, South Cotabato",
    heroHeadline: "Connecting jobseekers and employers in General Santos City",
    heroSubheadline: "A single window for opportunities, referrals, and PESO services",
    primaryCTA: "Browse Jobs",
    secondaryCTA: "Post a Vacancy",
    aboutTitle: "Why GensanWorks",
    aboutBody: "PESO-led platform for job matching, referrals, and analytics across the city.",
    heroBackgroundImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
    seoKeywords: "peso gensan jobs, job portal gensan, peso referrals",
  };
  private authSettings: import("@shared/schema").AuthSettings = { providers: [] };
  // Use process.cwd() for directory resolution (ESM/CJS safe)
  private static _dirname = process.cwd();
  private generalSettingsPath: string;
  private authSettingsPath: string;

  constructor() {
    this.generalSettingsPath = this.resolveGeneralSettingsPath();
    this.authSettingsPath = this.resolveAuthSettingsPath();
    this.ensureGeneralSettingsDirectory();
    this.ensureAuthSettingsDirectory();
    // Load persisted general settings if available
    try {
      if (fs.existsSync(this.generalSettingsPath)) {
        const raw = fs.readFileSync(this.generalSettingsPath, 'utf-8');
        this.generalSettings = JSON.parse(raw);
      } else {
        this.saveGeneralSettingsToDisk();
      }
    } catch (e) {
      console.error('[GeneralSettings] Failed to load persisted general settings:', e);
    }
    // Load persisted auth settings if available
    try {
      if (fs.existsSync(this.authSettingsPath)) {
        const raw = fs.readFileSync(this.authSettingsPath, 'utf-8');
        this.authSettings = JSON.parse(raw);
      } else {
        this.saveAuthSettingsToDisk();
      }
    } catch (e) {
      console.error('[AuthSettings] Failed to load persisted auth settings:', e);
    }
  }

  private resolveAuthSettingsPath(): string {
    const candidates = [
      path.join(process.cwd(), 'server', 'data', 'auth-settings.json'),
      path.join(process.cwd(), 'data', 'auth-settings.json'),
    ];
    const existing = candidates.find((candidate) => fs.existsSync(candidate));
    return existing || candidates[0];
  }

  private resolveGeneralSettingsPath(): string {
    const candidates = [
      path.join(process.cwd(), 'server', 'data', 'general-settings.json'),
      path.join(process.cwd(), 'data', 'general-settings.json'),
    ];
    const existing = candidates.find((candidate) => fs.existsSync(candidate));
    return existing || candidates[0];
  }

  private ensureAuthSettingsDirectory() {
    const dir = path.dirname(this.authSettingsPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  private ensureGeneralSettingsDirectory() {
    const dir = path.dirname(this.generalSettingsPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  private saveAuthSettingsToDisk() {
    try {
      this.ensureAuthSettingsDirectory();
      fs.writeFileSync(this.authSettingsPath, JSON.stringify(this.authSettings, null, 2), 'utf-8');
    } catch (e) {
      console.error('[AuthSettings] Failed to persist auth settings:', e);
    }
  }

  private saveGeneralSettingsToDisk() {
    try {
      this.ensureGeneralSettingsDirectory();
      fs.writeFileSync(this.generalSettingsPath, JSON.stringify(this.generalSettings, null, 2), 'utf-8');
    } catch (e) {
      console.error('[GeneralSettings] Failed to persist general settings:', e);
    }
  }

  async getDb() {
    if (!this.db) {
      this.db = await initializeDatabase();
    }
    return this.db;
  }

  private base = (v: number): SummaryCardWithHistory => ({
    value: v,
    change: 0,
    trend: v > 0 ? 'up' : 'down',
    history: [v, v, v, v, v, v, v]
  });

  // Cache summary data for 30 seconds to reduce database load
  private summaryCache: { data: SummaryDataWithHistory | null; timestamp: number } = { data: null, timestamp: 0 };
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getSummaryData(startDate?: string, endDate?: string): Promise<SummaryDataWithHistory> {
    // Check cache first (only if no date filters)
    if (!startDate && !endDate) {
      const now = Date.now();
      if (this.summaryCache.data && (now - this.summaryCache.timestamp) < this.CACHE_TTL) {
        console.log('[getSummaryData] Returning cached data');
        return this.summaryCache.data;
      }
    }

    try {
      const db = await this.getDb();

      let applicants: any[] = [];
      let employers: any[] = [];
      let jobVacancies: any[] = [];
      let jobs: any[] = [];
      let referrals: any[] = [];
      let freelancers = 0;

      let applicantCountValue: number | undefined;
      let employerCountValue: number | undefined;
      let jobCountValue: number | undefined;
      let referralCountValue: number | undefined;
      let freelancerCountValue: number | undefined;
      let hadDbError = false;

      try {
        // Use COUNT queries instead of loading all records when possible
        if (!startDate && !endDate) {
          // Fast path: count totals + load minimal rows needed for derived metrics
          const [applicantCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable);
          // Count only approved (active) employers; exclude pending/unapproved sign-ups and archived records
          const [employerCount] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(employersTable)
            .where(
              and(
                eq(employersTable.archived, false),
                eq(employersTable.accountStatus, 'active'),
              )
            );
          const [jobCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(jobsTable);
          const [referralCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(referralsTable);
          const [freelancerCount] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(usersTable)
            .where(eq(usersTable.role, 'freelancer'));

          applicantCountValue = applicantCount?.count;
          employerCountValue = employerCount?.count;
          jobCountValue = jobCount?.count;
          referralCountValue = referralCount?.count;
          freelancerCountValue = freelancerCount?.count;

          // Load minimal data for status / breakdown checks
          jobs = await db
            .select({ id: jobsTable.id, status: jobsTable.status, archived: jobsTable.archived })
            .from(jobsTable);
          referrals = await db
            .select({ status: referralsTable.status, feedback: referralsTable.feedback })
            .from(referralsTable);
          applicants = await db
            .select({
              id: usersTable.id,
              is4psBeneficiary: usersTable.is4psBeneficiary,
              isOfw: usersTable.isOfw,
              isFormerOfw: usersTable.isFormerOfw,
            })
            .from(usersTable);

          freelancers = typeof freelancerCountValue === 'number' ? freelancerCountValue : 0;
        } else {
          // Date filter path: load records with dates
          applicants = await db.select().from(usersTable);
          employers = await db.select().from(employersTable);
          jobs = await db.select().from(jobsTable);
          referrals = await db.select().from(referralsTable);

          const freelancerApplicants = await db.select().from(usersTable).where(eq(usersTable.role, 'freelancer'));
          freelancers = freelancerApplicants.length;
        }
      } catch (e) {
        hadDbError = true;
        console.error('[getSummaryData] Error fetching from database:', e);
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        // Parse dates as UTC to avoid timezone issues
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');
        const startMs = start.getTime();
        const endMs = end.getTime();

        applicants = applicants.filter(app => {
          if (!app.createdAt) return false;
          try {
            // Handle both UNIX timestamps (numbers) and ISO date strings
            const createdDate = typeof app.createdAt === 'number' 
              ? new Date(app.createdAt * 1000) 
              : new Date(app.createdAt);
            if (isNaN(createdDate.getTime())) return false;
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false;
          }
        });

        jobs = jobs.filter(job => {
          if (!job.createdAt) return false;
          try {
            // Handle both UNIX timestamps (numbers) and ISO date strings
            const createdDate = typeof job.createdAt === 'number'
              ? new Date(job.createdAt * 1000)
              : new Date(job.createdAt);
            const isValid = !isNaN(createdDate.getTime());
            if (!isValid) return false;
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false;
          }
        });

        jobVacancies = jobVacancies.filter(vac => {
          if (!vac.createdAt) return false;
          try {
            // Handle both UNIX timestamps (numbers) and ISO date strings
            const createdDate = typeof vac.createdAt === 'number'
              ? new Date(vac.createdAt * 1000)
              : new Date(vac.createdAt);
            if (isNaN(createdDate.getTime())) return false;
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false;
          }
        });

        employers = employers.filter(emp => {
          if (!emp.createdAt) return false;
          try {
            // Handle both UNIX timestamps (numbers) and ISO date strings
            const createdDate = typeof emp.createdAt === 'number'
              ? new Date(emp.createdAt * 1000)
              : new Date(emp.createdAt);
            if (isNaN(createdDate.getTime())) return false;
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false;
          }
        });

        referrals = referrals.filter(ref => {
          const rawDate = ref.dateReferred || ref.createdAt;
          if (!rawDate) return false;
          try {
            // Handle both UNIX timestamps (numbers) and ISO date strings
            const referralDate = typeof rawDate === 'number'
              ? new Date(rawDate * 1000)
              : new Date(rawDate);
            if (Number.isNaN(referralDate.getTime())) return false;
            return referralDate >= start && referralDate <= end;
          } catch (e) {
            return false;
          }
        });
      }

      const totalApplicants = typeof applicantCountValue === 'number' ? applicantCountValue : (applicants?.length || 0);
      const activeEmployers = typeof employerCountValue === 'number'
        ? employerCountValue
        : (employers || []).filter((emp: any) => {
            const archived = Boolean(emp.archived);
            // Default to pending so unapproved sign-ups aren't counted unless explicitly approved.
            const status = String(emp.accountStatus || emp.account_status || 'pending').toLowerCase();
            return !archived && status === 'active';
          }).length;

      // FIX: Count only active (non-archived) jobs - archived jobs should not be in "active" metric
      const allJobs = jobs || [];
      const activeJobs = allJobs.filter((job: any) => {
        const status = typeof job.status === 'string' ? job.status.toLowerCase() : '';
        const archived = Boolean(job.archived);
        return status === 'active' && !archived;  // Must be active AND not archived
      });

      const totalJobPosts = activeJobs.length;

      // Count 4Ps beneficiaries and OFW applicants
      const fourPsBeneficiaries = applicants.filter((a: any) => a.is4psBeneficiary === true || a.is4psBeneficiary === 1).length;
      const ofwApplicants = applicants.filter((a: any) => a.isOfw === true || a.isOfw === 1 || a.isFormerOfw === true || a.isFormerOfw === 1).length;
      const successfulReferralCount = referrals.filter((ref: any) => typeof ref.status === 'string' && ref.status.toLowerCase() === 'hired').length;
      const pendingFeedbackCount = referrals.filter((ref: any) => {
        const hasFeedback = typeof ref.feedback === 'string' && ref.feedback.trim().length > 0;
        const status = typeof ref.status === 'string' ? ref.status.toLowerCase() : '';
        return !hasFeedback && status !== 'hired';
      }).length;

      const result = {
        totalApplicants: this.base(totalApplicants),
        activeEmployers: this.base(activeEmployers),
        activeJobPosts: this.base(totalJobPosts),
        pendingEmployerFeedback: this.base(pendingFeedbackCount),
        successfulReferrals: this.base(successfulReferralCount),
        activeFreelancers: this.base(freelancers),
        fourPsBeneficiaries: this.base(fourPsBeneficiaries),
        ofwApplicants: this.base(ofwApplicants),
      };

      // Cache the result if no date filters
      // Only cache successful DB-backed results; avoid caching transient failures as zeros.
      if (!startDate && !endDate && !hadDbError) {
        this.summaryCache = {
          data: result,
          timestamp: Date.now()
        };
      }

      return result;
    } catch (error) {
      console.error('Error in getSummaryData:', error);
      return {
        totalApplicants: this.base(0),
        activeEmployers: this.base(0),
        activeJobPosts: this.base(0),
        pendingEmployerFeedback: this.base(0),
        successfulReferrals: this.base(0),
        activeFreelancers: this.base(0),
        fourPsBeneficiaries: this.base(0),
        ofwApplicants: this.base(0),
      };
    }
  }

  async getGeneralSettings(): Promise<GeneralSettings> {
    try {
      if (fs.existsSync(this.generalSettingsPath)) {
        const raw = fs.readFileSync(this.generalSettingsPath, 'utf-8');
        this.generalSettings = JSON.parse(raw);
      } else {
        this.saveGeneralSettingsToDisk();
      }
    } catch (e) {
      console.error('[GeneralSettings] Failed to reload general settings:', e);
    }
    return this.generalSettings;
  }

  async updateGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
    this.generalSettings = settings;
    this.saveGeneralSettingsToDisk();
    return this.generalSettings;
  }

  async getAuthSettings(): Promise<import("@shared/schema").AuthSettings> {
    // Always reload from disk in case of external edits
    try {
      if (fs.existsSync(this.authSettingsPath)) {
        const raw = fs.readFileSync(this.authSettingsPath, 'utf-8');
        this.authSettings = JSON.parse(raw);
      } else {
        this.saveAuthSettingsToDisk();
      }
    } catch (e) {
      console.error('[AuthSettings] Failed to reload auth settings:', e);
    }
    return this.authSettings;
  }

  async updateAuthSettings(settings: import("@shared/schema").AuthSettings): Promise<import("@shared/schema").AuthSettings> {
    this.authSettings = settings;
    this.saveAuthSettingsToDisk();
    return this.authSettings;
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const db = await this.getDb();
      const activities: RecentActivity[] = [];

      // Recent applicants
      const recentApplicants = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(10);
      for (const app of recentApplicants as any[]) {
        activities.push({
          id: `applicant-${app.id}`,
          message: `New applicant registered: ${app.firstName} ${app.surname}`,
          timestamp: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
        });
      }

      // Recent employers
      const recentEmployers = await db.select().from(employersTable).orderBy(desc(employersTable.createdAt)).limit(10);
      for (const emp of recentEmployers as any[]) {
        activities.push({
          id: `employer-${emp.id}`,
          message: `New employer registered: ${emp.establishmentName}`,
          timestamp: emp.createdAt ? new Date(emp.createdAt).toISOString() : new Date().toISOString(),
        });
      }

      // Recent job vacancies
      // Removed jobVacanciesTable logic

      // Recent jobs
      const recentJobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(10);
      for (const j of recentJobs as any[]) {
        activities.push({
          id: `job-${j.id}`,
          message: `Job posted: ${j.title}`,
          timestamp: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
        });
      }

      // Recent applications
      const recentApps = await db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt)).limit(10);
      for (const a of recentApps as any[]) {
        activities.push({
          id: `app-${a.id}`,
          message: `Referral created`,
          timestamp: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        });
      }

      // Sort and return top 30
      return activities.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      }).slice(0, 30);
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  }

  async getDoughnutChartData(startDate?: string, endDate?: string): Promise<DoughnutChartData> {
    try {
      const db = await this.getDb();
      let applicants = await db.select().from(usersTable);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        applicants = applicants.filter((app: any) => {
          const createdDate = app.createdAt ? new Date(app.createdAt) : null;
          return createdDate && createdDate >= start && createdDate <= end;
        });
      }

      const jobSeeker = applicants.filter((a: any) => {
        if (!a.employmentType) return true;
        return !a.employmentType.toLowerCase().includes('freelancer');
      }).length;

      const freelancer = applicants.filter((a: any) =>
        a.employmentType?.toLowerCase().includes('freelancer')
      ).length;

      return { jobSeeker, freelancer };
    } catch (error) {
      console.error('Error in getDoughnutChartData:', error);
      return { jobSeeker: 0, freelancer: 0 };
    }
  }

  async getBarChartData(startDate?: string, endDate?: string): Promise<BarChartData> {
    try {
      const db = await this.getDb();
      let applicants = await db.select().from(usersTable);

      if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        applicants = applicants.filter((app: any) => {
          const createdDate = app.createdAt ? new Date(app.createdAt) : null;
          return createdDate && createdDate >= start && createdDate <= end;
        });
      }

      const allBarangays = [
        "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang",
        "City Heights", "Conel", "Dadiangas East", "Dadiangas North",
        "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan",
        "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
        "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler",
        "Tinagacan", "Upper Labay"
      ];

      const barangayLookup = new Map<string, string>();
      for (const name of allBarangays) {
        barangayLookup.set(name.toLowerCase(), name);
      }

      const barangayWageEmployedCounts = new Map<string, number>();
      const barangayUnemployedCounts = new Map<string, number>();
      const barangaySelfEmployedCounts = new Map<string, number>();
      const barangayNewEntrantCounts = new Map<string, number>();

      for (const barangay of allBarangays) {
        barangayWageEmployedCounts.set(barangay, 0);
        barangayUnemployedCounts.set(barangay, 0);
        barangaySelfEmployedCounts.set(barangay, 0);
        barangayNewEntrantCounts.set(barangay, 0);
      }

      for (const applicant of applicants) {
        const barangayRaw = typeof applicant.barangay === 'string' ? applicant.barangay.trim() : '';
        const barangayKey = barangayLookup.get(barangayRaw.toLowerCase());
        if (!barangayKey) {
          continue;
        }

        const bucket = classifyEmploymentStatus(applicant);
        if (!bucket) {
          continue;
        }

        if (bucket === 'employed') {
          barangayWageEmployedCounts.set(barangayKey, (barangayWageEmployedCounts.get(barangayKey) || 0) + 1);
        } else if (bucket === 'selfEmployed') {
          barangaySelfEmployedCounts.set(barangayKey, (barangaySelfEmployedCounts.get(barangayKey) || 0) + 1);
        } else if (bucket === 'unemployed') {
          barangayUnemployedCounts.set(barangayKey, (barangayUnemployedCounts.get(barangayKey) || 0) + 1);
        } else if (bucket === 'newEntrant') {
          barangayNewEntrantCounts.set(barangayKey, (barangayNewEntrantCounts.get(barangayKey) || 0) + 1);
          barangayUnemployedCounts.set(barangayKey, (barangayUnemployedCounts.get(barangayKey) || 0) + 1);
        }
      }

      const barangays = Array.from(barangayWageEmployedCounts.keys());
      const employed = barangays.map(b => (barangayWageEmployedCounts.get(b) || 0) + (barangaySelfEmployedCounts.get(b) || 0));
      const unemployed = barangays.map(b => barangayUnemployedCounts.get(b) || 0);
      const selfEmployed = barangays.map(b => barangaySelfEmployedCounts.get(b) || 0);
      const newEntrant = barangays.map(b => barangayNewEntrantCounts.get(b) || 0);

      return { barangays, employed, unemployed, selfEmployed, newEntrant };
    } catch (error) {
      console.error('Error in getBarChartData:', error);
      const allBarangays = [
        "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang",
        "City Heights", "Conel", "Dadiangas East", "Dadiangas North",
        "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan",
        "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
        "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler",
        "Tinagacan", "Upper Labay"
      ];
      return {
        barangays: allBarangays,
        employed: new Array(allBarangays.length).fill(0),
        unemployed: new Array(allBarangays.length).fill(0),
        selfEmployed: new Array(allBarangays.length).fill(0),
        newEntrant: new Array(allBarangays.length).fill(0),
      };
    }
  }

  async getLineChartData(startDate?: string, endDate?: string): Promise<LineChartData> {
    try {
      const db = await this.getDb();
      const referrals = await db.select().from(referralsTable);

      const parseReferralDate = (ref: any): Date | null => {
        const raw = ref.dateReferred || ref.createdAt || ref.updatedAt;
        if (!raw) return null;
        const dt = new Date(raw);
        return Number.isNaN(dt.getTime()) ? null : dt;
      };

      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate + "T00:00:00.000Z");
        end = new Date(endDate + "T23:59:59.999Z");
      } else {
        const referralDates = referrals
          .map(parseReferralDate)
          .filter((dateValue: Date | null): dateValue is Date => dateValue instanceof Date)
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        if (referralDates.length) {
          start = referralDates[0];
          end = referralDates[referralDates.length - 1];
        } else {
          const now = new Date();
          start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          end = now;
        }
      }

      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      const buckets: { label: string; start: Date; end: Date }[] = [];
      const addBucket = (label: string, bucketStart: Date, bucketEnd: Date) => {
        const normalizedStart = new Date(bucketStart);
        const normalizedEnd = new Date(bucketEnd);
        buckets.push({ label, start: normalizedStart, end: normalizedEnd });
      };
      const daysDiff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      if (daysDiff <= 1) {
        const label = start.toLocaleString('default', { month: 'short', day: 'numeric' });
        addBucket(label, new Date(start), new Date(end));
      } else if (daysDiff <= 7) {
        for (let i = 0; i <= daysDiff; i++) {
          const dayStart = new Date(start);
          dayStart.setHours(0, 0, 0, 0);
          dayStart.setDate(start.getDate() + i);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          const label = dayStart.toLocaleString('default', { month: 'short', day: 'numeric' });
          addBucket(label, dayStart, dayEnd);
        }
      } else if (daysDiff <= 31) {
        const cursor = new Date(start);
        cursor.setHours(0, 0, 0, 0);
        while (cursor <= end) {
          const weekStart = new Date(cursor);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          if (weekEnd > end) {
            weekEnd.setTime(end.getTime());
          }
          const label = `${weekStart.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
          addBucket(label, weekStart, weekEnd);
          cursor.setDate(cursor.getDate() + 7);
        }
      } else if (daysDiff <= 365) {
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cursor <= end) {
          const monthStart = new Date(cursor);
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
          if (monthEnd > end) {
            monthEnd.setTime(end.getTime());
          }
          const label = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });
          addBucket(label, monthStart, monthEnd);
          cursor.setMonth(cursor.getMonth() + 1);
        }
      } else {
        const cursor = new Date(start.getFullYear(), 0, 1);
        while (cursor <= end) {
          const yearStart = new Date(cursor);
          const yearEnd = new Date(yearStart.getFullYear(), 11, 31, 23, 59, 59, 999);
          if (yearEnd > end) {
            yearEnd.setTime(end.getTime());
          }
          const label = yearStart.toLocaleString('default', { year: 'numeric' });
          addBucket(label, yearStart, yearEnd);
          cursor.setFullYear(cursor.getFullYear() + 1);
        }
      }

      if (!buckets.length) {
        const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
        addBucket(label, start, end);
      }

      const referred = new Array(buckets.length).fill(0);
      const hired = new Array(buckets.length).fill(0);
      const feedback = new Array(buckets.length).fill(0);

      const isHired = (status: unknown) => typeof status === 'string' && status.toLowerCase() === 'hired';
      const hasFeedback = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

      referrals.forEach((ref: any) => {
        const eventDate = parseReferralDate(ref);
        if (!eventDate) return;
        if (eventDate < start || eventDate > end) return;

        const bucketIndex = buckets.findIndex(bucket => eventDate >= bucket.start && eventDate <= bucket.end);
        if (bucketIndex === -1) return;

        referred[bucketIndex] += 1;
        if (isHired(ref.status)) {
          hired[bucketIndex] += 1;
        }
        if (hasFeedback(ref.feedback)) {
          feedback[bucketIndex] += 1;
        }
      });

      const months = buckets.map(bucket => bucket.label);
      return { months, referred, hired, feedback };
    } catch (error) {
      console.error('Error in getLineChartData:', error);
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(dt.toLocaleString('default', { month: 'short', year: 'numeric' }));
      }
      return {
        months,
        referred: new Array(months.length).fill(0),
        hired: new Array(months.length).fill(0),
        feedback: new Array(months.length).fill(0),
      };
    }
  }

  async getReferrals(filters?: ReferralFilters): Promise<Referral[]> {
    try {
      const db = await this.getDb();
      const applications = await db.select().from(applicationsTable);
      const jobs = await db.select().from(jobsTable);
      const employers = await db.select().from(employersTable);
      const jobVacancies: any[] = [];

      // Map ALL applications to referrals (no status filter here)
      const out: Referral[] = applications.map((a: any) => {
        // Try to find job by jobId in jobs table first, then jobVacancies
        let jobTitle = 'Unknown';
        if (a.jobId) {
          const job = jobs.find((j: any) => j.id === a.jobId);
          if (job) jobTitle = job.title || 'Unknown';
          else {
            const vacancy = jobVacancies.find((jv: any) => jv.id === a.jobId);
            if (vacancy) jobTitle = vacancy.positionTitle || 'Unknown';
          }
        }
        
        const employer = employers.find((e: any) => e.id === a.employerId) || { establishmentName: 'Unknown' };
        const status = a.status || 'Pending';
        
        // Determine status color
        let statusColor = 'gray';
        if (status === 'Hired') statusColor = 'green';
        else if (status === 'Rejected') statusColor = 'red';
        else if (status === 'For Interview') statusColor = 'blue';
        else if (status === 'Pending') statusColor = 'yellow';
        else if (status === 'Withdrawn') statusColor = 'orange';

        // Safely format date
        let dateReferred = new Date().toISOString();
        if (a.createdAt instanceof Date) {
          try {
            const time = a.createdAt.getTime();
            if (!isNaN(time)) {
              dateReferred = a.createdAt.toISOString();
            }
          } catch (e) {
            dateReferred = new Date().toISOString();
          }
        } else if (typeof a.createdAt === 'string') {
          const parsed = new Date(a.createdAt);
          try {
            if (!isNaN(parsed.getTime())) {
              dateReferred = a.createdAt;
            }
          } catch (e) {
            dateReferred = new Date().toISOString();
          }
        }

        return {
          referralId: a.id,
          applicant: a.applicantName || 'Unknown',
          vacancy: jobTitle,
          employer: employer.establishmentName,
          dateReferred: dateReferred,
          status,
          statusColor,
          feedback: a.feedback || a.notes || '',
        } as Referral;
      });

      // Apply filters
      let filtered = out;
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(r => r.status === filters.status);
        }
        if (filters.employer) {
          filtered = filtered.filter(r => r.employer.toLowerCase().includes((filters.employer as string).toLowerCase()));
        }
        if (filters.barangay) {
          filtered = filtered.filter(r => r.applicant);
        }
      }

      // Apply pagination
      let result = filtered;
      if (filters?.offset) result = result.slice(filters.offset);
      if (filters?.limit) result = result.slice(0, filters.limit);

      return result;
    } catch (error) {
      console.error('Error in getReferrals:', error);
      return [];
    }
  }

  async getNotes(filters?: NotesFilters): Promise<Note[]> {
    try {
      const db = await this.getDb();
      let notes = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));

      if (filters?.offset) notes = notes.slice(filters.offset);
      if (filters?.limit) notes = notes.slice(0, filters.limit);

      return notes.map((n: any) => ({ id: n.id, title: n.title, body: n.body, createdAt: n.createdAt }));
    } catch (error) {
      console.error('Error in getNotes:', error);
      return [];
    }
  }

  async addJobseeker(payload: { name: string; email: string; role: 'jobseeker' | 'freelancer'; passwordHash: string }): Promise<Jobseeker> {
    try {
      const db = await this.getDb();
      const id = `JS-${Date.now()}`;
      const now = new Date();

      const result = await db.insert(usersTable).values({
        id,
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash,
        role: payload.role,
        hasAccount: true,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return {
        id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        createdAt: now.toISOString(),
      };
    } catch (error) {
      console.error('Error adding jobseeker:', error);
      throw error;
    }
  }

  async getJobseekers(): Promise<Jobseeker[]> {
    try {
      const db = await this.getDb();
      const users = await db.select().from(usersTable).where(
        and(
          eq(usersTable.hasAccount, true),
          or(
            eq(usersTable.role, 'jobseeker'),
            eq(usersTable.role, 'freelancer')
          )
        )
      );

      return users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt?.toISOString?.() || u.createdAt,
      }));
    } catch (error) {
      console.error('Error getting jobseekers:', error);
      return [];
    }
  }

  async addEmployer(employer: Employer): Promise<Employer> {
    try {
      const db = await this.getDb();
      const now = new Date();

      const result = await db.insert(employersTable).values({
        id: employer.id || `EMP-${Date.now()}`,
        establishmentName: employer.establishmentName || '',
        houseStreetVillage: employer.houseStreetVillage,
        barangay: employer.barangay,
        municipality: employer.municipality,
        province: employer.province,
        contactNumber: employer.contactNumber,
        email: employer.email,
        numberOfPaidEmployees: employer.numberOfPaidEmployees,
        numberOfVacantPositions: employer.numberOfVacantPositions,
        industryType: employer.industryType,
        srsSubscriber: employer.srsSubscriber ? 1 : 0,
        companyTin: (employer as any).companyTIN,
        businessPermitNumber: employer.businessPermitNumber,
        bir2303Number: employer.bir2303Number,
        chairpersonName: employer.chairpersonName,
        chairpersonContact: employer.chairpersonContact,
        secretaryName: employer.secretaryName,
        secretaryContact: employer.secretaryContact,
        preparedByName: employer.preparedByName,
        preparedByDesignation: employer.preparedByDesignation,
        preparedByContact: employer.preparedByContact,
        dateAccomplished: employer.dateAccomplished,
        remarks: employer.remarks,
        isManpowerAgency: employer.isManpowerAgency ? 1 : 0,
        doleCertificationNumber: employer.doleCertificationNumber,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error adding employer:', error);
      throw error;
    }
  }

  async getEmployers(): Promise<Employer[]> {
    try {
      const db = await this.getDb();
      const employers = await db.select().from(employersTable);

      return employers.map((e: any) => {
        // Safely format createdAt
        let createdAt = e.createdAt;
        if (createdAt instanceof Date) {
          try {
            const time = createdAt.getTime();
            createdAt = isNaN(time) ? new Date().toISOString() : createdAt.toISOString();
          } catch (err) {
            createdAt = new Date().toISOString();
          }
        } else if (typeof createdAt === 'number') {
          const date = new Date(createdAt);
          try {
            createdAt = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          } catch (err) {
            createdAt = new Date().toISOString();
          }
        } else if (typeof createdAt === 'string') {
          // Validate string date
          const parsed = new Date(createdAt);
          try {
            createdAt = isNaN(parsed.getTime()) ? new Date().toISOString() : createdAt;
          } catch (err) {
            createdAt = new Date().toISOString();
          }
        } else {
          createdAt = new Date().toISOString();
        }

        return {
          id: e.id,
          establishmentName: e.establishmentName,
          houseStreetVillage: e.houseStreetVillage,
          barangay: e.barangay,
          municipality: e.municipality,
          province: e.province,
          contactNumber: e.contactNumber,
          email: e.email,
          numberOfPaidEmployees: e.numberOfPaidEmployees,
          numberOfVacantPositions: e.numberOfVacantPositions,
          industryType: e.industryType,
          srsSubscriber: !!e.srsSubscriber,
          companyTin: e.companyTin,
          businessPermitNumber: e.businessPermitNumber,
          bir2303Number: e.bir2303Number,
          chairpersonName: e.chairpersonName,
          chairpersonContact: e.chairpersonContact,
          secretaryName: e.secretaryName,
          secretaryContact: e.secretaryContact,
          preparedByName: e.preparedByName,
          preparedByDesignation: e.preparedByDesignation,
          preparedByContact: e.preparedByContact,
          dateAccomplished: e.dateAccomplished,
          remarks: e.remarks,
          isManpowerAgency: !!e.isManpowerAgency,
          doleCertificationNumber: e.doleCertificationNumber,
          createdAt,
        };
      });
    } catch (error) {
      console.error('Error getting employers:', error);
      return [];
    }
  }

  async addJobPost(
    employerId: string,
    company: string,
    payload: {
      employerId: string;
      status?: "active" | "draft" | "closed";
      positionTitle: string;
      description: string;
      location: string;
      salaryPeriod: "monthly" | "hourly" | "daily" | "weekly" | "15days";
      salaryMin?: number;
      salaryMax?: number;
      salaryAmount?: number;
      salaryType?: string;
      jobStatus?: string;
      minimumEducation?: string;
      yearsOfExperience?: number;
      skills?: string;
    }
  ): Promise<Job> {
    try {
      const db = await this.getDb();
      const id = `JOB-${Date.now()}`;
      const now = new Date();
      await db.insert(jobsTable).values({
        id,
        employerId,
        positionTitle: payload.positionTitle,
        description: payload.description,
        location: payload.location,
        salaryMin: payload.salaryMin,
        salaryMax: payload.salaryMax,
        salaryPeriod: payload.salaryPeriod,
        salaryAmount: payload.salaryAmount,
        salaryType: payload.salaryType,
        jobStatus: payload.jobStatus,
        minimumEducation: payload.minimumEducation,
        yearsOfExperience: payload.yearsOfExperience,
        skills: payload.skills,
        status: payload.status,
        archived: false,
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id,
        employerId,
        company: company || "",
        title: payload.positionTitle,
        positionTitle: payload.positionTitle,
        description: payload.description,
        location: payload.location,
        salaryMin: payload.salaryMin,
        salaryMax: payload.salaryMax,
        salaryPeriod: payload.salaryPeriod,
        salaryAmount: payload.salaryAmount,
        salaryType: payload.salaryType,
        jobStatus: payload.jobStatus,
        minimumEducation: payload.minimumEducation,
        yearsOfExperience: payload.yearsOfExperience,
        skills: payload.skills,
        status: payload.status,
        archived: false,
        archivedAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    } catch (error) {
      console.error('Error adding job post:', error);
      throw error;
    }
  }

  async addJobPostFull(jobData: any): Promise<any> {
    try {
      const db = await this.getDb();
      const id = jobData.id || `JOB-${Date.now()}`;
      const now = new Date();

      const result = await db.insert(jobsTable).values({
        id,
        employerId: jobData.employerId,
        positionTitle: jobData.positionTitle,
        description: jobData.description,
        location: jobData.location,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error adding full job post:', error);
      throw error;
    }
  }

  async getJobPosts(): Promise<JobPost[]> {
    try {
      const db = await this.getDb();
      const jobs = await db.select().from(jobsTable);
      const employers = await db.select().from(employersTable);

      return jobs.map((j: any) => {
        let createdAt = j.createdAt;
        if (createdAt instanceof Date) {
          try {
            const time = createdAt.getTime();
            createdAt = isNaN(time) ? new Date().toISOString() : createdAt.toISOString();
          } catch (err) {
            createdAt = new Date().toISOString();
          }
        } else if (typeof createdAt === 'number') {
          const date = new Date(createdAt);
          try {
            createdAt = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          } catch (err) {
            createdAt = new Date().toISOString();
          }
        } else if (typeof createdAt === 'string') {
          if (!createdAt.includes('T')) {
            const parsed = new Date(createdAt);
            try {
              createdAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
            } catch (err) {
              createdAt = new Date().toISOString();
            }
          }
        } else {
          createdAt = new Date().toISOString();
        }

        const employerName = employers.find((e: any) => e.id === j.employerId)?.establishmentName || "";

        return {
          id: j.id,
          positionTitle: j.positionTitle,
          description: j.description,
          location: j.location,
          employerId: j.employerId,
          employerName,
          company: employerName,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          createdAt,
          archived: j.archived || false,
          archivedAt: j.archivedAt,
        };
      });
    } catch (error) {
      console.error('Error getting job posts:', error);
      return [];
    }
  }

  async deleteJobPost(jobId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.delete(jobsTable).where(eq(jobsTable.id, jobId));
    } catch (error) {
      console.error('Error deleting job post:', error);
      throw error;
    }
  }

  async saveJobs(jobs: any[]): Promise<void> {
    // This method is no longer needed with database storage
    // Jobs are automatically persisted to database
    console.log('saveJobs called - jobs are persisted to database automatically');
  }

  async applyToJob(
    jobId: string, 
    applicant: { id: string; name: string }, 
    coverLetter?: string
  ): Promise<Application> {
    try {
      const db = await this.getDb();
      const id = `APP-${Date.now()}`;
      const now = new Date();

      await db.insert(applicationsTable).values({
        id,
        jobId,
        applicantId: applicant.id,
        applicantName: applicant.name,
        coverLetter: coverLetter || null,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });

      return {
        id,
        jobId,
        applicantId: applicant.id,
        applicantName: applicant.name,
        status: 'pending',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as unknown as Application;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  async getApplicationsByJobseeker(applicantId: string): Promise<any[]> {
    try {
      // Use shared database singleton for consistency with routes
      const db = await this.getDb();
      const applications = await db
        .select()
        .from(applicationsTable)
        .where(eq(applicationsTable.applicantId, applicantId));

      const jobs = await db.select().from(jobsTable);
      const vacancies: any[] = [];
      const employers = await db.select().from(employersTable);

      return applications.map((a: any) => {
        const job = jobs.find((j: any) => j.id === a.jobId);
        const vacancy = vacancies.find((v: any) => v.id === a.jobId);

        let title = 'Unknown Job';
        let location: string | undefined = undefined;
        let employerId: string | undefined = undefined;
        let employerName: string | undefined = undefined;

        if (job) {
          title = job.title || title;
          location = job.location || location;
          employerId = job.employerId;
        } else if (vacancy) {
          title = vacancy.positionTitle || title;
          // Prefer explicit location; fallback to establishment name
          location = vacancy.municipality || vacancy.establishmentName || location;
          employerId = vacancy.employerId;
          employerName = vacancy.establishmentName;
        }

        const employer = employers.find((e: any) => e.id === employerId);
        const company = employer?.establishmentName || employerName || 'Unknown';

        let createdAt: any = a.createdAt;
        if (createdAt instanceof Date) {
          try {
            createdAt = createdAt.toISOString();
          } catch {
            createdAt = new Date().toISOString();
          }
        } else if (typeof createdAt === 'number') {
          const d = new Date(createdAt);
          createdAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }

        return {
          id: a.id,
          job: {
            title,
            location: location || '-',
            employer: { company },
          },
          status: (a.status || 'pending').toLowerCase(),
          createdAt,
        };
      });
    } catch (error) {
      console.error('Error getting applications by jobseeker:', error);
      return [];
    }
  }

  async getApplicantsForJob(jobId: string): Promise<Application[]> {
    try {
      const db = await this.getDb();
      const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));

      return applications.map((a: any) => ({
        id: a.id,
        jobId: a.jobId,
        applicantId: a.jobseekerEmail,
        applicantName: '',
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
      }));
    } catch (error) {
      console.error('Error getting applicants for job:', error);
      return [];
    }
  }

  async addAdmin(payload: { name: string; email: string; passwordHash?: string; role?: string }): Promise<any> {
    try {
      const db = await this.getDb();
      const id = `ADM-${Date.now()}`;
      const now = new Date();
      const role = payload.role && typeof payload.role === 'string' ? payload.role : 'admin';

      const result = await db.insert(adminsTable).values({
        id,
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash || '',
        role,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return {
        id,
        name: payload.name,
        email: payload.email,
        role,
        createdAt: now.toISOString(),
      };
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  }

  async getAdmins(): Promise<any[]> {
    try {
      const db = await this.getDb();
      const admins = await db.select().from(adminsTable);

      return admins.map((a: any) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
      }));
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  async addApplicant(applicant: Applicant): Promise<Applicant> {
    try {
      const db = await this.getDb();
      const id = applicant.id || `APP-${Date.now()}`;
      const now = new Date();
      const passwordHash = (applicant as any).passwordHash ?? (applicant as any).password ?? "";
      const hasAccount = (applicant as any).hasAccount ?? false;
      const role = (applicant as any).role || "jobseeker";

      const result = await db.insert(usersTable).values({
        id,
        surname: applicant.surname || '',
        firstName: applicant.firstName || '',
        middleName: applicant.middleName,
        suffix: applicant.suffix,
        dateOfBirth: applicant.dateOfBirth,
        sex: applicant.sex,
        religion: applicant.religion,
        civilStatus: applicant.civilStatus,
        height: applicant.height,
        contactNumber: applicant.contactNumber,
        email: applicant.email,
        passwordHash,
        role,
        disability: applicant.disability,
        houseStreetVillage: applicant.houseStreetVillage || '',
        barangay: applicant.barangay,
        municipality: applicant.municipality,
        province: applicant.province,
        employmentStatus: applicant.employmentStatus,
        employmentStatusDetail: applicant.employmentStatusDetail,
        selfEmployedCategory: applicant.selfEmployedCategory,
        selfEmployedCategoryOther: applicant.selfEmployedCategoryOther,
        unemployedReason: applicant.unemployedReason,
        unemployedReasonOther: applicant.unemployedReasonOther,
        unemployedAbroadCountry: applicant.unemployedAbroadCountry,
        employmentType: applicant.employmentType,
        isOFW: applicant.isOFW ? 1 : 0,
        is4PSBeneficiary: applicant.is4PSBeneficiary ? 1 : 0,
        education: applicant.education,
        technicalTraining: applicant.technicalTraining,
        languageProficiency: applicant.languageProficiency,
        workExperience: applicant.workExperience,
        skills: applicant.skills,
        otherSkills: applicant.otherSkills,
        otherSkillsTraining: applicant.otherSkillsTraining,
        otherSkillsSpecify: applicant.otherSkillsSpecify,
        hasAccount,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error adding applicant:', error);
      throw error;
    }
  }

  async updateApplicant(id: string, updates: Partial<Applicant>): Promise<Applicant | null> {
    try {
      const db = await this.getDb();
      const now = new Date();
      const normalized = normalizeApplicantForDb(updates);
      const updateResult = await db.update(usersTable)
        .set({ ...normalized, updatedAt: now })
        .where(eq(usersTable.id, id));
      if (updateResult.changes === 0) return null;
      const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, id));
      return updated || null;
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  }

  async updateEmployer(id: string, updates: Partial<Employer>): Promise<Employer | null> {
    try {
      const db = await this.getDb();
      const now = new Date();
      const updateResult = await db.update(employersTable)
        .set({ ...updates, updatedAt: now })
        .where(eq(employersTable.id, id));
      if (updateResult.changes === 0) return null;
      const [updated] = await db.select().from(employersTable).where(eq(employersTable.id, id));
      return updated || null;
    } catch (error) {
      console.error('Error updating employer:', error);
      throw error;
    }
  }

  async getApplicants(): Promise<Applicant[]> {
    try {
      const db = await this.getDb();
      const applicants = await db.select().from(usersTable);

      return applicants.map((a: any) => ({
        id: a.id,
        surname: a.surname || "",
        firstName: a.firstName || "",
        middleName: a.middleName || "",
        suffix: a.suffix,
        dateOfBirth: a.dateOfBirth,
        sex: a.sex,
        religion: a.religion,
        civilStatus: a.civilStatus,
        height: a.height,
        contactNumber: a.contactNumber,
        email: a.email,
        disability: a.disability,
        houseStreetVillage: a.houseStreetVillage,
        barangay: a.barangay,
        municipality: a.municipality,
        province: a.province,
        employmentStatus: a.employmentStatus,
        employmentStatusDetail: a.employmentStatusDetail,
        selfEmployedCategory: a.selfEmployedCategory,
        selfEmployedCategoryOther: a.selfEmployedCategoryOther,
        unemployedReason: a.unemployedReason,
        unemployedReasonOther: a.unemployedReasonOther,
        unemployedAbroadCountry: a.unemployedAbroadCountry,
        employmentType: a.employmentType,
        isOFW: !!(a.isOFW),
        is4PSBeneficiary: !!(a.is4PSBeneficiary),
        education: a.education,
        technicalTraining: a.technicalTraining,
        languageProficiency: a.languageProficiency,
        workExperience: a.workExperience,
        skills: a.skills,
        otherSkills: a.otherSkills,
        otherSkillsTraining: a.otherSkillsTraining,
        otherSkillsSpecify: a.otherSkillsSpecify,
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
      }));
    } catch (error) {
      console.error('Error getting applicants:', error);
      return [];
    }
  }

  async deleteApplicant(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.delete(usersTable).where(eq(usersTable.id, id));
    } catch (error) {
      console.error('Error deleting applicant:', error);
      throw error;
    }
  }

  async deleteApplicants(ids: string[]): Promise<void> {
    try {
      const db = await this.getDb();
      for (const id of ids) {
        await db.delete(usersTable).where(eq(usersTable.id, id));
      }
    } catch (error) {
      console.error('Error deleting applicants:', error);
      throw error;
    }
  }

  // Removed: addJobVacancy, getJobVacancies

  async addAdminAccessRequest(request: { name: string; email: string; phone: string; organization: string; adminType?: string }): Promise<any> {
    const db = await this.getDb();
    const id = `REQ-${Date.now()}`;
    const now = new Date();
    const newRequest = {
      id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      organization: request.organization,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(adminAccessRequestsTable).values(newRequest);
    return newRequest;
  }

  async getAdminAccessRequests(): Promise<any[]> {
    const db = await this.getDb();
    const rows = await db.select().from(adminAccessRequestsTable);
    return rows;
  }

  async updateAdminAccessRequest(id: string, updates: { status: string }): Promise<any> {
    const db = await this.getDb();
    const now = new Date();
    await db.update(adminAccessRequestsTable)
      .set({ ...updates, updatedAt: now })
      .where(eq(adminAccessRequestsTable.id, id));
    // Return the updated row
    const [updated] = await db.select().from(adminAccessRequestsTable).where(eq(adminAccessRequestsTable.id, id));
    return updated;
  }

  /**
   * Returns a report of the top 20 most common skills and a list of rarest (expected shortage) skills among applicants.
   */
  async getSkillsReport(startDate?: string, endDate?: string) {
    const db = await this.getDb();
    const start = startDate ? new Date(`${startDate}T00:00:00`) : undefined;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : undefined;

    const isWithinRange = (rawDate: unknown) => {
      if (!start && !end) return true;
      if (!rawDate) return false;
      const dateValue = rawDate instanceof Date ? rawDate : new Date(rawDate as string);
      if (Number.isNaN(dateValue.getTime())) {
        return false;
      }
      if (start && dateValue < start) {
        return false;
      }
      if (end && dateValue > end) {
        return false;
      }
      return true;
    };

    const normalizeSkill = (skill: string) => skill.replace(/\s+/g, " ").trim();
    const splitSkills = (value: string) =>
      value
        .split(/[,;\n\r/]+/)
        .map((entry) => normalizeSkill(entry))
        .filter(Boolean);

    const extractSkills = (raw: unknown): string[] => {
      if (!raw && raw !== 0) return [];
      if (Array.isArray(raw)) {
        return raw
          .flatMap((entry) => extractSkills(entry))
          .map((entry) => normalizeSkill(String(entry)))
          .filter(Boolean);
      }
      if (typeof raw === "object") {
        return Object.values(raw as Record<string, unknown>).flatMap((entry) => extractSkills(entry));
      }
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return extractSkills(parsed);
          }
        } catch {
          // Not JSON â€“ fall back to delimiter split
        }
        return splitSkills(trimmed);
      }
      return [normalizeSkill(String(raw))].filter(Boolean);
    };

    const [applicantsRaw, jobsRaw] = await Promise.all([
      db.select().from(usersTable),
      db.select().from(jobsTable),
    ]);

    const applicants = applicantsRaw.filter((app: any) =>
      isWithinRange(app.createdAt || app.registeredAt || app.registrationDate)
    );
    const jobs = jobsRaw.filter((job: any) =>
      isWithinRange(job.createdAt || job.dateAccomplished || job.updatedAt)
    );

    const applicantSkillCounts = new Map<string, number>();
    const isPlaceholderOthers = (value: string) => {
      const cleaned = value
        // Strip common invisible characters that can sneak into user inputs.
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      const alphaOnly = cleaned.replace(/[^a-z]/g, "");
      return alphaOnly === "others";
    };

    applicants.forEach((applicant: any) => {
      // Include free-text "Others" entries so the report shows the actual skills,
      // not just the placeholder label.
      const skillsSources = [applicant.skills, applicant.otherSkills, applicant.otherSkillsSpecify];
      skillsSources
        .flatMap((source) => extractSkills(source))
        .forEach((skill) => {
          if (!skill) return;
          if (isPlaceholderOthers(skill)) return;
          applicantSkillCounts.set(skill, (applicantSkillCounts.get(skill) || 0) + 1);
        });
    });

    const jobDemandCounts = new Map<string, number>();
    jobs.forEach((job: any) => {
      const weight = typeof job.vacantPositions === "number" && job.vacantPositions > 0 ? job.vacantPositions : 1;
      const jobSkillSet = new Set(
        [job.skills, job.mainSkillOrSpecialization, job.requirements]
          .flatMap((source) => extractSkills(source))
      );

      jobSkillSet.forEach((skill) => {
        if (!skill) return;
        jobDemandCounts.set(skill, (jobDemandCounts.get(skill) || 0) + weight);
      });
    });

    const topSkills = Array.from(applicantSkillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill, count]) => ({ skill, count }));

    const shortageSkills = Array.from(jobDemandCounts.entries())
      .map(([skill, demand]) => {
        const applicantCount = applicantSkillCounts.get(skill) || 0;
        return { skill, count: Math.max(demand - applicantCount, 0) };
      })
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      topSkills,
      expectedSkillsShortage: shortageSkills,
    };
  }
}

export const storage = new DatabaseStorage();
