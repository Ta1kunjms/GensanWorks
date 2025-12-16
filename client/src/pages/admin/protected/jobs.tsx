/**
 * Admin Job Vacancies Management Page
 * Route: /admin/jobs
 * Modern UI matching the Employers Management page design
 * Only accessible to users with role='admin'
 */
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Archive,
  Eye,
  Pencil,
  MapPin,
  Building2,
  DollarSign,
  Users,
  GraduationCap,
  Clock,
  Briefcase,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Layers,
  TrendingUp,
  AlertCircle,
  Undo2,
} from 'lucide-react';
import { AddJobVacancyModal } from '@/components/add-job-vacancy-modal';
import { ViewEditJobVacancyModal } from '@/components/view-edit-job-vacancy-modal';
import { CompactJobCard } from '@/components/compact-job-card';
import { formatRelativeTime } from '@/lib/time-utils';
import { authFetch } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "needs-review" | "archived">("all");
  const [salaryRangeFilter, setSalaryRangeFilter] = useState<"all" | "low" | "mid" | "high">("all");
  const [employerFilter, setEmployerFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "urgent" | "normal">("all");
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [modalStartInEdit, setModalStartInEdit] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vacancyToArchive, setVacancyToArchive] = useState<any>(null);
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedVacancyIds, setSelectedVacancyIds] = useState<Set<string>>(new Set());
  const [employers, setEmployers] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const computeStatus = (vacancy: any) => {
    if (vacancy.archived) return 'archived';
    const raw = String(vacancy.status || vacancy.jobStatus || '').toLowerCase();
    if (raw.includes('pending') || raw.includes('review')) return 'needs-review';
    if (raw.includes('active') || raw.includes('approved') || raw === 'open') return 'approved';
    if (raw.includes('draft')) return 'draft';
    if (raw.includes('reject')) return 'rejected';
    if (raw.includes('closed')) return 'closed';
    return raw || 'needs-review';
  };

  const normalizedVacancies = useMemo(
    () =>
      vacancies.map((v) => ({
        ...v,
        _status: computeStatus(v),
      })),
    [vacancies]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: normalizedVacancies.length };
    normalizedVacancies.forEach((v) => {
      counts[v._status] = (counts[v._status] || 0) + 1;
    });
    return counts;
  }, [normalizedVacancies]);

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'needs-review', label: 'Needs Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
  ];

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/jobs');
      if (!res.ok) throw new Error('Failed to fetch vacancies');
      const data = await res.json();
      const jobs = Array.isArray(data) ? data : data.jobs || [];
      setVacancies(jobs);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const searched = normalizedVacancies.filter((v) =>
      [v.positionTitle, v.position_title, v.establishmentName, v.companyName, v.mainSkillOrSpecialization]
        .filter(Boolean)
        .some((value: string) => String(value).toLowerCase().includes(q))
    );

    let filtered = statusFilter === 'all' ? searched : searched.filter((v) => v._status === statusFilter);
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'salary-high':
          const salaryA = a.startingSalaryOrWage ?? a.salaryAmount ?? a.salaryMin ?? 0;
          const salaryB = b.startingSalaryOrWage ?? b.salaryAmount ?? b.salaryMin ?? 0;
          return salaryB - salaryA;
        case 'salary-low':
          const salaryALow = a.startingSalaryOrWage ?? a.salaryAmount ?? a.salaryMin ?? 0;
          const salaryBLow = b.startingSalaryOrWage ?? b.salaryAmount ?? b.salaryMin ?? 0;
          return salaryALow - salaryBLow;
        case 'openings':
          const openingsA = typeof a.vacantPositions === 'number' ? a.vacantPositions : Number(a.vacantPositions || a.vacancies || 0);
          const openingsB = typeof b.vacantPositions === 'number' ? b.vacantPositions : Number(b.vacantPositions || b.vacancies || 0);
          return openingsB - openingsA;
        case 'company':
          const companyA = (a.establishmentName || a.companyName || '').toLowerCase();
          const companyB = (b.establishmentName || b.companyName || '').toLowerCase();
          return companyA.localeCompare(companyB);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [searchQuery, statusFilter, normalizedVacancies, sortBy]);

  const handleArchiveVacancy = async (vacancyId: string) => {
    try {
      setIsArchiving(true);
      const res = await authFetch(`/api/jobs/${vacancyId}/archive`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true })
      });
      if (!res.ok) throw new Error('Failed to archive vacancy');
      toast({ title: 'Success', description: 'Job vacancy archived successfully' });
      setArchiveDialogOpen(false);
      fetchVacancies();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreVacancy = async (vacancyId: string) => {
    try {
      setIsArchiving(true);
      const res = await authFetch(`/api/jobs/${vacancyId}/unarchive`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to restore vacancy');
      toast({ title: 'Success', description: 'Job vacancy restored successfully' });
      fetchVacancies();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleStatusChange = async (vacancyId: string, status: 'active' | 'rejected') => {
    try {
      setIsUpdatingStatus(true);
      const res = await authFetch(`/api/admin/jobs/${vacancyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast({ title: 'Updated', description: `Job ${status === 'active' ? 'approved' : 'rejected'}.` });
      fetchVacancies();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cards = filteredVacancies.map((vacancy) => {
    const status = vacancy._status as string;
    const isPending = status === 'needs-review';

    // Status badge styling
    const statusConfig = {
      'needs-review': { label: 'Pending Review', class: 'bg-amber-100 text-amber-700 border-amber-300' },
      'approved': { label: 'Active', class: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      'rejected': { label: 'Rejected', class: 'bg-rose-100 text-rose-700 border-rose-300' },
      'archived': { label: 'Archived', class: 'bg-slate-100 text-slate-700 border-slate-300' },
      'draft': { label: 'Draft', class: 'bg-slate-100 text-slate-600 border-slate-300' },
    }[status] || { label: 'Unknown', class: 'bg-slate-100 text-slate-600 border-slate-300' };

    return (
      <CompactJobCard
        key={vacancy.id}
        job={vacancy}
        headerLeft={
          <Checkbox
            checked={selectedVacancyIds.has(vacancy.id)}
            onCheckedChange={(checked) => {
              const newSet = new Set(selectedVacancyIds);
              if (checked) {
                newSet.add(vacancy.id);
              } else {
                newSet.delete(vacancy.id);
              }
              setSelectedVacancyIds(newSet);
            }}
            className="h-3.5 w-3.5"
          />
        }
        statusBadge={
          <Badge variant="outline" className={`${statusConfig.class} border font-medium text-[10px] px-2 py-0`}>
            {statusConfig.label}
          </Badge>
        }
        showSkills
        showDescription={false}
        footer={
          isPending ? (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9"
                onClick={() => {
                  setSelectedVacancyId(vacancy.id);
                  setModalStartInEdit(false);
                  setViewEditModalOpen(true);
                }}
              >
                View Details
              </Button>
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(vacancy.id, 'active')}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 h-9"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(vacancy.id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-9"
                onClick={() => {
                  setSelectedVacancyId(vacancy.id);
                  setModalStartInEdit(false);
                  setViewEditModalOpen(true);
                }}
              >
                View Details
              </Button>
              {status === 'archived' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleRestoreVacancy(vacancy.id)}
                    disabled={isArchiving}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setVacancyToDelete(vacancy.id);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() => {
                    setVacancyToArchive(vacancy);
                    setArchiveDialogOpen(true);
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        }
      />
    );
  });

  // Calculate stats for the dashboard
  const statsData = useMemo(() => {
    const approved = normalizedVacancies.filter(v => v._status === 'approved' && !v.archived).length;
    const pending = normalizedVacancies.filter(v => v._status === 'needs-review').length;
    const totalApplications = normalizedVacancies.reduce((sum, v) => sum + (v.applicationsCount || 0), 0);
    const urgent = normalizedVacancies.filter(v => {
      const openings = v.vacantPositions || v.vacancies || 0;
      return openings >= 10 && v._status === 'approved';
    }).length;

    return [
      { label: 'Active Vacancies', value: approved, icon: Briefcase, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
      { label: 'Pending Review', value: pending, icon: Clock, color: 'amber', gradient: 'from-amber-500 to-amber-600' },
      { label: 'Total Applications', value: totalApplications, icon: Users, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
      { label: 'Urgent Positions', value: urgent, icon: AlertCircle, color: 'orange', gradient: 'from-orange-500 to-orange-600' },
    ];
  }, [normalizedVacancies]);

  // Active filters tracking
  const activeFilters = useMemo(() => {
    const filters = [];
    if (statusFilter !== 'all') filters.push({ key: 'status', label: statusFilter, value: statusFilter });
    if (salaryRangeFilter !== 'all') filters.push({ key: 'salary', label: salaryRangeFilter, value: salaryRangeFilter });
    if (employerFilter !== 'all') filters.push({ key: 'employer', label: employerFilter, value: employerFilter });
    if (urgencyFilter !== 'all') filters.push({ key: 'urgency', label: urgencyFilter, value: urgencyFilter });
    return filters;
  }, [statusFilter, salaryRangeFilter, employerFilter, urgencyFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSalaryRangeFilter('all');
    setEmployerFilter('all');
    setUrgencyFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Job Vacancies Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchVacancies} className="flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download size={16} /> Export
          </Button>
          <Button size="sm" onClick={() => setVacancyModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Job Post
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'needs-review', label: 'Pending' },
            { key: 'approved', label: 'Active' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'archived', label: 'Archived' },
          ].map((tab) => {
            const count = statusCounts[tab.key] || 0;
            const isActive = statusFilter === tab.key;
            return (
              <Button
                key={tab.key}
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setStatusFilter(tab.key as any)}
                className="gap-2"
              >
                <span>{tab.label}</span>
                {tab.key !== 'all' && (
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Bulk Actions for Needs Review */}
        {statusFilter === 'needs-review' && selectedVacancyIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{selectedVacancyIds.size} selected</span>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
              Approve All
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <XCircle className="h-3 w-3 mr-1 text-rose-600" />
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search jobs by position, employer, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Quick Stats Bar */}
      {statusFilter === 'needs-review' && filteredVacancies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-900">
                {filteredVacancies.length} job{filteredVacancies.length !== 1 ? 's' : ''} awaiting review
              </span>
            </div>
            <span className="text-amber-700">Review and approve employer submissions</span>
          </div>
          <Button size="sm" variant="outline" className="bg-white">
            Review All
          </Button>
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs-review">Needs Review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={salaryRangeFilter} onValueChange={(v: any) => setSalaryRangeFilter(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All salary ranges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All salary ranges</SelectItem>
              <SelectItem value="low">₱0 - ₱20,000</SelectItem>
              <SelectItem value="mid">₱20,000 - ₱50,000</SelectItem>
              <SelectItem value="high">₱50,000+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={employerFilter} onValueChange={setEmployerFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All employers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employers</SelectItem>
              {/* TODO: Populate with actual employers from API */}
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={(v: any) => setUrgencyFilter(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All urgency</SelectItem>
              <SelectItem value="urgent">Urgent (10+ openings)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Showing <span className="font-medium">{filteredVacancies.length}</span> of <span className="font-medium">{normalizedVacancies.length}</span> jobs</span>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-slate-600">
                Clear filters
              </Button>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-9 bg-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="salary-high">Highest Salary</SelectItem>
              <SelectItem value="salary-low">Lowest Salary</SelectItem>
              <SelectItem value="openings">Most Openings</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200">
              {filter.label}
              <button onClick={() => {
                if (filter.key === 'status') setStatusFilter('all');
                if (filter.key === 'salary') setSalaryRangeFilter('all');
                if (filter.key === 'employer') setEmployerFilter('all');
                if (filter.key === 'urgency') setUrgencyFilter('all');
              }}>
                <XCircle className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Jobs Grid - 4 per row */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            {searchQuery || activeFilters.length > 0 ? 'No jobs match your filters' : 'No job vacancies posted yet'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'needs-review' && 'Employer-submitted jobs will appear here for review'}
            {statusFilter === 'approved' && 'Approved jobs will appear here'}
            {statusFilter === 'archived' && 'Archived jobs will appear here'}
            {statusFilter === 'all' && 'Start by adding a new job post'}
          </p>
        </div>
      ) : (
        <div>
          {/* Select All */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all"
                checked={selectedVacancyIds.size === filteredVacancies.length && filteredVacancies.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedVacancyIds(new Set(filteredVacancies.map(v => v.id)));
                  } else {
                    setSelectedVacancyIds(new Set());
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm text-slate-600 cursor-pointer">
                Select all {filteredVacancies.length} job{filteredVacancies.length !== 1 ? 's' : ''}
              </label>
            </div>
            {selectedVacancyIds.size > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedVacancyIds(new Set())}
                className="text-xs"
              >
                Clear selection
              </Button>
            )}
          </div>
          
          {/* 4-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards}
          </div>
        </div>
      )}

      <AddJobVacancyModal open={vacancyModalOpen} onOpenChange={setVacancyModalOpen} onJobVacancyAdded={fetchVacancies} />

      <ViewEditJobVacancyModal
        open={viewEditModalOpen}
        onOpenChange={setViewEditModalOpen}
        vacancyId={selectedVacancyId || undefined}
        onSave={fetchVacancies}
        startInEdit={modalStartInEdit}
      />

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Vacancy?</AlertDialogTitle>
            <AlertDialogDescription>
              Job vacancy "{vacancyToArchive?.positionTitle}" at {vacancyToArchive?.establishmentName} will be archived. You can view and restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vacancyToArchive) handleArchiveVacancy(vacancyToArchive.id);
            }}
            disabled={isArchiving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Vacancy?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The job posting will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!vacancyToDelete) return;
              try {
                setIsDeleting(true);
                const res = await authFetch(`/api/admin/jobs/${vacancyToDelete}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete job');
                
                // Immediately update local state to remove the job
                setVacancies((prev) => prev.filter((v) => v.id !== vacancyToDelete));
                
                toast({ title: 'Success', description: 'Job deleted successfully' });
                setDeleteDialogOpen(false);
                setVacancyToDelete(null);
                
                // Also refresh from server to ensure sync
                await fetchVacancies();
              } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
