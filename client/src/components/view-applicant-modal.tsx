import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEmploymentBadgeTone, getEmploymentStatusLabel } from "@/lib/employment";

interface ViewApplicantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
}

export function ViewApplicantModal({
  open,
  onOpenChange,
  applicant,
}: ViewApplicantModalProps) {
  if (!applicant) return null;

  const employmentSummary = getEmploymentStatusLabel(applicant);
  const employmentTone = getEmploymentBadgeTone(applicant);
  const employmentBadgeClassMap = {
    employed: "bg-emerald-100 text-emerald-800",
    selfEmployed: "bg-purple-100 text-purple-800",
    unemployed: "bg-rose-100 text-rose-800",
  } as const;
  const employmentSummaryBadge = employmentBadgeClassMap[employmentTone];
  const summaryBadgeClassName = employmentSummaryBadge ?? "bg-muted text-foreground";

  const selfEmployedCategoryLabel = applicant.selfEmployedCategory === "Others"
    ? applicant.selfEmployedCategoryOther || "Others"
    : applicant.selfEmployedCategory;
  const unemployedReasonLabel = applicant.unemployedReason === "Others"
    ? applicant.unemployedReasonOther || "Others"
    : applicant.unemployedReason;

  const isOfw = Boolean(applicant?.isOfw ?? applicant?.isOFW);
  const isFormerOfw = Boolean(applicant?.isFormerOfw ?? applicant?.isFormerOFW);
  const is4psBeneficiary = Boolean(applicant?.is4psBeneficiary ?? applicant?.is4PSBeneficiary);
  const isPwd = Boolean(applicant?.isPwd ?? applicant?.isPWD);
  const isSoloParent = Boolean(applicant?.isSoloParent);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const toArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  const normalizeValue = (value: any): any => {
    // Handle null, undefined, or empty string
    if (value === null || value === undefined || value === "") return "N/A";
    
    // Handle empty arrays
    if (Array.isArray(value) && value.length === 0) return "N/A";
    
    // Already an array or object, return as-is
    if (Array.isArray(value) || typeof value === "object") return value;
    
    // Try to parse JSON string
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.length === 0 ? "N/A" : parsed;
        }
        if (typeof parsed === "object") return parsed;
      } catch {}
    }
    return value;
  };

  const Field = ({ label, value }: { label: string; value: any }) => {
    const v = normalizeValue(value);
    if (Array.isArray(v)) {
      if (v.length > 0 && typeof v[0] === "object") {
        return (
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="space-y-3 mt-2">
              {v.map((item: any, idx: number) => (
                <div key={idx} className="border-l-2 border-border pl-3 space-y-1">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      <span className="text-foreground">{String(val ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm text-foreground break-words whitespace-normal mt-1">{v.join(", ")}</p>
        </div>
      );
    }
    if (typeof v === "object" && v !== null) {
      return (
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="space-y-2 mt-2">
            {Object.entries(v).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="text-foreground break-words whitespace-normal">{String(val ?? "—")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words whitespace-normal mt-1">{v || "N/A"}</p>
      </div>
    );
  };

  // Skills count for hero section
  const skillsCount = [
    ...toArray(applicant.skills),
    ...toArray(applicant.otherSkills),
  ].filter(Boolean).length;

  const heroHighlights = [
    {
      label: "Match Score",
      value: applicant.matchScore ? `${applicant.matchScore}%` : "—",
    },
    {
      label: "Skills",
      value: skillsCount > 0 ? skillsCount.toString() : "—",
    },
    {
      label: "Priority",
      value: applicant.priorityLevel ?? "Standard",
    },
  ];

  const heroBadges = [
    applicant.employmentStatusDetail && applicant.employmentStatusDetail !== employmentSummary
      ? applicant.employmentStatusDetail
      : null,
    selfEmployedCategoryLabel && selfEmployedCategoryLabel !== employmentSummary
      ? `Category: ${selfEmployedCategoryLabel}`
      : null,
    unemployedReasonLabel ? `Reason: ${unemployedReasonLabel}` : null,
    isOfw ? "OFW" : null,
    isFormerOfw ? "Former OFW" : null,
    isPwd ? "PWD" : null,
    is4psBeneficiary ? "4Ps Beneficiary" : null,
  ].filter(Boolean) as string[];

  const initials = `${(applicant.firstName ?? "").charAt(0)}${(applicant.surname ?? "").charAt(0)}`;
  const fullName = `${applicant.firstName ?? ""} ${applicant.surname ?? ""}`.trim() || "Applicant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b text-left">
          <DialogTitle className="text-xl leading-tight truncate">{fullName}</DialogTitle>
          <DialogDescription>Applicant details</DialogDescription>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <Avatar className="h-14 w-14 border">
                {applicant.profilePictureUrl ? (
                  <AvatarImage src={applicant.profilePictureUrl} alt="Applicant photo" />
                ) : (
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                )}
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {employmentSummary && employmentSummary !== "Not specified" && (
                    <Badge
                      variant="secondary"
                      className={`border-0 ${summaryBadgeClassName}`}
                    >
                      {employmentSummary}
                    </Badge>
                  )}
                  {heroBadges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="truncate">{applicant.email || "—"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Contact</p>
                    <p className="truncate">{applicant.contactNumber || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {heroHighlights.map((entry) => (
                <div
                  key={entry.label}
                  className="rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <p className="text-[11px] font-medium text-muted-foreground">{entry.label}</p>
                  <p className="text-sm font-semibold leading-tight truncate">{entry.value ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="skills">Skills & Education</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6 min-h-0">
            <div className="pt-4">
              <TabsContent value="personal" className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Personal Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First Name" value={applicant.firstName} />
                  <Field label="Middle Name" value={applicant.middleName} />
                  <Field label="Surname" value={applicant.surname} />
                  <Field label="Suffix" value={applicant.suffix} />
                  <Field label="Date of Birth" value={applicant.dateOfBirth} />
                  <Field label="Sex" value={applicant.sex} />
                  <Field label="Religion" value={applicant.religion} />
                  <Field label="Civil Status" value={applicant.civilStatus} />
                  <Field label="Height" value={applicant.height} />
                  <Field label="Disability" value={applicant.disability} />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold">Contact Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" value={applicant.email} />
                  <Field label="Contact Number" value={applicant.contactNumber} />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold">Address Information</p>
                <Field label="House/Street/Village" value={applicant.houseStreetVillage} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Barangay" value={applicant.barangay} />
                  <Field label="Municipality" value={applicant.municipality} />
                  <Field label="Province" value={applicant.province} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Employment Status" value={applicant.employmentStatus} />
                <Field label="Employment Summary" value={employmentSummary} />
                <Field label="Employment Branch" value={applicant.employmentStatusDetail} />
                <Field label="Self-employed Category" value={selfEmployedCategoryLabel} />
                <Field label="Unemployment Reason" value={unemployedReasonLabel} />
                <Field label="Months Looking for Work" value={applicant.monthsUnemployed} />
                <Field label="Country (if terminated abroad)" value={applicant.unemployedAbroadCountry} />
                <Field label="Employment Type (legacy)" value={applicant.employmentType} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Is OFW</p>
                  <Badge variant={isOfw ? "default" : "secondary"}>{isOfw ? "Yes" : "No"}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">PWD</p>
                  <Badge variant={isPwd ? "default" : "secondary"}>{isPwd ? "Yes" : "No"}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Solo Parent</p>
                  <Badge variant={isSoloParent ? "default" : "secondary"}>{isSoloParent ? "Yes" : "No"}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">4Ps Beneficiary</p>
                  <Badge variant={is4psBeneficiary ? "default" : "secondary"}>{is4psBeneficiary ? "Yes" : "No"}</Badge>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold">System Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="ID" value={applicant.id} />
                  <Field label="Created At" value={formatDate(applicant.createdAt)} />
                  <Field label="Updated At" value={formatDate(applicant.updatedAt)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              {/* IV. Educational Background */}
              <div className="space-y-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">IV</Badge>
                  Educational Background
                </p>
                <Field label="Education" value={applicant.education} />
              </div>

              {/* V. Technical/Vocational Training */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">V</Badge>
                  Technical/Vocational Training
                </p>
                <Field label="Technical Training" value={applicant.technicalTraining} />
              </div>

              {/* VI. Professional License */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">VI</Badge>
                  Professional License
                </p>
                <Field label="Professional Licenses" value={applicant.professionalLicenses} />
              </div>

              {/* III. Language/Dialect Proficiency */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">III</Badge>
                  Language/Dialect Proficiency
                </p>
                <Field label="Language Proficiency" value={applicant.languageProficiency} />
              </div>

              {/* VII. Work Experience */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">VII</Badge>
                  Work Experience (Last 10 Years)
                </p>
                <Field label="Work Experience" value={applicant.workExperience} />
              </div>

              {/* VIII. Other Skills Acquired Without Certificate */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">VIII</Badge>
                  Other Skills Acquired (Without Certificate)
                </p>
                <Field label="Skills" value={applicant.skills} />
                <Field label="Other Skills (Checkboxes)" value={applicant.otherSkills} />
                {applicant.otherSkillsSpecify && (
                  <Field label="Other Skills (Specify)" value={applicant.otherSkillsSpecify} />
                )}
                {applicant.otherSkillsTraining && (
                  <Field label="Additional Training Details" value={applicant.otherSkillsTraining} />
                )}
              </div>

              {/* Job Preferences */}
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-semibold">II</Badge>
                  Job Preferences
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Preferred Occupations" value={applicant.preferredOccupations} />
                  <Field label="Preferred Locations" value={applicant.preferredLocations} />
                  <Field label="Preferred Overseas Countries" value={applicant.preferredOverseasCountries} />
                  <Field label="Willing to Relocate" value={applicant.willingToRelocate ? "Yes" : "No"} />
                  <Field label="Willing to Work Overseas" value={applicant.willingToWorkOverseas ? "Yes" : "No"} />
                </div>
              </div>
            </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
