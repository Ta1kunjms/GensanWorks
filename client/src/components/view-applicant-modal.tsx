import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
      // Check if array contains objects (education, work experience, etc.)
      if (v.length > 0 && typeof v[0] === "object") {
        return (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
            <div className="space-y-3 mt-2">
              {v.map((item: any, idx: number) => (
                <div key={idx} className="border-l-2 border-slate-300 pl-3 space-y-1">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} className="text-sm">
                      <span className="font-semibold text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      <span className="text-slate-900">{String(val ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Array of simple values (skills, etc.)
      return (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
          <p className="text-sm text-slate-900 break-words whitespace-normal">{v.join(", ")}</p>
        </div>
      );
    }
    if (typeof v === "object" && v !== null) {
      return (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
          <div className="space-y-2 mt-2">
            {Object.entries(v).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-semibold text-slate-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="text-slate-900 break-words whitespace-normal">{String(val ?? "—")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        <p className="text-sm text-slate-900 break-words whitespace-normal">{v || "N/A"}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {applicant.firstName} {applicant.surname}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-white flex-shrink-0">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto flex-1">
            <TabsContent value="personal" className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-700">Personal Information</p>
                <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-700">Contact Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" value={applicant.email} />
                  <Field label="Contact Number" value={applicant.contactNumber} />
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-700">Address Information</p>
                <Field label="House/Street/Village" value={applicant.houseStreetVillage} />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Barangay" value={applicant.barangay} />
                  <Field label="Municipality" value={applicant.municipality} />
                  <Field label="Province" value={applicant.province} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employment Status" value={applicant.employmentStatus} />
                <Field label="Employment Type" value={applicant.employmentType} />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Is OFW</p>
                  <Badge variant={applicant.isOfw ? "default" : "secondary"}>
                    {applicant.isOfw ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">PWD</p>
                  <Badge variant={applicant.isPwd ? "default" : "secondary"}>
                    {applicant.isPwd ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Solo Parent</p>
                  <Badge variant={applicant.isSoloParent ? "default" : "secondary"}>
                    {applicant.isSoloParent ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">4PS Beneficiary</p>
                  <Badge variant={applicant.is4psBeneficiary ? "default" : "secondary"}>
                    {applicant.is4psBeneficiary ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-700">System Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="ID" value={applicant.id} />
                  <Field label="Created At" value={formatDate(applicant.createdAt)} />
                  <Field label="Updated At" value={formatDate(applicant.updatedAt)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Field label="Education" value={applicant.education} />
              <Field label="Technical Training" value={applicant.technicalTraining} />
              <Field label="Professional Licenses" value={applicant.professionalLicenses} />
              <Field label="Language Proficiency" value={applicant.languageProficiency} />
              <Field label="Work Experience" value={applicant.workExperience} />
              <Field label="Other Skills" value={applicant.otherSkills} />
              <Field label="Other Skills (Specify)" value={applicant.otherSkillsSpecify} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
