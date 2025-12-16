import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/time-utils';
import type { Job } from '@shared/schema';
import {
  Building2,
  Clock,
  MapPin,
  Briefcase,
  BadgeDollarSign,
  ChevronRight,
  GraduationCap,
  Phone,
  Users,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const jobTypeMap: Record<string, string> = {
  P: 'Permanent',
  T: 'Temporary',
  C: 'Contractual',
};

type JobCardProps = {
  job: Job;
  statusLabel?: string;
  statusTone?: 'success' | 'warning' | 'danger' | 'muted' | 'info';
  badgeLabel?: string;
  badgeHelper?: string;
  topRightSlot?: ReactNode;
  footer?: ReactNode;
  tags?: string[];
  highlightAccent?: 'indigo' | 'emerald' | 'violet' | 'orange';
  showLocation?: boolean;
  showSkill?: boolean;
  showContact?: boolean;
  showDescription?: boolean;
  descriptionLines?: number;
  className?: string;
  actions?: (helpers: { openDetails: () => void }) => ReactNode;
  detailsLabel?: string;
  onApply?: () => void;
  onViewDetails?: () => void;
  suppressMetaRow?: boolean;
  headerActions?: ReactNode;
  // Kept for compatibility but might not be used in new design
  hideStats?: string[];
  extraStats?: any[];
  showAdminControls?: boolean;
};

export function JobCard({
  job,
  statusLabel,
  statusTone = 'muted',
  badgeLabel,
  badgeHelper,
  topRightSlot,
  footer,
  tags,
  highlightAccent = 'indigo',
  showLocation = true,
  showSkill = true,
  showContact = true,
  showDescription = true,
  descriptionLines = 2,
  className,
  actions,
  detailsLabel,
  onApply,
  onViewDetails,
  suppressMetaRow = false,
  headerActions,
}: JobCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const positionTitle = job.positionTitle || job.title || 'Job Title Unavailable';
  const employerName = job.establishmentName || job.company || 'Confidential Company';
  const openings = Number(job.vacantPositions ?? 0);
  const education = job.minimumEducationRequired || job.minimumEducation || 'Not specified';
  const experienceValue = job.yearsOfExperienceRequired ?? job.yearsOfExperience;
  const experienceText =
    experienceValue === undefined || experienceValue === null
      ? 'Not specified'
      : experienceValue === 0
        ? 'No experience required'
        : `${experienceValue}+ years`;
  const jobTypeRaw = job.jobStatusPTC || job.jobStatus;
  const jobTypeLabel = jobTypeRaw ? jobTypeMap[jobTypeRaw] || jobTypeRaw : 'Full-time';
  
  const salaryMin = job.salaryMin || job.startingSalaryOrWage;
  const salaryMax = job.salaryMax || job.startingSalaryOrWage;
  const salaryAmount = job.startingSalaryOrWage || job.salaryAmount || job.salaryMin || job.salaryMax;
  const salaryRange = salaryMin && salaryMax && salaryMin !== salaryMax
    ? `₱${Number(salaryMin).toLocaleString()} - ₱${Number(salaryMax).toLocaleString()}`
    : null;
  const salaryDisplay = salaryRange || (salaryAmount ? `₱${Number(salaryAmount).toLocaleString()}` : 'Competitive Salary');
  
  const extendedJob = job as Job & Partial<{ barangay: string; municipality: string; province: string }>;
  const location = job.location || [extendedJob.barangay, extendedJob.municipality, extendedJob.province].filter(Boolean).join(', ') || 'Location not provided';
  const skill = job.mainSkillOrSpecialization || job.skills;
  const contactLine = job.preparedByName ? `${job.preparedByName}${job.preparedByDesignation ? ` (${job.preparedByDesignation})` : ''}` : null;
  const contactNumber = job.preparedByContact;

  const openDetails = () => {
    if (onViewDetails) {
      onViewDetails();
      return;
    }
    setShowDetails(true);
  };

  const handleApply = () => {
    setShowDetails(false); // Close modal first
    if (onApply) {
      onApply();
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

  const companyColor = getCompanyColor(employerName);
  const companyInitial = employerName.charAt(0).toUpperCase();

  const defaultActions = (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
      <Button 
        onClick={handleApply}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all hover:shadow-md"
      >
        Apply Now
      </Button>
      <Button 
        variant="outline" 
        onClick={openDetails}
        className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
      >
        {detailsLabel || 'View Details'}
      </Button>
    </div>
  );

  const renderedActions = actions ? actions({ openDetails }) : defaultActions;

  const skillTags = showSkill && typeof skill === 'string'
    ? skill
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <div 
        className={cn(
          "group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200/50 transition-all duration-300 overflow-hidden",
          className
        )}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0 ring-4 ring-white/50",
              companyColor
            )}>
              {companyInitial}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                {positionTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm mb-2">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="font-medium line-clamp-1">{employerName}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {job.createdAt ? formatRelativeTime(new Date(job.createdAt as any)) : 'Just now'}
                </span>
                {statusLabel && (
                  <Badge variant="outline" className={cn("text-xs font-medium h-5 px-2", 
                    statusTone === 'success' ? "text-emerald-600 bg-emerald-50 border-emerald-200" : 
                    statusTone === 'warning' ? "text-amber-600 bg-amber-50 border-amber-200" : 
                    "text-slate-600 bg-slate-50 border-slate-200"
                  )}>
                    {statusLabel}
                  </Badge>
                )}
              </div>
            </div>
            {headerActions && <div className="shrink-0">{headerActions}</div>}
          </div>

          {/* Salary Banner */}
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-emerald-700/80 font-bold uppercase tracking-wider mb-1">Salary Offer</p>
                <p className="text-2xl font-extrabold text-emerald-900 mb-0.5">{salaryDisplay}</p>
                {job.salaryPeriod && (
                  <p className="text-xs text-emerald-600/80 font-medium capitalize">Per {job.salaryPeriod}</p>
                )}
              </div>
              {openings > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-emerald-200/60">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-900 leading-none">{openings}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Opening{openings !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {showLocation && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-xs text-slate-900 font-semibold line-clamp-1" title={location}>{location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <Briefcase className="h-4 w-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Job Type</p>
                <p className="text-xs text-slate-900 font-semibold">{jobTypeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Education</p>
                <p className="text-xs text-slate-900 font-semibold line-clamp-1" title={education}>{education}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Experience</p>
                <p className="text-xs text-slate-900 font-semibold line-clamp-1" title={experienceText}>{experienceText}</p>
              </div>
            </div>
          </div>

          {/* Skills Preview */}
          {skillTags.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skillTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                    title={tag}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {showDescription && job.description && (
            <div className="mb-4">
              <p
                className={cn(
                  "text-sm text-slate-600 leading-relaxed",
                  descriptionLines === 1 ? "line-clamp-1" : descriptionLines === 2 ? "line-clamp-2" : "line-clamp-3"
                )}
              >
                {job.description}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <Button 
                onClick={handleApply}
                className="flex-1 h-10 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                onClick={openDetails}
                className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 font-semibold transition-all"
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className={cn("h-24 w-full shrink-0", companyColor)} />
          
          <div className="px-6 pb-6 -mt-12 flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-lg">
                  <div className={cn("h-full w-full rounded-lg flex items-center justify-center text-white font-bold text-3xl", companyColor)}>
                    {companyInitial}
                  </div>
                </div>
                <div className="mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">{positionTitle}</h2>
                  <div className="flex items-center gap-2 text-slate-600">
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

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                      <BadgeDollarSign className="h-3.5 w-3.5" /> Salary
                    </div>
                    <div className="font-bold text-emerald-900 text-base">{salaryDisplay}</div>
                    {job.salaryPeriod && (
                      <div className="text-xs text-emerald-600 capitalize mt-0.5">per {job.salaryPeriod}</div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate" title={location}>{location}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                      <Clock className="h-3.5 w-3.5" /> Experience
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{experienceText}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                      <GraduationCap className="h-3.5 w-3.5" /> Education
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate" title={education}>{education}</div>
                  </div>
                  {openings > 0 && (
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                      <div className="text-xs text-indigo-700 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                        <Users className="h-3.5 w-3.5" /> Openings
                      </div>
                      <div className="font-bold text-indigo-900 text-base">{openings} Position{openings !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                  {jobTypeLabel && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                        <Briefcase className="h-3.5 w-3.5" /> Type
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{jobTypeLabel}</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">About the Role</h3>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                    {job.description || 'No description provided.'}
                  </div>
                </div>

                {/* Skills */}
                {skill && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skill.split(',').map((s) => (
                        <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {showContact && (contactLine || contactNumber) && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      {contactLine && <p className="text-sm font-medium text-indigo-800">{contactLine}</p>}
                      {contactNumber && (
                        <p className="flex items-center gap-2 text-sm text-indigo-700">
                          <Phone className="h-3.5 w-3.5" />
                          {contactNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="pt-4 mt-auto border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleApply}>
                Apply for this Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
