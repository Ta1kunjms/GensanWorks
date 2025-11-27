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
import type { ApplicantCreate } from "@shared/schema";

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
  const [formData, setFormData] = useState<Partial<ApplicantCreate>>({
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
    municipality: "General Santos City",
    province: "South Cotabato",
  });

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

  const handleOccupationAdd = () => {
    setFormData((prev) => ({
      ...prev,
      preferredOccupations: [...(prev.preferredOccupations || []), ""],
    }));
  };

  const handleLocationAdd = () => {
    setFormData((prev) => ({
      ...prev,
      preferredLocations: [...(prev.preferredLocations || []), ""],
    }));
  };

  const handleOverseasCountryAdd = () => {
    setFormData((prev) => ({
      ...prev,
      preferredOverseasCountries: [...(prev.preferredOverseasCountries || []), ""],
    }));
  };

  const validateStep1 = () => {
    if (!formData.surname || !formData.firstName || !formData.dateOfBirth) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Surname, First Name, Date of Birth)",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.houseStreetVillage || !formData.barangay || !formData.municipality || !formData.province) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required address fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Final validation
      if (!formData.surname || !formData.firstName || !formData.dateOfBirth) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      setFormData({
        sex: "Male",
        civilStatus: "Single",
        disability: "None",
        is4PSBeneficiary: false,
        isOFW: false,
        isFormerOFW: false,
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
          <DialogTitle>Add New Applicant (NSRP Registration Form)</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 5 - Fill in applicant information from NSRP form
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Type Selector - Step 0 */}
          {currentStep === 1 && !formData.employmentType && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg text-slate-900">Select Applicant Type</h3>
              <p className="text-sm text-slate-600">Choose whether this applicant is a Job Seeker or Freelancer</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleInputChange("employmentType", "wage employed")}
                  className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="font-semibold text-slate-900">🎯 Job Seeker</div>
                  <p className="text-xs text-slate-600 mt-1">Looking for wage employment</p>
                </button>
                <button
                  onClick={() => handleInputChange("employmentType", "self-employed")}
                  className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition cursor-pointer"
                >
                  <div className="font-semibold text-slate-900">💼 Freelancer</div>
                  <p className="text-xs text-slate-600 mt-1">Self-employed / Independent work</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && formData.employmentType && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">I. PERSONAL INFORMATION</h3>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Surname *</Label>
                  <Input
                    value={formData.surname || ""}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="First name"
                  />
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
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
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
                    value={formData.houseStreetVillage || ""}
                    onChange={(e) => handleInputChange("houseStreetVillage", e.target.value)}
                    placeholder="Address"
                  />
                </div>
                <div>
                  <Label>Barangay *</Label>
                  <Select value={formData.barangay || ""} onValueChange={(v) => handleInputChange("barangay", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Municipality/City *</Label>
                  <Input
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality/City"
                  />
                </div>
                <div>
                  <Label>Province *</Label>
                  <Input
                    value={formData.province || ""}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    placeholder="Province"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg">EMPLOYMENT STATUS / TYPE</h3>

                <div className="mt-3 space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={formData.employmentStatus || ""} onValueChange={(v) => handleInputChange("employmentStatus", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Self-employed">Self-employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                      <SelectItem value="New Entrant/Fresh Graduate">New Entrant/Fresh Graduate</SelectItem>
                      <SelectItem value="Finished Contract">Finished Contract</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                      <SelectItem value="Terminated/Laid off">Terminated/Laid off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.employmentStatus === "Unemployed" && (
                  <div className="mt-3">
                    <Label>Months Looking for Work</Label>
                    <Input
                      type="number"
                      value={formData.monthsUnemployed || ""}
                      onChange={(e) => handleInputChange("monthsUnemployed", parseInt(e.target.value) || 0)}
                      placeholder="Number of months"
                    />
                  </div>
                )}

                <div className="mt-3">
                  <Label>Employment Type</Label>
                  <Select value={formData.employmentType || ""} onValueChange={(v) => handleInputChange("employmentType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wage employed">Wage employed</SelectItem>
                      <SelectItem value="Self-employed">Self-employed</SelectItem>
                      <SelectItem value="Fisherman/Fisherfolk">Fisherman/Fisherfolk</SelectItem>
                      <SelectItem value="Vendor/Retailer">Vendor/Retailer</SelectItem>
                      <SelectItem value="Home-based worker">Home-based worker</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Domestic Worker">Domestic Worker</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                      <SelectItem value="Artisan/Craft Worker">Artisan/Craft Worker</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                {formData.preferredOccupations?.map((occ, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={occ || ""}
                      onChange={(e) => {
                        const newOcc = [...(formData.preferredOccupations || [])];
                        newOcc[idx] = e.target.value;
                        handleInputChange("preferredOccupations", newOcc);
                      }}
                      placeholder={`Preferred Occupation ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newOcc = formData.preferredOccupations?.filter((_, i) => i !== idx) || [];
                        handleInputChange("preferredOccupations", newOcc);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleOccupationAdd} className="w-full">
                  + Add Occupation
                </Button>
              </div>

              {/* Employment Type Preference */}
              <div>
                <Label className="font-semibold text-base mb-2 block">EMPLOYMENT TYPE PREFERENCE</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.employmentType4 === "Part-time"}
                      onCheckedChange={(v) => {
                        if (v) handleInputChange("employmentType4", "Part-time");
                      }}
                    />
                    <Label>Part-time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.employmentType4 === "Full-time"}
                      onCheckedChange={(v) => {
                        if (v) handleInputChange("employmentType4", "Full-time");
                      }}
                    />
                    <Label>Full-time</Label>
                  </div>
                </div>
              </div>

              {/* Preferred Work Locations - Local */}
              <div>
                <Label className="font-semibold text-base mb-2 block">PREFERRED WORK LOCATION (Local - cities/municipalities)</Label>
                {formData.preferredLocations?.map((loc, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={loc || ""}
                      onChange={(e) => {
                        const newLoc = [...(formData.preferredLocations || [])];
                        newLoc[idx] = e.target.value;
                        handleInputChange("preferredLocations", newLoc);
                      }}
                      placeholder={`Preferred Location ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newLoc = formData.preferredLocations?.filter((_, i) => i !== idx) || [];
                        handleInputChange("preferredLocations", newLoc);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleLocationAdd} className="w-full">
                  + Add Location
                </Button>
              </div>

              {/* Preferred Work Locations - Overseas */}
              <div>
                <Label className="font-semibold text-base mb-2 block">PREFERRED WORK LOCATION (Overseas - countries)</Label>
                {formData.preferredOverseasCountries?.map((country, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={country || ""}
                      onChange={(e) => {
                        const newCountries = [...(formData.preferredOverseasCountries || [])];
                        newCountries[idx] = e.target.value;
                        handleInputChange("preferredOverseasCountries", newCountries);
                      }}
                      placeholder={`Preferred Country ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newCountries = formData.preferredOverseasCountries?.filter((_, i) => i !== idx) || [];
                        handleInputChange("preferredOverseasCountries", newCountries);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleOverseasCountryAdd} className="w-full">
                  + Add Country
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Education & Training */}
          {currentStep === 4 && (
            <div className="space-y-6">
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
                          <SelectItem value="Elementary">Elementary</SelectItem>
                          <SelectItem value="Secondary (K-12)">Secondary (K-12)</SelectItem>
                          <SelectItem value="Senior High School">Senior High School</SelectItem>
                          <SelectItem value="Tertiary">Tertiary</SelectItem>
                          <SelectItem value="Graduate Studies">Graduate Studies</SelectItem>
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
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Probationary">Probationary</SelectItem>
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
                  <Input
                    value={formData.otherSkillsSpecify || ""}
                    onChange={(e) => handleInputChange("otherSkillsSpecify", e.target.value)}
                    placeholder="Please specify other skills"
                    className="mt-2"
                  />
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

        <DialogFooter className="flex justify-between">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
