import type {
  SummaryData,
  RecentActivity,
  BarChartData,
  DoughnutChartData,
  LineChartData,
  Referral,
  ReferralFilters,
} from "@shared/schema";

// Extended summary card with historical data
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
}

export interface IStorage {
  getSummaryData(): Promise<SummaryDataWithHistory>;
  getRecentActivities(): Promise<RecentActivity[]>;
  getBarChartData(): Promise<BarChartData>;
  getDoughnutChartData(): Promise<DoughnutChartData>;
  getLineChartData(): Promise<LineChartData>;
  getReferrals(filters?: ReferralFilters): Promise<Referral[]>;
}

export class MemStorage implements IStorage {
  private summaryData: SummaryDataWithHistory;
  private recentActivities: RecentActivity[];
  private barChartData: BarChartData;
  private doughnutChartData: DoughnutChartData;
  private lineChartData: LineChartData;
  private referrals: Referral[];

  constructor() {
    // Initialize with seed data matching exact specification
    this.summaryData = {
      totalApplicants: {
        value: 1318,
        change: 4.2,
        trend: "up",
        history: [1200, 1220, 1250, 1270, 1285, 1300, 1318],
      },
      activeEmployers: {
        value: 119,
        change: 1.2,
        trend: "up",
        history: [112, 114, 115, 116, 117, 118, 119],
      },
      activeJobPosts: {
        value: 36,
        change: -2.6,
        trend: "down",
        history: [42, 41, 40, 39, 38, 37, 36],
      },
      pendingEmployerFeedback: {
        value: 13,
        change: 7.8,
        trend: "up",
        history: [10, 11, 11, 12, 12, 13, 13],
      },
      successfulReferrals: {
        value: 713,
        change: 52.7,
        trend: "up",
        history: [520, 560, 600, 640, 670, 690, 713],
      },
      activeFreelancers: {
        value: 47,
        change: 3.1,
        trend: "up",
        history: [42, 43, 44, 45, 46, 46, 47],
      },
    };

    this.recentActivities = [
      {
        id: "1",
        message: "New applicant from Labangal registered",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        message: "Employer ABC posted 3 new vacancies",
        timestamp: new Date().toISOString(),
      },
      {
        id: "3",
        message: "Referral slip issued to Maria Santos",
        timestamp: new Date().toISOString(),
      },
      {
        id: "4",
        message: "Interview scheduled for Juan Dela Cruz",
        timestamp: new Date().toISOString(),
      },
      {
        id: "5",
        message: "New employer registration from Tech Corp",
        timestamp: new Date().toISOString(),
      },
    ];

    this.barChartData = {
      barangays: [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
      ],
      jobSeeker: [
        12, 20, 18, 25, 70, 80, 90, 85, 78, 66, 60, 58, 50, 48, 45,
        40, 35, 30, 28, 26, 22, 18, 15, 12, 10, 8,
      ],
      freelancer: [
        1, 2, 1, 0, 3, 4, 5, 4, 3, 2, 2, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    };

    this.doughnutChartData = {
      jobSeeker: 1271,
      freelancer: 47,
    };

    this.lineChartData = {
      months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
      referred: [120, 130, 110, 140, 150, 160, 170, 155, 140, 130, 125, 135],
      hired: [40, 45, 50, 55, 60, 90, 100, 95, 80, 75, 70, 85],
      feedback: [10, 12, 11, 14, 20, 25, 30, 28, 20, 18, 17, 22],
    };

    this.referrals = [
      {
        referralId: "RFL-2025-0112",
        applicant: "Ren Paulo Galas",
        vacancy: "Office Staff",
        employer: "Jaro Construction & Supply",
        dateReferred: "2025-10-27",
        status: "Hired",
        statusColor: "#12B76A",
        feedback: "Excellent fit — already started on Nov 2.",
      },
      {
        referralId: "RFL-2025-0113",
        applicant: "Maria Teresa Santos",
        vacancy: "Customer Service Representative",
        employer: "GenSan Tech Solutions",
        dateReferred: "2025-10-28",
        status: "For Interview",
        statusColor: "#2E7FFB",
        feedback: "Interview scheduled for next week.",
      },
      {
        referralId: "RFL-2025-0114",
        applicant: "Juan Carlos Mendoza",
        vacancy: "Warehouse Staff",
        employer: "Metro Logistics Inc.",
        dateReferred: "2025-10-29",
        status: "Pending",
        statusColor: "#FF9500",
        feedback: "Awaiting employer response.",
      },
      {
        referralId: "RFL-2025-0115",
        applicant: "Anna Marie Cruz",
        vacancy: "Sales Associate",
        employer: "Retail Plus Corporation",
        dateReferred: "2025-10-30",
        status: "Rejected",
        statusColor: "#F04438",
        feedback: "Position already filled by another candidate.",
      },
      {
        referralId: "RFL-2025-0116",
        applicant: "Roberto Dela Rosa",
        vacancy: "Security Guard",
        employer: "SafeGuard Security Services",
        dateReferred: "2025-10-31",
        status: "Hired",
        statusColor: "#12B76A",
        feedback: "Started immediately. Performing well.",
      },
      {
        referralId: "RFL-2025-0117",
        applicant: "Elena Beatriz Fernandez",
        vacancy: "Accounting Clerk",
        employer: "ABC Accounting Firm",
        dateReferred: "2025-11-01",
        status: "For Interview",
        statusColor: "#2E7FFB",
        feedback: "Second round interview next Monday.",
      },
      {
        referralId: "RFL-2025-0118",
        applicant: "Miguel Angel Reyes",
        vacancy: "Delivery Driver",
        employer: "Fast Courier Services",
        dateReferred: "2025-11-02",
        status: "Withdrawn",
        statusColor: "#6B7280",
        feedback: "Applicant accepted another job offer.",
      },
      {
        referralId: "RFL-2025-0119",
        applicant: "Sofia Isabel Garcia",
        vacancy: "Marketing Assistant",
        employer: "Creative Marketing Agency",
        dateReferred: "2025-11-03",
        status: "Pending",
        statusColor: "#FF9500",
        feedback: "Documents under review.",
      },
      {
        referralId: "RFL-2025-0120",
        applicant: "Carlos Eduardo Torres",
        vacancy: "IT Support Specialist",
        employer: "TechSolutions Philippines",
        dateReferred: "2025-11-04",
        status: "Hired",
        statusColor: "#12B76A",
        feedback: "Outstanding technical skills. Started last week.",
      },
      {
        referralId: "RFL-2025-0121",
        applicant: "Diana Rose Santiago",
        vacancy: "HR Assistant",
        employer: "People First HR Consultancy",
        dateReferred: "2025-11-05",
        status: "For Interview",
        statusColor: "#2E7FFB",
        feedback: "Preliminary interview completed successfully.",
      },
    ];
  }

  async getSummaryData(): Promise<SummaryDataWithHistory> {
    return this.summaryData;
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.recentActivities;
  }

  async getBarChartData(): Promise<BarChartData> {
    return this.barChartData;
  }

  async getDoughnutChartData(): Promise<DoughnutChartData> {
    return this.doughnutChartData;
  }

  async getLineChartData(): Promise<LineChartData> {
    return this.lineChartData;
  }

  async getReferrals(filters?: ReferralFilters): Promise<Referral[]> {
    let filteredReferrals = [...this.referrals];

    if (filters?.status && filters.status !== "all") {
      // Case-insensitive status filtering
      filteredReferrals = filteredReferrals.filter(
        (r) => r.status.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    if (filters?.limit) {
      filteredReferrals = filteredReferrals.slice(0, filters.limit);
    }

    return filteredReferrals;
  }
}

export const storage = new MemStorage();
