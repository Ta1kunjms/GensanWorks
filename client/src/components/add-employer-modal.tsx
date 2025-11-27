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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { industryNameMap } from "@shared/schema";
import type { EmployerCreate } from "@shared/schema";
import { Upload, X, HelpCircle } from "lucide-react";

interface AddEmployerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployerAdded?: (employer: any) => void;
}

// Helper component for labels with tooltips
const LabelWithTooltip = ({ label, tooltip, required }: { label: string; tooltip?: string; required?: boolean }) => (
  <div className="flex items-center gap-1">
    <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export function AddEmployerModal({
  open,
  onOpenChange,
  onEmployerAdded,
}: AddEmployerModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EmployerCreate>>({
    numberOfPaidEmployees: 0,
    numberOfVacantPositions: 0,
    industryType: [],
    srsSubscriber: false,
    isManpowerAgency: false,
    preparedByName: "",
    preparedByDesignation: "",
    dateAccomplished: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    srsFormFile: null,
    businessPermitFile: null,
    bir2303File: null,
    companyProfileFile: null,
    doleCertificationFile: null,
  });
  const [industrySearchTerm, setIndustrySearchTerm] = useState("");

  // Auto-save form data to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("employer_form_draft", JSON.stringify(formData));
    }, 500); // Save after 500ms of inactivity

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("employer_form_draft");
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error("Failed to load form draft:", e);
      }
    }
  }, []);

  const clearFormDraft = () => {
    localStorage.removeItem("employer_form_draft");
  };

  const barangays = [
    "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang", "City Heights",
    "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West",
    "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
    "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay",
  ];

  const industryCodes = Object.entries(industryNameMap)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => parseInt(a.code) - parseInt(b.code));

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

  const validateStep1 = () => {
    if (!formData.establishmentName || !formData.houseStreetVillage || !formData.municipality || !formData.province) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required establishment fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.preparedByName || !formData.preparedByDesignation || !formData.dateAccomplished) {
      toast({
        title: "Validation Error",
        description: "Please fill in prepared by information and date",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.industryType || formData.industryType.length === 0) {
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
    if (!uploadedFiles.srsFormFile) {
      toast({
        title: "Validation Error",
        description: "SRS Form file is required. Please upload the SRS Form document.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    // Match Philippine phone formats: +63, 0, or just digits
    // Allow formats like: 09123456789, +639123456789, 02 1234567, etc.
    const phoneRegex = /^(\+63|0)?\d{9,11}$|^(\+63)?\s?\d{1,4}\s?\d{1,4}\s?\d{1,4}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  };

  const validateTIN = (tin: string): boolean => {
    if (!tin) return true; // Optional field
    // Philippine TIN format: 9 digits
    const tinRegex = /^\d{9}$/;
    return tinRegex.test(tin.replace(/[-\s]/g, ""));
  };

  const checkForDuplicates = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/employers/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentName: formData.establishmentName,
          companyTIN: formData.companyTIN,
        }),
      });

      const data = await response.json();
      
      if (data.isDuplicate) {
        toast({
          title: "Duplicate Found",
          description: data.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error checking duplicates:", error);
      // Don't fail on check error, allow user to continue
      return true;
    }
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const getFileName = (fieldName: string) => {
    const labelMap: Record<string, string> = {
      srsFormFile: "SRS Form",
      businessPermitFile: "Business Permit",
      bir2303File: "BIR 2303",
      companyProfileFile: "Company Profile",
      doleCertificationFile: "DOLE Certification",
    };
    return labelMap[fieldName] || fieldName;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!validateStep1() || !validateStep2()) {
        setLoading(false);
        return;
      }

      // Check for duplicates before submitting
      const noDuplicates = await checkForDuplicates();
      if (!noDuplicates) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add employer");
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: "Employer added successfully",
      });

      onOpenChange(false);
      onEmployerAdded?.(responseData.employer);
      clearFormDraft(); // Clear saved draft after successful submission

      // Reset form
      setFormData({
        numberOfPaidEmployees: 0,
        numberOfVacantPositions: 0,
        industryType: [],
        srsSubscriber: false,
        isManpowerAgency: false,
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Employer (SRS Form 2 - Establishment Listing)</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3 - Register employer establishment details
          </DialogDescription>
          
          {/* Progress Bar */}
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-700 mt-2">
              <span className={currentStep >= 1 ? "text-blue-600" : ""}>Step 1: Info</span>
              <span className={currentStep >= 2 ? "text-blue-600" : ""}>Step 2: Industry</span>
              <span className={currentStep >= 3 ? "text-blue-600" : ""}>Step 3: Files</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Step 1: Establishment Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">ESTABLISHMENT INFORMATION</h3>

              <div>
                <Label>Name of Establishment *</Label>
                <Input
                  value={formData.establishmentName || ""}
                  onChange={(e) => handleInputChange("establishmentName", e.target.value)}
                  placeholder="Company/Establishment name"
                />
              </div>

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
                  <Label>Barangay</Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Number</Label>
                  <div>
                    <Input
                      value={formData.contactNumber || ""}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                      placeholder="09123456789 or +639123456789"
                      className={formData.contactNumber && !validatePhoneNumber(formData.contactNumber) ? "border-red-500" : ""}
                    />
                    {formData.contactNumber && !validatePhoneNumber(formData.contactNumber) && (
                      <p className="text-xs text-red-500 mt-1">Invalid format. Use: 09XX, +63X, or 02 format</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">EMPLOYMENT INFORMATION</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>No. of Paid Employees</Label>
                    <Input
                      type="number"
                      value={formData.numberOfPaidEmployees || 0}
                      onChange={(e) => handleInputChange("numberOfPaidEmployees", parseInt(e.target.value) || 0)}
                      placeholder="Number of employees"
                    />
                  </div>
                  <div>
                    <Label>No. of Vacant Positions</Label>
                    <Input
                      type="number"
                      value={formData.numberOfVacantPositions || 0}
                      onChange={(e) => handleInputChange("numberOfVacantPositions", parseInt(e.target.value) || 0)}
                      placeholder="Number of vacancies"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">COMPANY INFORMATION</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <LabelWithTooltip 
                      label="Company TIN" 
                      tooltip="Tax Identification Number - 9 digit BIR identifier for the establishment"
                    />
                    <div>
                      <Input
                        value={formData.companyTIN || ""}
                        onChange={(e) => handleInputChange("companyTIN", e.target.value)}
                        placeholder="9-digit TIN (e.g., 123456789)"
                        maxLength={9}
                        className={formData.companyTIN && !validateTIN(formData.companyTIN) ? "border-red-500" : ""}
                      />
                      {formData.companyTIN && !validateTIN(formData.companyTIN) && (
                        <p className="text-xs text-red-500 mt-1">TIN must be 9 digits</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Business Permit Number</Label>
                    <Input
                      value={formData.businessPermitNumber || ""}
                      onChange={(e) => handleInputChange("businessPermitNumber", e.target.value)}
                      placeholder="Permit number"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <LabelWithTooltip 
                    label="BIR Form 2303 Number" 
                    tooltip="BIR Form 2303 (Registration of Business with the BIR) - Required for payroll tax compliance"
                  />
                  <Input
                    value={formData.bir2303Number || ""}
                    onChange={(e) => handleInputChange("bir2303Number", e.target.value)}
                    placeholder="BIR form number"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isManpowerAgency || false}
                  onCheckedChange={(v) => handleInputChange("isManpowerAgency", v)}
                />
                <Label>Is Manpower Agency?</Label>
              </div>

              {formData.isManpowerAgency && (
                <div>
                  <Label>DOLE Certification Number</Label>
                  <Input
                    value={formData.doleCertificationNumber || ""}
                    onChange={(e) => handleInputChange("doleCertificationNumber", e.target.value)}
                    placeholder="D.O. 174 Certification"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Industry & Requirements */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">INDUSTRY TYPE (Select all that apply) *</h3>
                
                {/* Search and Select All Controls */}
                <div className="mb-3 space-y-2">
                  <Input
                    placeholder="Search industries..."
                    value={industrySearchTerm}
                    onChange={(e) => setIndustrySearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          industryType: industryCodes.map(({ code }) => code),
                        }));
                      }}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          industryType: [],
                        }));
                      }}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Industry Checkboxes with Search Filter */}
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                  {industryCodes
                    .filter(({ code, name }) =>
                      code.toLowerCase().includes(industrySearchTerm.toLowerCase()) ||
                      name.toLowerCase().includes(industrySearchTerm.toLowerCase())
                    )
                    .map(({ code, name }) => (
                      <div key={code} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.industryType?.includes(code) || false}
                          onCheckedChange={() => handleIndustryToggle(code)}
                          id={`industry-${code}`}
                        />
                        <Label htmlFor={`industry-${code}`} className="text-sm cursor-pointer">
                          {code} - {name}
                        </Label>
                      </div>
                    ))}
                </div>
                {industrySearchTerm && industryCodes.filter(({ code, name }) =>
                  code.toLowerCase().includes(industrySearchTerm.toLowerCase()) ||
                  name.toLowerCase().includes(industrySearchTerm.toLowerCase())
                ).length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No industries found matching "{industrySearchTerm}"</p>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">GEOGRAPHIC IDENTIFICATION</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Chairperson Name</Label>
                    <Input
                      value={formData.chairpersonName || ""}
                      onChange={(e) => handleInputChange("chairpersonName", e.target.value)}
                      placeholder="Barangay chairperson"
                    />
                  </div>
                  <div>
                    <Label>Chairperson Contact</Label>
                    <div>
                      <Input
                        value={formData.chairpersonContact || ""}
                        onChange={(e) => handleInputChange("chairpersonContact", e.target.value)}
                        placeholder="09123456789"
                        className={formData.chairpersonContact && !validatePhoneNumber(formData.chairpersonContact) ? "border-red-500" : ""}
                      />
                      {formData.chairpersonContact && !validatePhoneNumber(formData.chairpersonContact) && (
                        <p className="text-xs text-red-500 mt-1">Invalid phone format</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Secretary Name</Label>
                    <Input
                      value={formData.secretaryName || ""}
                      onChange={(e) => handleInputChange("secretaryName", e.target.value)}
                      placeholder="Secretary"
                    />
                  </div>
                  <div>
                    <Label>Secretary Contact</Label>
                    <div>
                      <Input
                        value={formData.secretaryContact || ""}
                        onChange={(e) => handleInputChange("secretaryContact", e.target.value)}
                        placeholder="09123456789"
                        className={formData.secretaryContact && !validatePhoneNumber(formData.secretaryContact) ? "border-red-500" : ""}
                      />
                      {formData.secretaryContact && !validatePhoneNumber(formData.secretaryContact) && (
                        <p className="text-xs text-red-500 mt-1">Invalid phone format</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">SRS SUBSCRIPTION</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.srsSubscriber || false}
                    onCheckedChange={(v) => handleInputChange("srsSubscriber", v)}
                  />
                  <Label>Wants to be included as SRS subscriber</Label>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="Additional remarks or notes"
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-3">PREPARED BY</h3>

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

                <div className="grid grid-cols-2 gap-3 mt-3">
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
              </div>
            </div>
          )}

          {/* Step 3: Documentation & Signatory */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">DOCUMENTATION REQUIREMENTS</h3>
              <p className="text-sm text-slate-600">
                Upload the following documents (PDF, JPG, PNG):
              </p>

              {/* File Upload Sections */}
              <div className="space-y-3">
                {/* SRS Form */}
                <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                  <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    SRS Form <span className="text-red-600">*</span> <Badge variant="outline" className="bg-red-50">Required</Badge>
                  </Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("srsFormFile", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{uploadedFiles.srsFormFile?.name || "Click to upload"}</span>
                      </div>
                    </label>
                    {uploadedFiles.srsFormFile && (
                      <button
                        onClick={() => handleFileChange("srsFormFile", null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Business Permit */}
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-semibold mb-2 block">Business Permit (Photocopy) *</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("businessPermitFile", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{uploadedFiles.businessPermitFile?.name || "Click to upload"}</span>
                      </div>
                    </label>
                    {uploadedFiles.businessPermitFile && (
                      <button
                        onClick={() => handleFileChange("businessPermitFile", null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* BIR 2303 */}
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-semibold mb-2 block">BIR Form 2303 (Photocopy) *</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("bir2303File", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{uploadedFiles.bir2303File?.name || "Click to upload"}</span>
                      </div>
                    </label>
                    {uploadedFiles.bir2303File && (
                      <button
                        onClick={() => handleFileChange("bir2303File", null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Company Profile */}
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-semibold mb-2 block">Company Profile</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("companyProfileFile", e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{uploadedFiles.companyProfileFile?.name || "Click to upload"}</span>
                      </div>
                    </label>
                    {uploadedFiles.companyProfileFile && (
                      <button
                        onClick={() => handleFileChange("companyProfileFile", null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* DOLE Certification (conditional) */}
                {formData.isManpowerAgency && (
                  <div className="border rounded-lg p-3">
                    <Label className="text-sm font-semibold mb-2 block">DOLE Certification (D.O. 174)</Label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange("doleCertificationFile", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">{uploadedFiles.doleCertificationFile?.name || "Click to upload"}</span>
                        </div>
                      </label>
                      {uploadedFiles.doleCertificationFile && (
                        <button
                          onClick={() => handleFileChange("doleCertificationFile", null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4 p-3 bg-blue-50 rounded">
                <p className="text-xs text-slate-700">
                  <strong>Note:</strong> Review all information and upload required documents before submission.
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

          {currentStep < 3 ? (
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
            <Button 
              onClick={() => {
                if (!validateStep3()) return;
                handleSubmit();
              }} 
              disabled={loading}
            >
              {loading ? "Adding..." : "Submit Employer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
