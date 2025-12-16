/**
 * Admin Matching Page
 * Route: /admin/matching
 * Only accessible to users with role='admin'
 */
import { useMemo, useState } from "react";
import type { Job } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, RefreshCw, Search, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIJobMatchingModal } from "@/components/ai-job-matching-modal";
import { authFetch } from "@/lib/auth";

type AdminJobVacancy = Job & {
  employmentType?: string | null;
};

const statusAliasMap: Record<string, "pending" | "active" | "rejected" | "draft"> = {
  approved: "active",
  published: "active",
  open: "active",
  closed: "pending",
  archived: "pending",
};

const normalizeStatus = (status?: string) => {
  const value = (status ?? "pending").toLowerCase();
  if (statusAliasMap[value]) {
    return statusAliasMap[value];
  }
  return ["pending", "active", "rejected", "draft"].includes(value) ? value : "pending";
};

interface Applicant {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  contactNumber: string;
  barangay: string;
  employmentStatus: string;
  skills?: string[];
  education?: any[];
  workExperience?: any[];
}

const normalizeEmploymentStatus = (value?: string) => (value ?? "").trim().toLowerCase();

const isEmployedStatus = (value?: string) => {
  const normalized = normalizeEmploymentStatus(value);
  return ["employed", "wage employed", "self-employed", "self employed"].includes(normalized);
};

export default function AdminMatchingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobForMatching, setSelectedJobForMatching] = useState<AdminJobVacancy | null>(null);
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);

  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["/api/admin/jobs"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/jobs");
      if (!res.ok) throw new Error("Failed to fetch admin jobs");
      const data = await res.json();
      return Array.isArray(data) ? data : data?.jobs || [];
    },
  });

  const {
    data: applicantsData,
    isLoading: applicantsLoading,
    refetch: refetchApplicants,
  } = useQuery({
    queryKey: ["/api/applicants"],
    queryFn: async () => {
      const res = await authFetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
  });

  const jobs: AdminJobVacancy[] = Array.isArray(jobsData) ? jobsData : jobsData ?? [];

  const approvedJobs = useMemo(() => {
    return jobs.filter((job) => !job.archived && normalizeStatus(job.status) === "active");
  }, [jobs]);
  const applicants: Applicant[] = Array.isArray(applicantsData)
    ? applicantsData
    : (applicantsData?.applicants ?? applicantsData ?? []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return approvedJobs.filter((job) => {
      if (!query) return true;

      const haystack = [
        job.positionTitle,
        job.establishmentName,
        job.mainSkillOrSpecialization,
        job.location,
        job.skills,
      ]
        .map((value) => (value ? value.toLowerCase() : ""))
        .join(" ");
      return haystack.includes(query);
    });
  }, [approvedJobs, searchQuery]);

  const availableApplicants = applicants.filter((a) => !isEmployedStatus(a.employmentStatus)).length;
  const isLoading = jobsLoading || applicantsLoading;

  const handleRefresh = () => {
    refetchJobs();
    refetchApplicants();
  };

  const openMatchingModal = (job: AdminJobVacancy) => {
    setSelectedJobForMatching(job);
    setMatchingModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
          <div className="container mx-auto max-w-[1600px] space-y-6 p-6">
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" className="gap-2" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh data
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Approved jobs</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{approvedJobs.length}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Available applicants</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{availableApplicants}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 flex-col md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search approved jobs by title, employer, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 dark:bg-slate-800/80"
                />
              </div>
              <Button variant="outline" className="gap-2" onClick={handleRefresh}>
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="space-y-3 w-full max-w-xl">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2">No approved jobs match your search.</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Adjust the search or refresh data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const employerName = job.establishmentName || job.company || "—";
                const location =
                  job.location ||
                  [job.barangay, (job as any).municipality, (job as any).province].filter(Boolean).join(", ") ||
                  "Location not provided";

                return (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition flex flex-col gap-3 p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold">Approved</p>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">{job.positionTitle || job.title}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-1">{employerName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="line-clamp-1">{location}</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-2 text-xs bg-purple-600 hover:bg-purple-700"
                      onClick={() => openMatchingModal(job)}
                    >
                      <Wand2 className="h-4 w-4" />
                      Match Applicants
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {matchingModalOpen && selectedJobForMatching?.id && (
            <AIJobMatchingModal
              jobId={selectedJobForMatching.id}
              jobTitle={selectedJobForMatching.positionTitle}
              onClose={() => setMatchingModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
