import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCard } from "@/components/summary-card";
import { RecentActivities } from "@/components/recent-activities";
import { ApplicantsByBarangayChart } from "@/components/applicants-by-barangay-chart";
import { JobseekerFreelancerChart } from "@/components/jobseeker-freelancer-chart";
import { MonthlyReferralsChart } from "@/components/monthly-referrals-chart";
import { ReferralTable } from "@/components/referral-table";
import type {
  SummaryData,
  RecentActivity,
  BarChartData,
  DoughnutChartData,
  LineChartData,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: summaryData, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["/api/summary"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ["/api/recent-activities"],
  });

  const { data: barChartData, isLoading: barChartLoading } = useQuery<BarChartData>({
    queryKey: ["/api/charts/bar"],
  });

  const { data: doughnutData, isLoading: doughnutLoading } = useQuery<DoughnutChartData>({
    queryKey: ["/api/charts/doughnut"],
  });

  const { data: lineChartData, isLoading: lineChartLoading } = useQuery<LineChartData>({
    queryKey: ["/api/charts/line"],
  });

  const handleExportCSV = () => {
    toast({
      title: "CSV Exported",
      description: "Referral data has been exported successfully.",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Select Period:</span>
          <span className="text-sm font-semibold text-primary">Month</span>
        </div>

        {/* Summary Cards + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summaryLoading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[160px]" />
                ))}
              </>
            ) : summaryData ? (
              <>
                <SummaryCard
                  title="Total Applicants"
                  data={summaryData.totalApplicants}
                  testId="card-total-applicants"
                />
                <SummaryCard
                  title="Active Employers"
                  data={summaryData.activeEmployers}
                  testId="card-active-employers"
                />
                <SummaryCard
                  title="Active Job Posts"
                  data={summaryData.activeJobPosts}
                  testId="card-active-job-posts"
                />
                <SummaryCard
                  title="Pending Employer Feedback"
                  data={summaryData.pendingEmployerFeedback}
                  testId="card-pending-feedback"
                />
                <SummaryCard
                  title="Successful Referrals (Hired)"
                  data={summaryData.successfulReferrals}
                  testId="card-successful-referrals"
                />
                <SummaryCard
                  title="Active Freelancers"
                  data={summaryData.activeFreelancers}
                  testId="card-active-freelancers"
                />
              </>
            ) : null}
          </div>

          <div>
            {activitiesLoading ? (
              <Skeleton className="h-[300px]" />
            ) : activities ? (
              <RecentActivities activities={activities} />
            ) : null}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {barChartLoading ? (
              <Skeleton className="h-[400px]" />
            ) : barChartData ? (
              <ApplicantsByBarangayChart data={barChartData} />
            ) : null}
          </div>

          <div className="lg:col-span-1">
            {doughnutLoading ? (
              <Skeleton className="h-[400px]" />
            ) : doughnutData ? (
              <JobseekerFreelancerChart data={doughnutData} />
            ) : null}
          </div>

          <div className="lg:col-span-1">
            {lineChartLoading ? (
              <Skeleton className="h-[400px]" />
            ) : lineChartData ? (
              <MonthlyReferralsChart data={lineChartData} />
            ) : null}
          </div>
        </div>

        {/* Referral Table */}
        <div>
          <ReferralTable onExportCSV={handleExportCSV} />
        </div>
      </div>
    </div>
  );
}
