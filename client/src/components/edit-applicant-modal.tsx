import { EDUCATION_LEVEL_OPTIONS } from "@shared/education";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import {
  nsrpEmploymentStatusOptions,
  nsrpEmployedBranches,
  nsrpSelfEmploymentCategories,
  nsrpUnemployedReasons,
} from "@shared/schema";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE } from "@/lib/locations";

interface EditApplicantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
  onApplicantUpdated?: () => void;
}

export function EditApplicantModal({
  open,
  onOpenChange,
  applicant,
  onApplicantUpdated,
}: EditApplicantModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  type EditApplicantRequiredField =
    | "surname"
    | "firstName"
    | "dateOfBirth"
    | "sex"
    | "houseStreetVillage"
    | "barangay"
    | "municipality"
    | "province";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<EditApplicantRequiredField>();

  const toArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // treat as comma-separated fallback
        return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    }
    return [];
  };
  
  // Helper function to normalize array fields
  const normalizeApplicantData = (data: any) => {
    if (!data) return {};
    
    // Parse JSON strings or ensure arrays
    const parseJsonField = (field: any) => toArray(field);

    return {
      ...data,
      municipality: data.municipality || DEFAULT_MUNICIPALITY,
      province: data.province || DEFAULT_PROVINCE,
      workExperience: parseJsonField(data.workExperience),
      education: parseJsonField(data.education),
      technicalTraining: parseJsonField(data.technicalTraining),
      professionalLicenses: parseJsonField(data.professionalLicenses),
      languageProficiency: parseJsonField(data.languageProficiency),
      otherSkills: parseJsonField(data.otherSkills),
      skills: parseJsonField(data.skills),
      otherSkillsTraining: parseJsonField(data.otherSkillsTraining),
      preferredOccupations: parseJsonField(data.preferredOccupations),
      preferredLocations: parseJsonField(data.preferredLocations),
      preferredOverseasCountries: parseJsonField(data.preferredOverseasCountries),
      familyMembers: parseJsonField(data.familyMembers),
      dependents: parseJsonField(data.dependents),
      references: parseJsonField(data.references),
      documentRequirements: parseJsonField(data.documentRequirements),
      additionalAddresses: parseJsonField(data.additionalAddresses),
    };
  };
  
  const [formData, setFormData] = useState(normalizeApplicantData(applicant));

  useEffect(() => {
    setFormData(normalizeApplicantData(applicant));
  }, [applicant, open]);

  const barangays = [
    "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang",
    "City Heights", "Conel", "Dadiangas East", "Dadiangas North",
    "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan",
    "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
    "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler",
    "Tinagacan", "Upper Labay"
  ];

  const otherSkillsOptions = [
    "Auto Mechanic", "Beautician", "Carpentry Work", "Computer Literate", "Domestic Chores", "Driver",
    "Electrician", "Embroidery", "Gardening", "Masonry", "Painter/Artist", "Painting Jobs",
    "Photography", "Plumbing", "Sewing Dresses", "Stenography", "Tailoring", "Others"
  ] as const;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field === "surname" ||
      field === "firstName" ||
      field === "dateOfBirth" ||
      field === "sex" ||
      field === "houseStreetVillage" ||
      field === "barangay" ||
      field === "municipality" ||
      field === "province"
    ) {
      clearFieldError(field as EditApplicantRequiredField);
    }
  };

  const syncEmploymentType = (
    detail?: string | null,
    category?: string | null,
    categoryOther?: string | null,
  ) => {
    if (detail === "Self-employed") {
      if (category === "Others") {
        handleInputChange("employmentType", categoryOther || "Others");
      } else if (category) {
        handleInputChange("employmentType", category);
      } else {
        handleInputChange("employmentType", "Self-employed");
      }
      return;
    }

    if (detail === "Wage employed") {
      handleInputChange("employmentType", "Wage employed");
      return;
    }

    handleInputChange("employmentType", undefined);
  };

  const resetEmploymentDetailFields = () => {
    handleInputChange("employmentStatusDetail", undefined);
    handleInputChange("selfEmployedCategory", undefined);
    handleInputChange("selfEmployedCategoryOther", "");
  };

  const resetUnemploymentFields = () => {
    handleInputChange("unemployedReason", undefined);
    handleInputChange("unemployedReasonOther", "");
    handleInputChange("unemployedAbroadCountry", "");
    handleInputChange("monthsUnemployed", undefined);
  };

  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>(() => {
    const existing = formData.otherSkillsSpecify || "";
    return existing ? existing.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  });

  const handleCustomSkillAdd = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !customSkills.includes(trimmed)) {
      const updated = [...customSkills, trimmed];
      setCustomSkills(updated);
      handleInputChange("otherSkillsSpecify", updated.join(", "));
      setCustomSkillInput("");
    }
  };

  const handleCustomSkillRemove = (skillToRemove: string) => {
    const updated = customSkills.filter(s => s !== skillToRemove);
    setCustomSkills(updated);
    handleInputChange("otherSkillsSpecify", updated.join(", "));
  };

  const handleEmploymentStatusChange = (value: string) => {
    handleInputChange("employmentStatus", value);
    if (value === "Employed") {
      resetUnemploymentFields();
    } else if (value === "Unemployed") {
      resetEmploymentDetailFields();
      handleInputChange("employmentType", undefined);
    }
  };

  const handleEmploymentStatusDetailChange = (value: string) => {
    handleInputChange("employmentStatusDetail", value);
    if (value !== "Self-employed") {
      handleInputChange("selfEmployedCategory", undefined);
      handleInputChange("selfEmployedCategoryOther", "");
    }
    syncEmploymentType(value, formData.selfEmployedCategory, formData.selfEmployedCategoryOther);
  };

  const handleSelfEmployedCategoryChange = (value: string) => {
    handleInputChange("selfEmployedCategory", value);
    if (value !== "Others") {
      handleInputChange("selfEmployedCategoryOther", "");
    }
    syncEmploymentType(formData.employmentStatusDetail, value, formData.selfEmployedCategoryOther);
  };

  const handleSelfEmployedCategoryOtherChange = (value: string) => {
    handleInputChange("selfEmployedCategoryOther", value);
    if (formData.employmentStatusDetail === "Self-employed") {
      handleInputChange("employmentType", value || "Others");
    }
  };

  const handleUnemployedReasonChange = (value: string) => {
    handleInputChange("unemployedReason", value);
    if (value !== "Terminated/Laid off (abroad)") {
      handleInputChange("unemployedAbroadCountry", "");
    }
    if (value !== "Others") {
      handleInputChange("unemployedReasonOther", "");
    }
  };

  const handleSkillToggle = (skill: typeof otherSkillsOptions[number]) => {
    setFormData((prev: any) => {
      const skills = prev.otherSkills || [];
      return {
        ...prev,
        otherSkills: skills.includes(skill)
          ? skills.filter((s: string) => s !== skill)
          : [...skills, skill],
      };
    });
  };

  const handleWorkExperienceRemove = (idx: number) => {
    const newExp = formData.workExperience?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("workExperience", newExp);
  };

  const handleLanguageRemove = (idx: number) => {
    const newLang = formData.languageProficiency?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("languageProficiency", newLang);
  };

  const handleEducationRemove = (idx: number) => {
    const newEdu = formData.education?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("education", newEdu);
  };

  const handleTrainingRemove = (idx: number) => {
    const newTraining = formData.technicalTraining?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("technicalTraining", newTraining);
  };

  const handleLicenseRemove = (idx: number) => {
    const newLicenses = formData.professionalLicenses?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("professionalLicenses", newLicenses);
  };

  const handleFamilyMemberRemove = (idx: number) => {
    const next = formData.familyMembers?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("familyMembers", next);
  };

  const handleDependentRemove = (idx: number) => {
    const next = formData.dependents?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("dependents", next);
  };

  const handleReferenceRemove = (idx: number) => {
    const next = formData.references?.filter((_: any, i: number) => i !== idx) || [];
    handleInputChange("references", next);
  };

  const buildPayload = () => {
    const payload: any = { ...formData };

    // Add custom skills from the "Others" input to otherSkillsSpecify
    payload.otherSkillsSpecify = customSkills.join(", ");

    const arrayFields = [
      "education",
      "technicalTraining",
      "professionalLicenses",
      "languageProficiency",
      "workExperience",
      "otherSkills",
      "skills",
      "otherSkillsTraining",
      "preferredOccupations",
      "preferredLocations",
      "preferredOverseasCountries",
      "familyMembers",
      "dependents",
      "references",
      "documentRequirements",
      "additionalAddresses",
    ];

    arrayFields.forEach((field) => {
      payload[field] = toArray(payload[field]);
    });

    // Trim strings
    Object.entries(payload).forEach(([key, value]) => {
      if (typeof value === "string") {
        payload[key] = value.trim();
        if (payload[key] === "") payload[key] = undefined;
      }
    });

    // Numeric fields
    const numberFields = ["monthsUnemployed"];
    numberFields.forEach((field) => {
      if (field in payload) {
        const num = Number(payload[field]);
        payload[field] = Number.isFinite(num) ? num : undefined;
      }
    });

    // Optional enums: drop empty
    const optionalEnumFields = [
      "employmentStatus",
      "employmentStatusDetail",
      "selfEmployedCategory",
      "selfEmployedCategoryOther",
      "unemployedReason",
      "unemployedReasonOther",
      "employmentType",
      "jobPreference",
    ];
    optionalEnumFields.forEach((field) => {
      if (payload[field] === undefined || payload[field] === "") {
        delete payload[field];
      }
    });

    // ID fields
    ["id", "createdAt", "updatedAt", "hasAccount", "role", "passwordHash"].forEach((f) => {
      delete payload[f];
    });

    if (!payload.sex) {
      payload.sex = "Male";
    }

    return payload;
  };

  const handleSubmit = async () => {
    const nextErrors: FieldErrors<EditApplicantRequiredField> = {};
    if (!String(formData.surname || "").trim()) nextErrors.surname = "Surname is required";
    if (!String(formData.firstName || "").trim()) nextErrors.firstName = "First name is required";
    if (!String(formData.dateOfBirth || "").trim()) nextErrors.dateOfBirth = "Date of birth is required";
    if (!String(formData.sex || "").trim()) nextErrors.sex = "Sex is required";

    if (!String(formData.houseStreetVillage || "").trim()) {
      nextErrors.houseStreetVillage = "House/Street/Village is required";
    }
    if (!String(formData.barangay || "").trim()) nextErrors.barangay = "Barangay is required";
    if (!String(formData.municipality || "").trim()) nextErrors.municipality = "Municipality is required";
    if (!String(formData.province || "").trim()) nextErrors.province = "Province is required";

    if (Object.keys(nextErrors).length) {
      setActiveTab("overview");
      setErrorsAndFocus(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await authFetch(`/api/applicants/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.error || errBody?.message || "Failed to update applicant");
      }

      toast({
        title: "Success",
        description: "Applicant updated successfully",
      });

      onOpenChange(false);
      onApplicantUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Edit Applicant — {formData.firstName} {formData.surname}</DialogTitle>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 sticky top-0 bg-slate-50 z-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
            <TabsTrigger value="ids">IDs & Preferences</TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto flex-1 space-y-6 bg-white">
            {/* Overview Tab - Personal + Address */}
            <TabsContent value="overview" className="space-y-4">
              <h4 className="font-semibold mb-3">I. PERSONAL INFORMATION</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Surname *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.surname}
                    value={formData.surname || ""}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    placeholder="Surname"
                  />
                  {fieldErrors.surname && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.surname}</p>
                  )}
                </div>
                <div>
                  <Label>First Name *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.firstName}
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="First Name"
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.firstName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    value={formData.middleName || ""}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    placeholder="Middle Name"
                  />
                </div>
                <div>
                  <Label>Suffix</Label>
                  <Input
                    value={formData.suffix || ""}
                    onChange={(e) => handleInputChange("suffix", e.target.value)}
                    placeholder="Suffix (Jr., Sr., II, etc.)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    aria-invalid={!!fieldErrors.dateOfBirth}
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                  {fieldErrors.dateOfBirth && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <Label>Sex *</Label>
                  <Select value={formData.sex || "Male"} onValueChange={(v) => handleInputChange("sex", v)}>
                    <SelectTrigger aria-invalid={!!fieldErrors.sex}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.sex && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.sex}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Religion</Label>
                  <Input
                    value={formData.religion || ""}
                    onChange={(e) => handleInputChange("religion", e.target.value)}
                    placeholder="Religion"
                  />
                </div>
                <div>
                  <Label>Civil Status</Label>
                  <Select value={formData.civilStatus || "Single"} onValueChange={(v) => handleInputChange("civilStatus", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Height (ft.)</Label>
                  <Input
                    value={formData.height || ""}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="Height"
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.contactNumber || ""}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div>
                <Label>Disability Status</Label>
                <Select value={formData.disability || "None"} onValueChange={(v) => handleInputChange("disability", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Hearing">Hearing</SelectItem>
                    <SelectItem value="Speech">Speech</SelectItem>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Mental">Mental</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.disability === "Others" && (
                <div>
                  <Label>Specify Disability</Label>
                  <Input
                    value={formData.disabilitySpecify || ""}
                    onChange={(e) => handleInputChange("disabilitySpecify", e.target.value)}
                    placeholder="Please specify"
                  />
                </div>
              )}

              <h4 className="font-semibold mb-3 mt-6">II. ADDRESS INFORMATION</h4>
              <div>
                <Label>House/Street/Village *</Label>
                <Input
                  aria-invalid={!!fieldErrors.houseStreetVillage}
                  value={formData.houseStreetVillage || ""}
                  onChange={(e) => handleInputChange("houseStreetVillage", e.target.value)}
                  placeholder="Address"
                />
                {fieldErrors.houseStreetVillage && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.houseStreetVillage}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Barangay *</Label>
                  <Select value={formData.barangay || ""} onValueChange={(v) => handleInputChange("barangay", v)}>
                    <SelectTrigger aria-invalid={!!fieldErrors.barangay}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.barangay && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.barangay}</p>
                  )}
                </div>
                <div>
                  <Label>Municipality *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.municipality}
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality"
                  />
                  {fieldErrors.municipality && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.municipality}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Province *</Label>
                <Input
                  aria-invalid={!!fieldErrors.province}
                  value={formData.province || ""}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="Province"
                />
                {fieldErrors.province && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.province}</p>
                )}
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Employment Status</Label>
                  <Select value={formData.employmentStatus || undefined} onValueChange={handleEmploymentStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {nsrpEmploymentStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.employmentStatus === "Employed" && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div>
                      <Label>Employment Type</Label>
                      <Select
                        value={formData.employmentStatusDetail || undefined}
                        onValueChange={handleEmploymentStatusDetailChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {nsrpEmployedBranches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.employmentStatusDetail === "Self-employed" && (
                      <>
                        <div>
                          <Label>Self-employed Category</Label>
                          <Select
                            value={formData.selfEmployedCategory || undefined}
                            onValueChange={handleSelfEmployedCategoryChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {nsrpSelfEmploymentCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.selfEmployedCategory === "Others" && (
                          <Input
                            value={formData.selfEmployedCategoryOther || ""}
                            onChange={(e) => handleSelfEmployedCategoryOtherChange(e.target.value)}
                            placeholder="Please specify"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {formData.employmentStatus === "Unemployed" && (
                  <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                    <div>
                      <Label>Reason for unemployment</Label>
                      <Select
                        value={formData.unemployedReason || undefined}
                        onValueChange={handleUnemployedReasonChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {nsrpUnemployedReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.unemployedReason === "Others" && (
                      <Input
                        value={formData.unemployedReasonOther || ""}
                        onChange={(e) => handleInputChange("unemployedReasonOther", e.target.value)}
                        placeholder="Specify reason"
                      />
                    )}
                    {formData.unemployedReason === "Terminated/Laid off (abroad)" && (
                      <Input
                        value={formData.unemployedAbroadCountry || ""}
                        onChange={(e) => handleInputChange("unemployedAbroadCountry", e.target.value)}
                        placeholder="Country of employment"
                      />
                    )}
                    <div>
                      <Label>How many months looking for work?</Label>
                      <Input
                        type="number"
                        value={formData.monthsUnemployed ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            "monthsUnemployed",
                            e.target.value ? parseInt(e.target.value) : undefined,
                          )
                        }
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!formData.isOFW}
                  onCheckedChange={(checked) => {
                    const value = checked === true;
                    handleInputChange("isOFW", value);
                    if (!value) handleInputChange("owfCountry", "");
                  }}
                />
                <Label>Are you an OFW?</Label>
              </div>

              {formData.isOFW && (
                <Input
                  value={formData.owfCountry || ""}
                  onChange={(e) => handleInputChange("owfCountry", e.target.value)}
                  placeholder="Country"
                />
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!formData.isFormerOFW}
                  onCheckedChange={(checked) => {
                    const value = checked === true;
                    handleInputChange("isFormerOFW", value);
                    if (!value) {
                      handleInputChange("formerOFWCountry", "");
                      handleInputChange("returnToPHDate", "");
                    }
                  }}
                />
                <Label>Are you a former OFW?</Label>
              </div>

              {formData.isFormerOFW && (
                <div className="space-y-2">
                  <Input
                    value={formData.formerOFWCountry || ""}
                    onChange={(e) => handleInputChange("formerOFWCountry", e.target.value)}
                    placeholder="Latest country of deployment"
                  />
                  <Input
                    type="date"
                    value={formData.returnToPHDate || ""}
                    onChange={(e) => handleInputChange("returnToPHDate", e.target.value)}
                    placeholder="Return date"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={!!formData.is4PSBeneficiary}
                  onCheckedChange={(checked) => {
                    const value = checked === true;
                    handleInputChange("is4PSBeneficiary", value);
                    if (!value) handleInputChange("householdID", "");
                  }}
                />
                <Label>Are you a 4Ps beneficiary?</Label>
              </div>

              {formData.is4PSBeneficiary && (
                <Input
                  value={formData.householdID || ""}
                  onChange={(e) => handleInputChange("householdID", e.target.value)}
                  placeholder="Household ID No."
                />
              )}
            </TabsContent>

            {/* Skills & Education Tab */}
            <TabsContent value="skills" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">III. LANGUAGE PROFICIENCY</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLang = [...(formData.languageProficiency || []), { language: "", read: false, write: false, speak: false, understand: false }];
                      handleInputChange("languageProficiency", newLang);
                    }}
                  >
                    Add Language
                  </Button>
                </div>
                {(Array.isArray(formData.languageProficiency) ? formData.languageProficiency : []).map((lang: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Language {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLanguageRemove(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={lang.language || ""}
                      onChange={(e) => {
                        const newLang = [...(formData.languageProficiency || [])];
                        newLang[idx] = { ...lang, language: e.target.value };
                        handleInputChange("languageProficiency", newLang);
                      }}
                      placeholder="Language/Dialect"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lang.read || false}
                          onCheckedChange={(v) => {
                            const newLang = [...(formData.languageProficiency || [])];
                            newLang[idx] = { ...lang, read: v };
                            handleInputChange("languageProficiency", newLang);
                          }}
                        />
                        <Label className="text-sm">Read</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lang.write || false}
                          onCheckedChange={(v) => {
                            const newLang = [...(formData.languageProficiency || [])];
                            newLang[idx] = { ...lang, write: v };
                            handleInputChange("languageProficiency", newLang);
                          }}
                        />
                        <Label className="text-sm">Write</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lang.speak || false}
                          onCheckedChange={(v) => {
                            const newLang = [...(formData.languageProficiency || [])];
                            newLang[idx] = { ...lang, speak: v };
                            handleInputChange("languageProficiency", newLang);
                          }}
                        />
                        <Label className="text-sm">Speak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lang.understand || false}
                          onCheckedChange={(v) => {
                            const newLang = [...(formData.languageProficiency || [])];
                            newLang[idx] = { ...lang, understand: v };
                            handleInputChange("languageProficiency", newLang);
                          }}
                        />
                        <Label className="text-sm">Understand</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">IV. EDUCATIONAL BACKGROUND</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEdu = [...(formData.education || []), { level: "", course: "", schoolName: "", yearGraduated: "" }];
                      handleInputChange("education", newEdu);
                    }}
                  >
                    Add Education
                  </Button>
                </div>
                {(Array.isArray(formData.education) ? formData.education : []).map((edu: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Education {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEducationRemove(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select value={edu.level || ""} onValueChange={(v) => {
                      const newEdu = [...(formData.education || [])];
                      newEdu[idx] = { ...edu, level: v };
                      handleInputChange("education", newEdu);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVEL_OPTIONS.filter((level) => level !== "No specific requirement").map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={edu.course || ""}
                      onChange={(e) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx] = { ...edu, course: e.target.value };
                        handleInputChange("education", newEdu);
                      }}
                      placeholder="Course"
                    />
                    <Input
                      value={edu.schoolName || ""}
                      onChange={(e) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx] = { ...edu, schoolName: e.target.value };
                        handleInputChange("education", newEdu);
                      }}
                      placeholder="Name of School/University"
                    />
                    <Input
                      type="number"
                      value={edu.yearGraduated || ""}
                      onChange={(e) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx] = { ...edu, yearGraduated: e.target.value };
                        handleInputChange("education", newEdu);
                      }}
                      placeholder="Year Graduated"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">V. TECHNICAL/VOCATIONAL TRAINING</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTraining = [...(formData.technicalTraining || []), { course: "", hoursOfTraining: 0, trainingInstitution: "", skillsAcquired: "" }];
                      handleInputChange("technicalTraining", newTraining);
                    }}
                  >
                    Add Training
                  </Button>
                </div>
                {(Array.isArray(formData.technicalTraining) ? formData.technicalTraining : []).map((training: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Training {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrainingRemove(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={training.course || ""}
                      onChange={(e) => {
                        const newTraining = [...(formData.technicalTraining || [])];
                        newTraining[idx] = { ...training, course: e.target.value };
                        handleInputChange("technicalTraining", newTraining);
                      }}
                      placeholder="Training/Vocational Course"
                    />
                    <Input
                      type="number"
                      value={training.hoursOfTraining || ""}
                      onChange={(e) => {
                        const newTraining = [...(formData.technicalTraining || [])];
                        newTraining[idx] = { ...training, hoursOfTraining: parseInt(e.target.value) || 0 };
                        handleInputChange("technicalTraining", newTraining);
                      }}
                      placeholder="Hours of Training"
                    />
                    <Input
                      value={training.trainingInstitution || ""}
                      onChange={(e) => {
                        const newTraining = [...(formData.technicalTraining || [])];
                        newTraining[idx] = { ...training, trainingInstitution: e.target.value };
                        handleInputChange("technicalTraining", newTraining);
                      }}
                      placeholder="Training Institution"
                    />
                    <Input
                      value={training.skillsAcquired || ""}
                      onChange={(e) => {
                        const newTraining = [...(formData.technicalTraining || [])];
                        newTraining[idx] = { ...training, skillsAcquired: e.target.value };
                        handleInputChange("technicalTraining", newTraining);
                      }}
                      placeholder="Skills Acquired"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">VI. PROFESSIONAL LICENSES AND CERTIFICATIONS</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLicenses = [...(formData.professionalLicenses || []), { eligibility: "", dateTaken: "", licenseNumber: "", validUntil: "", issuedBy: "", rating: "", examPlace: "" }];
                      handleInputChange("professionalLicenses", newLicenses);
                    }}
                  >
                    Add License
                  </Button>
                </div>
                {(Array.isArray(formData.professionalLicenses) ? formData.professionalLicenses : []).map((license: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">License {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLicenseRemove(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={license.eligibility || ""}
                      onChange={(e) => {
                        const newLicenses = [...(formData.professionalLicenses || [])];
                        newLicenses[idx] = { ...license, eligibility: e.target.value };
                        handleInputChange("professionalLicenses", newLicenses);
                      }}
                      placeholder="Eligibility/License Title"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={license.licenseNumber || ""}
                        onChange={(e) => {
                          const newLicenses = [...(formData.professionalLicenses || [])];
                          newLicenses[idx] = { ...license, licenseNumber: e.target.value };
                          handleInputChange("professionalLicenses", newLicenses);
                        }}
                        placeholder="License Number"
                      />
                      <Input
                        value={license.validUntil || ""}
                        onChange={(e) => {
                          const newLicenses = [...(formData.professionalLicenses || [])];
                          newLicenses[idx] = { ...license, validUntil: e.target.value };
                          handleInputChange("professionalLicenses", newLicenses);
                        }}
                        placeholder="Valid Until (YYYY-MM-DD)"
                      />
                    </div>
                  </div>
                ))}
              </div>


              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">VII. WORK EXPERIENCE (Last 10 years)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExp = [...(formData.workExperience || []), { companyName: "", address: "", position: "", numberOfMonths: 0, status: "" }];
                      handleInputChange("workExperience", newExp);
                    }}
                  >
                    Add Experience
                  </Button>
                </div>
                {(Array.isArray(formData.workExperience) ? formData.workExperience : []).map((exp: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Experience {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWorkExperienceRemove(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={exp.companyName || ""}
                      onChange={(e) => {
                        const newExp = [...(formData.workExperience || [])];
                        newExp[idx] = { ...exp, companyName: e.target.value };
                        handleInputChange("workExperience", newExp);
                      }}
                      placeholder="Company Name"
                    />
                    <Input
                      value={exp.address || ""}
                      onChange={(e) => {
                        const newExp = [...(formData.workExperience || [])];
                        newExp[idx] = { ...exp, address: e.target.value };
                        handleInputChange("workExperience", newExp);
                      }}
                      placeholder="Address (City/Municipality)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={exp.position || ""}
                        onChange={(e) => {
                          const newExp = [...(formData.workExperience || [])];
                          newExp[idx] = { ...exp, position: e.target.value };
                          handleInputChange("workExperience", newExp);
                        }}
                        placeholder="Position"
                      />
                      <Input
                        type="number"
                        value={exp.numberOfMonths || ""}
                        onChange={(e) => {
                          const newExp = [...(formData.workExperience || [])];
                          newExp[idx] = { ...exp, numberOfMonths: parseInt(e.target.value) || 0 };
                          handleInputChange("workExperience", newExp);
                        }}
                        placeholder="Number of Months"
                      />
                    </div>
                    <Select
                      value={exp.status || ""}
                      onValueChange={(v) => {
                        const newExp = [...(formData.workExperience || [])];
                        newExp[idx] = { ...exp, status: v };
                        handleInputChange("workExperience", newExp);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contractual">Contractual</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold mb-3">VIII. OTHER SKILLS ACQUIRED WITHOUT CERTIFICATE</h4>
                <div className="grid grid-cols-2 gap-3">
                  {otherSkillsOptions.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.otherSkills?.includes(skill) || false}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label className="text-sm font-normal cursor-pointer">{skill}</Label>
                    </div>
                  ))}
                </div>

                {formData.otherSkills?.includes("Others") && (
                  <div className="mt-3">
                    <Label>Please specify other skills</Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCustomSkillAdd();
                          }
                        }}
                        placeholder="Type skill and press Enter"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCustomSkillAdd}
                      >
                        Add
                      </Button>
                    </div>
                    {customSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customSkills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleCustomSkillRemove(skill)}
                              className="ml-1 hover:text-green-900"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-6 mt-6 space-y-3">
                <h4 className="font-semibold">IX. Job Preferences & Locations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Preferred Occupations (comma separated)</Label>
                    <Input
                      value={(formData.preferredOccupations || []).join(", ")}
                      onChange={(e) => handleInputChange("preferredOccupations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="e.g., Nurse, Web Developer"
                    />
                  </div>
                  <div>
                    <Label>Preferred Locations (comma separated)</Label>
                    <Input
                      value={(formData.preferredLocations || []).join(", ")}
                      onChange={(e) => handleInputChange("preferredLocations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="e.g., General Santos City, Davao"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Preferred Overseas Countries (comma separated)</Label>
                    <Input
                      value={(formData.preferredOverseasCountries || []).join(", ")}
                      onChange={(e) => handleInputChange("preferredOverseasCountries", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="e.g., Canada, Japan"
                    />
                  </div>
                  <div>
                    <Label>Job Preference</Label>
                    <Select
                      value={formData.jobPreference || undefined}
                      onValueChange={(v) => handleInputChange("jobPreference", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Contractual">Contractual</SelectItem>
                        <SelectItem value="Seasonal">Seasonal</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                        <SelectItem value="Project-Based">Project-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* IDs & Preferences */}
            <TabsContent value="ids" className="space-y-4">
              <h4 className="font-semibold mb-3">Identification & NSRP</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Government ID Type</Label>
                  <Input
                    value={formData.governmentIdType || ""}
                    onChange={(e) => handleInputChange("governmentIdType", e.target.value)}
                    placeholder="e.g., PhilHealth, SSS, UMID"
                  />
                </div>
                <div>
                  <Label>Government ID Number</Label>
                  <Input
                    value={formData.governmentIdNumber || ""}
                    onChange={(e) => handleInputChange("governmentIdNumber", e.target.value)}
                    placeholder="ID Number"
                  />
                </div>
                <div>
                  <Label>NSRP Number</Label>
                  <Input
                    value={formData.nsrpNumber || ""}
                    onChange={(e) => handleInputChange("nsrpNumber", e.target.value)}
                    placeholder="NSRP Number"
                  />
                </div>
                <div>
                  <Label>NSRP Registration No.</Label>
                  <Input
                    value={formData.nsrpRegistrationNo || ""}
                    onChange={(e) => handleInputChange("nsrpRegistrationNo", e.target.value)}
                    placeholder="NSRP Registration No."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!!formData.willingToRelocate}
                    onCheckedChange={(checked) => handleInputChange("willingToRelocate", checked === true)}
                  />
                  <Label>Willing to relocate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!!formData.willingToWorkOverseas}
                    onCheckedChange={(checked) => handleInputChange("willingToWorkOverseas", checked === true)}
                  />
                  <Label>Willing to work overseas</Label>
                </div>
              </div>
            </TabsContent>

            {/* Family & References - REMOVED (Not part of NSRP form) */}
            {/* <TabsContent value="family" className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Family Members</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = [...(formData.familyMembers || []), { name: "", relationship: "", age: "" }];
                      handleInputChange("familyMembers", next);
                    }}
                  >
                    Add Member
                  </Button>
                </div>
                {(Array.isArray(formData.familyMembers) ? formData.familyMembers : []).map((member: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Member {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleFamilyMemberRemove(idx)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={member.name || ""}
                      onChange={(e) => {
                        const next = [...(formData.familyMembers || [])];
                        next[idx] = { ...member, name: e.target.value };
                        handleInputChange("familyMembers", next);
                      }}
                      placeholder="Name"
                    />
                    <Input
                      value={member.relationship || ""}
                      onChange={(e) => {
                        const next = [...(formData.familyMembers || [])];
                        next[idx] = { ...member, relationship: e.target.value };
                        handleInputChange("familyMembers", next);
                      }}
                      placeholder="Relationship"
                    />
                    <Input
                      type="number"
                      value={member.age || ""}
                      onChange={(e) => {
                        const next = [...(formData.familyMembers || [])];
                        next[idx] = { ...member, age: e.target.value };
                        handleInputChange("familyMembers", next);
                      }}
                      placeholder="Age"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Dependents</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = [...(formData.dependents || []), { name: "", relationship: "", age: "" }];
                      handleInputChange("dependents", next);
                    }}
                  >
                    Add Dependent
                  </Button>
                </div>
                {(Array.isArray(formData.dependents) ? formData.dependents : []).map((dep: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Dependent {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDependentRemove(idx)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={dep.name || ""}
                      onChange={(e) => {
                        const next = [...(formData.dependents || [])];
                        next[idx] = { ...dep, name: e.target.value };
                        handleInputChange("dependents", next);
                      }}
                      placeholder="Name"
                    />
                    <Input
                      value={dep.relationship || ""}
                      onChange={(e) => {
                        const next = [...(formData.dependents || [])];
                        next[idx] = { ...dep, relationship: e.target.value };
                        handleInputChange("dependents", next);
                      }}
                      placeholder="Relationship"
                    />
                    <Input
                      type="number"
                      value={dep.age || ""}
                      onChange={(e) => {
                        const next = [...(formData.dependents || [])];
                        next[idx] = { ...dep, age: e.target.value };
                        handleInputChange("dependents", next);
                      }}
                      placeholder="Age"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Character References</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = [...(formData.references || []), { name: "", contactNumber: "", relationship: "" }];
                      handleInputChange("references", next);
                    }}
                  >
                    Add Reference
                  </Button>
                </div>
                {(Array.isArray(formData.references) ? formData.references : []).map((ref: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Reference {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleReferenceRemove(idx)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={ref.name || ""}
                      onChange={(e) => {
                        const next = [...(formData.references || [])];
                        next[idx] = { ...ref, name: e.target.value };
                        handleInputChange("references", next);
                      }}
                      placeholder="Name"
                    />
                    <Input
                      value={ref.relationship || ""}
                      onChange={(e) => {
                        const next = [...(formData.references || [])];
                        next[idx] = { ...ref, relationship: e.target.value };
                        handleInputChange("references", next);
                      }}
                      placeholder="Relationship"
                    />
                    <Input
                      value={ref.contactNumber || ""}
                      onChange={(e) => {
                        const next = [...(formData.references || [])];
                        next[idx] = { ...ref, contactNumber: e.target.value };
                        handleInputChange("references", next);
                      }}
                      placeholder="Contact Number"
                    />
                  </div>
                ))}
              </div>
            </TabsContent> */}

            {/* Notes - REMOVED (Not part of NSRP form) */}
            {/* <TabsContent value="notes" className="space-y-4">
              <h4 className="font-semibold">Attachments & Notes</h4>
              <Textarea
                value={formData.attachments || ""}
                onChange={(e) => handleInputChange("attachments", e.target.value)}
                placeholder="Links or references to attachments"
              />
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about the applicant"
              />
            </TabsContent> */}
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
