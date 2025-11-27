import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ApplicantsByBarangayChart } from "@/components/applicants-by-barangay-chart";
import { MonthlyReferralsChart } from "@/components/monthly-referrals-chart";
import type { BarChartData, LineChartData } from "@shared/schema";

/**
 * Admin Reports & Key Metrics Page
 * Route: /admin/reports
 * Only accessible to users with role='admin'
 */
export default function AdminReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter" | "year" | null>(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    let start = new Date();

    if (useCustomDate && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }

    // When no quick period is selected, show all time (no filtering)
    if (!period) return null;

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

  const dateRange = getDateRange();
  const startDateFormatted = dateRange ? dateRange.start.toISOString().split("T")[0] : undefined;
  const endDateFormatted = dateRange ? dateRange.end.toISOString().split("T")[0] : undefined;

  // Fetch summary data
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ["/api/summary", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/summary?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : `/api/summary`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
  });

  // Fetch bar chart data
  const { data: barChartData, isLoading: barChartLoading, refetch: refetchBarChart } = useQuery<BarChartData>({
    queryKey: ["/api/charts/bar", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/charts/bar?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : `/api/charts/bar`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bar chart");
      return res.json();
    },
  });

  // Fetch line chart data
  const { data: lineChartData, isLoading: lineChartLoading, refetch: refetchLineChart } = useQuery<LineChartData>({
    queryKey: ["/api/charts/line", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/charts/line?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : `/api/charts/line`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch line chart");
      return res.json();
    },
  });

  // Fetch referrals data
  const { data: referralsData, isLoading: referralsLoading, refetch: refetchReferrals } = useQuery({
    queryKey: ["/api/referrals", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/referrals?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : `/api/referrals`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
  });

  // Fetch employment status data
  const { data: employmentStatusData, isLoading: employmentStatusLoading, refetch: refetchEmploymentStatus } = useQuery({
    queryKey: ["/api/charts/employment-status", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/charts/employment-status?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : `/api/charts/employment-status`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch employment status");
      return res.json();
    },
  });

  // Fetch applicants data for PESO metrics
  const { data: applicantsData, isLoading: applicantsLoading, refetch: refetchApplicants } = useQuery({
    queryKey: ["/api/applicants", startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
  });

  // Handle period change
  const handlePeriodChange = (newPeriod: NonNullable<typeof period>) => {
    // Toggle behavior: clicking the same period unselects it (show all)
    setPeriod(prev => (prev === newPeriod ? null : newPeriod));
    setUseCustomDate(false);
    setStartDate("");
    setEndDate("");
    toast({
      title: "Period Updated",
      description: `Now showing data for: ${newPeriod.toUpperCase()}`,
    });
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
  };

  // Calculate metrics
  const filteredApplicants = (applicantsData || []).filter((app: any) => {
    if (!dateRange) return true; // No filtering when period is not selected
    if (!app.createdAt) return false;
    const createdDate = new Date(app.createdAt);
    const start = dateRange.start;
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return createdDate >= start && createdDate <= end;
  });

  const transformedReferralsData = referralsData?.map((ref: any) => ({
    id: ref.referralId,
    referralId: ref.referralId,
    applicant: ref.applicant,
    vacancy: ref.vacancy,
    employer: ref.employer,
    status: ref.status,
  })) || [];

  const successfulReferrals = transformedReferralsData.filter((r: any) => r.status === "hired").length;
  const placementRate = transformedReferralsData.length > 0 ? (successfulReferrals / transformedReferralsData.length) * 100 : 0;
  
  const fourPsBeneficiaries = filteredApplicants.filter((app: any) => app.is4PSBeneficiary).length;
  const ofwApplicants = filteredApplicants.filter((app: any) => app.isOFW || app.isFormerOFW).length;
  const seniorCitizens = filteredApplicants.filter((app: any) => app.isSeniorCitizen).length;
  const personWithDisability = filteredApplicants.filter((app: any) => app.isPersonWithDisability).length;
  const soloParents = filteredApplicants.filter((app: any) => app.isSoloParent).length;
  const indigeneousPeople = filteredApplicants.filter((app: any) => app.isIndigenousPeople).length;

  // Calculate top skills
  const allSkills: { [key: string]: number } = {};
  filteredApplicants.forEach((app: any) => {
    // Collect skills from multiple possible fields
    const skillsSources = [app.skills, app.otherSkillsTraining, app.otherSkills];
    
    skillsSources.forEach(skillsData => {
      if (!skillsData) return;
      
      let skillsArray: string[] | null = null;
      
      // Handle different formats
      if (Array.isArray(skillsData)) {
        // Already an array
        skillsArray = skillsData;
      } else if (typeof skillsData === 'string') {
        // Try parsing as JSON first
        try {
          const parsed = JSON.parse(skillsData);
          if (Array.isArray(parsed)) {
            skillsArray = parsed;
          }
        } catch (e) {
          // If not JSON, treat as comma-separated string
          skillsArray = skillsData.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }
      
      // Count the skills
      if (skillsArray && Array.isArray(skillsArray)) {
        skillsArray.forEach((skill: string) => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            allSkills[trimmedSkill] = (allSkills[trimmedSkill] || 0) + 1;
          }
        });
      }
    });
  });

  const topSkills = Object.entries(allSkills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([skill, count]) => ({ skill, count }));

  // Handle export
  const handleExportCSV = () => {
    const periodLabel = useCustomDate ? "CUSTOM" : (period ? period.toUpperCase() : "ALL");
    const dateRangeLabel = startDateFormatted && endDateFormatted
      ? `${startDateFormatted} to ${endDateFormatted}`
      : "All time";
    const csv = `REPORTS & KEY METRICS\n${new Date().toLocaleDateString()}\n\nPeriod: ${periodLabel}\nDate Range: ${dateRangeLabel}\n\nKEY METRICS\nPlacement Rate,${placementRate.toFixed(2)}%\nSuccessful Referrals (Hired),${successfulReferrals}\nTotal Referrals,${transformedReferralsData.length}\n\nPESO INDICATORS\n4Ps Beneficiaries,${fourPsBeneficiaries}\nOFW Applicants,${ofwApplicants}\nSenior Citizens,${seniorCitizens}\nPerson with Disability,${personWithDisability}\nSolo Parents,${soloParents}\nIndigenous People,${indigeneousPeople}\n\nEMPLOYMENT STATUS\nEmployed,${employmentStatusData?.employed || 0}\nUnemployed,${employmentStatusData?.unemployed || 0}\nSelf-Employed,${employmentStatusData?.selfEmployed || 0}\nNew Entrant,${employmentStatusData?.newEntrant || 0}\n\nTOP 20 SKILLS DEMAND\n${topSkills.map(({ skill, count }) => `${skill},${count}`).join("\n")}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${startDateFormatted}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Report exported as CSV",
    });
  };

  const MetricCard = ({ title, value, subtitle, trend }: { title: string; value: string | number; subtitle: string; trend?: "up" | "down" | null }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</h3>
        {trend && (
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            {trend === 'up' ? (
              <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            )}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reports & Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Comprehensive analysis of placement performance and beneficiary indicators
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchSummary();
                  refetchBarChart();
                  refetchLineChart();
                  refetchReferrals();
                  refetchEmploymentStatus();
                  refetchApplicants();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Period & Date Filter */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Period Buttons */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Period Selection</p>
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
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* KEY METRICS Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Placement Rate"
                value={`${placementRate.toFixed(1)}%`}
                subtitle="Referrals successfully hired"
              />
              <MetricCard
                title="Referrals Successfully Hired"
                value={successfulReferrals}
                subtitle={`Out of ${transformedReferralsData.length} total referrals`}
                trend={successfulReferrals > 0 ? "up" : "down"}
              />
              <MetricCard
                title="Total Referrals"
                value={transformedReferralsData.length}
                subtitle="All referrals in selected period"
              />
            </div>
          </div>

          {/* PESO INDICATORS Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">PESO Beneficiary Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="4Ps Beneficiaries"
                value={fourPsBeneficiaries}
                subtitle="Active 4Ps registered applicants"
              />
              <MetricCard
                title="OFW Applicants"
                value={ofwApplicants}
                subtitle="OFW & Former OFW applicants"
              />
              <MetricCard
                title="Senior Citizens"
                value={seniorCitizens}
                subtitle="60 years old and above"
              />
              <MetricCard
                title="Person with Disability"
                value={personWithDisability}
                subtitle="PWD applicants"
              />
              <MetricCard
                title="Solo Parents"
                value={soloParents}
                subtitle="Solo parent applicants"
              />
              <MetricCard
                title="Indigenous People"
                value={indigeneousPeople}
                subtitle="IP/Indigenous applicants"
              />
            </div>
          </div>

          {/* EMPLOYMENT STATUS Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employment Status Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                title="Employed"
                value={employmentStatusLoading ? <Skeleton className="h-8 w-16" /> : employmentStatusData?.employed || 0}
                subtitle="Currently employed"
                trend="up"
              />
              <MetricCard
                title="Unemployed"
                value={employmentStatusLoading ? <Skeleton className="h-8 w-16" /> : employmentStatusData?.unemployed || 0}
                subtitle="Currently unemployed"
              />
              <MetricCard
                title="Self-Employed"
                value={employmentStatusLoading ? <Skeleton className="h-8 w-16" /> : employmentStatusData?.selfEmployed || 0}
                subtitle="Self-employed individuals"
                trend="up"
              />
              <MetricCard
                title="New Entrant"
                value={employmentStatusLoading ? <Skeleton className="h-8 w-16" /> : employmentStatusData?.newEntrant || 0}
                subtitle="New job market entrants"
              />
            </div>
          </div>

          {/* TOP SKILLS DEMAND Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top 20 Skills Demand</h2>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              {applicantsLoading ? (
                <div className="space-y-3">
                  {[...Array(20)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : topSkills.length > 0 ? (
                <div className="space-y-3">
                  {topSkills.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-700/30 dark:to-transparent rounded-lg border border-slate-100 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{item.skill}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                          {item.count} applicant{item.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No skills data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* CHARTS Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visual Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {barChartLoading ? (
                  <Skeleton className="h-80" />
                ) : barChartData ? (
                  <ApplicantsByBarangayChart data={barChartData} />
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>

              <div>
                {lineChartLoading ? (
                  <Skeleton className="h-80" />
                ) : lineChartData ? (
                  <MonthlyReferralsChart data={lineChartData} />
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY STATISTICS */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Period Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Date Range</p>
                <p className="font-semibold text-slate-900 dark:text-white">{startDateFormatted && endDateFormatted ? `${startDateFormatted} to ${endDateFormatted}` : 'All time'}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Total Applicants (Period)</p>
                <p className="font-semibold text-slate-900 dark:text-white">{filteredApplicants.length}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Total Referrals (Period)</p>
                <p className="font-semibold text-slate-900 dark:text-white">{transformedReferralsData.length}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Active Employers</p>
                <p className="font-semibold text-slate-900 dark:text-white">{summaryData?.activeEmployers?.value || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
