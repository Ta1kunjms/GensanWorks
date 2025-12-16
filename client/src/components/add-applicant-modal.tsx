import { EDUCATION_LEVEL_OPTIONS } from "@shared/education";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { authFetch } from "@/lib/auth";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE } from "@/lib/locations";
import {
  nsrpEmploymentTypes,
  nsrpEmploymentStatusOptions,
  nsrpEmployedBranches,
  nsrpSelfEmploymentCategories,
  nsrpUnemployedReasons,
  type ApplicantCreate,
} from "@shared/schema";

interface AddApplicantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplicantAdded?: () => void;
}

export function AddApplicantModal({
  open,
  onOpenChange,
  onApplicantAdded,
}: AddApplicantModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  type ApplicantRequiredField =
    | "surname"
    | "firstName"
    | "dateOfBirth"
    | "houseStreetVillage"
    | "barangay"
    | "municipality"
    | "province";

  const { fieldErrors, setFieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<ApplicantRequiredField>();
  const defaultFormState: Partial<ApplicantCreate> = {
    sex: "Male",
    civilStatus: "Single",
    disability: "None",
    is4PSBeneficiary: false,
    isOFW: false,
    isFormerOFW: false,
    languageProficiency: [],
    education: [],
    technicalTraining: [],
    professionalLicenses: [],
    workExperience: [],
    otherSkills: [],
    houseStreetVillage: "",
    barangay: "",
    municipality: DEFAULT_MUNICIPALITY,
    province: DEFAULT_PROVINCE,
    employmentStatus: "Unemployed",
    employmentStatusDetail: undefined,
    selfEmployedCategory: undefined,
    selfEmployedCategoryOther: "",
    unemployedReason: undefined,
    unemployedReasonOther: "",
    unemployedAbroadCountry: "",
    monthsUnemployed: undefined,
  };
  const [formData, setFormData] = useState<Partial<ApplicantCreate>>(defaultFormState);

  const barangays = [
    "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang", "City Heights",
    "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West",
    "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
    "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay",
  ];

  const otherSkillsOptions = [
    "Auto Mechanic", "Beautician", "Carpentry Work", "Computer Literate", "Domestic Chores", "Driver",
    "Electrician", "Embroidery", "Gardening", "Masonry", "Painter/Artist", "Painting Jobs",
    "Photography", "Plumbing", "Sewing Dresses", "Stenography", "Tailoring", "Others"
  ] as const;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field === "surname" ||
      field === "firstName" ||
      field === "dateOfBirth" ||
      field === "houseStreetVillage" ||
      field === "barangay" ||
      field === "municipality" ||
      field === "province"
    ) {
      clearFieldError(field as ApplicantRequiredField);
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
    setFormData((prev) => {
      const skills = prev.otherSkills || [];
      return {
        ...prev,
        otherSkills: skills.includes(skill)
          ? skills.filter((s) => s !== skill)
          : [...skills, skill],
      };
    });
  };

  const handleLanguageAdd = () => {
    setFormData((prev) => ({
      ...prev,
      languageProficiency: [
        ...(prev.languageProficiency || []),
        { language: "", read: false, write: false, speak: false, understand: false },
      ],
    }));
  };

  const handleEducationAdd = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { level: "", course: "", schoolName: "", yearGraduated: "", strand: "", levelReached: "" },
      ],
    }));
  };

  const handleTrainingAdd = () => {
    setFormData((prev) => ({
      ...prev,
      technicalTraining: [
        ...(prev.technicalTraining || []),
        { course: "", hoursOfTraining: undefined, trainingInstitution: "", skillsAcquired: "", certificatesReceived: "" },
      ],
    }));
  };

  const handleLicenseAdd = () => {
    setFormData((prev) => ({
      ...prev,
      professionalLicenses: [
        ...(prev.professionalLicenses || []),
        { eligibility: "", dateTaken: "", licenseNumber: "", validUntil: "", issuedBy: "", rating: "", examPlace: "" },
      ],
    }));
  };

  const handleWorkExperienceAdd = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...(prev.workExperience || []),
        { companyName: "", address: "", position: "", numberOfMonths: undefined, status: "" },
      ],
    }));
  };

  const handleWorkExperienceRemove = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience?.filter((_: any, i: number) => i !== idx) || [],
    }));
  };

  const [occupationInput, setOccupationInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [overseasCountryInput, setOverseasCountryInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);

  const handleCustomSkillAdd = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !customSkills.includes(trimmed)) {
      setCustomSkills([...customSkills, trimmed]);
      setCustomSkillInput("");
    }
  };

  const handleCustomSkillRemove = (skillToRemove: string) => {
    setCustomSkills(customSkills.filter(s => s !== skillToRemove));
  };

  const handleOccupationAdd = () => {
    const trimmed = occupationInput.trim();
    if (trimmed && !formData.preferredOccupations?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        preferredOccupations: [...(prev.preferredOccupations || []), trimmed],
      }));
      setOccupationInput("");
    }
  };

  const handleOccupationRemove = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredOccupations: prev.preferredOccupations?.filter((_, i) => i !== idx) || [],
    }));
  };

  const handleLocationAdd = () => {
    const trimmed = locationInput.trim();
    if (trimmed && !formData.preferredLocations?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        preferredLocations: [...(prev.preferredLocations || []), trimmed],
      }));
      setLocationInput("");
    }
  };

  const handleLocationRemove = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredLocations: prev.preferredLocations?.filter((_, i) => i !== idx) || [],
    }));
  };

  const handleOverseasCountryAdd = () => {
    const trimmed = overseasCountryInput.trim();
    if (trimmed && !formData.preferredOverseasCountries?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        preferredOverseasCountries: [...(prev.preferredOverseasCountries || []), trimmed],
      }));
      setOverseasCountryInput("");
    }
  };

  const handleOverseasCountryRemove = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredOverseasCountries: prev.preferredOverseasCountries?.filter((_, i) => i !== idx) || [],
    }));
  };

  const validateStep1 = () => {
    const nextErrors: FieldErrors<ApplicantRequiredField> = {};

    if (!String(formData.surname || "").trim()) nextErrors.surname = "Surname is required";
    if (!String(formData.firstName || "").trim()) nextErrors.firstName = "First name is required";
    if (!String(formData.dateOfBirth || "").trim()) nextErrors.dateOfBirth = "Date of birth is required";

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      if (!prev.surname && !prev.firstName && !prev.dateOfBirth) return prev;
      const cleaned = { ...prev };
      delete cleaned.surname;
      delete cleaned.firstName;
      delete cleaned.dateOfBirth;
      return cleaned;
    });

    return true;
  };

  const validateStep2 = () => {
    const nextErrors: FieldErrors<ApplicantRequiredField> = {};

    if (!String(formData.houseStreetVillage || "").trim()) {
      nextErrors.houseStreetVillage = "House/Street/Village is required";
    }
    if (!String(formData.barangay || "").trim()) nextErrors.barangay = "Barangay is required";
    if (!String(formData.municipality || "").trim()) {
      nextErrors.municipality = "Municipality/City is required";
    }
    if (!String(formData.province || "").trim()) nextErrors.province = "Province is required";

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      if (!prev.houseStreetVillage && !prev.barangay && !prev.municipality && !prev.province) return prev;
      const cleaned = { ...prev };
      delete cleaned.houseStreetVillage;
      delete cleaned.barangay;
      delete cleaned.municipality;
      delete cleaned.province;
      return cleaned;
    });

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Final validation
      const nextErrors: FieldErrors<ApplicantRequiredField> = {};
      const missingStep1 =
        !String(formData.surname || "").trim() ||
        !String(formData.firstName || "").trim() ||
        !String(formData.dateOfBirth || "").trim();
      const missingStep2 =
        !String(formData.houseStreetVillage || "").trim() ||
        !String(formData.barangay || "").trim() ||
        !String(formData.municipality || "").trim() ||
        !String(formData.province || "").trim();

      if (!String(formData.surname || "").trim()) nextErrors.surname = "Surname is required";
      if (!String(formData.firstName || "").trim()) nextErrors.firstName = "First name is required";
      if (!String(formData.dateOfBirth || "").trim()) nextErrors.dateOfBirth = "Date of birth is required";
      if (!String(formData.houseStreetVillage || "").trim()) nextErrors.houseStreetVillage = "House/Street/Village is required";
      if (!String(formData.barangay || "").trim()) nextErrors.barangay = "Barangay is required";
      if (!String(formData.municipality || "").trim()) nextErrors.municipality = "Municipality/City is required";
      if (!String(formData.province || "").trim()) nextErrors.province = "Province is required";

      if (Object.keys(nextErrors).length) {
        setFieldErrors(nextErrors);
        if (missingStep1) setCurrentStep(1);
        else if (missingStep2) setCurrentStep(2);
        requestAnimationFrame(() => setErrorsAndFocus(nextErrors));
        return;
      }

      const response = await authFetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hasAccount: true,
          role: "jobseeker",
          otherSkillsSpecify: customSkills.join(", "),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add applicant");
      }

      toast({
        title: "Success",
        description: "Applicant added successfully",
      });

      onOpenChange(false);
      onApplicantAdded?.();

      // Reset form
      setFormData({ ...defaultFormState });
      setCurrentStep(1);
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
      <DialogContent className="max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Add New Applicant (NSRP Registration Form)</DialogTitle>
            <DialogDescription className="text-blue-50">
              Step {currentStep} of 5 — complete the NSRP intake with guided sections.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0 space-y-6 p-6 overflow-y-auto bg-white">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">I. PERSONAL INFORMATION</h3>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Surname *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.surname}
                    value={formData.surname || ""}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    placeholder="Last name"
                  />
                  {fieldErrors.surname && <p className="mt-1 text-xs text-destructive">{fieldErrors.surname}</p>}
                </div>
                <div>
                  <Label>First Name *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.firstName}
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="First name"
                  />
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-destructive">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    value={formData.middleName || ""}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    placeholder="Middle name"
                  />
                </div>
                <div>
                  <Label>Suffix</Label>
                  <Input
                    value={formData.suffix || ""}
                    onChange={(e) => handleInputChange("suffix", e.target.value)}
                    placeholder="Jr., Sr., etc."
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label>Civil Status *</Label>
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
            </div>
          )}

          {/* Step 2: Address & Employment Status */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">PRESENT ADDRESS</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>House No./Street/Village *</Label>
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
                <div>
                  <Label>Barangay *</Label>
                  <Select value={formData.barangay || ""} onValueChange={(v) => handleInputChange("barangay", v)}>
                    <SelectTrigger aria-invalid={!!fieldErrors.barangay}>
                      <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.barangay && <p className="mt-1 text-xs text-destructive">{fieldErrors.barangay}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Municipality/City *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.municipality}
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality/City"
                  />
                  {fieldErrors.municipality && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.municipality}</p>
                  )}
                </div>
                <div>
                  <Label>Province *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.province}
                    value={formData.province || ""}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    placeholder="Province"
                  />
                  {fieldErrors.province && <p className="mt-1 text-xs text-destructive">{fieldErrors.province}</p>}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg">EMPLOYMENT STATUS / TYPE</h3>

                <div className="mt-3 space-y-2">
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
                  <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
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
                  <div className="mt-4 space-y-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4">
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

              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isOFW || false}
                    onCheckedChange={(v) => handleInputChange("isOFW", v)}
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
                    checked={formData.isFormerOFW || false}
                    onCheckedChange={(v) => handleInputChange("isFormerOFW", v)}
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
                      placeholder="Month and year of return to Philippines"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.is4PSBeneficiary || false}
                    onCheckedChange={(v) => handleInputChange("is4PSBeneficiary", v)}
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
              </div>
            </div>
          )}

          {/* Step 3: Job Preference */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">II. JOB PREFERENCE</h3>

              {/* Preferred Occupations */}
              <div>
                <Label className="font-semibold text-base mb-2 block">PREFERRED OCCUPATION</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={occupationInput}
                    onChange={(e) => setOccupationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOccupationAdd();
                      }
                    }}
                    placeholder="Type occupation and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOccupationAdd}
                  >
                    Add
                  </Button>
                </div>
                {formData.preferredOccupations && formData.preferredOccupations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredOccupations.map((occ, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                      >
                        <span>{occ}</span>
                        <button
                          type="button"
                          onClick={() => handleOccupationRemove(idx)}
                          className="ml-1 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employment Type Preference */}
              <div>
                <Label className="font-semibold text-base mb-2 block">EMPLOYMENT TYPE PREFERENCE</Label>
                <Select value={formData.employmentType4 || ""} onValueChange={(v) => handleInputChange("employmentType4", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {nsrpEmploymentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Work Locations - Local */}
              <div>
                <Label className="font-semibold text-base mb-2 block">PREFERRED WORK LOCATION (Local - cities/municipalities)</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLocationAdd();
                      }
                    }}
                    placeholder="Type city/municipality and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationAdd}
                  >
                    Add
                  </Button>
                </div>
                {formData.preferredLocations && formData.preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200"
                      >
                        <span>{loc}</span>
                        <button
                          type="button"
                          onClick={() => handleLocationRemove(idx)}
                          className="ml-1 hover:text-green-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferred Work Locations - Overseas */}
              <div>
                <Label className="font-semibold text-base mb-2 block">PREFERRED WORK LOCATION (Overseas - countries)</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={overseasCountryInput}
                    onChange={(e) => setOverseasCountryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOverseasCountryAdd();
                      }
                    }}
                    placeholder="Type country and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOverseasCountryAdd}
                  >
                    Add
                  </Button>
                </div>
                {formData.preferredOverseasCountries && formData.preferredOverseasCountries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredOverseasCountries.map((country, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-200"
                      >
                        <span>{country}</span>
                        <button
                          type="button"
                          onClick={() => handleOverseasCountryRemove(idx)}
                          className="ml-1 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Education & Training */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">III. LANGUAGE/DIALECT PROFICIENCY</h3>
                {formData.languageProficiency?.map((lang, idx) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <Input
                      value={lang.language || ""}
                      onChange={(e) => {
                        const newLang = [...(formData.languageProficiency || [])];
                        newLang[idx] = { ...lang, language: e.target.value };
                        handleInputChange("languageProficiency", newLang);
                      }}
                      placeholder="Language/Dialect"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {["read", "write", "speak", "understand"].map((skill) => (
                        <div key={skill} className="flex items-center space-x-1">
                          <Checkbox
                            checked={(lang as any)[skill] || false}
                            onCheckedChange={(v) => {
                              const newLang = [...(formData.languageProficiency || [])];
                              newLang[idx] = { ...lang, [skill]: v };
                              handleInputChange("languageProficiency", newLang);
                            }}
                          />
                          <Label className="capitalize text-xs">{skill}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={handleLanguageAdd} className="w-full">
                  + Add Language
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">IV. EDUCATIONAL BACKGROUND</h3>
                {formData.education?.map((edu, idx) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>
                    <Input
                      value={edu.schoolName || ""}
                      onChange={(e) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx] = { ...edu, schoolName: e.target.value };
                        handleInputChange("education", newEdu);
                      }}
                      placeholder="Name of School/University"
                    />
                    <div className="grid grid-cols-2 gap-2">
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
                      <Input
                        value={edu.levelReached || ""}
                        onChange={(e) => {
                          const newEdu = [...(formData.education || [])];
                          newEdu[idx] = { ...edu, levelReached: e.target.value };
                          handleInputChange("education", newEdu);
                        }}
                        placeholder="Level Reached"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={handleEducationAdd} className="w-full">
                  + Add Education Entry
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">V. TECHNICAL/VOCATIONAL TRAINING</h3>
                {formData.technicalTraining?.map((training, idx) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
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
                <Button variant="outline" onClick={handleTrainingAdd} className="w-full">
                  + Add Training Entry
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">VI. PROFESSIONAL LICENSES AND CERTIFICATIONS</h3>
                {formData.professionalLicenses?.map((license, idx) => (
                  <div key={idx} className="border p-3 rounded mb-3 space-y-2">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newLicenses = formData.professionalLicenses?.filter((_, i) => i !== idx) || [];
                        handleInputChange("professionalLicenses", newLicenses);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove License
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleLicenseAdd} className="w-full">
                  + Add Professional License
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Work Experience & Skills */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">VII. WORK EXPERIENCE</h3>
                <p className="text-xs text-slate-600 mb-3">(Last 10 years, most recent first)</p>
                {formData.workExperience?.map((exp, idx) => (
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
                <Button variant="outline" onClick={handleWorkExperienceAdd} className="w-full">
                  + Add Work Experience
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">VIII. OTHER SKILLS ACQUIRED WITHOUT CERTIFICATE</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {otherSkillsOptions.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.otherSkills?.includes(skill) || false}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>

                {formData.otherSkills?.includes("Others") && (
                  <div className="mt-3">
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

              <div className="border-t pt-4">
                <p className="text-xs text-slate-600 italic">
                  By submitting this form, I certify that all data/information provided are true to the best of my knowledge.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => {
                  if (currentStep === 1 && !validateStep1()) return;
                  if (currentStep === 2 && !validateStep2()) return;
                  setCurrentStep(currentStep + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Adding..." : "Submit Applicant"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
