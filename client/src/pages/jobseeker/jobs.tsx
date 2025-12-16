/**
 * Jobseeker Jobs Search Page
 * Route: /jobseeker/jobs
 * Only accessible to users with role='jobseeker' or 'freelancer'
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Eye,
  Search,
  Filter,
  SlidersHorizontal,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  DollarSign,
  GraduationCap,
  Building2,
  X,
  ArrowUpDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CompactJobCard } from '@/components/compact-job-card';
import { ViewJobVacancyModal } from '@/components/view-job-vacancy-modal';
import { ApplyJobModal } from '@/components/apply-job-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@shared/schema';

const SPOTLIGHT_FILTERS = [
  { value: 'all', label: 'All jobs', description: 'Every role that matches your filters' },
  { value: 'trending', label: 'New this week', description: 'Posted within the last 7 days' },
  { value: 'highSalary', label: 'Top salary', description: 'Starting pay of ₱30k+' },
  { value: 'entryLevel', label: 'Entry level', description: '0-1 year experience' },
  { value: 'saved', label: 'Saved roles', description: 'Bookmarked opportunities' },
] as const;

const JOB_TYPE_LABELS: Record<string, string> = {
  P: 'Permanent (P)',
  T: 'Temporary (T)',
  C: 'Contractual (C)',
};

type SpotlightFilter = (typeof SPOTLIGHT_FILTERS)[number]['value'];
type ActiveFilterBadge = { key: string; label: string; clear: () => void };
type SortBy = 'date' | 'salary' | 'relevance';

const filterJobsBySpotlight = (value: SpotlightFilter, jobs: Job[], savedJobs: Set<string>) => {
  if (value === 'saved') {
    return jobs.filter((job) => job.id && savedJobs.has(job.id));
  }

  if (value === 'trending') {
    const reference = new Date();
    reference.setDate(reference.getDate() - 7);
    return jobs.filter((job) => {
      if (!job.createdAt) return false;
      const createdAt = new Date(job.createdAt);
      return !Number.isNaN(createdAt.valueOf()) && createdAt >= reference;
    });
  }

  if (value === 'highSalary') {
    return jobs.filter((job) => (job.startingSalaryOrWage || 0) >= 30000);
  }

  if (value === 'entryLevel') {
    return jobs.filter((job) => (job.yearsOfExperienceRequired ?? 0) <= 1);
  }

  return jobs;
};

export default function JobseekerJobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const openedFromParam = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [spotlightFilter, setSpotlightFilter] = useState<SpotlightFilter>('all');
  const [highlightJobId, setHighlightJobId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (educationLevel) params.append('educationLevel', educationLevel);
      if (minExperience) params.append('minExperience', minExperience);
      if (maxExperience) params.append('maxExperience', maxExperience);
      if (industry) params.append('industry', industry);
      if (jobStatusFilter) params.append('jobStatus', jobStatusFilter);
      // Always fetch only approved jobs for jobseekers
      params.append('status', 'approved');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((page - 1) * itemsPerPage).toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      const jobsList = Array.isArray(data) ? data : data?.jobs || [];
      const sanitized = jobsList.filter((job: any) => !job.archived);
      setJobs(sanitized);
      const totalCount = typeof data?.total === 'number' ? data.total : sanitized.length;
      setTotal(totalCount);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Unable to load job listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = () => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(new Set(JSON.parse(saved)));
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, minSalary, maxSalary, educationLevel, minExperience, maxExperience, industry, jobStatusFilter, sortBy, sortOrder, page]);

  // Deep link handling: scroll to job id from ?job= query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('job');
    if (!targetId) return;

    setHighlightJobId(targetId);

    // Open the detail modal once when the job is present
    if (!openedFromParam.current) {
      const targetJob = jobs.find((j) => j.id === targetId);
      if (targetJob) {
        setSelectedJobId(targetId);
        setSelectedJob(targetJob);
        setViewModalOpen(true);
        openedFromParam.current = true;
      }
    }

    setTimeout(() => {
      const el = cardRefs.current[targetId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);

    const timeout = setTimeout(() => setHighlightJobId(null), 3200);
    return () => clearTimeout(timeout);
  }, [jobs]);

  const toggleSaveJob = (jobId: string) => {
    const nextSaved = new Set(savedJobs);
    if (nextSaved.has(jobId)) {
      nextSaved.delete(jobId);
      toast({ title: 'Removed from saved', description: 'This job is no longer in your saved list.' });
    } else {
      nextSaved.add(jobId);
      toast({ title: 'Job saved', description: 'Find all saved roles under the spotlight filter.' });
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('savedJobs', JSON.stringify(Array.from(nextSaved)));
  };

  const handleApply = (job: Job) => {
    setSelectedJobForApply(job);
    setApplyModalOpen(true);
  };

  const handleShare = async (job: Job) => {
    const url = `${window.location.origin}/jobseeker/jobs${job.id ? `?job=${job.id}` : ''}`;
    const text = `Check out this job: ${job.positionTitle || job.title || 'Job opportunity'} at ${job.establishmentName || 'an employer'} (${url})`;

    if (navigator.share) {
      try {
        await navigator.share({ title: job.positionTitle || job.title || 'Job opportunity', text, url });
        toast({ title: 'Shared', description: 'Job link sent via your native share options.' });
        return;
      } catch (err) {
        // If user cancels, silently ignore
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Job link copied to clipboard.' });
    } catch (err) {
      toast({ title: 'Unable to share', description: 'Copy failed. Please try again.', variant: 'destructive' });
    }
  };

  const handleApplicationSuccess = () => {
    toast({ title: 'Application submitted', description: 'We will notify you once the employer reviews it.' });
  };

  const handleViewJob = (job: Job) => {
    setSelectedJobId(job.id ?? null);
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setMinSalary('');
    setMaxSalary('');
    setEducationLevel('');
    setMinExperience('');
    setMaxExperience('');
    setIndustry('');
    setJobStatusFilter('');
    setSpotlightFilter('all');
    setPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery ||
        minSalary ||
        maxSalary ||
        educationLevel ||
        minExperience ||
        maxExperience ||
        industry ||
        jobStatusFilter ||
        spotlightFilter !== 'all'
    );
  }, [searchQuery, minSalary, maxSalary, educationLevel, minExperience, maxExperience, industry, jobStatusFilter, spotlightFilter]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const spotlightFilteredJobs = useMemo(
    () => filterJobsBySpotlight(spotlightFilter, jobs, savedJobs),
    [jobs, savedJobs, spotlightFilter]
  );

  const spotlightCounts = useMemo(() => {
    const result = {} as Record<SpotlightFilter, number>;
    SPOTLIGHT_FILTERS.forEach((filter) => {
      result[filter.value] = filterJobsBySpotlight(filter.value, jobs, savedJobs).length;
    });
    return result;
  }, [jobs, savedJobs]);

  const displayedJobs = spotlightFilteredJobs;

  const jobInsights = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const openings = jobs.reduce((acc, job) => acc + (Number(job.vacantPositions) || 0), 0);
    const newThisWeek = jobs.filter((job) => {
      if (!job.createdAt) return false;
      const createdAt = new Date(job.createdAt);
      return !Number.isNaN(createdAt.valueOf()) && createdAt >= sevenDaysAgo;
    }).length;
    const totalSalary = jobs.reduce((acc, job) => acc + (job.startingSalaryOrWage || 0), 0);
    const averageSalary = jobs.length ? Math.round(totalSalary / jobs.length) : 0;

    return {
      openings,
      newThisWeek,
      averageSalary,
      saved: savedJobs.size,
    };
  }, [jobs, savedJobs]);

  const averageSalaryDisplay = jobInsights.averageSalary
    ? `₱${jobInsights.averageSalary.toLocaleString()}`
    : '—';

  const activeFilterBadges = [
    searchQuery
      ? {
          key: 'search',
          label: `Keyword: ${searchQuery}`,
          clear: () => {
            setSearchQuery('');
            setPage(1);
          },
        }
      : null,
    minSalary
      ? {
          key: 'minSalary',
          label: `Min ₱${Number(minSalary).toLocaleString()}`,
          clear: () => {
            setMinSalary('');
            setPage(1);
          },
        }
      : null,
    maxSalary
      ? {
          key: 'maxSalary',
          label: `Max ₱${Number(maxSalary).toLocaleString()}`,
          clear: () => {
            setMaxSalary('');
            setPage(1);
          },
        }
      : null,
    educationLevel
      ? {
          key: 'education',
          label: `Education: ${educationLevel}`,
          clear: () => {
            setEducationLevel('');
            setPage(1);
          },
        }
      : null,
    minExperience
      ? {
          key: 'minExp',
          label: `Min exp: ${minExperience}y`,
          clear: () => {
            setMinExperience('');
            setPage(1);
          },
        }
      : null,
    maxExperience
      ? {
          key: 'maxExp',
          label: `Max exp: ${maxExperience}y`,
          clear: () => {
            setMaxExperience('');
            setPage(1);
          },
        }
      : null,
    industry
      ? {
          key: 'industry',
          label: `Industry: ${industry}`,
          clear: () => {
            setIndustry('');
            setPage(1);
          },
        }
      : null,
    jobStatusFilter
      ? {
          key: 'jobType',
          label: `Job type: ${JOB_TYPE_LABELS[jobStatusFilter] || jobStatusFilter}`,
          clear: () => {
            setJobStatusFilter('');
            setPage(1);
          },
        }
      : null,
    spotlightFilter !== 'all'
      ? {
          key: 'spotlight',
          label: `Spotlight: ${SPOTLIGHT_FILTERS.find((item) => item.value === spotlightFilter)?.label ?? ''}`,
          clear: () => setSpotlightFilter('all'),
        }
      : null,
  ].filter((chip): chip is ActiveFilterBadge => Boolean(chip));

  const activeFilterCount = activeFilterBadges.length;
  const spotlightLabel = SPOTLIGHT_FILTERS.find((item) => item.value === spotlightFilter)?.label ?? 'All jobs';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit border-white/30 bg-white/20 text-white">
                PESO Job Board
              </Badge>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Sparkles className="h-4 w-4" />
                <span>Human-curated roles, updated daily</span>
              </div>
              {/* Retain typography but avoid h1 since navbar owns page title. */}
              <p className="text-3xl font-semibold leading-tight md:text-4xl">
                Discover roles crafted for General Santos City talents
              </p>
              <p className="text-sm text-white/80 md:max-w-2xl">
                Browse verified listings from employers while enjoying the same clean, modern layout admins use to manage
                postings.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-5 text-white shadow-2xl backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Live roles</p>
              <p className="mt-2 text-4xl font-semibold">{total.toLocaleString()}</p>
              <p className="text-xs text-white/80">
                {jobInsights.newThisWeek} new this week · {jobInsights.openings.toLocaleString()} openings
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)]" />
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              New this week
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{jobInsights.newThisWeek}</p>
            <p className="text-xs text-slate-500">Fresh roles posted in the last 7 days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Avg. starting salary
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{averageSalaryDisplay}</p>
            <p className="text-xs text-slate-500">Based on live listings</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Saved roles
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{jobInsights.saved}</p>
            <p className="text-xs text-slate-500">Spotlight “Saved” to view them quickly</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              Total openings
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{jobInsights.openings.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Across all visible postings</p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, employer, or skills"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-slate-50 text-sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date posted</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-slate-200"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                className="rounded-xl border-slate-200 bg-slate-50 text-slate-700"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide filters' : 'Show filters'}
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Search is synced with the admin job review board so you always see what they publish.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">Spotlight filters</p>
              <p className="text-sm text-slate-500">The same quick views admins rely on to triage jobs.</p>
            </div>
            <Button variant="ghost" size="sm" disabled={spotlightFilter === 'all'} onClick={() => setSpotlightFilter('all')}>
              Reset
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SPOTLIGHT_FILTERS.map((filter) => {
              const isActive = filter.value === spotlightFilter;
              const count = spotlightCounts[filter.value] ?? 0;
              return (
                <button
                  key={filter.value}
                  onClick={() => {
                    setSpotlightFilter(filter.value);
                    setPage(1);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{filter.label}</p>
                      <p className="text-xs text-slate-500">{filter.description}</p>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {count} roles
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {showFilters && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Minimum salary (₱)</label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 20000"
                />
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Maximum salary (₱)</label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 60000"
                />
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Education level</label>
                <input
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., Bachelor's"
                />
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Minimum experience (years)</label>
                <input
                  type="number"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Maximum experience (years)</label>
                <input
                  type="number"
                  value={maxExperience}
                  onChange={(e) => setMaxExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Employment type</label>
                <Select value={jobStatusFilter} onValueChange={(value) => setJobStatusFilter(value)}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="P">{JOB_TYPE_LABELS.P}</SelectItem>
                    <SelectItem value="T">{JOB_TYPE_LABELS.T}</SelectItem>
                    <SelectItem value="C">{JOB_TYPE_LABELS.C}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., IT, Healthcare"
                />
              </div>
            </div>
          </section>
        )}

        {activeFilterBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilterBadges.map((badge) => (
              <span
                key={badge.key}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
              >
                {badge.label}
                {badge.clear && (
                  <button
                    type="button"
                    onClick={badge.clear}
                    className="rounded-full p-0.5 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600 md:flex md:items-center md:justify-between">
          <span>
            {loading
              ? 'Loading results...'
              : `Showing ${displayedJobs.length} of ${total.toLocaleString()} opportunities`}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 md:mt-0">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            {spotlightFilter === 'all' ? 'Default view' : `Spotlight: ${spotlightLabel}`}
          </span>
        </div>

        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">Loading job vacancies...</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Briefcase className="h-12 w-12 text-slate-300" />
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {jobs.length === 0 ? 'No job vacancies available right now' : 'No roles match your current filters'}
              </p>
              <p className="text-sm text-slate-500">
                {jobs.length === 0
                  ? 'Check back soon or enable notifications to get alerts.'
                  : 'Try adjusting salary, education, or spotlight filters.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" className="gap-2" onClick={clearAllFilters}>
                <X className="h-4 w-4" /> Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedJobs.map((job) => (
                <div
                  key={job.id || `${job.positionTitle}-${job.establishmentName}`}
                  ref={(el) => {
                    if (job.id) cardRefs.current[job.id] = el;
                  }}
                >
                  <CompactJobCard
                    job={job}
                    statusBadge={
                      <Badge
                        variant="outline"
                        className="bg-emerald-100 text-emerald-700 border-emerald-300 border font-medium text-[10px] px-2 py-0"
                      >
                        Active
                      </Badge>
                    }
                    headerRight={
                      job.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleShare(job)}
                            title="Share job"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => toggleSaveJob(job.id!)}
                            title={savedJobs.has(job.id) ? 'Remove from saved' : 'Save job'}
                          >
                            {savedJobs.has(job.id) ? (
                              <BookmarkCheck className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : null
                    }
                    showSkills
                    showDescription={false}
                    footer={
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                          onClick={() => handleApply(job)}
                        >
                          Apply Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9"
                          onClick={() => handleViewJob(job)}
                        >
                          View Details
                        </Button>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (page <= 3) {
                      pageNumber = index + 1;
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = page - 2 + index;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        size="sm"
                        variant={page === pageNumber ? 'default' : 'outline'}
                        className="w-10"
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  Next
                </Button>
                <span className="ml-4 text-xs text-slate-500">Page {page} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>

      <ViewJobVacancyModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        vacancyId={selectedJobId || undefined}
        onApply={handleApply as any}
        initialVacancy={selectedJob || undefined}
      />

      <ApplyJobModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        vacancy={selectedJobForApply as any}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
