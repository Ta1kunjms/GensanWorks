import { SkillSpecializationInput } from "@/components/skill-specialization-input";
/**
 * Employer Jobs Management Page
 * Route: /employer/jobs
 * Only accessible to users with role='employer'
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Save, Layers, RefreshCw, Pencil, Archive, Undo2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@shared/schema';
import { industryNameMap } from '@shared/schema';
import { EDUCATION_LEVEL_OPTIONS } from '@shared/education';
import { authFetch, useAuth } from '@/lib/auth';
import { EmployerJobCard } from '@/components/employer-job-card';
import { formatRelativeTime } from '@/lib/time-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type BarangayOption,
  type MunicipalityOption,
  type ProvinceOption,
  DEFAULT_MUNICIPALITY,
  DEFAULT_PROVINCE,
  fetchPhilippineLocations,
} from '@/lib/locations';
const DEFAULT_LOCATION = `${DEFAULT_MUNICIPALITY}, ${DEFAULT_PROVINCE}`;

const buildInitialForm = () => ({
  positionTitle: '',
  description: '',
  location: DEFAULT_LOCATION,
  barangay: '',
  municipality: DEFAULT_MUNICIPALITY,
  province: DEFAULT_PROVINCE,
  salaryMin: '',
  salaryMax: '',
  salaryPeriod: 'monthly',
  mainSkillOrSpecialization: '',
  minimumEducationRequired: '',
  yearsOfExperienceRequired: '',
  agePreference: '',
  vacantPositions: '',
  paidEmployees: '',
  industryCodes: [] as string[],
  jobStatus: 'P',
  preparedByName: '',
  preparedByDesignation: '',
  preparedByContact: '',
});

export default function EmployerJobsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(buildInitialForm());
  const [preparedByDefaults, setPreparedByDefaults] = useState<{
    preparedByName?: string;
    preparedByDesignation?: string;
    preparedByContact?: string;
  }>({});
  const [accountStatus, setAccountStatus] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<MunicipalityOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<BarangayOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'draft' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'salary_desc' | 'salary_asc'>('date_desc');
  const educationLevels = EDUCATION_LEVEL_OPTIONS;
  const industryOptions = useMemo(
    () =>
      Object.entries(industryNameMap)
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => parseInt(a.code) - parseInt(b.code)),
    []
  );

  useEffect(() => {
    fetchPhilippineLocations().then(setProvinces);
  }, []);

  useEffect(() => {
    if (!provinces.length || editingJob) return;
    if (!formData.province) {
      setFormData((prev) => ({ ...prev, province: DEFAULT_PROVINCE }));
    }
    if (!formData.municipality) {
      setFormData((prev) => ({ ...prev, municipality: DEFAULT_MUNICIPALITY, location: prev.location || DEFAULT_LOCATION }));
    }
  }, [provinces, editingJob, formData.province, formData.municipality]);

  useEffect(() => {
    const provinceEntry = provinces.find((p) => p.name === formData.province || p.code === formData.province);
    const muniList = provinceEntry?.municipalities ?? [];
    setMunicipalityOptions(muniList);

    const hasMatch = muniList.some((m) => m.name === formData.municipality || m.code === formData.municipality);
    if (!hasMatch && muniList.length && !editingJob) {
      const fallback = muniList.find((m) => m.name === DEFAULT_MUNICIPALITY) || muniList[0];
      setFormData((prev) => ({ ...prev, municipality: fallback.name, barangay: '', location: prev.location || DEFAULT_LOCATION }));
    }
  }, [provinces, formData.province, formData.municipality, editingJob]);

  useEffect(() => {
    const municipalityEntry = municipalityOptions.find((m) => m.name === formData.municipality || m.code === formData.municipality);
    const brgys = municipalityEntry?.barangays ?? [];
    setBarangayOptions(brgys);
    if (formData.barangay && !brgys.some((b) => b.name === formData.barangay)) {
      setFormData((prev) => ({ ...prev, barangay: '' }));
    }
  }, [municipalityOptions, formData.municipality, formData.barangay]);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await authFetch('/api/employer/profile');
        if (!res.ok) return;
        const data = await res.json();
        const status = String(data?.accountStatus || 'pending').toLowerCase();
        setAccountStatus((status === 'active' || status === 'rejected' ? status : 'pending') as any);
        setRejectionReason(typeof data?.rejectionReason === 'string' && data.rejectionReason.trim() ? data.rejectionReason : null);

        setPreparedByDefaults({
          preparedByName: typeof data?.preparedByName === 'string' ? data.preparedByName : '',
          preparedByDesignation: typeof data?.preparedByDesignation === 'string' ? data.preparedByDesignation : '',
          preparedByContact: typeof data?.preparedByContact === 'string' ? data.preparedByContact : '',
        });
      } catch {
        // ignore; job page can still function with server-side enforcement
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!showForm) return;
    if (editingJob) return;
    if (!preparedByDefaults.preparedByName && !preparedByDefaults.preparedByDesignation && !preparedByDefaults.preparedByContact) return;

    setFormData((prev) => ({
      ...prev,
      preparedByName: prev.preparedByName || preparedByDefaults.preparedByName || '',
      preparedByDesignation: prev.preparedByDesignation || preparedByDefaults.preparedByDesignation || '',
      preparedByContact: prev.preparedByContact || preparedByDefaults.preparedByContact || '',
    }));
  }, [showForm, editingJob, preparedByDefaults.preparedByName, preparedByDefaults.preparedByDesignation, preparedByDefaults.preparedByContact]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/employer/jobs`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      const employerJobs = Array.isArray(data) ? data : data?.jobs || data?.results || [];
      setJobs(employerJobs);
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

  const startEditing = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
    setFormData({
      positionTitle: job.positionTitle || job.title || '',
      description: job.description || '',
      location: job.location || [job.municipality, job.province].filter(Boolean).join(', ') || DEFAULT_LOCATION,
      barangay: (job as any).barangay || '',
      municipality: (job as any).municipality || '',
      province: (job as any).province || '',
      salaryMin: job.salaryMin ? String(job.salaryMin) : job.startingSalaryOrWage ? String(job.startingSalaryOrWage) : '',
      salaryMax: job.salaryMax ? String(job.salaryMax) : job.startingSalaryOrWage ? String(job.startingSalaryOrWage) : '',
      salaryPeriod: job.salaryPeriod || 'monthly',
      mainSkillOrSpecialization: job.mainSkillOrSpecialization || job.skills || '',
      minimumEducationRequired: job.minimumEducationRequired || job.minimumEducation || '',
      yearsOfExperienceRequired:
        job.yearsOfExperienceRequired !== undefined && job.yearsOfExperienceRequired !== null
          ? String(job.yearsOfExperienceRequired)
          : job.yearsOfExperience !== undefined && job.yearsOfExperience !== null
            ? String(job.yearsOfExperience)
            : '',
      agePreference: (job as any).agePreference || '',
      vacantPositions: job.vacantPositions ? String(job.vacantPositions) : '',
      paidEmployees: job.paidEmployees ? String(job.paidEmployees) : '',
      industryCodes: Array.isArray(job.industryCodes) ? job.industryCodes : [],
      jobStatus: (job.jobStatusPTC as any) || job.jobStatus || 'P',
      preparedByName: (job as any).preparedByName || '',
      preparedByDesignation: (job as any).preparedByDesignation || '',
      preparedByContact: (job as any).preparedByContact || '',
    });
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setFormData(buildInitialForm());
    setShowForm(false);
  };

  const buildPayload = () => {
    const startingSalary = formData.salaryMin || formData.salaryMax ? Number(formData.salaryMin || formData.salaryMax) : undefined;
    const yearsExperience = formData.yearsOfExperienceRequired !== '' ? Number(formData.yearsOfExperienceRequired) : undefined;
    const vacantPositions = formData.vacantPositions !== '' ? Number(formData.vacantPositions) : undefined;
    const paidEmployees = formData.paidEmployees !== '' ? Number(formData.paidEmployees) : undefined;

    return {
      employerId: user?.id || '',
      establishmentName: user?.company || undefined,
      positionTitle: formData.positionTitle.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      barangay: formData.barangay.trim() || undefined,
      municipality: formData.municipality.trim() || undefined,
      province: formData.province.trim() || undefined,
      salaryMin: startingSalary,
      salaryMax: startingSalary,
      salaryAmount: startingSalary,
      salaryPeriod: formData.salaryPeriod || 'monthly',
      jobStatus: formData.jobStatus || 'P',
      minimumEducation: formData.minimumEducationRequired || undefined,
      yearsOfExperience: yearsExperience,
      skills: formData.mainSkillOrSpecialization.trim() || undefined,
      industryCodes: formData.industryCodes || [],
      vacantPositions,
      paidEmployees,
      agePreference: formData.agePreference || undefined,
      preparedByName: formData.preparedByName || undefined,
      preparedByDesignation: formData.preparedByDesignation || undefined,
      preparedByContact: formData.preparedByContact || undefined,
    };
  };

  const validateForm = (allowPartialDraft = false) => {
    const errors: string[] = [];

    if (!formData.positionTitle.trim()) errors.push('Job title');

    if (!allowPartialDraft) {
      if (!formData.description.trim()) errors.push('Description');
      if (!formData.location.trim()) errors.push('Location');
      if (!formData.minimumEducationRequired) errors.push('Minimum education');
      if (!formData.mainSkillOrSpecialization.trim()) errors.push('Main skill/specialization');
      if (!formData.salaryMin && !formData.salaryMax) errors.push('Starting salary');
      if (!formData.jobStatus) errors.push('Job status');
      if (!formData.vacantPositions) errors.push('Vacant positions');
      if (!formData.paidEmployees) errors.push('Paid employees');
      if (!formData.industryCodes.length) errors.push('Industry');
      if (!formData.preparedByName) errors.push('Prepared by name');
      if (!formData.preparedByDesignation) errors.push('Prepared by designation');
    }

    if (errors.length) {
      toast({
        title: allowPartialDraft ? 'Missing key fields' : 'Missing details',
        description: allowPartialDraft
          ? `Draft needs at least: ${errors.join(', ')}`
          : `Please fill: ${errors.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(false)) return;

    try {
      const payload = buildPayload();
      console.log('Submitting job payload:', payload);

      const endpoint = editingJob ? `/api/employer/jobs/${editingJob.id}` : '/api/employer/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Submit error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to submit job for review');
      }

      const result = await res.json();
      console.log('Submit success:', result);

      toast({
        title: 'Success',
        description: editingJob
          ? 'Job update submitted for admin review'
          : 'Job submitted for admin review',
      });

      cancelEditing();
      fetchJobs();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit job',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm(true)) return;

    try {
      const payload = { ...buildPayload(), saveAsDraft: true };
      console.log('Saving draft payload:', payload);

      const endpoint = editingJob ? `/api/employer/jobs/${editingJob.id}` : '/api/employer/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Save draft error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to save draft');
      }

      const result = await res.json();
      console.log('Draft saved:', result);

      toast({ title: 'Draft saved', description: 'Draft synced to your account.' });
      fetchJobs();
      cancelEditing();
    } catch (error: any) {
      console.error('Draft save error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save draft', variant: 'destructive' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const res = await authFetch(`/api/employer/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete job');

      toast({
        title: 'Success',
        description: 'Job posting deleted successfully',
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to archive this job posting?')) return;

    try {
      // Use unified archive endpoint for all jobs
      const res = await authFetch(`/api/employer/jobs/${jobId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });

      if (!res.ok) throw new Error('Failed to archive job');

      toast({
        title: 'Success',
        description: 'Job archived successfully',
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUnarchiveJob = async (jobId: string) => {
    try {
      const res = await authFetch(`/api/employer/jobs/${jobId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      });

      if (!res.ok) throw new Error('Failed to restore job');

      toast({ title: 'Success', description: 'Job restored successfully' });
      fetchJobs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const normalizeStatus = (job: Job) => {
    const raw = ((job as any).status || (job as any).jobStatus || (job as any).jobStatusPTC || '').toString().toLowerCase();
    if (job.archived) return 'archived';
    if (raw === 'approved' || raw === 'active') return 'active';
    if (raw === 'rejected' || raw === 'needs_changes' || (raw.includes('need') && raw.includes('change')) || raw.includes('declined')) return 'rejected';
    if (raw === 'draft') return 'draft';
    return 'pending';
  };

  const statusBuckets = useMemo(() => {
    const base = { pending: 0, active: 0, rejected: 0, draft: 0, archived: 0 };
    jobs.forEach((job) => {
      const normalized = normalizeStatus(job) as keyof typeof base;
      if (base[normalized] !== undefined) {
        base[normalized] += 1;
      } else {
        base.pending += 1;
      }
    });
    return base;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = jobs.filter((job) => {
      const normalized = normalizeStatus(job);
      if (statusFilter !== 'all' && normalized !== statusFilter) return false;
      if (statusFilter !== 'archived' && job.archived) return false;

      if (term) {
        const haystack = [
          job.positionTitle,
          (job as any).title,
          (job as any).establishmentName,
          job.location,
          (job as any).mainSkillOrSpecialization,
          (job as any).skills,
          (job as any).municipality,
          (job as any).province,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (industryFilter !== 'all') {
        const codes = Array.isArray((job as any).industryCodes) ? (job as any).industryCodes : [];
        if (!codes.includes(industryFilter)) return false;
      }

      if (educationFilter !== 'all') {
        const edu = (job as any).minimumEducationRequired || (job as any).minimumEducation || '';
        if (typeof edu === 'string' && edu.toLowerCase() !== educationFilter.toLowerCase()) return false;
      }

      return true;
    });

    const sortMap: Record<typeof sortOption, (a: Job, b: Job) => number> = {
      date_desc: (a, b) => new Date((b as any).updatedAt || (b as any).createdAt || 0).getTime() - new Date((a as any).updatedAt || (a as any).createdAt || 0).getTime(),
      date_asc: (a, b) => new Date((a as any).updatedAt || (a as any).createdAt || 0).getTime() - new Date((b as any).updatedAt || (b as any).createdAt || 0).getTime(),
      salary_desc: (a, b) => ((b as any).salaryMin || (b as any).salaryAmount || 0) - ((a as any).salaryMin || (a as any).salaryAmount || 0),
      salary_asc: (a, b) => ((a as any).salaryMin || (a as any).salaryAmount || 0) - ((b as any).salaryMin || (b as any).salaryAmount || 0),
    };

    return filtered.sort(sortMap[sortOption]);
  }, [jobs, statusFilter, searchTerm, industryFilter, educationFilter, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 text-slate-900">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {accountStatus !== 'active' && (
          <div
            className={
              accountStatus === 'rejected'
                ? 'rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800'
                : 'rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={accountStatus === 'rejected' ? 'bg-red-600' : 'bg-amber-600'}>
                {accountStatus === 'rejected' ? 'Rejected' : 'Pending Approval'}
              </Badge>
              <span className="font-semibold">
                {accountStatus === 'rejected'
                  ? 'Your employer account was rejected.'
                  : 'Your employer account is awaiting admin approval.'}
              </span>
            </div>
            <p className="mt-1">
              {accountStatus === 'rejected'
                ? 'You cannot post job vacancies. Please update your account details and contact the admin.'
                : 'You cannot create job postings yet. Complete your profile and upload documents for review.'}
            </p>
            {accountStatus === 'rejected' && rejectionReason && (
              <p className="mt-2"><span className="font-semibold">Reason:</span> {rejectionReason}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            {/* Title handled by TopNavbar. */}
            <p className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Layers size={26} />
              Job Postings
            </p>
            <p className="text-slate-600">Create, edit, and track the status of your roles.</p>
            <p className="text-sm text-slate-500">Updates are reviewed by administrators before going live.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2" onClick={fetchJobs}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
              className="gap-2"
              onClick={() => (showForm ? cancelEditing() : setShowForm(true))}
              disabled={accountStatus !== 'active'}
            >
              <Plus size={18} />
              {showForm ? 'Close Form' : 'Create Job'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job title, company, location"
              className="w-full sm:w-64"
            />
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industryOptions.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>{opt.code} - {opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any education</SelectItem>
                {educationLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as typeof sortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest first</SelectItem>
                <SelectItem value="date_asc">Oldest first</SelectItem>
                <SelectItem value="salary_desc">Highest salary</SelectItem>
                <SelectItem value="salary_asc">Lowest salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200" onClick={fetchJobs}>
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setIndustryFilter('all');
                setEducationFilter('all');
                setSortOption('date_desc');
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {editingJob ? 'Changes will be reviewed by an administrator.' : 'Submit for approval or save a draft to finish later.'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" className="gap-2" onClick={handleSaveDraft} type="button">
                    <Save size={16} />
                    Save Draft
                </Button>
                <Button type="submit" className="gap-2">
                  {editingJob ? 'Submit Updates for Review' : 'Submit for Review'}
                </Button>
                <Button variant="outline" onClick={cancelEditing} type="button">
                  Cancel
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Skill / Specialization *</Label>
                  <SkillSpecializationInput
                    value={formData.mainSkillOrSpecialization}
                    onChange={(next) => setFormData({ ...formData, mainSkillOrSpecialization: next })}
                    placeholder="Type a skill (e.g., JavaScript) and press Enter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Education Required *</Label>
                  <Select
                    value={formData.minimumEducationRequired}
                    onValueChange={(v) => setFormData({ ...formData, minimumEducationRequired: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Status (P/T/C) *</Label>
                  <Select value={formData.jobStatus} onValueChange={(v) => setFormData({ ...formData, jobStatus: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P">Permanent (P)</SelectItem>
                      <SelectItem value="T">Temporary (T)</SelectItem>
                      <SelectItem value="C">Contractual (C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role Description</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and key qualifications."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Years of Experience Required</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperienceRequired}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperienceRequired: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Preference</Label>
                  <Input
                    value={formData.agePreference}
                    onChange={(e) => setFormData({ ...formData, agePreference: e.target.value })}
                    placeholder="e.g., 20-35"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. of Vacant Positions *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.vacantPositions}
                    onChange={(e) => setFormData({ ...formData, vacantPositions: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. of Paid Employees *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.paidEmployees}
                    onChange={(e) => setFormData({ ...formData, paidEmployees: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Barangay</Label>
                  <Select
                    value={formData.barangay}
                    onValueChange={(v) =>
                      setFormData((prev) => {
                        const locationParts = [v, prev.municipality, prev.province].filter(Boolean);
                        return {
                          ...prev,
                          barangay: v,
                          location: locationParts.join(', '),
                        };
                      })
                    }
                    disabled={!barangayOptions.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={barangayOptions.length ? 'Select barangay' : 'Select municipality first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {barangayOptions.map((barangay) => (
                        <SelectItem key={barangay.code} value={barangay.name}>
                          {barangay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Municipality/City</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(v) =>
                      setFormData((prev) => {
                        const locationParts = ['', v, prev.province].filter(Boolean);
                        return {
                          ...prev,
                          municipality: v,
                          barangay: '',
                          location: locationParts.join(', '),
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select municipality/city" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalityOptions.map((municipality) => (
                        <SelectItem key={municipality.code} value={municipality.name}>
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Province</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(v) =>
                      setFormData((prev) => {
                        return {
                          ...prev,
                          province: v,
                          municipality: '',
                          barangay: '',
                          location: v,
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Starting Salary/Wage (₱) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value, salaryMax: e.target.value })}
                    placeholder="Amount in PHP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Salary (optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="Amount in PHP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary Period</Label>
                  <Select value={formData.salaryPeriod} onValueChange={(v) => setFormData({ ...formData, salaryPeriod: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Industry Type (select all that apply) *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded border border-slate-200 dark:border-slate-700 p-3">
                  {industryOptions.map(({ code, name }) => (
                    <label key={code} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-200">
                      <Checkbox
                        checked={formData.industryCodes.includes(code)}
                        onCheckedChange={() => {
                          setFormData((prev) => {
                            const exists = prev.industryCodes.includes(code);
                            return {
                              ...prev,
                              industryCodes: exists
                                ? prev.industryCodes.filter((c) => c !== code)
                                : [...prev.industryCodes, code],
                            };
                          });
                        }}
                      />
                      <span>{code} - {name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prepared By (Name) *</Label>
                  <Input
                    value={formData.preparedByName}
                    onChange={(e) => setFormData({ ...formData, preparedByName: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Input
                    value={formData.preparedByDesignation}
                    onChange={(e) => setFormData({ ...formData, preparedByDesignation: e.target.value })}
                    placeholder="Job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input
                    value={formData.preparedByContact}
                    onChange={(e) => setFormData({ ...formData, preparedByContact: e.target.value })}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end">
                <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-2">
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button type="submit" className="gap-2">
                  {editingJob ? 'Submit Updates for Review' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'active', label: 'Active' },
              { value: 'rejected', label: 'Needs Changes' },
              { value: 'draft', label: 'Drafts' },
              { value: 'archived', label: 'Archived' },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={statusFilter === tab.value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
                className="gap-2"
              >
                <span>{tab.label}</span>
                {tab.value !== 'all' && (
                  <Badge variant="secondary" className="ml-1">
                    {statusBuckets[tab.value as keyof typeof statusBuckets] ?? 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-600 dark:text-slate-200 shadow-sm">
            Loading your postings...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800 dark:text-white">No job postings found</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">Try another filter or create a new posting.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <EmployerJobCard
                key={job.id}
                job={job}
                onEdit={startEditing}
                onDelete={(job) => handleDeleteJob(job.id)}
                onViewApplicants={(job) => setLocation(`/employer/applications?jobId=${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
