/**
 * Admin Matching Page
 * Route: /admin/matching
 * Only accessible to users with role='admin'
 */
import { useState } from "react";
import type { JobVacancy as BaseJobVacancy } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Wand2, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIJobMatchingModal } from "@/components/ai-job-matching-modal";

type AdminJobVacancy = BaseJobVacancy & {
  workLocation?: string;
  salaryFrom?: number;
  salaryTo?: number;
  numberOfVacancies?: number; // alias of vacantPositions if present
  occupationCategory?: string;
  workDescription?: string;
  employmentType?: string;
  archived?: boolean;
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

export default function AdminMatchingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobForMatching, setSelectedJobForMatching] = useState<AdminJobVacancy | null>(null);
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);

  // Fetch job vacancies data
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/job-vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/job-vacancies");
      if (!res.ok) throw new Error("Failed to fetch job vacancies");
      return res.json();
    },
  });

  // Fetch applicants data
  const { data: applicantsData, isLoading: applicantsLoading } = useQuery({
    queryKey: ["/api/applicants"],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
  });

  const jobs: AdminJobVacancy[] = Array.isArray(jobsData)
    ? jobsData
    : (jobsData?.vacancies ?? []);
  const applicants: Applicant[] = Array.isArray(applicantsData)
    ? applicantsData
    : (applicantsData?.applicants ?? applicantsData ?? []);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.establishmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.workLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.mainSkillOrSpecialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunAutoMatch = () => {
    toast({
      title: "Auto-Matching Started",
      description: "Analyzing applicants and job requirements...",
    });
    // Implement auto-matching algorithm here
  };

  if (jobsLoading || applicantsLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <p className="text-center text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Job Matching</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Match applicants with job opportunities</p>
          </div>
          <Button className="gap-2" onClick={handleRunAutoMatch}>
            <Wand2 className="h-4 w-4" />
            Run Auto-Match
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs by title, company, or location..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Jobs</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Available Applicants</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {applicants.filter(a => a.employmentStatus !== "Employed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-base line-clamp-2 flex-1">
                      {job.positionTitle}
                    </h3>
                    <Badge variant="default" className="ml-2 shrink-0">
                      {job.numberOfVacancies || 0} slots
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 font-medium line-clamp-1">
                    {job.establishmentName}
                  </p>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Location & Salary */}
                  <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200">
                    <div>
                      <p className="text-slate-600 font-medium mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </p>
                      <p className="text-xs text-slate-900 line-clamp-1">
                        {job.workLocation || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Salary
                      </p>
                      <p className="text-xs font-semibold text-slate-900">
                        {job.salaryFrom && job.salaryTo 
                          ? `₱${job.salaryFrom.toLocaleString()} - ₱${job.salaryTo.toLocaleString()}`
                          : "Not specified"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.mainSkillOrSpecialization && (
                    <div className="mb-3 pb-3 border-b border-slate-200">
                      <p className="text-xs text-slate-600 font-medium mb-1 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Main Skill
                      </p>
                      <p className="text-sm text-slate-900 line-clamp-2">
                        {job.mainSkillOrSpecialization}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(job.createdAt || "").toLocaleDateString()}
                  </p>
                </div>

                {/* Footer - AI Match Button Only */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <Button
                    size="sm"
                    className="w-full text-xs h-9 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setSelectedJobForMatching(job);
                      setMatchingModalOpen(true);
                    }}
                  >
                    <Wand2 className="h-4 w-4" />
                    AI Match Applicants
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Job Matching Modal */}
        {matchingModalOpen && selectedJobForMatching?.id && (
          <AIJobMatchingModal
            jobId={selectedJobForMatching.id}
            jobTitle={selectedJobForMatching.positionTitle}
            onClose={() => setMatchingModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
