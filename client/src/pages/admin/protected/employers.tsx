/**
 * Admin Employers Page
 * Route: /admin/employers
 * Only accessible to users with role='admin'
 */
import { useState, useEffect, useMemo } from "react";
import { authFetch } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Eye, Edit, Trash2, Archive, Plus, RefreshCw, Building2, Factory, Users, Layers, ChevronDown, FileText, Download, Undo2, Check, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { AddEmployerModal } from "@/components/add-employer-modal";
import { ViewEmployerModal } from "@/components/view-employer-modal";
import { EditEmployerModal } from "@/components/edit-employer-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminEmployersPage() {
  const { toast } = useToast();
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employerModalOpen, setEmployerModalOpen] = useState(false);
  const [viewEmployerModalOpen, setViewEmployerModalOpen] = useState(false);
  const [editEmployerModalOpen, setEditEmployerModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployerIds, setSelectedEmployerIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employerToDelete, setEmployerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "rejected" | "archived">("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "subscriber" | "non-subscriber">("all");
  const [multiCompanyFilter, setMultiCompanyFilter] = useState<"all" | "multi" | "solo">("all");
  const [requirementsFilter, setRequirementsFilter] = useState<"all" | "pending" | "clear">("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedCompliance, setExpandedCompliance] = useState<Set<string>>(new Set());

  const getEmployerAccountStatus = (emp: any): string => {
    const raw = emp?.accountStatus ?? emp?.account_status;
    return typeof raw === "string" && raw.trim() ? raw.trim().toLowerCase() : "pending";
  };

  const activeFilters = useMemo(() => {
    const chips: { label: string; value: string }[] = [];
    if (statusFilter !== "all") chips.push({ label: "Status", value: statusFilter });
    if (subscriptionFilter !== "all") chips.push({ label: "Subscription", value: subscriptionFilter });
    if (multiCompanyFilter !== "all") chips.push({ label: "Company", value: multiCompanyFilter });
    if (requirementsFilter !== "all") chips.push({ label: "Compliance", value: requirementsFilter });
    if (searchQuery.trim()) chips.push({ label: "Search", value: searchQuery.trim() });
    return chips;
  }, [multiCompanyFilter, requirementsFilter, searchQuery, statusFilter, subscriptionFilter]);

  // Restore expanded compliance panels from localStorage for continuity across refresh.
  useEffect(() => {
    const saved = localStorage.getItem("employers:expanded-compliance");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setExpandedCompliance(new Set(parsed));
      } catch {
        /* ignore parse errors */
      }
    }
  }, []);

  // Persist filters via URL query params so refresh keeps state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const getFilter = (key: string, current: string) => {
      const value = params.get(key);
      return value && ["all", "pending", "active", "rejected", "archived", "subscriber", "non-subscriber", "multi", "solo", "clear"].includes(value)
        ? (value as any)
        : current;
    };

    const prevSnapshot = {
      status: statusFilter,
      sub: subscriptionFilter,
      multi: multiCompanyFilter,
      req: requirementsFilter,
      query: searchQuery,
    };

    const nextStatus = getFilter("status", statusFilter) as typeof statusFilter;
    const nextSub = getFilter("sub", subscriptionFilter) as typeof subscriptionFilter;
    const nextMulti = getFilter("multi", multiCompanyFilter) as typeof multiCompanyFilter;
    const nextReq = getFilter("req", requirementsFilter) as typeof requirementsFilter;
    const query = params.get("q");

    setStatusFilter(nextStatus);
    setSubscriptionFilter(nextSub);
    setMultiCompanyFilter(nextMulti);
    setRequirementsFilter(nextReq);
    if (query) setSearchQuery(query);

    if (params.toString()) {
      const changed =
        prevSnapshot.status !== nextStatus ||
        prevSnapshot.sub !== nextSub ||
        prevSnapshot.multi !== nextMulti ||
        prevSnapshot.req !== nextReq ||
        prevSnapshot.query !== query;
      if (changed) {
        toast({ title: "Filters restored", description: "Reloaded your employer filters from the URL." });
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (subscriptionFilter !== "all") params.set("sub", subscriptionFilter);
    if (multiCompanyFilter !== "all") params.set("multi", multiCompanyFilter);
    if (requirementsFilter !== "all") params.set("req", requirementsFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }, [statusFilter, subscriptionFilter, multiCompanyFilter, requirementsFilter, searchQuery]);

  const normalizeIndustryList = (raw: unknown): string[] => {
    if (!raw) return [];
    const toLabel = (entry: unknown): string | null => {
      if (!entry) return null;
      if (typeof entry === "string") return entry;
      if (typeof entry === "object") {
        const typed = entry as { code?: string; description?: string };
        return typed.description || typed.code || null;
      }
      return String(entry);
    };

    if (Array.isArray(raw)) {
      return raw
        .map((entry) => toLabel(entry))
        .filter((value): value is string => Boolean(value));
    }

    const single = toLabel(raw);
    return single ? [single] : [];
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const handleApproveEmployerAccount = async (employerId: string, employerName: string) => {
    try {
      const res = await authFetch(`/api/employers/${employerId}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to approve employer");
      const data = await res.json();
      const updatedEmployer = data?.employer;
      toast({ title: "Employer approved", description: `"${employerName}" can now post job vacancies.` });
      setEmployers((prev) => prev.map((e) => (e.id === employerId ? { ...e, ...(updatedEmployer || {}), accountStatus: "active" } : e)));
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to approve employer", variant: "destructive" });
    }
  };

  const handleRejectEmployerAccount = async (employerId: string, employerName: string) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      const res = await authFetch(`/api/employers/${employerId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject employer");
      const data = await res.json();
      const updatedEmployer = data?.employer;
      toast({ title: "Employer rejected", description: `"${employerName}" has been rejected.` });
      setEmployers((prev) => prev.map((e) => (e.id === employerId ? { ...e, ...(updatedEmployer || {}), accountStatus: "rejected" } : e)));
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to reject employer", variant: "destructive" });
    }
  };

  const getFileUrlFromMetadata = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const typed = value as { url?: string; path?: string; fileUrl?: string; file?: string };
      return typed.url || typed.path || typed.fileUrl || typed.file;
    }
    return undefined;
  };

  const buildRequirementEntries = (requirements?: Record<string, any>) => {
    if (!requirements) return [] as Array<{ key: string; label: string; status: string; fileUrl?: string; submitted?: boolean; required?: boolean; }>; // typed helper
    return Object.entries(requirements).map(([key, value]) => {
      const label = (value as any)?.label || key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
      const submitted = Boolean((value as any)?.submitted);
      const required = (value as any)?.required !== false; // default required
      const status = submitted ? "Submitted" : required ? "Pending" : "Optional";
      const fileUrl = (value as any)?.fileUrl || (value as any)?.url || (value as any)?.file;
      return { key, label, status, fileUrl, submitted, required };
    });
  };

  const buildComplianceEntries = (employer: any) => {
    const fromChecklist = buildRequirementEntries(employer?.requirements);
    if (fromChecklist.length > 0) return fromChecklist;

    const docFields = [
      { key: "businessPermitFile", label: "Business Permit" },
      { key: "bir2303File", label: "BIR Form 2303" },
      { key: "companyProfileFile", label: "Company Profile" },
      { key: "doleCertificationFile", label: "DOLE Accreditation" },
    ] as const;

    return docFields.map((doc) => {
      const fileUrl = getFileUrlFromMetadata(employer?.[doc.key]);
      const submitted = Boolean(fileUrl);
      const required = true;
      const status = submitted ? "Submitted" : "Pending";
      return { key: doc.key, label: doc.label, status, fileUrl, submitted, required };
    });
  };

  const getPendingRequirementCount = (employer: any) =>
    buildComplianceEntries(employer).filter((item) => item.required && !item.submitted).length;

  const formatAddress = (employer: any) => {
    const segments = [employer.houseStreetVillage, employer.barangay, employer.municipality, employer.province].filter(Boolean);
    return segments.join(", ");
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleComplianceExpansion = (id: string) => {
    setExpandedCompliance((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("employers:expanded-compliance", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/employers?limit=10000&includeArchived=true");
      if (!res.ok) throw new Error("Failed to fetch employers");
      const data = await res.json();
      // If API returns { employers: [...] }, use that, else fallback to data as array
      if (Array.isArray(data)) {
        setEmployers(data.filter(Boolean));
      } else if (data && Array.isArray(data.employers)) {
        setEmployers(data.employers.filter(Boolean));
      } else {
        setEmployers([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setViewEmployerModalOpen(true);
  };

  const handleEditEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setEditEmployerModalOpen(true);
  };

  const handleSelectEmployer = (employerId: string) => {
    const newSelected = new Set(selectedEmployerIds);
    if (newSelected.has(employerId)) {
      newSelected.delete(employerId);
    } else {
      newSelected.add(employerId);
    }
    setSelectedEmployerIds(newSelected);
  };

  const handleDeleteEmployer = async (employerId: string) => {
    try {
      setIsDeleting(true);
      const res = await authFetch(`/api/employers/${employerId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete employer");

      toast({
        title: "Success",
        description: "Employer deleted successfully",
      });

      setEmployers(employers.filter((e) => e.id !== employerId));
      setSelectedEmployerIds(new Set(Array.from(selectedEmployerIds).filter((id) => id !== employerId)));
      setDeleteDialogOpen(false);
      setEmployerToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveEmployer = async (employerId: string, employerName: string) => {
    try {
      const res = await authFetch(`/api/employers/${employerId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });

      if (!res.ok) throw new Error("Failed to archive employer");

      const payload = await res.json().catch(() => null);
      const updatedEmployer = payload?.employer;

      toast({
        title: "Success",
        description: `"${employerName}" has been archived successfully`,
      });

      setEmployers((prev) =>
        prev.map((e) =>
          e.id === employerId
            ? { ...e, ...(updatedEmployer || {}), archived: true }
            : e
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await authFetch("/api/employers/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedEmployerIds) }),
      });

      if (!res.ok) throw new Error("Failed to delete employers");

      toast({
        title: "Success",
        description: `${selectedEmployerIds.size} employer(s) deleted successfully`,
      });

      setEmployers(employers.filter((e) => !selectedEmployerIds.has(e.id)));
      setSelectedEmployerIds(new Set());
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const archivedCount = employers.filter((emp) => emp.archived).length;
  const nonArchivedCount = employers.filter((emp) => !emp.archived).length;
  const pendingApprovalCount = employers.filter((emp) => !emp.archived && getEmployerAccountStatus(emp) === "pending").length;
  const activeCount = employers.filter((emp) => !emp.archived && getEmployerAccountStatus(emp) === "active").length;
  const rejectedCount = employers.filter((emp) => !emp.archived && getEmployerAccountStatus(emp) === "rejected").length;

  const statusCounts: Record<string, number> = {
    all: nonArchivedCount,
    pending: pendingApprovalCount,
    active: activeCount,
    rejected: rejectedCount,
    archived: archivedCount,
  };


  const filteredEmployers = employers
    .filter((emp) => {
      const query = searchQuery.trim().toLowerCase();
      const searchableFields = [
        emp.establishmentName,
        emp.tradeName,
        emp.municipality,
        emp.province,
        emp.contactPerson?.personName,
        emp.email,
      ].filter((value): value is string => typeof value === "string");
      const matchesQuery =
        query.length === 0 || searchableFields.some((field) => field.toLowerCase().includes(query));

      const accountStatus = getEmployerAccountStatus(emp);
      const matchesStatus =
        statusFilter === "archived"
          ? Boolean(emp.archived)
          : statusFilter === "all"
            ? !emp.archived
            : !emp.archived && accountStatus === statusFilter;

      const matchesSubscription =
        subscriptionFilter === "all"
          ? true
          : subscriptionFilter === "subscriber"
            ? Boolean(emp.srsSubscriber)
            : !emp.srsSubscriber;

      const additionalCount = emp.additionalEstablishments?.length ?? 0;
      const matchesMulti =
        multiCompanyFilter === "all"
          ? true
          : multiCompanyFilter === "multi"
            ? additionalCount > 0
            : additionalCount === 0;

      const pendingCount = getPendingRequirementCount(emp);
      const matchesRequirements =
        requirementsFilter === "all"
          ? true
          : requirementsFilter === "pending"
            ? pendingCount > 0
            : pendingCount === 0;

      return matchesQuery && matchesStatus && matchesSubscription && matchesMulti && matchesRequirements;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const clearFilters = () => {
    setStatusFilter("all");
    setSubscriptionFilter("all");
    setMultiCompanyFilter("all");
    setRequirementsFilter("all");
    setSearchQuery("");
  };

  const handleDownloadAllCompliance = async (employer: any) => {
    const entries = buildComplianceEntries(employer);
    const files = entries
      .map((req) => ({ url: req.fileUrl, label: req.label }))
      .filter((item): item is { url: string; label: string } => Boolean(item.url));

    if (files.length === 0) {
      toast({ title: "No files", description: "This employer has no uploaded compliance files." });
      return;
    }

    const zip = new JSZip();
    let downloaded = 0;

    await Promise.all(
      files.map(async (file, index) => {
        try {
          const res = await fetch(file.url);
          if (!res.ok) throw new Error(`Failed to fetch ${file.label}`);
          const blob = await res.blob();
          const fileExt = (file.url.split(".").pop() || "file").split("?")[0];
          const safeName = file.label.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").toLowerCase();
          zip.file(`${safeName || "document"}-${index + 1}.${fileExt}`, blob);
          downloaded += 1;
        } catch (err) {
          console.error(err);
        }
      })
    );

    if (downloaded === 0) {
      toast({ title: "Download failed", description: "Could not retrieve any files." });
      return;
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${(employer.establishmentName || "employer").replace(/[^a-z0-9]/gi, "-").toLowerCase()}-compliance.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "ZIP ready",
      description: `Downloaded ${downloaded} file${downloaded === 1 ? "" : "s"} into a single archive`,
    });
  };

  const handleMarkAllSubmitted = async (employerId: string) => {
    try {
      const res = await authFetch(`/api/employers/${employerId}/requirements/submit-all`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to update compliance");
      const payload = await res.json();
      setEmployers((prev) =>
        prev.map((emp) => (emp.id === employerId ? { ...emp, requirements: payload.requirements } : emp))
      );
      toast({ title: "Marked submitted", description: "Server updated all compliance items for this employer." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkSelectedSubmitted = async () => {
    if (selectedEmployerIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedEmployerIds).map((id) =>
          authFetch(`/api/employers/${id}/requirements/submit-all`, { method: "PATCH" })
        )
      );
      // Refetch to ensure sync
      await fetchEmployers();
      toast({
        title: "Marked selected",
        description: `${selectedEmployerIds.size} employer${selectedEmployerIds.size === 1 ? "" : "s"} marked as compliant on server.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleExportComplianceCsv = () => {
    const rows = filteredEmployers.flatMap((emp) =>
      buildComplianceEntries(emp).map((req) => ({
        employer: emp.establishmentName || emp.tradeName || "Unknown Employer",
        requirement: req.label,
        status: req.status,
        required: req.required ? "Yes" : "Optional",
        submitted: req.submitted ? "Yes" : "No",
        fileUrl: req.fileUrl || "",
      }))
    );

    if (rows.length === 0) {
      toast({
        title: "No compliance data",
        description: "Nothing to export for the current filters.",
        variant: "destructive",
      });
      return;
    }

    const header = "Employer,Requirement,Status,Required,Submitted,File URL";
    const csvBody = rows
      .map((row) =>
        [row.employer, row.requirement, row.status, row.required, row.submitted, row.fileUrl]
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csv = `${header}\n${csvBody}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `employer-compliance-${filteredEmployers.length}-records.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Compliance exported",
      description: `${rows.length} line${rows.length === 1 ? "" : "s"} ready as CSV`,
    });
  };

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
          <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
            <div className="flex flex-wrap gap-2 justify-end">
              {selectedEmployerIds.size > 0 && (
                <Button
                  onClick={() => {
                    setDeleteDialogOpen(true);
                    setEmployerToDelete(null);
                  }}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedEmployerIds.size})
                </Button>
              )}
              {selectedEmployerIds.size > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleMarkSelectedSubmitted}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Mark Selected Submitted
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => fetchEmployers()}
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExportComplianceCsv}
                className="gap-2"
                disabled={filteredEmployers.length === 0}
              >
                <Download className="h-4 w-4" />
                Export Compliance
              </Button>
              <Button onClick={() => setEmployerModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employer
              </Button>
            </div>

            {/* Status Tabs (Jobs page style) */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "active", label: "Active" },
                  { key: "rejected", label: "Rejected" },
                  { key: "archived", label: "Archived" },
                ].map((tab) => {
                  const count = statusCounts[tab.key] || 0;
                  const isActive = statusFilter === (tab.key as any);
                  return (
                    <Button
                      key={tab.key}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setStatusFilter(tab.key as any)}
                      className="gap-2"
                    >
                      <span>{tab.label}</span>
                      {tab.key !== "all" && (
                        <Badge variant="secondary" className="ml-1">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employers by name, city, or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap justify-between">
                <p>
                  Showing <span className="font-semibold text-slate-700 dark:text-white">{filteredEmployers.length}</span> of {statusFilter === "archived" ? archivedCount : nonArchivedCount} employers
                </p>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={clearFilters}>
                  <Undo2 className="h-4 w-4" />
                  Clear filters
                </Button>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {activeFilters.map((chip) => (
                  <span key={`${chip.label}-${chip.value}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">{chip.label}:</span> {chip.value}
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={subscriptionFilter}
                onValueChange={(value) => setSubscriptionFilter(value as typeof subscriptionFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subscription states</SelectItem>
                  <SelectItem value="subscriber">SRS subscribers</SelectItem>
                  <SelectItem value="non-subscriber">Non-subscribers</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={multiCompanyFilter}
                onValueChange={(value) => setMultiCompanyFilter(value as typeof multiCompanyFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Company scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All company types</SelectItem>
                  <SelectItem value="multi">With additional establishments</SelectItem>
                  <SelectItem value="solo">Single establishment</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={requirementsFilter}
                onValueChange={(value) => setRequirementsFilter(value as typeof requirementsFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Compliance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All compliance states</SelectItem>
                  <SelectItem value="pending">Pending documents</SelectItem>
                  <SelectItem value="clear">Cleared documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <Button
                size="sm"
                variant={subscriptionFilter === "subscriber" ? "default" : "outline"}
                onClick={() => setSubscriptionFilter(subscriptionFilter === "subscriber" ? "all" : "subscriber")}
                className="h-8"
              >
                SRS subscribers
              </Button>
              <Button
                size="sm"
                variant={requirementsFilter === "pending" ? "default" : "outline"}
                onClick={() => setRequirementsFilter(requirementsFilter === "pending" ? "all" : "pending")}
                className="h-8"
              >
                Pending docs
              </Button>
              <Button
                size="sm"
                variant={multiCompanyFilter === "multi" ? "default" : "outline"}
                onClick={() => setMultiCompanyFilter(multiCompanyFilter === "multi" ? "all" : "multi")}
                className="h-8"
              >
                Multi-company
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-8 text-slate-600 dark:text-slate-300">
              <div className="mx-auto max-w-xl space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : filteredEmployers.length === 0 ? (
            <Card className="border-dashed border-2 border-border bg-white dark:bg-slate-800">
              <CardContent className="text-center py-10">
                <p className="text-slate-600 dark:text-slate-300">No employers match your filters. Adjust the filters or add a new employer.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEmployers.map((employer) => {
                const isSelected = selectedEmployerIds.has(employer.id);
                const additionalCount = employer.additionalEstablishments?.length ?? 0;
                const hasAdditional = additionalCount > 0;
                const pendingCount = getPendingRequirementCount(employer);
                const isExpanded = expandedCards.has(employer.id);
                const industries = normalizeIndustryList(employer.industryCodes ?? employer.industryType);
                const primaryIndustry = industries[0];
                const contactPerson = employer.contactPerson;

                return (
                  <Card
                    key={employer.id}
                    className={`border-border shadow-sm transition ${isSelected ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectEmployer(employer.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-semibold text-slate-900">{employer.establishmentName}</h3>
                              {hasAdditional && <Badge className="bg-blue-50 text-blue-700">Multi-company</Badge>}
                              {employer.accountStatus === "pending" && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  Pending approval
                                </Badge>
                              )}
                              {employer.accountStatus === "rejected" && (
                                <Badge variant="destructive">Rejected</Badge>
                              )}
                              {employer.srsSubscriber && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                  SRS Subscriber
                                </Badge>
                              )}
                              {employer.archived && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  Archived
                                </Badge>
                              )}
                              {pendingCount > 0 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  {pendingCount} pending doc{pendingCount > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{formatAddress(employer)}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                              <span>Primary industry: {primaryIndustry || "Not specified"}</span>
                              <span>Last updated: {formatDate(employer.updatedAt || employer.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {employer.accountStatus === "pending" && employer.createdBy === "self" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleApproveEmployerAccount(employer.id, employer.establishmentName)}
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Approve employer account</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRejectEmployerAccount(employer.id, employer.establishmentName)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reject employer account</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewEmployer(employer)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View employer profile</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditEmployer(employer)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit employer</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleArchiveEmployer(employer.id, employer.establishmentName)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archive employer</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEmployerToDelete(employer.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete employer</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Paid employees</p>
                          <p className="text-lg font-semibold text-slate-900">{employer.numberOfPaidEmployees ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Vacant positions</p>
                          <p className="text-lg font-semibold text-slate-900">{employer.numberOfVacantPositions ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Contact person</p>
                          <p className="text-sm font-semibold text-slate-900">{contactPerson?.personName || "Not set"}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {contactPerson?.contactNumber || contactPerson?.email || employer.contactNumber || "—"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs text-slate-500">Subscription</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {employer.subscriptionStatus || (employer.srsSubscriber ? "Subscriber" : "Non-subscriber")}
                          </p>
                          <p className="text-xs text-slate-500">TIN: {employer.companyTIN || employer.companyTin || "—"}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Compliance overview</p>
                          <p className="text-xs text-slate-500">
                            {pendingCount > 0 ? `${pendingCount} requirement${pendingCount > 1 ? "s" : ""} pending` : "All required documents submitted"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={pendingCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}
                          >
                            {pendingCount > 0 ? "Pending" : "Complete"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => toggleComplianceExpansion(employer.id)}
                          >
                            {expandedCompliance.has(employer.id) ? "Hide" : "View"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => handleDownloadAllCompliance(employer)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download all docs
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => handleMarkAllSubmitted(employer.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark all submitted
                          </Button>
                        </div>
                      </div>

                      {expandedCompliance.has(employer.id) && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                          {buildComplianceEntries(employer).length === 0 ? (
                            <p className="text-sm text-slate-600">No compliance data available.</p>
                          ) : (
                            buildComplianceEntries(employer).map((req) => (
                              <div key={req.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border border-slate-100 rounded-lg p-3 bg-slate-50">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-slate-900">{req.label}</p>
                                  <p className="text-xs text-slate-500">
                                    {req.required ? "Required" : "Optional"} • {req.status}
                                  </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className={req.submitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                                    {req.submitted ? "Submitted" : "Pending"}
                                  </Badge>
                                  {req.fileUrl ? (
                                    <>
                                      <Button asChild variant="outline" size="sm" className="gap-1">
                                        <a href={req.fileUrl} target="_blank" rel="noreferrer">
                                          <FileText className="h-4 w-4" />
                                          Preview
                                        </a>
                                      </Button>
                                      <Button asChild variant="secondary" size="sm" className="gap-1">
                                        <a href={req.fileUrl} download>
                                          <Download className="h-4 w-4" />
                                          Download
                                        </a>
                                      </Button>
                                    </>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-500 bg-slate-100">No file</Badge>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {hasAdditional && (
                        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Additional establishments</p>
                              <p className="text-xs text-slate-500">{additionalCount} branch{additionalCount > 1 ? "es" : ""} linked</p>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => toggleCardExpansion(employer.id)}>
                              {isExpanded ? "Hide" : "Show"}
                              <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                            </Button>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 space-y-3">
                              {employer.additionalEstablishments?.map((branch: any, index: number) => (
                                <div
                                  key={`${employer.id}-branch-${index}`}
                                  className="rounded-md bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-200 dark:border-slate-700"
                                >
                                  <p className="text-sm font-semibold text-slate-900">{branch.establishmentName}</p>
                                  <p className="text-xs text-slate-500 mt-1">{formatAddress(branch)}</p>
                                  <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-4">
                                    <span>Contact: {branch.contactPerson?.personName || "—"}</span>
                                    {branch.contactPerson?.contactNumber && <span>{branch.contactPerson.contactNumber}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

      <AddEmployerModal
        open={employerModalOpen}
        onOpenChange={setEmployerModalOpen}
        onEmployerAdded={(employer) => {
          // Add newly created employer to the list
          if (employer && employer.id) {
            setEmployers((prev) => [employer, ...prev]);
            // Automatically select the new employer
            setSelectedEmployer(employer);
          } else {
            // Fallback to fetching if employer data isn't returned
            fetchEmployers();
          }
        }}
      />

      {selectedEmployer && (
        <ViewEmployerModal
          open={viewEmployerModalOpen}
          onOpenChange={setViewEmployerModalOpen}
          employer={selectedEmployer}
          onEmployerUpdated={() => {
            fetchEmployers();
            setSelectedEmployer(null);
          }}
        />
      )}

      {selectedEmployer && (
        <EditEmployerModal
          open={editEmployerModalOpen}
          onOpenChange={setEditEmployerModalOpen}
          employer={selectedEmployer}
          onEmployerUpdated={fetchEmployers}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer{employerToDelete ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {employerToDelete
                ? "This employer will be permanently deleted. This action cannot be undone."
                : `${selectedEmployerIds.size} employer(s) will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (employerToDelete) {
                handleDeleteEmployer(employerToDelete);
              } else {
                handleBulkDelete();
              }
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
