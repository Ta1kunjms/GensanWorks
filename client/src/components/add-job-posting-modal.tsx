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
import { industryNameMap } from "@shared/schema";

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

const EDUCATION_LEVELS = [
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

export function AddJobPostingModal({
  open,
  onOpenChange,
  onJobAdded,
}: AddJobPostingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

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
    if (!formData.employerId) {
      toast({ title: "Error", description: "Please select an employer", variant: "destructive" });
      return false;
    }
    if (!formData.title) {
      toast({ title: "Error", description: "Position title is required", variant: "destructive" });
      return false;
    }
    if (!formData.minimumEducation) {
      toast({ title: "Error", description: "Minimum education is required", variant: "destructive" });
      return false;
    }
    if (!formData.mainSkillOrSpecialization) {
      toast({ title: "Error", description: "Main skill/specialization is required", variant: "destructive" });
      return false;
    }
    if (!formData.salaryMin || parseFloat(formData.salaryMin) <= 0) {
      toast({ title: "Error", description: "Valid starting salary is required", variant: "destructive" });
      return false;
    }
    if (!formData.preparedByName || !formData.preparedByDesignation || !formData.dateAccomplished) {
      toast({ title: "Error", description: "Please fill in prepared by information and date", variant: "destructive" });
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
                <SelectTrigger>
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
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Software Developer"
                />
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
                  <SelectTrigger>
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
              </div>
              <div>
                <Label>Main Skill/Specialization Desired *</Label>
                <Input
                  value={formData.mainSkillOrSpecialization}
                  onChange={(e) => handleInputChange("mainSkillOrSpecialization", e.target.value)}
                  placeholder="e.g., JavaScript, Accounting"
                />
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
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  placeholder="Amount"
                />
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
                  value={formData.preparedByName}
                  onChange={(e) => handleInputChange("preparedByName", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input
                  value={formData.preparedByDesignation}
                  onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
                  placeholder="Job title"
                />
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
                  value={formData.dateAccomplished}
                  onChange={(e) => handleInputChange("dateAccomplished", e.target.value)}
                />
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
