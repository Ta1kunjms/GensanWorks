import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { differenceInYears } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { ApplicantsByBarangayChart } from "@/components/applicants-by-barangay-chart";
import { MonthlyReferralsChart } from "@/components/monthly-referrals-chart";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import type { Applicant, BarChartData, LineChartData } from "@shared/schema";
import lmiFormAsset from "@assets/LMI-Monitoring-Forms.xlsx?url";
import pesFormAsset from "@assets/PES-APRIL-2024.xlsx?url";
import srsFormAsset from "@assets/SKILLS-REGISTRY-SYSTEM-STATISTICAL-REPORT.xlsx?url";
import sprsFormAsset from "@assets/SPRS-APRIL-2024.xlsx?url";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

type TemplateKey = "lmi" | "pes" | "srs" | "sprs";

type SkillCount = {
  skill: string;
  count: number;
};

type SkillsReportResponse = {
  topSkills: SkillCount[];
  expectedSkillsShortage: SkillCount[];
};

const templateMap: Record<TemplateKey, {
  title: string;
  description: string;
  asset: string;
  anchor: string;
}> = {
  lmi: {
    title: "LMI Form 1 – Individuals Reached",
    description: "Captures per-applicant reach data required by BLE LMI Form 1 v2.0.",
    asset: lmiFormAsset,
    anchor: "lmi-preview",
  },
  pes: {
    title: "Applicants Registration (PES 2024)",
    description: "Official PESO enrolment roster with assistance types per applicant.",
    asset: pesFormAsset,
    anchor: "pes-preview",
  },
  srs: {
    title: "Skills Registry System Statistical Report",
    description: "Barangay-level aggregation of registered jobseekers.",
    asset: srsFormAsset,
    anchor: "srs-preview",
  },
  sprs: {
    title: "Consolidated PESO Statistical Performance (SPRS)",
    description: "Quarterly summary covering core PESO program accomplishments.",
    asset: sprsFormAsset,
    anchor: "sprs-preview",
  },
};

/**
 * Admin Analytics & Key Metrics Page
 * Route: /admin/reports
 * Only accessible to users with role='admin'
 */
