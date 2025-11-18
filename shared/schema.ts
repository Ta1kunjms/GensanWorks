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
  jobSeeker: z.array(z.number()),
  freelancer: z.array(z.number()),
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
