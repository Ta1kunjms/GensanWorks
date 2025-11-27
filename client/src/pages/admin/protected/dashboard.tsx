import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCard } from "@/components/summary-card";
import { ApplicantsByBarangayChart } from "@/components/applicants-by-barangay-chart";
import { MonthlyReferralsChart } from "@/components/monthly-referrals-chart";
import { ReferralSummaryTable } from "@/components/referral-summary-table";
import { EmploymentStatusChart } from "@/components/employment-status-chart";
import { PesoMetrics } from "@/components/peso-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  SummaryData,
  RecentActivity,
  BarChartData,
  LineChartData,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin Dashboard
 * Route: /admin/dashboard
 * Only accessible to users with role='admin'
 */
export default function AdminDashboard() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter" | "year" | null>(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [lastRefreshDate, setLastRefreshDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    let start = new Date();

    if (useCustomDate && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }

    // If no period selected, return null to show all data
    if (!period) {
      return null;
    }

    switch (period) {
      case "day":
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return { start, end: now };
  };

  // Auto-detect new day and refresh data
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastRefreshDate) {
        console.log("[Dashboard] New day detected, refreshing data");
        setLastRefreshDate(today);
        setRefetchTrigger(prev => prev + 1);
        toast({
          title: "Data Refreshed",
          description: "Dashboard updated for the new day",
        });
      }
    };

    // Check immediately
    checkNewDay();

    // Check every minute for new day
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [lastRefreshDate, toast]);

  const dateRange = getDateRange();
  const startDateFormatted = dateRange?.start.toISOString().split("T")[0] || "";
  const endDateFormatted = dateRange?.end.toISOString().split("T")[0] || "";

  // Fetch data with date range parameters
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<SummaryData>({
    queryKey: ["/api/summary", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const params = startDateFormatted && endDateFormatted 
        ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : '';
      const res = await fetch(`/api/summary${params}`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: barChartData, isLoading: barChartLoading, refetch: refetchBarChart } = useQuery<BarChartData>({
    queryKey: ["/api/charts/bar", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const params = startDateFormatted && endDateFormatted 
        ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : '';
      const res = await fetch(`/api/charts/bar${params}`);
      if (!res.ok) throw new Error("Failed to fetch bar chart");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: lineChartData, isLoading: lineChartLoading, refetch: refetchLineChart } = useQuery<LineChartData>({
    queryKey: ["/api/charts/line", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const params = startDateFormatted && endDateFormatted 
        ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : '';
      const res = await fetch(`/api/charts/line${params}`);
      if (!res.ok) throw new Error("Failed to fetch line chart");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch employment status data
  const { data: employmentStatusData, isLoading: employmentStatusLoading, refetch: refetchEmploymentStatus } = useQuery({
    queryKey: ["/api/charts/employment-status", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const params = startDateFormatted && endDateFormatted 
        ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : '';
      const res = await fetch(`/api/charts/employment-status${params}`);
      if (!res.ok) throw new Error("Failed to fetch employment status");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch referrals data
  const { data: referralsData, isLoading: referralsLoading, refetch: refetchReferrals } = useQuery({
    queryKey: ["/api/referrals", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const params = startDateFormatted && endDateFormatted 
        ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : '';
      const res = await fetch(`/api/referrals${params}`);
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch applicants data for PESO metrics calculation
  const { data: applicantsData } = useQuery({
    queryKey: ["/api/applicants", refetchTrigger],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
    staleTime: 0,
  });

  // Transform referrals data to match ReferralSummaryItem interface
  const transformedReferralsData = referralsData?.map((ref: any) => ({
    id: ref.referralId, // Use referralId as the primary identifier for delete operations
    referralId: ref.referralId,
    applicant: ref.applicant,
    vacancy: ref.vacancy,
    employer: ref.employer,
    barangay: ref.barangay || "",
    jobCategory: ref.jobCategory || "",
    dateReferred: ref.dateReferred,
    status: ref.status,
    feedback: ref.feedback || "",
  })) || [];

  // Handle period change - toggle to unselect
  const handlePeriodChange = (newPeriod: typeof period) => {
    if (period === newPeriod && !useCustomDate) {
      // Clicking the same period again - unselect it
      setPeriod(null);
      toast({
        title: "Filter Cleared",
        description: "Now showing all data (no period filter)",
      });
    } else {
      // Select new period
      setPeriod(newPeriod);
      setUseCustomDate(false);
      setStartDate("");
      setEndDate("");
      toast({
        title: "Period Updated",
        description: `Now showing data for: ${newPeriod?.toUpperCase() || 'ALL'}`,
      });
    }
  };

  const handleApplyCustomDate = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    setUseCustomDate(true);
    toast({
      title: "Date Range Applied",
      description: `Showing data from ${startDate} to ${endDate}`,
    });
  };

  const handleClearCustomDate = () => {
    setUseCustomDate(false);
    setStartDate("");
    setEndDate("");
    setPeriod(null);
    toast({
      title: "Filter Cleared",
      description: "Showing all data (no date filter)",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "CSV Exported",
      description: "Referral data has been exported successfully.",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Welcome to GensanWorks Admin Panel
              </p>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                refetchSummary();
                refetchBarChart();
                refetchLineChart();
                refetchEmploymentStatus();
                refetchReferrals();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Enhanced Period & Date Filter */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Period Buttons */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Quick Period Selection 
                  <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                    {!period && !useCustomDate ? '(Showing All Data)' : useCustomDate ? '(Custom Date)' : `(${period?.toUpperCase()})`}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['day', 'week', 'month', 'quarter', 'year'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={period === p && !useCustomDate ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePeriodChange(p)}
                      className="capitalize text-xs"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={useCustomDate ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      {useCustomDate ? 'Custom Date' : 'Date Range'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleApplyCustomDate} className="flex-1">
                          Apply
                        </Button>
                        {useCustomDate && (
                          <Button size="sm" variant="outline" onClick={handleClearCustomDate}>
                            Clear
                          </Button>
                        )}
                      </div>
                      {useCustomDate && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Currently showing: {startDate} to {endDate}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {useCustomDate && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    {startDate} → {endDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Metrics</h2>

            {/* Metrics Grid - Modern Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryLoading ? (
                <>
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </>
              ) : summaryData ? (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Applicants</p>
                        <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{summaryData.totalApplicants.value}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                          {summaryData.totalApplicants.change > 0 ? '↑' : '↓'} {Math.abs(summaryData.totalApplicants.change)}% from last period
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 dark:bg-blue-700/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">👥</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Active Employers</p>
                        <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-100">{summaryData.activeEmployers.value}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          {summaryData.activeEmployers.change > 0 ? '↑' : '↓'} {Math.abs(summaryData.activeEmployers.change)}% from last period
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-200 dark:bg-emerald-700/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">🏢</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl border border-amber-200 dark:border-amber-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Job Posts</p>
                        <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">{summaryData.activeJobPosts.value}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                          {summaryData.activeJobPosts.change > 0 ? '↑' : '↓'} {Math.abs(summaryData.activeJobPosts.change)}% from last period
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-200 dark:bg-amber-700/50 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl">📋</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl border border-red-200 dark:border-red-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Pending Feedback</p>
                        <p className="text-4xl font-bold text-red-900 dark:text-red-100">{summaryData.pendingEmployerFeedback.value}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                          Action needed
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 dark:bg-red-700/50 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 text-xl">⏳</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-xl border border-cyan-200 dark:border-cyan-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-1">Successful Placements</p>
                        <p className="text-4xl font-bold text-cyan-900 dark:text-cyan-100">{summaryData.successfulReferrals.value}</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
                          {summaryData.successfulReferrals.change > 0 ? '↑' : '↓'} {Math.abs(summaryData.successfulReferrals.change)}% from last period
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-cyan-200 dark:bg-cyan-700/50 rounded-lg flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-xl">✅</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Active Freelancers</p>
                        <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">{summaryData.activeFreelancers.value}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                          {summaryData.activeFreelancers.change > 0 ? '↑' : '↓'} {Math.abs(summaryData.activeFreelancers.change)}% from last period
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl">💼</div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* PESO-Focused Analytics & Insights */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Metrics & PESO Indicators</h2>
            
            {/* PESO Metrics Cards */}
            <div className="mb-8">
              {(() => {
                // Filter applicants by date range (if period is selected)
                const filteredApplicants = (applicantsData || []).filter((app: any) => {
                  if (!app.createdAt) return false;
                  
                  // If no date range, show all data
                  if (!dateRange) return true;
                  
                  const createdDate = new Date(app.createdAt);
                  const start = dateRange.start;
                  const end = new Date(dateRange.end);
                  end.setHours(23, 59, 59, 999);
                  return createdDate >= start && createdDate <= end;
                });

                // Filter referrals by date range (if period is selected)
                const filteredReferrals = (transformedReferralsData || []).filter((ref: any) => {
                  if (!ref.dateReferred) return false;
                  
                  // If no date range, show all data
                  if (!dateRange) return true;
                  
                  const refDate = new Date(ref.dateReferred);
                  const start = dateRange.start;
                  const end = new Date(dateRange.end);
                  end.setHours(23, 59, 59, 999);
                  return refDate >= start && refDate <= end;
                });

                // Count hired referrals in the period
                const hiredReferrals = filteredReferrals.filter((ref: any) => ref.status === 'hired' || ref.status === 'successful').length;

                // Calculate PESO metrics from filtered applicants
                const fourPsBeneficiaries = filteredApplicants.filter((app: any) => app.is4PSBeneficiary).length;
                const ofwApplicants = filteredApplicants.filter((app: any) => app.isOFW || app.isFormerOFW).length;

                return (
                  <PesoMetrics
                    placementRate={filteredReferrals.length > 0
                      ? (hiredReferrals / filteredReferrals.length) * 100
                      : 0}
                    fourPsBeneficiaries={fourPsBeneficiaries}
                    ofwApplicants={ofwApplicants}
                    topSkill="Computer Literacy"
                  />
                );
              })()}
            </div>

            {/* Row 1: Applicants in General Santos City (Full Width) */}
            <div className="mb-6">
              {barChartLoading ? (
                <Skeleton className="h-[480px] rounded-lg" />
              ) : barChartData ? (
                <ApplicantsByBarangayChart data={barChartData} />
              ) : null}
            </div>

            {/* Row 2: Monthly Referral Trends (Full Width) */}
            <div className="mb-6">
              {lineChartLoading ? (
                <Skeleton className="h-[480px] rounded-lg" />
              ) : lineChartData ? (
                <MonthlyReferralsChart data={lineChartData} />
              ) : null}
            </div>

            {/* Row 3: Employment Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employment Status Chart */}
              <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Employment Status Distribution
                </h3>
                <EmploymentStatusChart
                  isLoading={employmentStatusLoading}
                  data={employmentStatusData || {
                    employed: 0,
                    unemployed: 0,
                    selfEmployed: 0,
                    newEntrant: 0,
                  }}
                />
              </div>

              {/* System Health & Important Counts */}
              <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  System Health & Key Numbers
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Total Applicants</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {summaryData?.totalApplicants.value || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Active Employers</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summaryData?.activeEmployers.value || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Job Vacancies</span>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {summaryData?.activeJobPosts.value || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Pending Feedback</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {summaryData?.pendingEmployerFeedback.value || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Successful Placements</span>
                    <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {summaryData?.successfulReferrals.value || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Details */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Referral Summary</h2>
            <ReferralSummaryTable 
              data={transformedReferralsData} 
              onExportCSV={handleExportCSV}
              onRefresh={() => {
                refetchReferrals();
                refetchSummary();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
