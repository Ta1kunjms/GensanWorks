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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";

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
  
  // Helper function to normalize array fields
  const normalizeApplicantData = (data: any) => {
    if (!data) return {};
    
    // Parse JSON strings or ensure arrays
    const parseJsonField = (field: any) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    return {
      ...data,
      workExperience: parseJsonField(data.workExperience),
      education: parseJsonField(data.education),
      technicalTraining: parseJsonField(data.technicalTraining),
      professionalLicenses: parseJsonField(data.professionalLicenses),
      languageProficiency: parseJsonField(data.languageProficiency),
      otherSkills: parseJsonField(data.otherSkills),
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applicants/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update applicant");
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Applicant - {formData.firstName} {formData.surname}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 sticky top-0">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {/* Personal Info Tab - combines Personal and Address */}
            <TabsContent value="personal" className="space-y-4">
              <h4 className="font-semibold mb-3">I. PERSONAL INFORMATION</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Surname *</Label>
                  <Input
                    value={formData.surname || ""}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                    placeholder="Surname"
                  />
                </div>
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.firstName || ""}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="First Name"
                  />
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
                  value={formData.houseStreetVillage || ""}
                  onChange={(e) => handleInputChange("houseStreetVillage", e.target.value)}
                  placeholder="Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Barangay *</Label>
                  <Select value={formData.barangay || ""} onValueChange={(v) => handleInputChange("barangay", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Municipality *</Label>
                  <Input
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality"
                  />
                </div>
              </div>

              <div>
                <Label>Province *</Label>
                <Input
                  value={formData.province || ""}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="Province"
                />
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Employment Status</Label>
                  <Select value={formData.employmentStatus || ""} onValueChange={(v) => handleInputChange("employmentStatus", v)}>
                    <SelectTrigger>
                      <SelectValue />
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
                <div>
                  <Label>Employment Type</Label>
                  <Select value={formData.employmentType || ""} onValueChange={(v) => handleInputChange("employmentType", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wage employed">Wage Employed (Job Seeker)</SelectItem>
                      <SelectItem value="self-employed">Self-Employed (Freelancer)</SelectItem>
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
                    placeholder="Return date"
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
                      const newLicenses = [...(formData.professionalLicenses || []), { license: "", validUntil: "" }];
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
                      value={license.license || ""}
                      onChange={(e) => {
                        const newLicenses = [...(formData.professionalLicenses || [])];
                        newLicenses[idx] = { ...license, license: e.target.value };
                        handleInputChange("professionalLicenses", newLicenses);
                      }}
                      placeholder="License/Certificate Title"
                    />
                    <Input
                      value={license.validUntil || ""}
                      onChange={(e) => {
                        const newLicenses = [...(formData.professionalLicenses || [])];
                        newLicenses[idx] = { ...license, validUntil: e.target.value };
                        handleInputChange("professionalLicenses", newLicenses);
                      }}
                      placeholder="Valid Until"
                    />
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
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Project-based">Project-based</SelectItem>
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
                    <Input
                      value={formData.otherSkillsSpecify || ""}
                      onChange={(e) => handleInputChange("otherSkillsSpecify", e.target.value)}
                      placeholder="Specify other skills"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
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
