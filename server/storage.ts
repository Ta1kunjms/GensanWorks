import type {
  SummaryData,
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
  JobVacancy,
} from "@shared/schema";
import bcrypt from 'bcryptjs';
import { eq, desc, and, or } from 'drizzle-orm';
import { initializeDatabase, getDatabase } from './database';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import {
  adminsTable,
  applicantsTable,
  employersTable,
  jobsTable,
  jobVacanciesTable,
  applicationsTable,
  notesTable,
  referralsTable,
} from './unified-schema';

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
  addJobseeker(payload: { name: string; email: string; role: 'jobseeker' | 'freelancer'; passwordHash: string }): Promise<Jobseeker>;
  getJobseekers(): Promise<Jobseeker[]>;
  addEmployer?(employer: Employer): Promise<Employer>;
  getEmployers?(): Promise<Employer[]>;
  addJobPost(employerId: string, company: string, payload: { title: string; description: string }): Promise<JobPost>;
  addJobPostFull?(jobData: any): Promise<any>;
  getJobPosts(): Promise<JobPost[]>;
  deleteJobPost?(jobId: string): Promise<void>;
  saveJobs?(jobs: any[]): Promise<void>;
  applyToJob(jobId: string, applicant: { id: string; name: string }, coverLetter?: string): Promise<Application>;
  getApplicantsForJob(jobId: string): Promise<Application[]>;
  getApplicationsByJobseeker?(applicantId: string): Promise<any[]>;
  addAdmin(payload: { name: string; email: string; passwordHash?: string }): Promise<any>;
  getAdmins(): Promise<any[]>;
  addApplicant?(applicant: Applicant): Promise<Applicant>;
  getApplicants?(): Promise<Applicant[]>;
  deleteApplicant?(id: string): Promise<void>;
  deleteApplicants?(ids: string[]): Promise<void>;
  addJobVacancy?(vacancy: JobVacancy): Promise<JobVacancy>;
  getJobVacancies?(): Promise<JobVacancy[]>;
  addAdminAccessRequest?(request: { name: string; email: string; phone: string; organization: string }): Promise<any>;
  getAdminAccessRequests?(): Promise<any[]>;
  updateAdminAccessRequest?(id: string, updates: { status: string }): Promise<any>;
  // Auth settings
  getAuthSettings?(): Promise<import("@shared/schema").AuthSettings>;
  updateAuthSettings?(settings: import("@shared/schema").AuthSettings): Promise<import("@shared/schema").AuthSettings>;
}

export class DatabaseStorage implements IStorage {
  private db: any = null;
  private adminAccessRequests: Map<string, any> = new Map();
  private authSettings: import("@shared/schema").AuthSettings = { providers: [] };
  private authSettingsPath = path.join(__dirname, 'data', 'auth-settings.json');