export default function AdminAnalyticsPage() {
  const { toast } = useToast();

  type ReportsValidationField = "startDate" | "endDate" | "templates";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<ReportsValidationField>();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter" | "year" | null>(null);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateKey[]>(["lmi"]);
  const [generatorMonthValue, setGeneratorMonthValue] = useState(() => new Date().toISOString().slice(0, 7));
  const [usePageFilters, setUsePageFilters] = useState(true);
  const [maskPersonalData, setMaskPersonalData] = useState(false);
  const [aggregatedOnlyView, setAggregatedOnlyView] = useState(false);

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

  const periodDescriptor = useMemo(() => {
    if (useCustomDate && startDateFormatted && endDateFormatted) {
      return `${startDateFormatted} – ${endDateFormatted}`;
    }
    if (period) {
      return period.toUpperCase();
    }
    return "All time";
  }, [endDateFormatted, period, startDateFormatted, useCustomDate]);

  const generatorRangeLabel = useMemo(() => {
    if (usePageFilters && startDateFormatted && endDateFormatted) {
      return `${startDateFormatted} to ${endDateFormatted}`;
    }
    if (!usePageFilters && generatorMonthValue) {
      const [year, month] = generatorMonthValue.split("-");
      const humanMonth = new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long" });
      return `${humanMonth} ${year}`;
    }
    return "All time";
  }, [endDateFormatted, generatorMonthValue, startDateFormatted, usePageFilters]);

  const { data: skillsReport, isLoading: skillsReportLoading } = useQuery<SkillsReportResponse>({
    queryKey: ["/api/reports/skills", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const url = startDateFormatted && endDateFormatted
        ? `/api/reports/skills?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
        : "/api/reports/skills";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch skills report");
      return res.json();
    },
  });

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Treat date/period filter changes as a new view; update timestamp to reflect current window.
  useEffect(() => {
    setLastUpdated(new Date());
  }, [period, useCustomDate, startDateFormatted, endDateFormatted]);

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
  const { data: applicantsData, isLoading: applicantsLoading, refetch: refetchApplicants } = useQuery<Applicant[]>({
    queryKey: ["/api/applicants", startDateFormatted ?? "all", endDateFormatted ?? "all"],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (startDateFormatted) {
        searchParams.set("startDate", startDateFormatted);
      }
      if (endDateFormatted) {
        searchParams.set("endDate", endDateFormatted);
      }
      const url = searchParams.toString() ? `/api/applicants?${searchParams.toString()}` : "/api/applicants";
      const res = await fetch(url);
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
    const nextErrors: FieldErrors<ReportsValidationField> = {};
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

  const handleTemplateToggle = (key: TemplateKey) => {
    clearFieldError("templates");
    setSelectedTemplates((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const openGeneratorForTemplate = (key: TemplateKey) => {
    clearFieldError("templates");
    setSelectedTemplates((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setIsGeneratorOpen(true);
  };

  const handleGenerateForms = () => {
    if (selectedTemplates.length === 0) {
      const nextErrors: FieldErrors<ReportsValidationField> = {
        templates: "Choose at least one worksheet to download.",
      };
      setErrorsAndFocus(nextErrors);
      return;
    }

    const rangeSlug = generatorRangeLabel
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "all";

    selectedTemplates.forEach((key) => {
      const template = templateMap[key];
      const link = document.createElement("a");
      link.href = template.asset;
      link.download = `${template.title.replace(/[^a-zA-Z0-9]+/g, "-")}-${rangeSlug}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: "Templates downloaded",
      description: `${selectedTemplates.length} Excel form${selectedTemplates.length > 1 ? "s" : ""} generated for ${generatorRangeLabel}.`,
    });
    setIsGeneratorOpen(false);
  };

  // Calculate metrics
  const filteredApplicants = (applicantsData || []).filter((app: Applicant) => {
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
  
  const fourPsBeneficiaries = filteredApplicants.filter((app) => app.is4PSBeneficiary).length;
  const ofwApplicants = filteredApplicants.filter((app) => app.isOFW || app.isFormerOFW).length;
  const seniorCitizens = filteredApplicants.filter((app) => {
    const age = app.age ?? getApplicantAge(app);
    return typeof age === "number" && age >= 60;
  }).length;
  const personWithDisability = filteredApplicants.filter((app) => app.isPersonWithDisability).length;
  const soloParents = filteredApplicants.filter((app) => app.isSoloParent).length;
  const indigeneousPeople = filteredApplicants.filter((app) => app.isIndigenousPeople).length;


  // Use API-provided top skills and shortage
  const topSkills: SkillCount[] = skillsReport?.topSkills || [];
  const expectedSkillsShortage: SkillCount[] = skillsReport?.expectedSkillsShortage || [];
  const templateEntries = useMemo(
    () => Object.entries(templateMap) as [TemplateKey, (typeof templateMap)[TemplateKey]][],
    []
  );
  const formatApplicantName = (app: Applicant) => {
    const middle = app.middleName ? ` ${app.middleName}` : "";
    const suffix = app.suffix ? ` ${app.suffix}` : "";
    return `${app.surname || ""}, ${app.firstName || ""}${middle}${suffix}`.trim();
  };

  const formatApplicantAddress = (app: Applicant) => {
    const segments = [
      app.houseStreetVillage,
      app.barangay,
      app.municipality,
      app.province,
    ].filter(Boolean);
    return segments.join(", ");
  };

  const getApplicantAge = (app: Applicant) => {
    if (typeof app.age === "number") return app.age;
    if (app.dateOfBirth) {
      try {
        return differenceInYears(new Date(), new Date(app.dateOfBirth));
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  const isYouthApplicant = (app: Applicant) => {
    const age = getApplicantAge(app);
    if (typeof age !== "number") return null;
    return age >= 15 && age <= 24;
  };

  const maskableValue = (value?: string | number | null) => {
    if (!value) return "—";
    return maskPersonalData ? "Restricted" : String(value);
  };

  const youthBreakdown = useMemo(() => {
    let youth = 0;
    let nonYouth = 0;
    let male = 0;
    let female = 0;

    filteredApplicants.forEach((app) => {
      if (app.sex === "Male") male += 1;
      if (app.sex === "Female") female += 1;

      const isYouth = isYouthApplicant(app);
      if (isYouth === true) youth += 1;
      if (isYouth === false) nonYouth += 1;
    });

    return {
      total: filteredApplicants.length,
      youth,
      nonYouth,
      male,
      female,
    };
  }, [filteredApplicants]);

  const lmiPreviewRows = useMemo(() => {
    if (aggregatedOnlyView) return [];
    return filteredApplicants.slice(0, 8).map((app, index) => {
      const youthFlag = isYouthApplicant(app);
      return {
        no: index + 1,
        name: formatApplicantName(app),
        address: maskableValue(formatApplicantAddress(app)),
        contact: maskableValue(
          app.contactNumber ||
          app.contactInformation?.mobileNumber ||
          app.contactInformation?.telephoneNumber
        ),
        male: app.sex === "Male" ? "✓" : "",
        female: app.sex === "Female" ? "✓" : "",
        youth: youthFlag === true ? "✓" : "",
        nonYouth: youthFlag === false ? "✓" : "",
      };
    });
  }, [aggregatedOnlyView, filteredApplicants, maskPersonalData]);

    const deriveAssistanceFlags = (app: Applicant) => {
    const seekingEmployment = !app.employmentStatus || app.employmentStatus === "Unemployed" || app.employmentStatus === "New Entrant/Fresh Graduate";
      const counseling = Boolean(
        app.jobPreference ||
        app.jobPreferences?.preferredOccupations?.length ||
        app.jobPreferences?.preferredEmploymentTypes?.length
      );
    const others = Boolean(app.otherSkills?.length || app.otherSkillsTraining);
    return { seekingEmployment, counseling, others };
  };

  const pesPreviewRows = useMemo(() => {
    if (aggregatedOnlyView) return [];
    return filteredApplicants.slice(0, 8).map((app, index) => {
      const assistance = deriveAssistanceFlags(app);
      return {
        no: index + 1,
        name: formatApplicantName(app),
        male: app.sex === "Male" ? "✓" : "",
        female: app.sex === "Female" ? "✓" : "",
        address: maskableValue(formatApplicantAddress(app)),
        contact: maskableValue(
          app.contactNumber ||
          app.contactInformation?.mobileNumber ||
          app.contactInformation?.telephoneNumber
        ),
        seekingEmployment: assistance.seekingEmployment ? "✓" : "",
        counseling: assistance.counseling ? "✓" : "",
        others: assistance.others ? "✓" : "",
      };
    });
  }, [aggregatedOnlyView, filteredApplicants, maskPersonalData]);

  const srsPreviewRows = useMemo(() => {
    if (!barChartData) return [];
    const totals = barChartData.barangays.map((barangay, index) => {
      const total =
        (barChartData.employed[index] || 0) +
        (barChartData.unemployed[index] || 0) +
        (barChartData.selfEmployed[index] || 0) +
        (barChartData.newEntrant[index] || 0);
      return { barangay, total };
    });
    return totals.sort((a, b) => b.total - a.total);
  }, [barChartData]);

  const totalBarangayRegistrations = useMemo(() => {
    return srsPreviewRows.reduce((sum, row) => sum + row.total, 0);
  }, [srsPreviewRows]);

  const femaleApplicants = filteredApplicants.filter((app) => app.sex === "Female").length;

  const sprsPreviewRows = useMemo(() => {
    const totalApplicants = filteredApplicants.length;
    const totalReferrals = transformedReferralsData.length;
    return [
      {
        program: "A. PESO CORE PROGRAMS",
        measure: "1.1 Job Vacancies Solicited",
        gscfo: summaryData?.activeJobPosts?.value || 0,
        lgu: summaryData?.activeJobPosts?.value || 0,
        barangay: totalBarangayRegistrations,
        total: summaryData?.activeJobPosts?.value || 0,
      },
      {
        program: "1. Referral & Placement",
        measure: "1.2 Applicants Registered",
        gscfo: totalApplicants,
        lgu: totalApplicants,
        barangay: totalBarangayRegistrations,
        total: totalApplicants,
      },
      {
        program: "",
        measure: "1.2.1 Female",
        gscfo: femaleApplicants,
        lgu: femaleApplicants,
        barangay: totalBarangayRegistrations ? Math.round((femaleApplicants / Math.max(totalApplicants, 1)) * totalBarangayRegistrations) : 0,
        total: femaleApplicants,
      },
      {
        program: "",
        measure: "1.3 Applicants Placed",
        gscfo: successfulReferrals,
        lgu: successfulReferrals,
        barangay: successfulReferrals,
        total: successfulReferrals,
      },
      {
        program: "",
        measure: "1.4 Referrals Issued",
        gscfo: totalReferrals,
        lgu: totalReferrals,
        barangay: totalReferrals,
        total: totalReferrals,
      },
    ];
  }, [filteredApplicants.length, femaleApplicants, summaryData?.activeJobPosts?.value, successfulReferrals, totalBarangayRegistrations, transformedReferralsData.length]);

  // Handle export
  const handleExportCSV = () => {
    const periodLabel = useCustomDate ? "CUSTOM" : (period ? period.toUpperCase() : "ALL");
    const dateRangeLabel = startDateFormatted && endDateFormatted
      ? `${startDateFormatted} to ${endDateFormatted}`
      : "All time";
    const dateSlug = startDateFormatted || "all";
    const csv = `ANALYTICS & KEY METRICS\n${new Date().toLocaleDateString()}\n\nPeriod: ${periodLabel}\nDate Range: ${dateRangeLabel}\n\nKEY METRICS\nPlacement Rate,${placementRate.toFixed(2)}%\nSuccessful Referrals (Hired),${successfulReferrals}\nTotal Referrals,${transformedReferralsData.length}\n\nPESO INDICATORS\n4Ps Beneficiaries,${fourPsBeneficiaries}\nOFW Applicants,${ofwApplicants}\nSenior Citizens,${seniorCitizens}\nPerson with Disability,${personWithDisability}\nSolo Parents,${soloParents}\nIndigenous People,${indigeneousPeople}\n\nEMPLOYMENT STATUS\nEmployed,${employmentStatusData?.employed || 0}\nUnemployed,${employmentStatusData?.unemployed || 0}\nSelf-Employed,${employmentStatusData?.selfEmployed || 0}\nNew Entrant,${employmentStatusData?.newEntrant || 0}\n\nTOP 20 SKILLS DEMAND\n${topSkills.map(({ skill, count }) => `${skill},${count}`).join("\n")}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateSlug}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Analytics exported as CSV",
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

  const InsightCard = ({ title, value, hint }: { title: string; value: string | number; hint: string }) => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/85 dark:bg-slate-800/70 p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-70 dark:opacity-80" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-700/60 px-2 py-[2px] text-[10px] font-semibold text-slate-600 dark:text-slate-200">Live</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>
    </div>
  );

  const SparklineCard = ({
    title,
    value,
    data,
    color,
    subtitle,
    tooltip,
  }: {
    title: string;
    value: number;
    data: number[];
    color: string;
    subtitle?: string;
    tooltip?: string;
  }) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const chartData = {
      labels: data.map((_, idx) => String(idx + 1)),
      datasets: [
        {
          data,
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    };

    return (
      <div
        className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 p-3 shadow-sm"
        title={tooltip || undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{title}</p>
              {tooltip && (
                <TooltipProvider delayDuration={100} skipDelayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex"
                        aria-label={`${title} info`}
                      >
                        <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{safeValue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{data.length > 0 ? subtitle || "Trend across selected window" : "No data in selected window"}</p>
          </div>
          {data.length > 0 ? (
            <div className="h-12 w-24">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-12 w-24 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">No trend</div>
          )}
        </div>
      </div>
    );
  };

  const insightCards = [
    {
      title: "Placement rate",
      value: `${placementRate.toFixed(1)}%`,
      hint: "Hired vs. total referrals",
    },
    {
      title: "Active employers",
      value: summaryData?.activeEmployers?.value ?? 0,
      hint: "Current registry",
    },
    {
      title: "Active job posts",
      value: summaryData?.activeJobPosts?.value ?? 0,
      hint: "Open requisitions",
    },
    {
      title: "Applicants (period)",
      value: filteredApplicants.length,
      hint: periodDescriptor,
    },
  ];

  const beneficiaryMix = [
    { name: "4Ps", value: fourPsBeneficiaries, color: "#6366f1" },
    { name: "Solo parent", value: soloParents, color: "#f97316" },
    { name: "PWD", value: personWithDisability, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const referralStatusCounts = transformedReferralsData.reduce(
    (acc: Record<string, number>, ref: { status?: string }) => {
      const key = (ref?.status || "unknown").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const referralStatusOrder = [
    "hired",
    "for deployment",
    "for interview",
    "pending",
    "ongoing",
    "rejected",
    "unknown",
  ];

  const referralStatusDonut = Object.entries(referralStatusCounts)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((item) => item.value > 0)
    .sort((a, b) => referralStatusOrder.indexOf(a.name) - referralStatusOrder.indexOf(b.name));

  const referralStatusPalette = ["#10b981", "#22c55e", "#0ea5e9", "#f59e0b", "#f97316", "#ef4444", "#6366f1"];

  const referralSparklineCards = [
    { title: "Referrals sent", series: lineChartData?.referred || [], color: "hsl(25 95% 53%)" },
    { title: "Hired", series: lineChartData?.hired || [], color: "hsl(151 55% 42%)" },
    { title: "With feedback", series: lineChartData?.feedback || [], color: "hsl(215 92% 58%)" },
  ].map((card) => ({
    ...card,
    value: card.series.reduce((sum, n) => sum + (Number(n) || 0), 0),
  }));

  const hasReferralSparklineData = referralSparklineCards.length > 0;

  const formatStatusLabel = (status: string) => {
    const normalized = status.trim().toLowerCase();
    if (!normalized) return "Unknown";
    if (normalized === "for deployment") return "For Deployment";
    if (normalized === "for interview") return "For Interview";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button 
              size="sm"
              onClick={() => setIsGeneratorOpen(true)}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Generate
            </Button>
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
                setLastUpdated(new Date());
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

          <p className="text-xs text-slate-500 dark:text-slate-400">Last refreshed: {lastUpdated ? lastUpdated.toLocaleString() : "Just now"}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightCards.map((card) => (
              <InsightCard key={card.title} title={card.title} value={card.value} hint={card.hint} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Beneficiary mix</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PWD / Solo Parent / 4Ps — {periodDescriptor}</p>
                </div>
              </div>
              {beneficiaryMix.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No beneficiary data for this window.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={beneficiaryMix}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {beneficiaryMix.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {beneficiaryMix.map((item) => (
                      <span
                        key={item.name}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1"
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Referrals by status</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Placement funnel — {periodDescriptor}</p>
                </div>
              </div>
              {referralStatusDonut.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No referrals found for this window.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={referralStatusDonut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        label={({ name, value }) => `${formatStatusLabel(name)}: ${value}`}
                      >
                        {referralStatusDonut.map((entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={referralStatusPalette[index % referralStatusPalette.length]}
                          />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                      {referralStatusDonut.map((item, index) => (
                      <span
                        key={item.name}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: referralStatusPalette[index % referralStatusPalette.length] }}
                        />
                        {formatStatusLabel(item.name)}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {referralStatusDonut.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {referralStatusDonut.map((item, index) => (
                <div
                  key={`status-card-${item.name}`}
                  className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{formatStatusLabel(item.name)}</p>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: referralStatusPalette[index % referralStatusPalette.length] }}
                    />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Referrals in this status</p>
                </div>
              ))}
            </div>
          )}

          {hasReferralSparklineData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {referralSparklineCards.map((card) => (
                <SparklineCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  data={card.series}
                  color={card.color}
                  subtitle="Trend across selected window"
                  tooltip={`${card.title}: sum ${card.value.toLocaleString()}`}
                />
              ))}
            </div>
          )}

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
                        <label className="text-sm font-medium text-slate-900 dark:text-white block mb-1">End Date</label>
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
              {/* Removed Active Freelancers card */}
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
              {/* Removed Self-Employed and New Entrant card */}
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
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expected Skills Shortage</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Direct lift from BLE shortage matrix to align with Excel tab.</p>
                </div>
                <span className="text-xs uppercase tracking-wide text-red-500 dark:text-red-300">Priority Monitor</span>
              </div>
              {skillsReportLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : expectedSkillsShortage.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-[300px] text-sm border rounded-lg">
                    <thead>
                      <tr className="bg-red-50 dark:bg-red-900/20 text-left">
                        <th className="px-4 py-2">Skill</th>
                        <th className="px-4 py-2 w-32">Slots Needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expectedSkillsShortage.map(({ skill, count }) => (
                        <tr key={skill} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-4 py-2">{skill}</td>
                          <td className="px-4 py-2 font-semibold">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No shortage flagged within the selected period.</p>
              )}
            </div>
          </div>

          {/* GOVERNMENT WORKSHEETS Section */}
          <div className="space-y-4" id="forms-toolkit">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Government Worksheet Toolkit</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Every card mirrors an attached Microsoft Excel form—use it to preview data before exporting.</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Switch checked={maskPersonalData} onCheckedChange={(checked) => setMaskPersonalData(Boolean(checked))} />
                  Mask personal identifiers
                </label>
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Switch checked={aggregatedOnlyView} onCheckedChange={(checked) => setAggregatedOnlyView(Boolean(checked))} />
                  Show aggregates only
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {templateEntries.map(([key, template]) => {
                const isSelected = selectedTemplates.includes(key);
                return (
                  <div key={key} className={`rounded-2xl border p-5 flex flex-col gap-3 ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400/60 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/40'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{template.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
                      </div>
                      <Checkbox checked={isSelected} onCheckedChange={() => handleTemplateToggle(key)} aria-label={`Select ${template.title}`} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ready for {generatorRangeLabel}</p>
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" className="flex-1" variant={isSelected ? 'default' : 'outline'} onClick={() => openGeneratorForTemplate(key)}>
                        Generate
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`#${template.anchor}`}>Preview</a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM PREVIEWS */}
          <div className="space-y-6">
            <div id="lmi-preview" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">LMI Form 1 – Individuals Reached</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Replicates the DOLE header plus roster columns (Name, Contact Details, Sex, Client Type).</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGeneratorForTemplate("lmi")}>
                  Generate from template
                </Button>
              </div>
              {aggregatedOnlyView && (
                <p className="text-xs text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/40 rounded-lg px-3 py-2">
                  Individual roster hidden. Toggle off “Show aggregates only” to display the per-applicant table exactly as in the Excel sheet.
                </p>
              )}
              {!aggregatedOnlyView && lmiPreviewRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                        <th className="px-3 py-2">No.</th>
                        <th className="px-3 py-2">Name (Last, First, Middle)</th>
                        <th className="px-3 py-2">Address</th>
                        <th className="px-3 py-2">Tel./Cellphone No.</th>
                        <th className="px-3 py-2">Male</th>
                        <th className="px-3 py-2">Female</th>
                        <th className="px-3 py-2">Youth<br />(15-24)</th>
                        <th className="px-3 py-2">Non-Youth<br />(25+)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lmiPreviewRows.map((row) => (
                        <tr key={row.no} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2">{row.no}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                          <td className="px-3 py-2">{row.address}</td>
                          <td className="px-3 py-2">{row.contact}</td>
                          <td className="px-3 py-2">{row.male}</td>
                          <td className="px-3 py-2">{row.female}</td>
                          <td className="px-3 py-2">{row.youth}</td>
                          <td className="px-3 py-2">{row.nonYouth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !aggregatedOnlyView ? (
                <p className="text-sm text-slate-500">There are no recent applicant interactions to populate LMI Form 1.</p>
              ) : null}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Total Records</p>
                  <p className="text-xl font-semibold">{youthBreakdown.total}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Youth</p>
                  <p className="text-xl font-semibold">{youthBreakdown.youth}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Non-Youth</p>
                  <p className="text-xl font-semibold">{youthBreakdown.nonYouth}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Female Registrants</p>
                  <p className="text-xl font-semibold">{youthBreakdown.female}</p>
                </div>
              </div>
            </div>

            <div id="pes-preview" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Applicants Registration Sheet (PES)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mirrors the April 2024 worksheet columns (Gender, Address, Assistance Provided).</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGeneratorForTemplate("pes")}>
                  Generate from template
                </Button>
              </div>
              {aggregatedOnlyView && (
                <p className="text-xs text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/40 rounded-lg px-3 py-2">
                  Personal identifiers hidden—toggle off “Show aggregates only” for the detailed roster.
                </p>
              )}
              {!aggregatedOnlyView && pesPreviewRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                        <th className="px-3 py-2">No.</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Male</th>
                        <th className="px-3 py-2">Female</th>
                        <th className="px-3 py-2">Address</th>
                        <th className="px-3 py-2">Tel./Cellphone</th>
                        <th className="px-3 py-2">Seeking Employment</th>
                        <th className="px-3 py-2">Counseling</th>
                        <th className="px-3 py-2">Others</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pesPreviewRows.map((row) => (
                        <tr key={row.no} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2">{row.no}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                          <td className="px-3 py-2">{row.male}</td>
                          <td className="px-3 py-2">{row.female}</td>
                          <td className="px-3 py-2">{row.address}</td>
                          <td className="px-3 py-2">{row.contact}</td>
                          <td className="px-3 py-2">{row.seekingEmployment}</td>
                          <td className="px-3 py-2">{row.counseling}</td>
                          <td className="px-3 py-2">{row.others}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !aggregatedOnlyView ? (
                <p className="text-sm text-slate-500">No applicant registrations fall within this filter.</p>
              ) : null}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Assisted Applicants</p>
                  <p className="text-xl font-semibold">{filteredApplicants.length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Seeking Employment</p>
                  <p className="text-xl font-semibold">{filteredApplicants.filter((app) => deriveAssistanceFlags(app).seekingEmployment).length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Counseling</p>
                  <p className="text-xl font-semibold">{filteredApplicants.filter((app) => deriveAssistanceFlags(app).counseling).length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs uppercase text-slate-500">Other Services</p>
                  <p className="text-xl font-semibold">{filteredApplicants.filter((app) => deriveAssistanceFlags(app).others).length}</p>
                </div>
              </div>
            </div>

            <div id="srs-preview" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Registry System Statistical Report</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Barangay vs. total registrants (mirrors the January 2023 sheet layout).</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGeneratorForTemplate("srs")}>
                  Generate from template
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                      <th className="px-3 py-2">Barangay</th>
                      <th className="px-3 py-2">Total Registrants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {srsPreviewRows.slice(0, 15).map((row) => (
                      <tr key={row.barangay} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2">{row.barangay}</td>
                        <td className="px-3 py-2 font-semibold">{row.total}</td>
                      </tr>
                    ))}
                    {srsPreviewRows.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-center text-slate-500">No barangay submissions for the selected period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Reporting Window Total: <span className="font-semibold text-slate-900 dark:text-white">{totalBarangayRegistrations}</span> registrants
              </div>
            </div>

            <div id="sprs-preview" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Consolidated PESO Statistical Performance (SPRS)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Key PESO program accomplishments referencing the official spreadsheet columns.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openGeneratorForTemplate("sprs")}>
                  Generate from template
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                      <th className="px-3 py-2">Key PESO Program</th>
                      <th className="px-3 py-2">Performance Measure</th>
                      <th className="px-3 py-2">GSCFO</th>
                      <th className="px-3 py-2">LGU PESO Gensan</th>
                      <th className="px-3 py-2">Barangay</th>
                      <th className="px-3 py-2">Total Gensan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sprsPreviewRows.map((row, index) => (
                      <tr key={`${row.measure}-${index}`} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-semibold">{row.program || "—"}</td>
                        <td className="px-3 py-2">{row.measure}</td>
                        <td className="px-3 py-2">{row.gscfo}</td>
                        <td className="px-3 py-2">{row.lgu}</td>
                        <td className="px-3 py-2">{row.barangay}</td>
                        <td className="px-3 py-2">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Excel Worksheets</DialogTitle>
            <DialogDescription>
              Download the exact Microsoft Excel forms bundled with GensanWorks for {generatorRangeLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Select forms to include</Label>
              {fieldErrors.templates && (
                <p className="mt-2 text-xs text-destructive" aria-invalid={!!fieldErrors.templates} tabIndex={-1}>
                  {fieldErrors.templates}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {templateEntries.map(([key, template]) => {
                  const isChecked = selectedTemplates.includes(key);
                  return (
                    <label
                      key={key}
                      aria-invalid={!!fieldErrors.templates}
                      className={`border rounded-xl p-4 space-y-2 cursor-pointer transition aria-[invalid=true]:border-destructive ${isChecked ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 dark:border-blue-400/60' : 'border-slate-200 dark:border-slate-700/60'}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isChecked} onCheckedChange={() => handleTemplateToggle(key)} />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{template.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Preview anchor: #{template.anchor}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reporting period</Label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Use current page filters</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{periodDescriptor}</p>
                  </div>
                  <Switch checked={usePageFilters} onCheckedChange={(checked) => setUsePageFilters(Boolean(checked))} />
                </div>
                <Input
                  type="month"
                  value={generatorMonthValue}
                  onChange={(e) => setGeneratorMonthValue(e.target.value)}
                  disabled={usePageFilters}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional options</Label>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  <label className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Mask personal identifiers</span>
                    <Switch checked={maskPersonalData} onCheckedChange={(checked) => setMaskPersonalData(Boolean(checked))} />
                  </label>
                  <label className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Show aggregates only in preview</span>
                    <Switch checked={aggregatedOnlyView} onCheckedChange={(checked) => setAggregatedOnlyView(Boolean(checked))} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Files retain the official structure from the attached Microsoft Excel forms.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsGeneratorOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateForms} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Download {selectedTemplates.length || ""}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
