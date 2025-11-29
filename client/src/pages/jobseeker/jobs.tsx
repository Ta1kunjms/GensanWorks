/**
 * Jobseeker Jobs Search Page
 * Route: /jobseeker/jobs
 * Only accessible to users with role='jobseeker' or 'freelancer'
 */
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Eye, Search, Filter, SlidersHorizontal, 
  Bookmark, BookmarkCheck, ChevronDown, MapPin, 
  DollarSign, GraduationCap, Clock, Building2, X,
  ArrowUpDown, TrendingUp, Calendar
} from 'lucide-react';
import { ViewJobVacancyModal } from '@/components/view-job-vacancy-modal';
import { ApplyJobModal } from '@/components/apply-job-modal';
import { formatRelativeTime } from '@/lib/time-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobVacancy } from '@shared/schema';


export default function JobseekerJobsPage() {
  const { toast } = useToast();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedVacancyForApply, setSelectedVacancyForApply] = useState<JobVacancy | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'relevance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchVacancies();
    loadSavedJobs();
  }, [searchQuery, minSalary, maxSalary, educationLevel, minExperience, maxExperience, 
      industry, jobStatusFilter, sortBy, sortOrder, page]);

  const fetchVacancies = async () => {
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
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((page - 1) * itemsPerPage).toString());
      
      params.append('limit', '10000');
      const res = await fetch(`/api/job-vacancies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch job vacancies');
      const data = await res.json();
      setVacancies(data.vacancies || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
  
  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
      toast({ title: 'Job removed from saved', variant: 'default' });
    } else {
      newSaved.add(jobId);
      toast({ title: 'Job saved successfully', variant: 'default' });
    }
    setSavedJobs(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(Array.from(newSaved)));
  };

  const handleApply = (vacancy: JobVacancy) => {
    setSelectedVacancyForApply(vacancy);
    setApplyModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    toast({
      title: 'Success',
      description: 'Application submitted successfully',
    });
    // Optionally refresh the job list or update UI
  };

  const handleViewVacancy = (vacancy: any) => {
    setSelectedVacancyId(vacancy.id);
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
    setPage(1);
  };
  
  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || minSalary || maxSalary || educationLevel || 
              minExperience || maxExperience || industry || jobStatusFilter);
  }, [searchQuery, minSalary, maxSalary, educationLevel, minExperience, 
      maxExperience, industry, jobStatusFilter]);
  
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase size={28} />
          Find Jobs
        </h1>
        <p className="text-slate-600 mt-1">Browse and apply for available job vacancies in General Santos City</p>
      </div>

      {/* Search Bar and Sort */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search by job title, company, or skills..."
              />
            </div>
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                {[searchQuery, minSalary, maxSalary, educationLevel, minExperience, maxExperience, industry, jobStatusFilter].filter(Boolean).length}
              </span>
            )}
          </Button>
          
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown size={16} className="mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Date Posted
                </div>
              </SelectItem>
              <SelectItem value="salary">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} />
                  Salary
                </div>
              </SelectItem>
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} />
                  Relevance
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown size={18} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Advanced Filters
            </h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-purple-600 hover:text-purple-700">
                <X size={16} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <DollarSign size={14} />
                Min Salary (₱)
              </label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <DollarSign size={14} />
                Max Salary (₱)
              </label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="No limit"
              />
            </div>
            
            {/* Education Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <GraduationCap size={14} />
                Education Level
              </label>
              <Select value={educationLevel || "all"} onValueChange={(val) => setEducationLevel(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Senior High">Senior High School</SelectItem>
                  <SelectItem value="Vocational">Vocational/Technical</SelectItem>
                  <SelectItem value="College">College Level</SelectItem>
                  <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master">Master's Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min Experience (years)
              </label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Experience (years)
              </label>
              <input
                type="number"
                value={maxExperience}
                onChange={(e) => setMaxExperience(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="No limit"
                min="0"
              />
            </div>
            
            {/* Job Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Building2 size={14} />
                Job Type
              </label>
              <Select value={jobStatusFilter || "all"} onValueChange={(val) => setJobStatusFilter(val === "all" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="P">Permanent (P)</SelectItem>
                  <SelectItem value="T">Temporary (T)</SelectItem>
                  <SelectItem value="C">Contractual (C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., IT, Healthcare"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count and Active Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          {loading ? (
            'Loading...'
          ) : (
            <>
              Showing <span className="font-semibold text-slate-900">{vacancies.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{total}</span> job{total === 1 ? '' : 's'}
              {hasActiveFilters && ' (filtered)'}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading job vacancies...</p>
          </div>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-slate-200">
          <Briefcase size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 text-lg mb-2 font-medium">
            {hasActiveFilters ? 'No jobs match your filters' : 'No job vacancies available at the moment'}
          </p>
          <p className="text-slate-500 text-sm mb-4">
            {hasActiveFilters ? 'Try adjusting your search criteria' : 'Check back later for new opportunities'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="mt-2"
            >
              <X size={16} className="mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {vacancies.map((vacancy) => {
              const isSaved = vacancy.id ? savedJobs.has(vacancy.id) : false;
              
              return (
                <div
                  key={vacancy.id}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-slate-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {vacancy.positionTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                          <Building2 size={14} />
                          <p className="line-clamp-1">{vacancy.establishmentName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => vacancy.id && toggleSaveJob(vacancy.id)}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="text-purple-600" size={18} />
                        ) : (
                          <Bookmark className="text-slate-400" size={18} />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        {vacancy.vacantPositions || 1} {vacancy.vacantPositions === 1 ? 'opening' : 'openings'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {vacancy.jobStatus === 'P' ? 'Permanent (P)' : 
                         vacancy.jobStatus === 'T' ? 'Temporary (T)' : 
                         vacancy.jobStatus === 'C' ? 'Contractual (C)' : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Salary Highlight */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-0.5">Starting Salary/Wage</p>
                          <p className="text-xl font-bold text-green-800">
                            ₱{(vacancy.startingSalaryOrWage || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Details */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-start gap-2">
                        <GraduationCap size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 font-medium">Education</p>
                          <p className="text-sm text-slate-900 font-medium line-clamp-1">
                            {vacancy.minimumEducationRequired || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 font-medium">Experience</p>
                          <p className="text-sm text-slate-900 font-medium">
                            {vacancy.yearsOfExperienceRequired === 0 
                              ? 'No experience required' 
                              : `${vacancy.yearsOfExperienceRequired}+ years`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {vacancy.mainSkillOrSpecialization && (
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-xs text-slate-600 font-medium mb-1.5">Required Skills</p>
                        <p className="text-sm text-slate-800 line-clamp-2">
                          {vacancy.mainSkillOrSpecialization}
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-auto pt-3">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Posted {formatRelativeTime(vacancy.createdAt || new Date().toISOString())}
                      </p>
                    </div>
                  </div>

                  {/* Footer - Action Buttons */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-9 gap-1.5 hover:bg-slate-100"
                        onClick={() => handleViewVacancy(vacancy)}
                      >
                        <Eye size={15} />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleApply(vacancy)}
                      >
                        <Briefcase size={15} />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
              
              <span className="ml-4 text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* View Job Vacancy Modal */}
      <ViewJobVacancyModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        vacancyId={selectedVacancyId || undefined}
        onApply={handleApply}
      />

      {/* Apply Job Modal */}
      <ApplyJobModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        vacancy={selectedVacancyForApply}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
