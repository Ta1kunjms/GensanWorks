/**
 * View Job Vacancy Modal (Jobseeker)
 * Display-only modal for jobseekers to view job vacancy details
 */
import { useState, useEffect } from 'react';
import { resolveIndustryName, type JobVacancy, type Job } from '@shared/schema';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  MapPin,
  DollarSign,
  GraduationCap,
  Clock,
  Users,
  Mail,
  Phone,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Building2,
  BadgeCheck,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type JobDetails = JobVacancy | Job;
type IndustryEntry = { code: string; description?: string };

interface ViewJobVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancyId?: string;
  onApply?: (vacancy: JobDetails) => void;
  initialVacancy?: JobDetails | null;
}

export function ViewJobVacancyModal({
  open,
  onOpenChange,
  vacancyId,
  onApply,
  initialVacancy,
}: ViewJobVacancyModalProps) {
  const { toast } = useToast();
  const [vacancy, setVacancy] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialVacancy && (!vacancy || vacancy.id !== initialVacancy.id)) {
      setVacancy(initialVacancy as JobDetails);
      setLoading(false);
    }
  }, [initialVacancy, vacancy]);

  useEffect(() => {
    if (open && vacancyId && !initialVacancy) {
      fetchVacancy();
    }
  }, [open, vacancyId, initialVacancy]);

  const extractIndustryEntries = (source: unknown): IndustryEntry[] => {
    if (!source) return [];

    const entries: IndustryEntry[] = [];
    const pushEntry = (entry: IndustryEntry | null) => {
      if (!entry?.code) return;
      if (entries.some((existing) => existing.code === entry.code)) return;
      entries.push(entry);
    };

    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (typeof item === 'string') {
          const [codePart, ...rest] = item.split('-').map((segment) => segment.trim()).filter(Boolean);
          if (codePart) {
            pushEntry({ code: codePart, description: rest.join(' - ') || undefined });
          }
          return;
        }
        if (item && typeof item === 'object') {
          const code = 'code' in item ? String((item as { code?: string }).code ?? '').trim() : '';
          const description = 'description' in item ? String((item as { description?: string }).description ?? '').trim() : undefined;
          if (code || description) {
            pushEntry({ code: code || description || '', description });
          }
        }
      });
      return entries;
    }

    if (typeof source === 'string') {
      const trimmed = source.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        return extractIndustryEntries(parsed);
      } catch {
        return extractIndustryEntries(trimmed.split(',').map((part) => part.trim()).filter(Boolean));
      }
    }

    if (source && typeof source === 'object') {
      return extractIndustryEntries(Object.values(source));
    }

    return [];
  };

  const fetchVacancy = async () => {
    if (!vacancyId) return;
    setLoading(true);
    try {
      let response = await fetch(`/api/jobs/${vacancyId}`);
      if (!response.ok) {
        response = await fetch(`/api/job-vacancies/${vacancyId}`);
      }
      if (!response.ok) {
        throw new Error('Failed to fetch vacancy');
      }
      const data = await response.json();
      setVacancy(data as JobDetails);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load vacancy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (vacancy && onApply) {
      onApply(vacancy);
      onOpenChange(false);
    }
  };

  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
      'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500',
      'bg-amber-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading job details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vacancy) {
    return null;
  }

  const jobData = vacancy as Job;
  const employerName = vacancy.establishmentName || jobData?.company || '—';
  const companyColor = getCompanyColor(employerName);
  const companyInitial = employerName.charAt(0).toUpperCase();

  const vacantPositions = vacancy.vacantPositions ?? jobData?.vacantPositions ?? 0;
  const paidEmployees = vacancy.paidEmployees ?? jobData?.paidEmployees ?? 0;
  const salaryValue =
    vacancy.startingSalaryOrWage ?? jobData?.salaryAmount ?? jobData?.salaryMin ?? jobData?.salaryMax ?? 0;
  const salaryPeriod = (vacancy as any).salaryPeriod || (vacancy as any).salary_period || 'Monthly';
  const minimumEducation =
    vacancy.minimumEducationRequired || jobData?.minimumEducation || jobData?.educationLevel || 'Not specified';
  const experienceYears =
    vacancy.yearsOfExperienceRequired ?? jobData?.yearsOfExperience ?? jobData?.yearsOfExperienceRequired ?? 0;
  const specialization =
    vacancy.mainSkillOrSpecialization || jobData?.mainSkillOrSpecialization || jobData?.skills || jobData?.description;
  const employmentType = vacancy.jobStatus || jobData?.jobStatusPTC || jobData?.status;
  const preparedByName = vacancy.preparedByName || jobData?.preparedByName || jobData?.companyContact;
  const preparedByDesignation = vacancy.preparedByDesignation || jobData?.preparedByDesignation;
  const preparedByContact = vacancy.preparedByContact || jobData?.preparedByContact || jobData?.contactNumber;
  const location =
    (vacancy as any).location ||
    [
      (vacancy as any).barangay,
      (vacancy as any).municipality,
      (vacancy as any).province,
    ]
      .filter(Boolean)
      .join(', ');
  const jobContactEmail = (vacancy as any).job_contact_email || (vacancy as any).jobContactEmail;
  const responsibilities =
    (vacancy as any).responsibilities || (vacancy as any).job_requirements || jobData?.description || '';
  const schedule = (vacancy as any).job_schedule || (vacancy as any).jobSchedule;
  const shift = (vacancy as any).job_shift || (vacancy as any).jobShift;
  const category = (vacancy as any).job_category || (vacancy as any).jobCategory;
  const experienceLevel = (vacancy as any).job_experience_level || (vacancy as any).jobExperienceLevel;
  const benefitsRaw =
    (vacancy as any).job_benefits ||
    (vacancy as any).jobBenefits ||
    (vacancy as any).benefits ||
    (vacancy as any).job_perks ||
    '';
  const compensationDetails = (vacancy as any).job_compensation_details || (vacancy as any).compensationDetails;
  const compensationType = (vacancy as any).job_compensation_type || (vacancy as any).compensationType;
  const industryEntries = extractIndustryEntries(
    vacancy.industryCodes ?? (vacancy as any).industryType ?? (vacancy as any).industry_codes ?? null,
  );
  const shouldShowIndustrySection = industryEntries.length > 0 || Boolean(vacancy.industryCodes);

  const benefits = String(benefitsRaw || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const tags = [category, experienceLevel, employmentType, schedule, shift].filter(Boolean) as string[];

  const jobTypeLabel = employmentType === 'P'
    ? 'Permanent'
    : employmentType === 'T'
      ? 'Temporary'
      : employmentType === 'C'
        ? 'Contractual'
        : employmentType || 'Full-time';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-200 shadow-2xl">
        {/* Top Accent Bar */}
        <div className={cn("h-24 w-full shrink-0", companyColor)} />
        
        <div className="px-8 pb-6 -mt-12 flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-end gap-5">
              <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-lg shrink-0">
                <div className={cn("h-full w-full rounded-lg flex items-center justify-center text-white font-bold text-3xl", companyColor)}>
                  {companyInitial}
                </div>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{vacancy.positionTitle}</h2>
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{employerName}</span>
                </div>
              </div>
            </div>
            <div className="mb-1 hidden sm:block">
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 px-3 py-1 text-sm">
                {jobTypeLabel}
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-8 px-8">
            <div className="space-y-8 pb-8">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Salary
                  </div>
                  <div className="font-bold text-slate-900 text-sm">₱{(salaryValue || 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{salaryPeriod}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-2" title={location}>{location}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Experience
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{experienceYears}+ years</div>
                  <div className="text-xs text-slate-500 mt-0.5">Required</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Education
                  </div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-2" title={minimumEducation}>{minimumEducation}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-indigo-500" />
                  About the Role
                </h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                  {responsibilities || 'No description provided.'}
                </div>
              </div>

              {/* Skills */}
              {specialization && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specialization.split(',').map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {benefits.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Benefits & Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {benefits.map((benefit, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                        <BadgeCheck className="h-3 w-3" /> {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Company Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    Company Info
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Company Name</div>
                      <div className="font-medium text-slate-900">{employerName}</div>
                    </div>
                    {shouldShowIndustrySection && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Industry</div>
                        <div className="flex flex-wrap gap-1.5">
                          {industryEntries.map((entry, index) => (
                            <span key={index} className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                              {entry.description || resolveIndustryName(entry.code) || entry.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Employees</div>
                        <div className="font-medium text-slate-900">{paidEmployees}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Openings</div>
                        <div className="font-medium text-slate-900">{vacantPositions}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {(preparedByName || preparedByContact || jobContactEmail) && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      Contact Information
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      {preparedByName && (
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Contact Person</div>
                          <div className="font-medium text-slate-900">{preparedByName}</div>
                          {preparedByDesignation && <div className="text-xs text-slate-500">{preparedByDesignation}</div>}
                        </div>
                      )}
                      {preparedByContact && (
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Phone</div>
                          <div className="font-medium text-slate-900">{preparedByContact}</div>
                        </div>
                      )}
                      {jobContactEmail && (
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">Email</div>
                          <div className="font-medium text-slate-900">{jobContactEmail}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Close
            </Button>
            <Button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-sm hover:shadow">
              Apply for this Position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
