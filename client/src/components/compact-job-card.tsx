import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Users, Briefcase, GraduationCap, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

type CompactJobCardProps = {
  job: any;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  statusBadge?: React.ReactNode;
  footer?: React.ReactNode;
  showSkills?: boolean;
  showDescription?: boolean;
  className?: string;
};

const splitSkills = (raw: unknown) => {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export function CompactJobCard({
  job,
  headerLeft,
  headerRight,
  statusBadge,
  footer,
  showSkills = true,
  showDescription = false,
  className,
}: CompactJobCardProps) {
  const salary = job?.startingSalaryOrWage ?? job?.salaryAmount ?? job?.salaryMin ?? 0;
  const salaryMax = job?.salaryMax ?? salary;
  const openings =
    typeof job?.vacantPositions === "number"
      ? job.vacantPositions
      : Number(job?.vacantPositions || job?.vacancies || job?.openings || 0);

  const title = job?.positionTitle || job?.position_title || job?.title || "Job Position";
  const company = job?.establishmentName || job?.companyName || job?.company || "Company Name";
  const location =
    [job?.barangay, job?.municipality, job?.province].filter(Boolean).join(", ") ||
    job?.location ||
    job?.location_address ||
    "Location not specified";

  const posted = job?.createdAt ? formatRelativeTime(job.createdAt) : "Recently";

  const jobType = job?.employmentType || job?.employment_type || job?.jobType || job?.job_type || job?.jobStatusPTC || job?.jobStatus || "Full-time";
  const education =
    job?.minimumEducationRequired ||
    job?.minimumEducation ||
    job?.job_education_level ||
    job?.jobEducationLevel ||
    job?.educationRequirement ||
    "Not specified";
  const experience = job?.yearsOfExperienceRequired ?? job?.yearsOfExperience ?? job?.years_experience ?? 0;

  const skillsRaw = job?.mainSkillOrSpecialization || job?.skills || "";
  const skillTags = splitSkills(skillsRaw);
  const skillsToShow = skillTags.slice(0, 4);
  const remainingSkills = skillTags.length - skillsToShow.length;

  const salaryPeriod = job?.salaryPeriod || job?.salary_period || "monthly";
  const description = job?.description || job?.responsibilities || job?.job_requirements || "";

  return (
    <Card
      className={cn(
        "bg-white border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all h-full flex flex-col",
        className
      )}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Card Header - Compact */}
        {(headerLeft || statusBadge || headerRight) && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              {headerLeft}
              {statusBadge}
            </div>
            {headerRight ? <div className="flex items-center">{headerRight}</div> : null}
          </div>
        )}

        {/* Card Body */}
        <div className="p-3 space-y-3 flex-1 flex flex-col">
          {/* Job Title & Company */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 line-clamp-2" title={title}>
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-medium truncate">{company}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Key Info */}
          <div className="space-y-2 py-2 border-y border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  {salary > 0
                    ? salaryMax > salary
                      ? `₱${(salary / 1000).toFixed(0)}K - ₱${(salaryMax / 1000).toFixed(0)}K`
                      : `₱${Number(salary).toLocaleString()}`
                    : "Negotiable"}
                </span>
              </div>
              <span className="text-xs text-slate-500">/{salaryPeriod}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {openings} opening{openings !== 1 ? "s" : ""}
                </span>
              </div>
              {openings >= 10 && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0"
                >
                  Urgent
                </Badge>
              )}
            </div>
          </div>

          {/* Secondary Info */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-slate-400" />
              <span className="text-slate-600">{jobType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-slate-400" />
              <span className="text-slate-600 line-clamp-1">{education}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-slate-600">{experience > 0 ? `${experience}+ yrs exp` : "Entry level"}</span>
            </div>
          </div>

          {/* Skills */}
          {showSkills && skillsToShow.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skillsToShow.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] px-1.5 py-0"
                  title={skill}
                >
                  {skill}
                </Badge>
              ))}
              {remainingSkills > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] px-1.5 py-0"
                  title={skillTags.join(", ")}
                >
                  +{remainingSkills}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {showDescription && description && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{description}</p>
          )}

          {/* Posted Time */}
          <div className="text-xs text-slate-500 mt-auto">Posted {posted}</div>

          {/* Footer */}
          {footer ? <div className="pt-3">{footer}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
