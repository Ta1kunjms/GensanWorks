import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { authFetch } from "@/lib/auth";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";
import { industryNameMap } from "@shared/schema";
import { EDUCATION_LEVEL_OPTIONS } from "@shared/education";

interface AddJobPostingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobAdded: () => void;
}

interface Employer {
  id: string;
  establishmentName: string;
  contactNumber?: string;
}

const EDUCATION_LEVELS = EDUCATION_LEVEL_OPTIONS;

export function AddJobPostingModal({
  open,
  onOpenChange,
  onJobAdded,
}: AddJobPostingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  type JobPostingRequiredField =
    | "employerId"
    | "title"
    | "minimumEducation"
    | "mainSkillOrSpecialization"
    | "salaryMin"
    | "preparedByName"
    | "preparedByDesignation"
    | "dateAccomplished";

  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<JobPostingRequiredField>();

  const industryCodes = Object.entries(industryNameMap)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => parseInt(a.code) - parseInt(b.code));

  const [formData, setFormData] = useState({
    employerId: "",
    title: "",
    minimumEducation: "",
    mainSkillOrSpecialization: "",
    yearsOfExperience: 0,
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    salaryType: "Monthly",
    jobStatus: "Permanent",
    industryType: [] as string[],
    numberOfVacancies: 1,
    agePreference: "",
    additionalRequirements: "",
    benefits: [] as string[],
    preparedByName: "",
    preparedByDesignation: "",
    dateAccomplished: new Date().toISOString().split('T')[0],
    preparedByContact: "",
  });

  useEffect(() => {
    if (open) {
      fetchEmployers();
    }
  }, [open]);

  const fetchEmployers = async () => {
    setLoadingEmployers(true);
    try {
      const response = await fetch("/api/employers");
      if (response.ok) {
        const data = await response.json();
        setEmployers(data);
      }
    } catch (error) {
      console.error("Failed to fetch employers:", error);
    } finally {
      setLoadingEmployers(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field === "employerId" ||
      field === "title" ||
      field === "minimumEducation" ||
      field === "mainSkillOrSpecialization" ||
      field === "salaryMin" ||
      field === "preparedByName" ||
      field === "preparedByDesignation" ||
      field === "dateAccomplished"
    ) {
      clearFieldError(field as JobPostingRequiredField);
    }
  };

  const handleIndustryToggle = (code: string) => {
    setFormData((prev) => {
      const industries = prev.industryType || [];
      return {
        ...prev,
        industryType: industries.includes(code)
          ? industries.filter((i) => i !== code)
          : [...industries, code],
      };
    });
  };

  const validateForm = () => {
    const nextErrors: FieldErrors<JobPostingRequiredField> = {};

    if (!String(formData.employerId || "").trim()) nextErrors.employerId = "Please select an employer";
    if (!String(formData.title || "").trim()) nextErrors.title = "Position title is required";
    if (!String(formData.minimumEducation || "").trim()) nextErrors.minimumEducation = "Minimum education is required";
    if (!String(formData.mainSkillOrSpecialization || "").trim()) {
      nextErrors.mainSkillOrSpecialization = "Main skill/specialization is required";
    }
    if (!String(formData.salaryMin || "").trim() || parseFloat(String(formData.salaryMin)) <= 0) {
      nextErrors.salaryMin = "Valid starting salary is required";
    }
    if (!String(formData.preparedByName || "").trim()) nextErrors.preparedByName = "Name is required";
    if (!String(formData.preparedByDesignation || "").trim()) nextErrors.preparedByDesignation = "Designation is required";
    if (!String(formData.dateAccomplished || "").trim()) nextErrors.dateAccomplished = "Date accomplished is required";

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        employerId: formData.employerId,
        title: formData.title,
        description: formData.description || formData.mainSkillOrSpecialization,
        location: formData.location || "Not specified",
        salaryMin: parseInt(formData.salaryMin),
        salaryMax: parseInt(formData.salaryMax) || parseInt(formData.salaryMin),
        salaryPeriod: "monthly",
        salaryType: formData.salaryType,
        jobStatus: formData.jobStatus,
        minimumEducation: formData.minimumEducation,
        yearsOfExperience: formData.yearsOfExperience,
        skills: formData.mainSkillOrSpecialization,
        status: "active",
      };

      const response = await authFetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create job posting");
      }

      toast({
        title: "Success",
        description: "Job posting created successfully",
      });

      onOpenChange(false);
      onJobAdded();
      
      // Reset form
      setFormData({
        employerId: "",
        title: "",
        minimumEducation: "",
        mainSkillOrSpecialization: "",
        yearsOfExperience: 0,
        description: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        salaryType: "Monthly",
        jobStatus: "Permanent",
        industryType: [],
        numberOfVacancies: 1,
        agePreference: "",
        additionalRequirements: "",
        benefits: [],
        preparedByName: "",
        preparedByDesignation: "",
        dateAccomplished: new Date().toISOString().split('T')[0],
        preparedByContact: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Posting - SRS Form 2A</DialogTitle>
          <DialogDescription>
            Republic of the Philippines - Department of Labor and Employment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: Establishment & Industry */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">ESTABLISHMENT INFORMATION</h3>
            
            <div>
              <Label>Name of Establishment *</Label>
              <Select
                value={formData.employerId}
                onValueChange={(v) => handleInputChange("employerId", v)}
              >
                <SelectTrigger aria-invalid={!!fieldErrors.employerId}>
                  <SelectValue placeholder={loadingEmployers ? "Loading..." : "Select an employer"} />
                </SelectTrigger>
                <SelectContent>
                  {employers.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.establishmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.employerId && <p className="mt-1 text-xs text-destructive">{fieldErrors.employerId}</p>}
            </div>

            <div>
              <Label>Industry engaged in (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {industryCodes.map(({ code, name }) => (
                  <div key={code} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.industryType.includes(code)}
                      onCheckedChange={() => handleIndustryToggle(code)}
                    />
                    <Label className="text-sm cursor-pointer">{code} - {name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Position Details */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">JOB VACANCY DETAILS</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Position Title *</Label>
                <Input
                  aria-invalid={!!fieldErrors.title}
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Software Developer"
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>}
              </div>
              <div>
                <Label>Number of Vacancies</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.numberOfVacancies}
                  onChange={(e) => handleInputChange("numberOfVacancies", parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Minimum Education Required *</Label>
                <Select
                  value={formData.minimumEducation}
                  onValueChange={(v) => handleInputChange("minimumEducation", v)}
                >
                  <SelectTrigger aria-invalid={!!fieldErrors.minimumEducation}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.minimumEducation && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.minimumEducation}</p>
                )}
              </div>
              <div>
                <Label>Main Skill/Specialization Desired *</Label>
                <SkillSpecializationInput
                  aria-invalid={!!fieldErrors.mainSkillOrSpecialization}
                  value={formData.mainSkillOrSpecialization}
                  onChange={(next) => handleInputChange("mainSkillOrSpecialization", next)}
                  placeholder="Type a skill and press Enter"
                />
                {fieldErrors.mainSkillOrSpecialization && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.mainSkillOrSpecialization}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Years of Experience Required</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Age Preference</Label>
                <Input
                  value={formData.agePreference}
                  onChange={(e) => handleInputChange("agePreference", e.target.value)}
                  placeholder="e.g., 20-35, No preference"
                />
              </div>
            </div>

            <div>
              <Label>Job Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Detailed job description and responsibilities"
                rows={3}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., General Santos City"
              />
            </div>
          </div>

          {/* Section 3: Compensation */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">COMPENSATION & JOB STATUS</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Starting Salary/Wage *</Label>
                <Input
                  type="number"
                  min="0"
                  aria-invalid={!!fieldErrors.salaryMin}
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  placeholder="Amount"
                />
                {fieldErrors.salaryMin && <p className="mt-1 text-xs text-destructive">{fieldErrors.salaryMin}</p>}
              </div>
              <div>
                <Label>Maximum Salary</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                  placeholder="Maximum amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Salary Type</Label>
                <Select
                  value={formData.salaryType}
                  onValueChange={(v) => handleInputChange("salaryType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Status *</Label>
                <Select
                  value={formData.jobStatus}
                  onValueChange={(v) => handleInputChange("jobStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent (P)</SelectItem>
                    <SelectItem value="Temporary">Temporary (T)</SelectItem>
                    <SelectItem value="Contractual">Contractual (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Additional Requirements</Label>
              <Textarea
                value={formData.additionalRequirements}
                onChange={(e) => handleInputChange("additionalRequirements", e.target.value)}
                placeholder="Any additional skills, certifications, or requirements"
                rows={2}
              />
            </div>

            <div>
              <Label>Benefits</Label>
              <Textarea
                value={formData.benefits.join("\n")}
                onChange={(e) => {
                  const benefits = e.target.value.split("\n").filter((b) => b.trim());
                  handleInputChange("benefits", benefits);
                }}
                placeholder="List benefits (one per line) e.g., Health Insurance, 13th Month Pay"
                rows={2}
              />
            </div>
          </div>

          {/* Section 4: Prepared By & Date */}
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">PREPARED BY & DATE</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name *</Label>
                <Input
                  aria-invalid={!!fieldErrors.preparedByName}
                  value={formData.preparedByName}
                  onChange={(e) => handleInputChange("preparedByName", e.target.value)}
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
                  value={formData.preparedByDesignation}
                  onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
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
                  value={formData.preparedByContact}
                  onChange={(e) => handleInputChange("preparedByContact", e.target.value)}
                  placeholder="Contact number"
                />
              </div>
              <div>
                <Label>Date Accomplished *</Label>
                <Input
                  type="date"
                  aria-invalid={!!fieldErrors.dateAccomplished}
                  value={formData.dateAccomplished}
                  onChange={(e) => handleInputChange("dateAccomplished", e.target.value)}
                />
                {fieldErrors.dateAccomplished && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.dateAccomplished}</p>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded">
              <p><strong>*P</strong> for Permanent, <strong>T</strong> for Temporary, <strong>C</strong> for Contractual</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting..." : "Post Job Vacancy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
