import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { industryNameMap } from "@shared/schema";
import type { JobVacancyCreate, Employer } from "@shared/schema";

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
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employersLoading, setEmployersLoading] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<JobVacancyCreate>>({
    employerId,
    establishmentName: employerName,
    yearsOfExperienceRequired: 0,
    vacantPositions: 0,
    paidEmployees: 0,
    industryCodes: [],
    jobStatus: "P",
  });

  // Fetch employers when modal opens
  useEffect(() => {
    if (open && !employerId) {
      fetchEmployers();
    }
  }, [open, employerId]);

  // Update form data when modal opens with new employer info
  useEffect(() => {
    if (open && employerId) {
      const employer = employers.find((e) => e.id === employerId);
      if (employer) {
        setSelectedEmployer(employer);
        setFormData((prev) => ({
          ...prev,
          employerId,
          establishmentName: employerName,
          preparedByName: employer.preparedByName || "",
          preparedByDesignation: employer.preparedByDesignation || "",
          preparedByContact: employer.preparedByContact || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          employerId,
          establishmentName: employerName,
        }));
      }
      setCurrentStep(2); // Skip to step 2 if employer is pre-selected
    }
  }, [open, employerId, employerName, employers]);

  const fetchEmployers = async () => {
    try {
      setEmployersLoading(true);
      const response = await fetch("/api/employers");
      if (!response.ok) throw new Error("Failed to fetch employers");
      const data = await response.json();
      setEmployers(data);
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

  const educationLevels = [
    "Elementary",
    "Secondary",
    "High School (K-12)",
    "Senior High School",
    "Vocational/Technical",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "No specific requirement",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  };

  const validateStep1 = () => {
    if (!formData.employerId) {
      toast({
        title: "Validation Error",
        description: "Please select an employer",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.positionTitle || !formData.minimumEducationRequired || !formData.mainSkillOrSpecialization) {
      toast({
        title: "Validation Error",
        description: "Please fill in position title, education requirement, and main skill/specialization",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.industryCodes || formData.industryCodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one industry type",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.startingSalaryOrWage === null || formData.startingSalaryOrWage === undefined || formData.startingSalaryOrWage <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid starting salary",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.preparedByName || !formData.preparedByDesignation || !formData.dateAccomplished) {
      toast({
        title: "Validation Error",
        description: "Please fill in prepared by information and date",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Final validation before submit
      const validationErrors: string[] = [];
      
      if (!formData.employerId) validationErrors.push("Employer");
      if (!formData.positionTitle) validationErrors.push("Position title");
      if (!formData.minimumEducationRequired) validationErrors.push("Minimum education");
      if (!formData.industryCodes || formData.industryCodes.length === 0) validationErrors.push("Industry (select at least one)");
      if (!formData.startingSalaryOrWage || formData.startingSalaryOrWage <= 0) validationErrors.push("Starting salary");
      if (!formData.yearsOfExperienceRequired && formData.yearsOfExperienceRequired !== 0) validationErrors.push("Years of experience required");
      if (formData.vacantPositions === null || formData.vacantPositions === undefined) validationErrors.push("No. of Vacant Position");
      if (formData.paidEmployees === null || formData.paidEmployees === undefined) validationErrors.push("No. of Paid Employees");
      if (!formData.jobStatus) validationErrors.push("Job status (P/T/C)");
      if (!formData.preparedByName) validationErrors.push("Prepared by name");
      if (!formData.preparedByDesignation) validationErrors.push("Prepared by designation");
      if (!formData.dateAccomplished) validationErrors.push("Date accomplished");

      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing or invalid fields: ${validationErrors.join(", ")}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Log form data for debugging
      console.log("Submitting form data:", formData);
      console.log("industryCodes type:", typeof formData.industryCodes, "isArray:", Array.isArray(formData.industryCodes));
      console.log("industryCodes value:", JSON.stringify(formData.industryCodes));

      const response = await fetch("/api/job-vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        description: "Job vacancy added successfully",
      });

      onOpenChange(false);
      onJobVacancyAdded?.();

      // Reset form
      setFormData({
        employerId: "",
        establishmentName: "",
        yearsOfExperienceRequired: 0,
        vacantPositions: 0,
        paidEmployees: 0,
        industryCodes: [],
        jobStatus: "P" as const,
      });
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
                  const selectedEmployer = employers.find((e) => e.id === value);
                  if (selectedEmployer) {
                    handleInputChange("employerId", value);
                    handleInputChange("establishmentName", selectedEmployer.establishmentName);
                    setSelectedEmployer(selectedEmployer);
                    handleInputChange("preparedByName", selectedEmployer.preparedByName || "");
                    handleInputChange("preparedByDesignation", selectedEmployer.preparedByDesignation || "");
                    handleInputChange("preparedByContact", selectedEmployer.preparedByContact || "");
                  }
                }} disabled={employersLoading}>
                  <SelectTrigger>
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
                  value={formData.positionTitle || ""}
                  onChange={(e) => handleInputChange("positionTitle", e.target.value)}
                  placeholder="e.g., Software Developer, Accountant, etc."
                />
              </div>

              <div>
                <Label>Minimum Education Required *</Label>
                <Select
                  value={formData.minimumEducationRequired || ""}
                  onValueChange={(v) => handleInputChange("minimumEducationRequired", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Main Skill / Specialization Desired *</Label>
                <Input
                  value={formData.mainSkillOrSpecialization || ""}
                  onChange={(e) => handleInputChange("mainSkillOrSpecialization", e.target.value)}
                  placeholder="e.g., JavaScript, Accounting, Leadership, etc."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Years of Experience Required</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperienceRequired || 0}
                    onChange={(e) => handleInputChange("yearsOfExperienceRequired", parseInt(e.target.value) || 0)}
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
                    value={formData.vacantPositions || 0}
                    onChange={(e) => handleInputChange("vacantPositions", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>No. of Paid Employees *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.paidEmployees || 0}
                    onChange={(e) => handleInputChange("paidEmployees", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">INDUSTRY TYPE (Select all that apply)</h3>
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
                <Label>Starting Salary/Wage *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.startingSalaryOrWage || ""}
                  onChange={(e) => handleInputChange("startingSalaryOrWage", parseFloat(e.target.value) || 0)}
                  placeholder="Amount in PHP"
                />
              </div>

              <div>
                <Label>Job Status *</Label>
                <Select
                  value={formData.jobStatus || "P"}
                  onValueChange={(v) => handleInputChange("jobStatus", v)}
                >
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
          )}

          {/* Step 4: Signatory & Date */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">PREPARED BY & DATE</h3>

              {selectedEmployer && (
                <div className="border-l-4 border-blue-500 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>✓ Auto-populated from Employer:</strong> {selectedEmployer.establishmentName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.preparedByName || ""}
                    onChange={(e) => handleInputChange("preparedByName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Input
                    value={formData.preparedByDesignation || ""}
                    onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
                    placeholder="Job title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.preparedByContact || ""}
                    onChange={(e) => handleInputChange("preparedByContact", e.target.value)}
                    placeholder="Contact number"
                  />
                </div>
                <div>
                  <Label>Date Accomplished *</Label>
                  <Input
                    type="date"
                    value={formData.dateAccomplished || ""}
                    onChange={(e) => handleInputChange("dateAccomplished", e.target.value)}
                  />
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
                  <p><strong>Salary:</strong> ₱{formData.startingSalaryOrWage}</p>
                  <p><strong>Status:</strong> {formData.jobStatus}</p>
                  <p><strong>Education Required:</strong> {formData.minimumEducationRequired}</p>
                  <p><strong>Experience:</strong> {formData.yearsOfExperienceRequired} years</p>
                  <p><strong>Industries:</strong> {Array.isArray(formData.industryCodes) ? formData.industryCodes.join(", ") : String(formData.industryCodes)} ({Array.isArray(formData.industryCodes) ? formData.industryCodes.length : 0} selected)</p>
                  <p className="text-xs text-gray-500">Debug: {JSON.stringify(formData.industryCodes)}</p>
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
