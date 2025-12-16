import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicantsByBarangayChart } from "@/components/applicants-by-barangay-chart";
import { MonthlyReferralsChart } from "@/components/monthly-referrals-chart";
import { ReferralSummaryTable } from "@/components/referral-summary-table";
import { EmploymentStatusChart } from "@/components/employment-status-chart";
import { PesoMetrics } from "@/components/peso-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RefreshCw, Calendar, Activity, Users, Building2, BriefcaseBusiness, Clock3, BadgeCheck } from "lucide-react";
import type { SummaryData, BarChartData, LineChartData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

type SkillCount = {
  skill: string;
  count: number;
};

type SkillsReportResponse = {
  topSkills: SkillCount[];
  expectedSkillsShortage: SkillCount[];
};

export default function AdminDashboard() {
  const { toast } = useToast();

  type DateFilterField = "startDate" | "endDate";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } = useFieldErrors<DateFilterField>();

  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter" | "year" | null>(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastRefreshDate, setLastRefreshDate] = useState(new Date().toISOString().split("T")[0]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(new Date().toLocaleString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [barangayQuery, setBarangayQuery] = useState("");
  const [barangayLimit, setBarangayLimit] = useState<"all" | "top5" | "top10">("top10");

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();

    if (useCustomDate && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }

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

  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastRefreshDate) {
        setLastRefreshDate(today);
        setRefetchTrigger((prev) => prev + 1);
        toast({ title: "Data Refreshed", description: "Dashboard updated for the new day" });
      }
    };
    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [lastRefreshDate, toast]);

  const dateRange = getDateRange();
  const startDateFormatted = dateRange?.start.toISOString().split("T")[0] || "";
  const endDateFormatted = dateRange?.end.toISOString().split("T")[0] || "";

  const dateParams = startDateFormatted && endDateFormatted
    ? `?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
    : "";

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<SummaryData>({
    queryKey: ["/api/summary", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/summary${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: barChartData, isLoading: barChartLoading, refetch: refetchBarChart } = useQuery<BarChartData>({
    queryKey: ["/api/charts/bar", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/charts/bar${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch bar chart");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: lineChartData, isLoading: lineChartLoading, refetch: refetchLineChart } = useQuery<LineChartData>({
    queryKey: ["/api/charts/line", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/charts/line${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch line chart");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  type EmploymentStatusData = { employed: number; unemployed: number };
  const { data: employmentStatusData, isLoading: employmentStatusLoading, refetch: refetchEmploymentStatus } = useQuery<EmploymentStatusData>({
    queryKey: ["/api/charts/employment-status", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/charts/employment-status${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch employment status");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: skillsReport, refetch: refetchSkillsReport } = useQuery<SkillsReportResponse>({
    queryKey: ["/api/reports/skills", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/reports/skills${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch skills report");
      const payload = await res.json();
      return {
        topSkills: Array.isArray(payload?.topSkills) ? payload.topSkills : [],
        expectedSkillsShortage: Array.isArray(payload?.expectedSkillsShortage) ? payload.expectedSkillsShortage : [],
      };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  type ReferralsApiItem = {
    referralId: string;
    applicant: string;
    vacancy: string;
    employer: string;
    barangay?: string;
    jobCategory?: string;
    dateReferred: string;
    status: string;
    feedback?: string;
    job?: any;
    employerId?: string;
  };

  const { data: referralsData, isLoading: referralsLoading, refetch: refetchReferrals } = useQuery<ReferralsApiItem[]>({
    queryKey: ["/api/referrals", startDateFormatted, endDateFormatted, refetchTrigger],
    queryFn: async () => {
      const res = await authFetch(`/api/referrals${dateParams}`);
      if (!res.ok) throw new Error("Failed to fetch referrals");
      const payload = await res.json();
      return Array.isArray(payload) ? payload : [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const normalizeReferralStatus = (status: string): "Hired" | "Pending" | "Rejected" => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "hired" || normalized === "successful" || normalized === "success") return "Hired";
    if (normalized === "rejected" || normalized === "declined") return "Rejected";
    return "Pending";
  };

  const transformedReferralsData = referralsData?.map((ref) => {
    const applicantName = typeof ref.applicant === "string" ? ref.applicant : (ref as any)?.applicant?.name || "-";
    const vacancyTitle = typeof ref.vacancy === "string" ? ref.vacancy : ref.job?.title || ref.job?.positionTitle || "-";
    const employerName = typeof ref.employer === "string" ? ref.employer : (ref.job as any)?.employerName || (ref.job as any)?.establishmentName || ref.employerId || "-";

    return {
      id: ref.referralId,
      referralId: ref.referralId,
      applicant: applicantName,
      vacancy: vacancyTitle,
      employer: employerName,
      barangay: ref.barangay || "",
      jobCategory: ref.jobCategory || "",
      dateReferred: ref.dateReferred,
      status: normalizeReferralStatus(ref.status),
      feedback: ref.feedback || "",
    };
  }) || [];

  const handlePeriodChange = (newPeriod: typeof period) => {
    if (period === newPeriod && !useCustomDate) {
      setPeriod(null);
      toast({ title: "Filter Cleared", description: "Now showing all data (no period filter)" });
    } else {
      setPeriod(newPeriod);
      setUseCustomDate(false);
      setStartDate("");
      setEndDate("");
      toast({ title: "Period Updated", description: `Now showing data for: ${newPeriod?.toUpperCase() || "ALL"}` });
    }
  };

  const handleApplyCustomDate = () => {
    const nextErrors: FieldErrors<DateFilterField> = {};
    if (!startDate) nextErrors.startDate = "Start date is required";
    if (!endDate) nextErrors.endDate = "End date is required";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      nextErrors.startDate = "Start date must be before end date";
      nextErrors.endDate = "End date must be after start date";
    }
    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return;
    }
    setUseCustomDate(true);
    toast({ title: "Date Range Applied", description: `Showing data from ${startDate} to ${endDate}` });
  };

  const handleClearCustomDate = () => {
    setUseCustomDate(false);
    setStartDate("");
    setEndDate("");
    setPeriod(null);
    toast({ title: "Filter Cleared", description: "Showing all data (no date filter)" });
  };

  const filteredBarChartData = useMemo(() => {
    if (!barChartData) return undefined;

    const rows = barChartData.barangays.map((barangay: string, idx: number) => ({
      barangay,
      employed: barChartData.employed[idx] || 0,
      unemployed: barChartData.unemployed[idx] || 0,
    }));

    const query = barangayQuery.trim().toLowerCase();
    let filteredRows = query ? rows.filter((row) => row.barangay.toLowerCase().includes(query)) : rows;

    if (barangayLimit === "top5" || barangayLimit === "top10") {
      const take = barangayLimit === "top5" ? 5 : 10;
      filteredRows = [...filteredRows].sort((a, b) => b.employed + b.unemployed - (a.employed + a.unemployed)).slice(0, take);
    }

    return {
      barangays: filteredRows.map((row) => row.barangay),
      employed: filteredRows.map((row) => row.employed),
      unemployed: filteredRows.map((row) => row.unemployed),
    } as BarChartData;
  }, [barChartData, barangayLimit, barangayQuery]);

  const dateWindowLabel = useMemo(() => {
    if (useCustomDate && startDate && endDate) return `${startDate} to ${endDate}`;
    if (period) return `Past ${period}`;
    return "All time";
  }, [endDate, period, startDate, useCustomDate]);

  const refetchAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchBarChart(),
        refetchLineChart(),
        refetchEmploymentStatus(),
        refetchReferrals(),
        refetchSkillsReport(),
      ]);
      setLastUpdatedLabel(new Date().toLocaleString());
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchBarChart, refetchEmploymentStatus, refetchLineChart, refetchReferrals, refetchSkillsReport, refetchSummary]);

  const periodOptions: Array<{ value: typeof period; label: string; hint: string }> = [
    { value: null, label: "All", hint: "Full history" },
    { value: "day", label: "Day", hint: "24h" },
    { value: "week", label: "Week", hint: "7 days" },
    { value: "month", label: "Month", hint: "30 days" },
    { value: "quarter", label: "Quarter", hint: "90 days" },
    { value: "year", label: "Year", hint: "12 months" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="relative min-h-[100svh] bg-slate-50 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -left-40 top-[-200px] h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/15 via-indigo-500/10 to-purple-500/10 blur-3xl" />
          <div className="absolute right-[-140px] top-16 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/15 via-cyan-400/10 to-sky-500/12 blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-[1920px] px-4 py-6 space-y-8">
          <div className="grid gap-4 xl:grid-cols-[1.65fr,1fr]">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    <Activity className="h-3.5 w-3.5" /> Live dashboard
                  </span>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Operations pulse</p>
                  <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">Filters above apply to every widget below.</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <Button variant="outline" size="sm" onClick={refetchAll} disabled={isRefreshing} className="gap-2 w-full sm:w-auto">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Refreshing" : "Refresh"}
                  </Button>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Updated {lastUpdatedLabel}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/70 dark:border-slate-800/70 px-4 sm:px-6 py-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {periodOptions.map((option) => {
                    const isActive = period === option.value && !useCustomDate;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handlePeriodChange(option.value)}
                        className={`flex min-w-[110px] flex-col rounded-xl border px-3 py-2 text-left transition-all ${isActive ? "border-slate-900/20 bg-slate-900/5 shadow-sm dark:border-slate-100/10 dark:bg-slate-100/5" : "border-slate-200/70 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 hover:dark:border-slate-700"}`}
                      >
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{option.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={useCustomDate ? "default" : "outline"} size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {useCustomDate ? "Custom date" : "Date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">Start date</label>
                          <Input
                            type="date"
                            aria-invalid={!!fieldErrors.startDate}
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              clearFieldError("startDate");
                            }}
                            className="w-full"
                          />
                          {fieldErrors.startDate && (
                            <p className="mt-1 text-xs text-destructive">{fieldErrors.startDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">End date</label>
                          <Input
                            type="date"
                            aria-invalid={!!fieldErrors.endDate}
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              clearFieldError("endDate");
                            }}
                            className="w-full"
                          />
                          {fieldErrors.endDate && (
                            <p className="mt-1 text-xs text-destructive">{fieldErrors.endDate}</p>
                          )}
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
                        {useCustomDate && <div className="text-xs text-slate-600 dark:text-slate-400">Showing: {startDate} to {endDate}</div>}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {useCustomDate && <div className="text-xs text-slate-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{startDate}  {endDate}</div>}
                  <span className="text-xs text-slate-500 dark:text-slate-400">Window: {dateWindowLabel}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-xl">
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Snapshot</p>
                    <p className="text-lg font-semibold">Confidence layer</p>
                    <p className="text-sm text-slate-300">{summaryLoading ? "Syncing data..." : "Live data connected."} Data window: {dateWindowLabel}.</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-100">{new Date(lastRefreshDate).toLocaleDateString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"><span>Filters</span><span className="text-[11px] text-emerald-200">Global</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"><span>Coverage</span><span className="text-[11px] text-sky-200">{barangayLimit === "all" ? "All" : barangayLimit === "top5" ? "Top 5" : "Top 10"}</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"><span>Custom dates</span><span className="text-[11px] text-amber-200">{useCustomDate ? "Active" : "Off"}</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"><span>Last sync</span><span className="text-[11px] text-lime-200">{lastUpdatedLabel}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Overview</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Data window: {dateWindowLabel}</span>
            </div>
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
                [
                  { title: "Applicants", value: summaryData.totalApplicants.value, change: summaryData.totalApplicants.change, icon: Users, accent: "from-sky-500/20 via-sky-500/10 to-sky-500/5" },
                  { title: "Active employers", value: summaryData.activeEmployers.value, change: summaryData.activeEmployers.change, icon: Building2, accent: "from-emerald-500/20 via-emerald-500/10 to-emerald-500/5" },
                  { title: "Job posts", value: summaryData.activeJobPosts.value, change: summaryData.activeJobPosts.change, icon: BriefcaseBusiness, accent: "from-amber-500/25 via-amber-500/10 to-amber-500/5" },
                  { title: "Pending feedback", value: summaryData.pendingEmployerFeedback.value, change: 0, icon: Clock3, accent: "from-rose-500/20 via-rose-500/10 to-rose-500/5" },
                  { title: "Successful placements", value: summaryData.successfulReferrals.value, change: summaryData.successfulReferrals.change, icon: BadgeCheck, accent: "from-cyan-500/20 via-cyan-500/10 to-cyan-500/5" },
                ].map((metric) => {
                  const Icon = metric.icon;
                  const isPositive = metric.change >= 0;
                  return (
                    <div key={metric.title} className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 shadow-sm shadow-slate-900/5">
                      <div className={`absolute inset-0 bg-gradient-to-br ${metric.accent}`} aria-hidden />
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{metric.title}</p>
                          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{metric.value.toLocaleString()}</p>
                          <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isPositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"}`}>
                              {metric.change > 0 ? "+" : metric.change < 0 ? "-" : "="} {Math.abs(metric.change).toLocaleString()}%
                            </span>
                            <span>vs last period</span>
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/70 text-slate-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100">
                          <Icon className="h-5 w-5" aria-hidden />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 shadow-sm shadow-slate-900/5 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">PESO indicators</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Weighted with the active filters above.</p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Window: {dateWindowLabel}</div>
            </div>

            <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 px-4 py-4 sm:px-6 sm:py-5">
              {(() => {
                const filteredReferrals = (transformedReferralsData || []).filter((ref: any) => {
                  if (!ref.dateReferred) return false;
                  if (!dateRange) return true;
                  const refDate = new Date(ref.dateReferred);
                  const start = dateRange.start;
                  const end = new Date(dateRange.end);
                  end.setHours(23, 59, 59, 999);
                  return refDate >= start && refDate <= end;
                });

                const hiredReferrals = filteredReferrals.filter((ref: any) => {
                  const normalized = (ref.status || "").toLowerCase();
                  return normalized === "hired" || normalized === "successful";
                }).length;
                const fourPsBeneficiaries = summaryData?.fourPsBeneficiaries?.value ?? 0;
                const ofwApplicants = summaryData?.ofwApplicants?.value ?? 0;
                const topSkill =
                  skillsReport?.topSkills?.find((entry) => {
                    const label = String(entry?.skill ?? "").trim().toLowerCase();
                    return label !== "others";
                  })?.skill || "—";

                return (
                  <PesoMetrics
                    placementRate={filteredReferrals.length > 0 ? (hiredReferrals / filteredReferrals.length) * 100 : 0}
                    fourPsBeneficiaries={fourPsBeneficiaries}
                    ofwApplicants={ofwApplicants}
                    topSkill={topSkill}
                  />
                );
              })()}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Barangay focus</span>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant={barangayLimit === "all" ? "default" : "outline"} onClick={() => setBarangayLimit("all")}>
                        All
                      </Button>
                      <Button type="button" size="sm" variant={barangayLimit === "top10" ? "default" : "outline"} onClick={() => setBarangayLimit("top10")}>
                        Top 10
                      </Button>
                      <Button type="button" size="sm" variant={barangayLimit === "top5" ? "default" : "outline"} onClick={() => setBarangayLimit("top5")}>
                        Top 5
                      </Button>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Sorted by employed + unemployed counts</span>
                  </div>
                  <Input placeholder="Search barangay" value={barangayQuery} onChange={(e) => setBarangayQuery(e.target.value)} className="w-full md:w-64" />
                </div>

                {barChartLoading ? (
                  <Skeleton className="h-[480px] rounded-xl" />
                ) : filteredBarChartData && filteredBarChartData.barangays.length > 0 ? (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 p-3">
                    <ApplicantsByBarangayChart data={filteredBarChartData} />
                  </div>
                ) : barChartData ? (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    No barangay matches this filter. Clear the search or show all.
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    No barangay data available.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {lineChartLoading ? (
                  <Skeleton className="h-[480px] rounded-xl" />
                ) : lineChartData ? (
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 p-3">
                    <MonthlyReferralsChart data={lineChartData} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    No referral trend data available for this range.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Employment status distribution</h3>
                  <EmploymentStatusChart isLoading={employmentStatusLoading} data={employmentStatusData ? { employed: employmentStatusData.employed ?? 0, unemployed: employmentStatusData.unemployed ?? 0 } : { employed: 0, unemployed: 0 }} />
                </div>

                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System health</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[{ label: "Total applicants", value: summaryData?.totalApplicants.value || 0, tone: "emerald" }, { label: "Active employers", value: summaryData?.activeEmployers.value || 0, tone: "sky" }, { label: "Job vacancies", value: summaryData?.activeJobPosts.value || 0, tone: "amber" }, { label: "Pending feedback", value: summaryData?.pendingEmployerFeedback.value || 0, tone: "rose" }, { label: "Successful placements", value: summaryData?.successfulReferrals.value || 0, tone: "cyan" }].map((item) => (
                      <div key={item.label} className="rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-3 py-3 shadow-sm shadow-slate-900/5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.value.toLocaleString()}</p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.tone === "emerald" ? "from-emerald-500 to-emerald-400" : ""}${item.tone === "sky" ? " from-sky-500 to-sky-400" : ""}${item.tone === "amber" ? " from-amber-500 to-amber-400" : ""}${item.tone === "rose" ? " from-rose-500 to-rose-400" : ""}${item.tone === "cyan" ? " from-cyan-500 to-cyan-400" : ""}`} style={{ width: "80%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Referral summary</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Filters respected</span>
            </div>
            {referralsLoading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <ReferralSummaryTable
                data={transformedReferralsData}
                onExportCSV={() => toast({ title: "CSV Exported", description: "Referral data has been exported successfully." })}
                onRefresh={() => {
                  refetchReferrals();
                  refetchSummary();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
