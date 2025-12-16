import { useState, useEffect, useCallback, useMemo } from "react";
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
import { SkillSpecializationInput } from "@/components/skill-specialization-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { industryNameMap } from "@shared/schema";
import type { Employer } from "@shared/schema";
import { EDUCATION_LEVEL_OPTIONS } from "@shared/education";
import { authFetch, useAuth } from "@/lib/auth";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";
import {
  type BarangayOption,
  type MunicipalityOption,
  type ProvinceOption,
  DEFAULT_MUNICIPALITY,
  DEFAULT_PROVINCE,
  fetchPhilippineLocations,
} from "@/lib/locations";

const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);
const toTrimmedString = (value?: string | null) => (typeof value === "string" ? value.trim() : "");
const DEFAULT_LOCATION = `${DEFAULT_MUNICIPALITY}, ${DEFAULT_PROVINCE}`;

interface AddJobVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employerId?: string;
  employerName?: string;
  onJobVacancyAdded?: () => void;
}

export function AddJobVacancyModal({
  open,
  onOpenChange,
  employerId = "",
  employerName = "",
  onJobVacancyAdded,
}: AddJobVacancyModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  type JobVacancyRequiredField =
    | "employerId"
    | "positionTitle"
    | "location"
    | "minimumEducationRequired"
    | "mainSkillOrSpecialization"
    | "industryCodes"
    | "salaryMin"
    | "jobStatus"
    | "vacantPositions"
    | "paidEmployees"
    | "preparedByName"
    | "preparedByDesignation";

  const { fieldErrors, clearFieldError, setErrorsAndFocus, setFieldErrors } =
    useFieldErrors<JobVacancyRequiredField>();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employersLoading, setEmployersLoading] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<MunicipalityOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<BarangayOption[]>([]);

  type SalaryPeriod = "hourly" | "daily" | "weekly" | "15days" | "monthly";

  type JobFormData = {
    employerId: string;
    establishmentName: string;
    positionTitle: string;
    description: string;
    location: string;
    barangay: string;
    municipality: string;
    province: string;
    salaryMin: string;
    salaryMax: string;
    salaryPeriod: SalaryPeriod;
    mainSkillOrSpecialization: string;
    minimumEducationRequired: string;
    yearsOfExperienceRequired: string;
    agePreference: string;
    vacantPositions: string;
    paidEmployees: string;
    industryCodes: string[];
    jobStatus: "P" | "T" | "C";
    preparedByName: string;
    preparedByDesignation: string;
    preparedByContact: string;
    dateAccomplished: string;
  };

  const [formData, setFormData] = useState<JobFormData>({
    employerId,
    establishmentName: employerName,
    positionTitle: "",
    description: "",
    location: DEFAULT_LOCATION,
    barangay: "",
    municipality: DEFAULT_MUNICIPALITY,
    province: DEFAULT_PROVINCE,
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "monthly",
    mainSkillOrSpecialization: "",
    minimumEducationRequired: "",
    yearsOfExperienceRequired: "",
    agePreference: "",
    vacantPositions: "",
    paidEmployees: "",
    industryCodes: [],
    jobStatus: "P",
    preparedByName: "",
    preparedByDesignation: "",
    preparedByContact: "",
    dateAccomplished: getTodayIsoDate(),
  });
  const hydrateFromEmployer = useCallback((employer: Employer | null, overrideId?: string) => {
    if (!employer) return;
    const contact = employer.contactPerson;
    const fallbackName = contact?.personName || "";
    const fallbackDesignation = contact?.designation || "";
    const fallbackContact = contact?.contactNumber || employer.contactNumber || "";

    setSelectedEmployer(employer);
    setFormData((prev) => ({
      ...prev,
      employerId: overrideId ?? employer.id ?? prev.employerId,
      establishmentName: employer.establishmentName || prev.establishmentName,
      preparedByName: employer.preparedByName || fallbackName || prev.preparedByName || "",
      preparedByDesignation: employer.preparedByDesignation || fallbackDesignation || prev.preparedByDesignation || "",
      preparedByContact: employer.preparedByContact || fallbackContact || prev.preparedByContact || "",
      dateAccomplished: employer.dateAccomplished || prev.dateAccomplished || getTodayIsoDate(),
      barangay: employer.barangay || prev.barangay,
      municipality: employer.municipality || prev.municipality,
      province: employer.province || prev.province,
      location:
        prev.location ||
        [employer.barangay, employer.municipality, employer.province].filter(Boolean).join(", ") ||
        DEFAULT_LOCATION,
    }));
  }, []);

  useEffect(() => {
    fetchPhilippineLocations().then(setProvinces);
  }, []);

  useEffect(() => {
    const provinceEntry = provinces.find((p) => p.name === formData.province || p.code === formData.province);
    const muniList = provinceEntry?.municipalities ?? [];
    setMunicipalityOptions(muniList);

    if (!muniList.length) return;

    const hasMatch = muniList.some((m) => m.name === formData.municipality || m.code === formData.municipality);
    if (!hasMatch) {
      const fallback = muniList.find((m) => m.name === DEFAULT_MUNICIPALITY) || muniList[0];
      setFormData((prev) => ({
        ...prev,
        municipality: fallback.name,
        barangay: "",
        location: prev.location || `${fallback.name}, ${prev.province || DEFAULT_PROVINCE}`,
      }));
    }
  }, [provinces, formData.province, formData.municipality]);

  useEffect(() => {
    const municipalityEntry = municipalityOptions.find(
      (m) => m.name === formData.municipality || m.code === formData.municipality,
    );
    const brgys = municipalityEntry?.barangays ?? [];
    setBarangayOptions(brgys);
    if (formData.barangay && !brgys.some((b) => b.name === formData.barangay)) {
      setFormData((prev) => ({ ...prev, barangay: "" }));
    }
  }, [municipalityOptions, formData.municipality, formData.barangay]);

  // Fetch employers when modal opens
  useEffect(() => {
    if (open && !employerId && !isEmployer) {
      fetchEmployers();
    }
  }, [open, employerId, isEmployer]);

  // Update form data when modal opens with new employer info
  useEffect(() => {
    if (!open || !employerId) return;
    const employerMatch = employers.find((e) => e.id === employerId);
    if (employerMatch) {
      hydrateFromEmployer(employerMatch, employerId);
      setCurrentStep(2);
    } else {
      setFormData((prev) => ({
        ...prev,
        employerId,
        establishmentName: employerName,
      }));
    }
  }, [open, employerId, employerName, employers, hydrateFromEmployer]);

  useEffect(() => {
    if (!open || !isEmployer) return;
    setFormData((prev) => ({
      ...prev,
      employerId: user?.id || prev.employerId,
      establishmentName: user?.company || prev.establishmentName || employerName,
      dateAccomplished: prev.dateAccomplished || getTodayIsoDate(),
    }));
    setCurrentStep(2);
  }, [open, isEmployer, user, employerName]);

  const fetchEmployers = async () => {
    try {
      setEmployersLoading(true);
      const response = await authFetch("/api/admin/employers");
      if (!response.ok) throw new Error("Failed to fetch employers");
      const data = await response.json();
      // Some endpoints return { employers: [...] }, others return [...]
      const employersArr = Array.isArray(data)
        ? data
        : Array.isArray(data.employers)
        ? data.employers
        : [];
      console.log("[AddJobVacancyModal] /api/admin/employers response:", employersArr);
      setEmployers(employersArr);
    } catch (error) {
      console.error("Error fetching employers:", error);
      toast({
        title: "Error",
        description: "Failed to load employers",
        variant: "destructive",
      });
    } finally {
      setEmployersLoading(false);
    }
  };

  const industryCodes = Object.entries(industryNameMap)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => parseInt(a.code) - parseInt(b.code));

  const educationLevels = EDUCATION_LEVEL_OPTIONS;

  const preparedValues = useMemo(() => {
    const employerName = toTrimmedString(selectedEmployer?.preparedByName) || toTrimmedString(selectedEmployer?.contactPerson?.personName);
    const employerDesignation = toTrimmedString(selectedEmployer?.preparedByDesignation) || toTrimmedString(selectedEmployer?.contactPerson?.designation);
    const employerContact = toTrimmedString(selectedEmployer?.preparedByContact)
      || toTrimmedString(selectedEmployer?.contactPerson?.contactNumber)
      || toTrimmedString(selectedEmployer?.contactNumber);
    const fallbackName = toTrimmedString(formData.preparedByName);
    const fallbackDesignation = toTrimmedString(formData.preparedByDesignation);
    const fallbackContact = toTrimmedString(formData.preparedByContact);
    return {
      name: employerName || fallbackName,
      designation: employerDesignation || fallbackDesignation,
      contact: employerContact || fallbackContact,
      lockedName: Boolean(employerName),
      lockedDesignation: Boolean(employerDesignation),
      lockedContact: Boolean(employerContact),
    };
  }, [selectedEmployer, formData.preparedByName, formData.preparedByDesignation, formData.preparedByContact]);

  const autoDateDisplay = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field === "employerId" ||
      field === "positionTitle" ||
      field === "location" ||
      field === "minimumEducationRequired" ||
      field === "mainSkillOrSpecialization" ||
      field === "salaryMin" ||
      field === "jobStatus" ||
      field === "vacantPositions" ||
      field === "paidEmployees" ||
      field === "preparedByName" ||
      field === "preparedByDesignation"
    ) {
      clearFieldError(field as JobVacancyRequiredField);
    }
  };

  const handleIndustryToggle = (code: string) => {
    setFormData((prev) => {
      const industries = (prev.industryCodes || []) as string[];
      return {
        ...prev,
        industryCodes: industries.includes(code)
          ? industries.filter((i) => i !== code)
          : [...industries, code],
      } as typeof prev;
    });

    clearFieldError("industryCodes");
  };

  const validateStep1 = () => {
    const nextErrors: FieldErrors<JobVacancyRequiredField> = {};
    if (!String(formData.employerId || "").trim()) nextErrors.employerId = "Please select an employer";

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      if (!prev.employerId) return prev;
      const cleaned = { ...prev };
      delete cleaned.employerId;
      return cleaned;
    });

    return true;
  };

  const validateStep2 = () => {
    const nextErrors: FieldErrors<JobVacancyRequiredField> = {};

    if (!String(formData.positionTitle || "").trim()) nextErrors.positionTitle = "Position title is required";
    if (!String(formData.location || "").trim()) nextErrors.location = "Location is required";
    if (!String(formData.minimumEducationRequired || "").trim()) {
      nextErrors.minimumEducationRequired = "Minimum education is required";
    }
    if (!String(formData.mainSkillOrSpecialization || "").trim()) {
      nextErrors.mainSkillOrSpecialization = "Main skill/specialization is required";
    }
    if (!String(formData.vacantPositions || "").trim()) {
      nextErrors.vacantPositions = "Vacant positions is required";
    }
    if (!String(formData.paidEmployees || "").trim()) {
      nextErrors.paidEmployees = "Paid employees is required";
    }
    if (!Array.isArray(formData.industryCodes) || formData.industryCodes.length === 0) {
      nextErrors.industryCodes = "Select at least one industry type";
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned.positionTitle;
      delete cleaned.location;
      delete cleaned.minimumEducationRequired;
      delete cleaned.mainSkillOrSpecialization;
      delete cleaned.vacantPositions;
      delete cleaned.paidEmployees;
      delete cleaned.industryCodes;
      return cleaned;
    });

    return true;
  };

  const validateStep3 = () => {
    const nextErrors: FieldErrors<JobVacancyRequiredField> = {};
    if (
      (!formData.salaryMin.trim() && !formData.salaryMax.trim()) ||
      (formData.salaryMin.trim() && Number(formData.salaryMin) <= 0) ||
      (formData.salaryMax.trim() && Number(formData.salaryMax) <= 0)
    ) {
      nextErrors.salaryMin = "Please enter a valid salary";
    }

    if (!String(formData.jobStatus || "").trim()) nextErrors.jobStatus = "Job status is required";

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned.salaryMin;
      delete cleaned.jobStatus;
      return cleaned;
    });

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Final validation before submit
      const nextErrors: FieldErrors<JobVacancyRequiredField> = {};

      if (!String(formData.employerId || "").trim()) nextErrors.employerId = "Please select an employer";
      if (!String(formData.positionTitle || "").trim()) nextErrors.positionTitle = "Position title is required";
      if (!String(formData.minimumEducationRequired || "").trim()) {
        nextErrors.minimumEducationRequired = "Minimum education is required";
      }
      if (!String(formData.mainSkillOrSpecialization || "").trim()) {
        nextErrors.mainSkillOrSpecialization = "Main skill/specialization is required";
      }
      if (!Array.isArray(formData.industryCodes) || formData.industryCodes.length === 0) {
        nextErrors.industryCodes = "Select at least one industry type";
      }
      if (
        (!formData.salaryMin.trim() && !formData.salaryMax.trim()) ||
        (formData.salaryMin.trim() && Number(formData.salaryMin) <= 0) ||
        (formData.salaryMax.trim() && Number(formData.salaryMax) <= 0)
      ) {
        nextErrors.salaryMin = "Please enter a valid salary";
      }
      if (!String(formData.jobStatus || "").trim()) nextErrors.jobStatus = "Job status is required";
      if (!String(formData.location || "").trim()) nextErrors.location = "Location is required";
      if (!String(formData.vacantPositions || "").trim()) nextErrors.vacantPositions = "Vacant positions is required";
      if (!String(formData.paidEmployees || "").trim()) nextErrors.paidEmployees = "Paid employees is required";
      if (!String(preparedValues.name || "").trim()) nextErrors.preparedByName = "Prepared by name is required";
      if (!String(preparedValues.designation || "").trim()) {
        nextErrors.preparedByDesignation = "Prepared by designation is required";
      }
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        if (nextErrors.employerId) setCurrentStep(1);
        else if (
          nextErrors.positionTitle ||
          nextErrors.minimumEducationRequired ||
          nextErrors.mainSkillOrSpecialization ||
          nextErrors.industryCodes
        ) {
          setCurrentStep(2);
        } else if (nextErrors.salaryMin || nextErrors.jobStatus) {
          setCurrentStep(3);
        } else {
          setCurrentStep(4);
        }
        requestAnimationFrame(() => setErrorsAndFocus(nextErrors));
        setLoading(false);
        return;
      }

        const derivedBarangay = (formData.barangay || selectedEmployer?.barangay || "").trim();
        const derivedMunicipality = (formData.municipality || selectedEmployer?.municipality || "").trim();
        const derivedProvince = (formData.province || selectedEmployer?.province || "").trim();
        const derivedLocation = [derivedBarangay, derivedMunicipality, derivedProvince].filter(Boolean).join(", ") || formData.location;

        const salaryMin = formData.salaryMin.trim() ? Number(formData.salaryMin) : undefined;
        const salaryMax = formData.salaryMax.trim() ? Number(formData.salaryMax) : undefined;
        const salaryAmount = salaryMin ?? salaryMax;

        const yearsOfExperience = formData.yearsOfExperienceRequired.trim() ? Number(formData.yearsOfExperienceRequired) : undefined;
        const vacantPositions = formData.vacantPositions.trim() ? Number(formData.vacantPositions) : undefined;
        const paidEmployees = formData.paidEmployees.trim() ? Number(formData.paidEmployees) : undefined;

        const payload = {
          employerId: formData.employerId || (isEmployer ? user?.id : undefined),
          establishmentName: selectedEmployer?.establishmentName || formData.establishmentName || user?.company || "",
          positionTitle: formData.positionTitle.trim(),
          description: formData.description.trim() || formData.mainSkillOrSpecialization.trim() || "Job description",
          location: derivedLocation,
          salaryMin,
          salaryMax,
          salaryPeriod: formData.salaryPeriod,
          salaryAmount,
          jobStatus: formData.jobStatus || "P",
          minimumEducation: formData.minimumEducationRequired || "",
          yearsOfExperience,
          skills: formData.mainSkillOrSpecialization || "",
          industryCodes: Array.isArray(formData.industryCodes) ? formData.industryCodes : [],
          vacantPositions,
          paidEmployees,
          preparedByName: preparedValues.name,
          preparedByDesignation: preparedValues.designation,
          preparedByContact: preparedValues.contact,
          dateAccomplished: formData.dateAccomplished || getTodayIsoDate(),
          agePreference: formData.agePreference,
          barangay: derivedBarangay || undefined,
          municipality: derivedMunicipality || undefined,
          province: derivedProvince || undefined,
          status: isEmployer ? "pending" : "active",
          archived: false,
        };
        console.log("Submitting mapped job payload:", payload);

        const response = await authFetch(isEmployer ? "/api/employer/jobs" : "/api/admin/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error?.message || "Failed to add job vacancy");
      }

      const responseData = await response.json();
      console.log("Success response:", responseData);

      toast({
        title: "Success",
        description: isEmployer
          ? "Job submitted for admin review. We'll notify you once it's approved."
          : "Job vacancy added successfully",
      });

      onOpenChange(false);
      onJobVacancyAdded?.();

      // Reset form
      setFormData({
        employerId: isEmployer ? user?.id || "" : "",
        establishmentName: isEmployer ? (user?.company || "") : "",
        positionTitle: "",
        description: "",
        location: DEFAULT_LOCATION,
        barangay: "",
        municipality: DEFAULT_MUNICIPALITY,
        province: DEFAULT_PROVINCE,
        salaryMin: "",
        salaryMax: "",
        salaryPeriod: "monthly",
        mainSkillOrSpecialization: "",
        minimumEducationRequired: "",
        yearsOfExperienceRequired: "",
        agePreference: "",
        vacantPositions: "",
        paidEmployees: "",
        industryCodes: [],
        jobStatus: "P" as const,
        preparedByName: "",
        preparedByDesignation: "",
        preparedByContact: "",
        dateAccomplished: getTodayIsoDate(),
      });
      setCurrentStep(isEmployer ? 2 : 1);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Vacancy (SRS Form 2A)</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 4 - {currentStep === 1 && "Select employer"}{currentStep === 2 && "Post a new job vacancy"}{currentStep === 3 && "Set compensation & job status"}{currentStep === 4 && "Prepare signatory and date"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Employer */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">SELECT EMPLOYER</h3>
              <div>
                <Label>Employer *</Label>
                <Select value={formData.employerId || ""} onValueChange={(value) => {
                  handleInputChange("employerId", value);
                  const match = employers.find((e) => e.id === value);
                  if (match) {
                    handleInputChange("establishmentName", match.establishmentName);
                    hydrateFromEmployer(match, value);
                  }
                }} disabled={employersLoading}>
                  <SelectTrigger aria-invalid={!!fieldErrors.employerId}>
                    <SelectValue placeholder={employersLoading ? "Loading employers..." : "Select an employer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.map((employer) => (
                      <SelectItem key={employer.id || ""} value={employer.id || ""}>
                        {employer.establishmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.employerId && <p className="mt-1 text-xs text-destructive">{fieldErrors.employerId}</p>}
              </div>
              {formData.employerId && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm"><strong>Selected Employer:</strong> {formData.establishmentName}</p>
                </div>
              )}
              {employers.length === 0 && !employersLoading && (
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">No employers available. Please create an employer first.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Position Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">JOB VACANCY DETAILS</h3>

              {formData.establishmentName && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm"><strong>Establishment:</strong> {formData.establishmentName}</p>
                </div>
              )}

              <div>
                <Label>Position Title *</Label>
                <Input
                  aria-invalid={!!fieldErrors.positionTitle}
                  value={formData.positionTitle || ""}
                  onChange={(e) => handleInputChange("positionTitle", e.target.value)}
                  placeholder="e.g., Software Developer, Accountant, etc."
                />
                {fieldErrors.positionTitle && <p className="mt-1 text-xs text-destructive">{fieldErrors.positionTitle}</p>}
              </div>

              <div>
                <Label>Job Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Write a short job description"
                />
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
                          location: locationParts.join(", "),
                        };
                      })
                    }
                    disabled={!barangayOptions.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={barangayOptions.length ? "Select barangay" : "Select municipality first"} />
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
                        const locationParts = ["", v, prev.province].filter(Boolean);
                        return {
                          ...prev,
                          municipality: v,
                          barangay: "",
                          location: locationParts.join(", "),
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
                          municipality: "",
                          barangay: "",
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

                {fieldErrors.location && <p className="mt-1 text-xs text-destructive">{fieldErrors.location}</p>}

              <div>
                <Label>Minimum Education Required *</Label>
                <Select
                  value={formData.minimumEducationRequired || ""}
                  onValueChange={(v) => handleInputChange("minimumEducationRequired", v)}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.minimumEducationRequired}>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.minimumEducationRequired && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.minimumEducationRequired}</p>
                )}
              </div>

              <div>
                <Label>Main Skill / Specialization Desired *</Label>
                <SkillSpecializationInput
                  aria-invalid={!!fieldErrors.mainSkillOrSpecialization}
                  value={formData.mainSkillOrSpecialization || ""}
                  onChange={(next) => handleInputChange("mainSkillOrSpecialization", next)}
                  placeholder="Type a skill and press Enter"
                />
                {fieldErrors.mainSkillOrSpecialization && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.mainSkillOrSpecialization}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Years of Experience Required</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperienceRequired}
                    onChange={(e) => handleInputChange("yearsOfExperienceRequired", e.target.value)}
                    placeholder="Years"
                  />
                </div>
                <div>
                  <Label>Age Preference</Label>
                  <Input
                    value={formData.agePreference || ""}
                    onChange={(e) => handleInputChange("agePreference", e.target.value)}
                    placeholder="e.g., 20-35"
                  />
                </div>
                <div>
                  <Label>No. of Vacant Position *</Label>
                  <Input
                    type="number"
                    min="0"
                    aria-invalid={!!fieldErrors.vacantPositions}
                    value={formData.vacantPositions}
                    onChange={(e) => handleInputChange("vacantPositions", e.target.value)}
                    placeholder="0"
                  />
                  {fieldErrors.vacantPositions && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.vacantPositions}</p>
                  )}
                </div>
                <div>
                  <Label>No. of Paid Employees *</Label>
                  <Input
                    type="number"
                    min="0"
                    aria-invalid={!!fieldErrors.paidEmployees}
                    value={formData.paidEmployees}
                    onChange={(e) => handleInputChange("paidEmployees", e.target.value)}
                    placeholder="0"
                  />
                  {fieldErrors.paidEmployees && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.paidEmployees}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">INDUSTRY TYPE (Select all that apply)</h3>
                {fieldErrors.industryCodes && (
                  <p className="mb-2 text-xs text-destructive">{fieldErrors.industryCodes}</p>
                )}
                <div className="space-y-2">
                  {industryCodes.map(({ code, name }) => (
                    <div key={code} className="flex items-center space-x-2">
                      <Checkbox
                        checked={(formData.industryCodes as string[] || []).includes(code) || false}
                        onCheckedChange={() => handleIndustryToggle(code)}
                      />
                      <Label className="text-sm cursor-pointer">{code} - {name}</Label>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          )}

          {/* Step 3: Compensation & Status */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">COMPENSATION & JOB STATUS</h3>

              <div>
                <Label>Salary *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Min</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      aria-invalid={!!fieldErrors.salaryMin}
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Period</Label>
                    <Select value={formData.salaryPeriod} onValueChange={(v) => handleInputChange("salaryPeriod", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="15days">15 days</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {fieldErrors.salaryMin && <p className="mt-1 text-xs text-destructive">{fieldErrors.salaryMin}</p>}
              </div>

              <div>
                <Label>Job Status *</Label>
                <Select
                  value={formData.jobStatus || "P"}
                  onValueChange={(v) => handleInputChange("jobStatus", v)}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.jobStatus}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">Permanent (P)</SelectItem>
                    <SelectItem value="T">Temporary (T)</SelectItem>
                    <SelectItem value="C">Contractual (C)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.jobStatus && <p className="mt-1 text-xs text-destructive">{fieldErrors.jobStatus}</p>}
              </div>




            </div>
          )}

          {/* Step 4: Signatory & Date */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">PREPARED BY & DATE</h3>

              {selectedEmployer && (
                <div className="border-l-4 border-blue-500 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>✓ Auto-populated from Employer:</strong> {selectedEmployer.establishmentName}. Update the employer profile to change these details.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.preparedByName}
                    value={preparedValues.name}
                    readOnly={preparedValues.lockedName}
                    disabled={preparedValues.lockedName}
                    className={preparedValues.lockedName ? "bg-slate-100 text-slate-700" : ""}
                    onChange={(e) => {
                      if (preparedValues.lockedName) return;
                      handleInputChange("preparedByName", e.target.value);
                    }}
                    placeholder="Full name"
                  />
                  {fieldErrors.preparedByName && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.preparedByName}</p>
                  )}
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Input
                    aria-invalid={!!fieldErrors.preparedByDesignation}
                    value={preparedValues.designation}
                    readOnly={preparedValues.lockedDesignation}
                    disabled={preparedValues.lockedDesignation}
                    className={preparedValues.lockedDesignation ? "bg-slate-100 text-slate-700" : ""}
                    onChange={(e) => {
                      if (preparedValues.lockedDesignation) return;
                      handleInputChange("preparedByDesignation", e.target.value);
                    }}
                    placeholder="Job title"
                  />
                  {fieldErrors.preparedByDesignation && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.preparedByDesignation}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={preparedValues.contact}
                    readOnly={preparedValues.lockedContact}
                    disabled={preparedValues.lockedContact}
                    className={preparedValues.lockedContact ? "bg-slate-100 text-slate-700" : ""}
                    onChange={(e) => {
                      if (preparedValues.lockedContact) return;
                      handleInputChange("preparedByContact", e.target.value);
                    }}
                    placeholder="Contact number"
                  />
                </div>
                <div>
                  <Label>Date Accomplished</Label>
                  <div className="h-10 flex items-center rounded border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700">
                    Automatically set to {autoDateDisplay}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    The system records the current date when you post this vacancy.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4 p-3 bg-yellow-50 rounded">
                <p className="text-xs text-slate-700">
                  <strong>*P</strong> for Permanent, <strong>T</strong> for Temporary, <strong>C</strong> for Contractual
                </p>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">VACANCY SUMMARY</h3>
                <div className="space-y-2 p-3 bg-slate-50 rounded text-sm">
                  <p><strong>Position:</strong> {formData.positionTitle}</p>
                  <p>
                    <strong>Salary:</strong>{" "}
                    {formData.salaryMin ? `₱${formData.salaryMin}` : "—"}
                    {formData.salaryMax ? ` - ₱${formData.salaryMax}` : ""}
                    {formData.salaryPeriod ? ` (${formData.salaryPeriod})` : ""}
                  </p>
                  <p><strong>Status:</strong> {formData.jobStatus}</p>
                  <p><strong>Education Required:</strong> {formData.minimumEducationRequired}</p>
                  <p><strong>Experience:</strong> {formData.yearsOfExperienceRequired || "0"} years</p>
                  <p><strong>Industries:</strong> {Array.isArray(formData.industryCodes) ? formData.industryCodes.join(", ") : String(formData.industryCodes)} ({Array.isArray(formData.industryCodes) ? formData.industryCodes.length : 0} selected)</p>

                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => {
                if (currentStep === 1 && !validateStep1()) return;
                if (currentStep === 2 && !validateStep2()) return;
                if (currentStep === 3 && !validateStep3()) return;
                setCurrentStep(currentStep + 1);
              }}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Post Vacancy"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