  constructor() {
    // Load persisted auth settings if available
    try {
      if (fs.existsSync(this.authSettingsPath)) {
        const raw = fs.readFileSync(this.authSettingsPath, 'utf-8');
        this.authSettings = JSON.parse(raw);
      }
    } catch (e) {
      console.error('[AuthSettings] Failed to load persisted auth settings:', e);
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

  async getSummaryData(startDate?: string, endDate?: string): Promise<SummaryDataWithHistory> {
    try {
      // Use getDatabase() directly to ensure we get fresh data
      const db = getDatabase();

      let applicants: any[] = [];
      let employers: any[] = [];
      let jobVacancies: any[] = [];
      let jobs: any[] = [];
      let referrals: any[] = [];
      let freelancers = 0;

      try {
        applicants = await db.select().from(applicantsTable);
        employers = await db.select().from(employersTable);
        jobVacancies = await db.select().from(jobVacanciesTable);
        jobs = await db.select().from(jobsTable);

        // Count freelancers from applicants table
        const freelancerApplicants = await db.select().from(applicantsTable).where(eq(applicantsTable.role, 'freelancer'));
        freelancers = freelancerApplicants.length;
      } catch (e) {
        console.error('[getSummaryData] Error fetching from database:', e);
      }

      console.log(`[getSummaryData] Raw data: ${applicants.length} applicants, ${employers.length} employers, ${jobs.length} jobs, ${jobVacancies.length} vacancies`);
      console.log(`[getSummaryData] startDate=${startDate}, endDate=${endDate}`);

      // Filter by date range if provided
      if (startDate && endDate) {
        // Parse dates as UTC to avoid timezone issues
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');

        console.log(`[getSummaryData] Filtering by date range: ${startDate} to ${endDate}`);
        console.log(`[getSummaryData] Date range: ${start.toISOString()} to ${end.toISOString()}`);
        console.log(`[getSummaryData] Before filter: ${applicants.length} applicants, ${employers.length} employers, ${jobs.length} jobs, ${jobVacancies.length} vacancies`);

        applicants = applicants.filter(app => {
          if (!app.createdAt) {
            console.log(`[getSummaryData] Applicant ${app.id} has no createdAt - excluding`);
            return false; // Exclude items without dates
          }
          try {
            const createdDate = new Date(app.createdAt);
            const isValid = !isNaN(createdDate.getTime());
            if (!isValid) {
              console.log(`[getSummaryData] Applicant ${app.id} has invalid date ${app.createdAt} - excluding`);
              return false; // Invalid date, exclude it
            }
            const passes = createdDate >= start && createdDate <= end;
            console.log(`[getSummaryData] Applicant ${app.id} created at ${createdDate.toISOString()} - passes=${passes} (range: ${start.toISOString()} to ${end.toISOString()})`);
            return passes;
          } catch (e) {
            console.log(`[getSummaryData] Applicant ${app.id} error checking date: ${e}`);
            return false; // On error, exclude the item
          }
        });

        jobs = jobs.filter(job => {
          if (!job.createdAt) return false; // Exclude items without dates
          try {
            const createdDate = new Date(job.createdAt);
            const isValid = !isNaN(createdDate.getTime());
            if (!isValid) return false; // Invalid date, exclude it
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false; // On error, exclude the item
          }
        });

        jobVacancies = jobVacancies.filter(vac => {
          // EXCLUDE items without dates when filtering by date range
          if (!vac.createdAt) return false;
          try {
            const createdDate = new Date(vac.createdAt);
            const isValid = !isNaN(createdDate.getTime());
            if (!isValid) return false; // Invalid date, exclude it
            const passes = createdDate >= start && createdDate <= end;
            if (passes) {
              console.log(`[getSummaryData] Vacancy ${vac.id} created at ${createdDate.toISOString()} passes filter`);
            }
            return passes;
          } catch (e) {
            return false; // On error, exclude the item
          }
        });

        // Also filter employers by date range
        employers = employers.filter(emp => {
          // EXCLUDE items without dates when filtering by date range
          if (!emp.createdAt) return false;
          try {
            const createdDate = new Date(emp.createdAt);
            const isValid = !isNaN(createdDate.getTime());
            if (!isValid) return false; // Invalid date, exclude it
            return createdDate >= start && createdDate <= end;
          } catch (e) {
            return false; // On error, exclude the item
          }
        });

        console.log(`[getSummaryData] After filter: ${applicants.length} applicants, ${employers.length} employers, ${jobs.length} jobs, ${jobVacancies.length} vacancies`);
      } else {
        console.log(`[getSummaryData] NO date filter applied - using all data`);
      }

      const totalApplicants = applicants?.length || 0;
      const activeEmployers = employers?.length || 0;

      // Count ALL vacancies (including archived ones)
      // Only deleted (permanently removed) vacancies will reduce the count
      const allVacancies = jobVacancies || [];

      // Count ALL legacy jobs (including archived/inactive)
      const allJobs = jobs || [];

      const totalJobPosts = allJobs.length + allVacancies.length;

      console.log(`[getSummaryData] Final counts: ${totalApplicants} applicants, ${activeEmployers} employers, ${totalJobPosts} total job posts (${allJobs.length} jobs + ${allVacancies.length} vacancies including archived)`);

      // Count 4Ps beneficiaries and OFW applicants
      const fourPsBeneficiaries = applicants.filter((a: any) => a.is4psBeneficiary === true || a.is4psBeneficiary === 1).length;
      const ofwApplicants = applicants.filter((a: any) => a.isOfw === true || a.isOfw === 1 || a.isFormerOfw === true || a.isFormerOfw === 1).length;

      console.log(`[getSummaryData] 4Ps: ${fourPsBeneficiaries}, OFW: ${ofwApplicants}`);

      return {
        totalApplicants: this.base(totalApplicants),
        activeEmployers: this.base(activeEmployers),
        activeJobPosts: this.base(totalJobPosts),
        pendingEmployerFeedback: this.base(0),
        successfulReferrals: this.base(0),
        activeFreelancers: this.base(freelancers),
        fourPsBeneficiaries: this.base(fourPsBeneficiaries),
        ofwApplicants: this.base(ofwApplicants),
      };
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

  async getAuthSettings(): Promise<import("@shared/schema").AuthSettings> {
    // Always reload from disk in case of external edits
    try {
      if (fs.existsSync(this.authSettingsPath)) {
        const raw = fs.readFileSync(this.authSettingsPath, 'utf-8');
        this.authSettings = JSON.parse(raw);
      }
    } catch (e) {
      console.error('[AuthSettings] Failed to reload auth settings:', e);
    }
    return this.authSettings;
  }

  async updateAuthSettings(settings: import("@shared/schema").AuthSettings): Promise<import("@shared/schema").AuthSettings> {
    this.authSettings = settings;
    try {
      fs.writeFileSync(this.authSettingsPath, JSON.stringify(this.authSettings, null, 2), 'utf-8');
    } catch (e) {
      console.error('[AuthSettings] Failed to persist auth settings:', e);
    }
    return this.authSettings;
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const db = await this.getDb();
      const activities: RecentActivity[] = [];

      // Recent applicants
      const recentApplicants = await db.select().from(applicantsTable).orderBy(desc(applicantsTable.createdAt)).limit(10);
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
      const recentVacancies = await db.select().from(jobVacanciesTable).orderBy(desc(jobVacanciesTable.createdAt)).limit(10);
      for (const jv of recentVacancies as any[]) {
        activities.push({
          id: `vacancy-${jv.id}`,
          message: `New job vacancy posted: ${jv.positionTitle}`,
          timestamp: jv.createdAt ? new Date(jv.createdAt).toISOString() : new Date().toISOString(),
        });
      }

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
      let applicants = await db.select().from(applicantsTable);

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
      let applicants = await db.select().from(applicantsTable);

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

      const barangayEmployedCounts = new Map<string, number>();
      const barangayUnemployedCounts = new Map<string, number>();
      const barangaySelfEmployedCounts = new Map<string, number>();
      const barangayNewEntrantCounts = new Map<string, number>();

      for (const barangay of allBarangays) {
        barangayEmployedCounts.set(barangay, 0);
        barangayUnemployedCounts.set(barangay, 0);
        barangaySelfEmployedCounts.set(barangay, 0);
        barangayNewEntrantCounts.set(barangay, 0);
      }

      for (const applicant of applicants) {
        const barangay = applicant.barangay || 'Unknown';
        const status = (applicant.employmentStatus || '').toLowerCase().trim().replace(/[-_]+/g, ' ');

        if (barangayEmployedCounts.has(barangay)) {
          // Match employment status with flexible matching for variations
          // Normalize: remove hyphens, underscores
          if (status.includes('wage') && status.includes('employ')) {
            barangayEmployedCounts.set(barangay, (barangayEmployedCounts.get(barangay) || 0) + 1);
          } else if (status.includes('self') && status.includes('employ')) {
            barangaySelfEmployedCounts.set(barangay, (barangaySelfEmployedCounts.get(barangay) || 0) + 1);
          } else if (status.includes('unemployed') || status.includes('underemployed')) {
            barangayUnemployedCounts.set(barangay, (barangayUnemployedCounts.get(barangay) || 0) + 1);
          } else if (status.includes('new entrant') || status.includes('fresh graduate')) {
            barangayNewEntrantCounts.set(barangay, (barangayNewEntrantCounts.get(barangay) || 0) + 1);
          }
        }
      }

      const barangays = Array.from(barangayEmployedCounts.keys());
      const employed = barangays.map(b => barangayEmployedCounts.get(b) || 0);
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
      let applications = await db.select().from(applicationsTable);

      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate + 'T00:00:00.000Z');
        end = new Date(endDate + 'T23:59:59.999Z');
      } else {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        end = now;
      }

      applications = applications.filter((app: any) => {
        const createdDate = app.createdAt ? new Date(app.createdAt) : null;
        return createdDate && createdDate >= start && createdDate <= end;
      });

      const months: string[] = [];
      const referred: number[] = [];
      const hired: number[] = [];
      const feedback: number[] = [];

      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        const dt = new Date(start);
        months.push(dt.toLocaleString('default', { month: 'short', day: 'numeric' }));
        referred.push(0);
        hired.push(0);
        feedback.push(0);
      } else if (daysDiff <= 7) {
        for (let i = 0; i <= daysDiff; i++) {
          const dt = new Date(start);
          dt.setDate(dt.getDate() + i);
          months.push(dt.toLocaleString('default', { month: 'short', day: 'numeric' }));
          referred.push(0);
          hired.push(0);
          feedback.push(0);
        }
      } else if (daysDiff <= 31) {
        const currentDate = new Date(start);
        while (currentDate <= end) {
          const weekStart = new Date(currentDate);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const label = `${weekStart.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
          months.push(label);
          referred.push(0);
          hired.push(0);
          feedback.push(0);

          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (daysDiff <= 365) {
        const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
          const label = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
          months.push(label);
          referred.push(0);
          hired.push(0);
          feedback.push(0);

          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else {
        const currentDate = new Date(start.getFullYear(), 0, 1);
        while (currentDate <= end) {
          const label = currentDate.toLocaleString('default', { year: 'numeric' });
          months.push(label);
          referred.push(0);
          hired.push(0);
          feedback.push(0);

          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }

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
        referred: [0, 0, 0, 0, 0, 0],
        hired: [0, 0, 0, 0, 0, 0],
        feedback: [0, 0, 0, 0, 0, 0],
      };
    }
  }

  async getReferrals(filters?: ReferralFilters): Promise<Referral[]> {
    try {
      const db = await this.getDb();
      const applications = await db.select().from(applicationsTable);
      const jobs = await db.select().from(jobsTable);
      const employers = await db.select().from(employersTable);
      const jobVacancies = await db.select().from(jobVacanciesTable);

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

      const result = await db.insert(applicantsTable).values({
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
      const users = await db.select().from(applicantsTable).where(
        and(
          eq(applicantsTable.hasAccount, true),
          or(
            eq(applicantsTable.role, 'jobseeker'),
            eq(applicantsTable.role, 'freelancer')
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
        numberOfVacantPositions: employer.numberOfPaidPositions || employer.numberOfVacantPositions,
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

  async addJobPost(employerId: string, company: string, payload: { title: string; description: string }): Promise<JobPost> {
    try {
      const db = await this.getDb();
      const id = `JOB-${Date.now()}`;
      const now = new Date();

      await db.insert(jobsTable).values({
        id,
        employerId,
        title: payload.title,
        description: payload.description,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id,
        title: payload.title,
        description: payload.description,
        employerId,
        company,
        createdAt: now.toISOString(),
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
        title: jobData.title,
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
        const employer = employers.find((e: any) => e.id === j.employerId);
        const employerName = employer?.establishmentName || 'Unknown Employer';

        // Safely format createdAt
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

        return {
          id: j.id,
          title: j.title,
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
      const db = getDatabase();
      const applications = await db
        .select()
        .from(applicationsTable)
        .where(eq(applicationsTable.applicantId, applicantId));

      const jobs = await db.select().from(jobsTable);
      const vacancies = await db.select().from(jobVacanciesTable);
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

  async addAdmin(payload: { name: string; email: string; passwordHash?: string }): Promise<any> {
    try {
      const db = await this.getDb();
      const id = `ADM-${Date.now()}`;
      const now = new Date();

      const result = await db.insert(adminsTable).values({
        id,
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash || '',
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      }).returning();

      return {
        id,
        name: payload.name,
        email: payload.email,
        role: 'admin',
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

      const result = await db.insert(applicantsTable).values({
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
        disability: applicant.disability,
        houseStreetVillage: applicant.houseStreetVillage || '',
        barangay: applicant.barangay,
        municipality: applicant.municipality,
        province: applicant.province,
        employmentStatus: applicant.employmentStatus,
        employmentType: applicant.employmentType,
        isOFW: applicant.isOFW ? 1 : 0,
        is4PSBeneficiary: applicant.is4PSBeneficiary ? 1 : 0,
        education: applicant.education,
        technicalTraining: applicant.technicalTraining,
        languageProficiency: applicant.languageProficiency,
        workExperience: applicant.workExperience,
        otherSkills: applicant.otherSkills,
        otherSkillsSpecify: applicant.otherSkillsSpecify,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error adding applicant:', error);
      throw error;
    }
  }

  async getApplicants(): Promise<Applicant[]> {
    try {
      const db = await this.getDb();
      const applicants = await db.select().from(applicantsTable);

      return applicants.map((a: any) => ({
        id: a.id,
        surname: a.surname,
        firstName: a.firstName,
        middleName: a.middleName,
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
        employmentType: a.employmentType,
        isOFW: !!a.isOFW,
        is4PSBeneficiary: !!a.is4PSBeneficiary,
        education: a.education,
        technicalTraining: a.technicalTraining,
        languageProficiency: a.languageProficiency,
        workExperience: a.workExperience,
        otherSkills: a.otherSkills,
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
      await db.delete(applicantsTable).where(eq(applicantsTable.id, id));
    } catch (error) {
      console.error('Error deleting applicant:', error);
      throw error;
    }
  }

  async deleteApplicants(ids: string[]): Promise<void> {
    try {
      const db = await this.getDb();
      for (const id of ids) {
        await db.delete(applicantsTable).where(eq(applicantsTable.id, id));
      }
    } catch (error) {
      console.error('Error deleting applicants:', error);
      throw error;
    }
  }

  async addJobVacancy(vacancy: JobVacancy): Promise<JobVacancy> {
    try {
      const db = await this.getDb();
      const id = vacancy.id || `VAC-${Date.now()}`;
      const now = new Date();

      const result = await db.insert(jobVacanciesTable).values({
        id,
        employerId: vacancy.employerId || '',
        establishmentName: vacancy.establishmentName || '',
        positionTitle: vacancy.positionTitle || '',
        // Use compatible fields from unified schema
        industryCodes: (vacancy as any).industryCodes || null,
        minimumEducationRequired: vacancy.minimumEducationRequired,
        mainSkillOrSpecialization: (vacancy as any).mainSkillOrSpecialization || null,
        yearsOfExperienceRequired: (vacancy as any).yearsOfExperienceRequired || null,
        agePreference: (vacancy as any).agePreference || null,
        startingSalaryOrWage: (vacancy as any).startingSalaryOrWage || null,
        vacantPositions: (vacancy as any).vacantPositions || (vacancy as any).numberOfVacancies || null,
        paidEmployees: (vacancy as any).paidEmployees || null,
        jobStatus: (vacancy as any).jobStatus || null,
        preparedByName: (vacancy as any).preparedByName || null,
        preparedByDesignation: (vacancy as any).preparedByDesignation || null,
        preparedByContact: (vacancy as any).preparedByContact || null,
        dateAccomplished: (vacancy as any).dateAccomplished || null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error adding job vacancy:', error);
      throw error;
    }
  }

  async getJobVacancies(): Promise<JobVacancy[]> {
    try {
      const db = await this.getDb();
      const vacancies = await db.select().from(jobVacanciesTable);

      return vacancies.map((v: any) => ({
        id: v.id,
        employerId: v.employerId,
        establishmentName: v.establishmentName,
        positionTitle: v.positionTitle,
        numberOfVacancies: v.numberOfVacancies,
        industryType: v.industryType,
        minimumEducationRequired: v.minimumEducationRequired,
        mainSkillOrSpecialization: v.mainSkillOrSpecialization,
        yearsOfExperienceRequired: v.yearsOfExperienceRequired,
        agePreference: v.agePreference,
        startingSalaryOrWage: v.startingSalaryOrWage,
        salaryType: v.salaryType,
        jobStatus: v.jobStatus,
        benefits: v.benefits,
        additionalRequirements: v.additionalRequirements,
        jobDescription: v.jobDescription,
        preparedByName: v.preparedByName,
        preparedByDesignation: v.preparedByDesignation,
        preparedByContact: v.preparedByContact,
        dateAccomplished: v.dateAccomplished,
        createdAt: v.createdAt?.toISOString?.() || v.createdAt,
      }));
    } catch (error) {
      console.error('Error getting job vacancies:', error);
      return [];
    }
  }

  async addAdminAccessRequest(request: { name: string; email: string; phone: string; organization: string; adminType?: string }): Promise<any> {
    const id = `REQ-${Date.now()}`;
    const newRequest = {
      id,
      ...request,
      adminType: request.adminType || 'general_admin',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.adminAccessRequests.set(id, newRequest);
    return newRequest;
  }

  async getAdminAccessRequests(): Promise<any[]> {
    return Array.from(this.adminAccessRequests.values());
  }

  async updateAdminAccessRequest(id: string, updates: { status: string }): Promise<any> {
    const request = this.adminAccessRequests.get(id);
    if (!request) return null;
    const updated = { ...request, ...updates };
    this.adminAccessRequests.set(id, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();
