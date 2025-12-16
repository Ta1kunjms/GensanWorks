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
import { authFetch } from "@/lib/auth";
import { DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE } from "@/lib/locations";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

interface AddEmployerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployerAdded?: (employer: any) => void;
}

const getTodayIsoDate = () => new Date().toISOString().split("T")[0];

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

const createInitialContactPerson = (): EmployerCreate["contactPerson"] => ({
  personName: "",
  designation: "",
  email: "",
  contactNumber: "",
});

const createInitialFormState = (): Partial<EmployerCreate> => ({
  numberOfPaidEmployees: 0,
  numberOfVacantPositions: 0,
  industryType: [],
  srsSubscriber: false,
  isManpowerAgency: false,
  municipality: DEFAULT_MUNICIPALITY,
  province: DEFAULT_PROVINCE,
  preparedByName: "",
  preparedByDesignation: "",
  dateAccomplished: "",
  contactPerson: createInitialContactPerson(),
  geographicCode: "",
  telNumber: "",
  barangayChairperson: "",
  chairpersonTelNumber: "",
  barangaySecretary: "",
  secretaryTelNumber: "",
  remarks: "",
});

export function AddEmployerModal({
  open,
  onOpenChange,
  onEmployerAdded,
}: AddEmployerModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EmployerCreate>>(() => createInitialFormState());
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    businessPermitFile: null,
    bir2303File: null,
    companyProfileFile: null,
    doleCertificationFile: null,
  });
  const [industrySearchTerm, setIndustrySearchTerm] = useState("");

  type EmployerRequiredField =
    | "establishmentName"
    | "houseStreetVillage"
    | "municipality"
    | "province"
    | "companyTIN"
    | "contactPersonName"
    | "contactPersonEmail"
    | "contactPersonContactNumber"
    | "preparedByName"
    | "preparedByDesignation"
    | "industryType"
    ;

  const { fieldErrors, clearFieldError, setErrorsAndFocus, setFieldErrors } =
    useFieldErrors<EmployerRequiredField>();

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
        const parsed = JSON.parse(draft);
        const merged = {
          ...createInitialFormState(),
          ...parsed,
          contactPerson: {
            ...createInitialContactPerson(),
            ...(parsed.contactPerson || {}),
          },
        } as Partial<EmployerCreate>;

        setFormData({
          ...merged,
          municipality: merged.municipality?.trim() ? merged.municipality : DEFAULT_MUNICIPALITY,
          province: merged.province?.trim() ? merged.province : DEFAULT_PROVINCE,
        });
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

    if (
      field === "establishmentName" ||
      field === "houseStreetVillage" ||
      field === "municipality" ||
      field === "province" ||
      field === "companyTIN" ||
      field === "preparedByName" ||
      field === "preparedByDesignation"
    ) {
      clearFieldError(field as EmployerRequiredField);
    }
  };

  const handleContactPersonChange = (field: keyof EmployerCreate["contactPerson"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...createInitialContactPerson(),
        ...(prev.contactPerson || {}),
        [field]: value,
      },
    }));

    if (field === "personName") clearFieldError("contactPersonName");
    if (field === "email") clearFieldError("contactPersonEmail");
    if (field === "contactNumber") clearFieldError("contactPersonContactNumber");
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

    clearFieldError("industryType");
  };

  const validateStep1 = () => {
    const nextErrors: FieldErrors<EmployerRequiredField> = {};

    if (!String(formData.establishmentName || "").trim()) nextErrors.establishmentName = "Establishment name is required";
    if (!String(formData.houseStreetVillage || "").trim()) nextErrors.houseStreetVillage = "Address is required";
    if (!String(formData.municipality || "").trim()) nextErrors.municipality = "Municipality/City is required";
    if (!String(formData.province || "").trim()) nextErrors.province = "Province is required";

    if (!String(formData.contactPerson?.personName || "").trim()) {
      nextErrors.contactPersonName = "Primary contact person is required";
    }

    const contactEmail = String(formData.contactPerson?.email || "").trim();
    if (contactEmail && !validateEmail(contactEmail)) nextErrors.contactPersonEmail = "Invalid email format";

    const contactNumber = String(formData.contactPerson?.contactNumber || "").trim();
    if (contactNumber && !validatePhoneNumber(contactNumber)) {
      nextErrors.contactPersonContactNumber = "Invalid phone format";
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned.establishmentName;
      delete cleaned.houseStreetVillage;
      delete cleaned.municipality;
      delete cleaned.province;
      delete cleaned.contactPersonName;
      delete cleaned.contactPersonEmail;
      delete cleaned.contactPersonContactNumber;
      return cleaned;
    });

    return true;
  };

  const validateStep2 = () => {
    const nextErrors: FieldErrors<EmployerRequiredField> = {};

    if (!String(formData.preparedByName || "").trim()) nextErrors.preparedByName = "Name is required";
    if (!String(formData.preparedByDesignation || "").trim()) nextErrors.preparedByDesignation = "Designation is required";
    if (!formData.industryType || formData.industryType.length === 0) {
      nextErrors.industryType = "Select at least one industry type";
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return false;
    }

    setFieldErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned.preparedByName;
      delete cleaned.preparedByDesignation;
      delete cleaned.industryType;
      return cleaned;
    });

    return true;
  };

  const validateStep3 = () => {
    const nextErrors: FieldErrors<EmployerRequiredField> = {};
    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
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

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
  };

  const validateTIN = (tin: string): boolean => {
    if (!tin) return true; // Optional field
    // Philippine TIN format: 9 digits
    const tinRegex = /^\d{9}$/;
    return tinRegex.test(tin.replace(/[-\s]/g, ""));
  };

  const checkForDuplicates = async (): Promise<boolean> => {
    try {
      const response = await authFetch("/api/employers/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentName: formData.establishmentName,
          companyTIN: formData.companyTIN,
        }),
      });

      const data = await response.json();
      
      if (data.isDuplicate) {
        const message = String(data.message || "A duplicate employer was found.").trim();
        const nextErrors: FieldErrors<EmployerRequiredField> = {
          establishmentName: message,
        };

        if (String(formData.companyTIN || "").trim()) {
          nextErrors.companyTIN = message;
        }

        setErrorsAndFocus(nextErrors);
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
      businessPermitFile: "Business Permit",
      bir2303File: "BIR 2303",
      companyProfileFile: "Company Profile",
      doleCertificationFile: "DOLE Accreditation",
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

      // Step 1: Upload files first
      let fileMetadata: Record<string, any> = {};
      const hasFiles = Object.values(uploadedFiles).some(file => file !== null);

      if (hasFiles) {
        const formDataFiles = new FormData();
        Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
          if (file) {
            formDataFiles.append(fieldName, file);
          }
        });

        const uploadResponse = await authFetch("/api/upload/employer-docs", {
          method: "POST",
          body: formDataFiles,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload files");
        }

        const uploadResult = await uploadResponse.json();
        fileMetadata = uploadResult.files || {};
      }

      // Step 2: Submit employer data with file metadata
      const payload = {
        ...formData,
        dateAccomplished: getTodayIsoDate(),
        industryCodes: Array.from(new Set(formData.industryType || [])),
        // Admin-created employers are automatically active
        accountStatus: "active",
        createdBy: "admin",
        // Merge file metadata into payload
        ...(fileMetadata.businessPermitFile && { 
          businessPermitFile: JSON.stringify(fileMetadata.businessPermitFile) 
        }),
        ...(fileMetadata.bir2303File && { 
          bir2303File: JSON.stringify(fileMetadata.bir2303File) 
        }),
        ...(fileMetadata.companyProfileFile && { 
          companyProfileFile: JSON.stringify(fileMetadata.companyProfileFile) 
        }),
        ...(fileMetadata.doleCertificationFile && { 
          doleCertificationFile: JSON.stringify(fileMetadata.doleCertificationFile) 
        }),
      };

      const response = await authFetch("/api/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage = responseData?.error?.message || responseData?.message || "Failed to add employer";
        throw new Error(serverMessage);
      }

      toast({
        title: "Success",
        description: "Employer added successfully with documents",
      });

      onOpenChange(false);
      onEmployerAdded?.(responseData.employer);
      clearFormDraft(); // Clear saved draft after successful submission

      // Reset form
      setFormData(createInitialFormState());
      setUploadedFiles({
        businessPermitFile: null,
        bir2303File: null,
        companyProfileFile: null,
        doleCertificationFile: null,
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
                  aria-invalid={!!fieldErrors.establishmentName}
                  value={formData.establishmentName || ""}
                  onChange={(e) => handleInputChange("establishmentName", e.target.value)}
                  placeholder="Company/Establishment name"
                />
                {fieldErrors.establishmentName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.establishmentName}</p>
                )}
              </div>

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
                    aria-invalid={!!fieldErrors.municipality}
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality/City"
                  />
                  {fieldErrors.municipality && <p className="mt-1 text-xs text-destructive">{fieldErrors.municipality}</p>}
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
                <h3 className="font-semibold text-base mb-3">GEOGRAPHIC IDENTIFICATION</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Geographic Code</Label>
                    <Input
                      value={formData.geographicCode || ""}
                      onChange={(e) => handleInputChange("geographicCode", e.target.value)}
                      placeholder="Enter geographic code"
                    />
                  </div>
                  <div>
                    <Label>Tel. No.</Label>
                    <Input
                      value={formData.telNumber || ""}
                      onChange={(e) => handleInputChange("telNumber", e.target.value)}
                      placeholder="Telephone number"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-base mb-3">BARANGAY OFFICIALS</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Barangay Chairperson</Label>
                    <Input
                      value={formData.barangayChairperson || ""}
                      onChange={(e) => handleInputChange("barangayChairperson", e.target.value)}
                      placeholder="Chairperson name"
                    />
                  </div>
                  <div>
                    <Label>Chairperson Tel. No.</Label>
                    <Input
                      value={formData.chairpersonTelNumber || ""}
                      onChange={(e) => handleInputChange("chairpersonTelNumber", e.target.value)}
                      placeholder="Telephone number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Barangay Secretary</Label>
                    <Input
                      value={formData.barangaySecretary || ""}
                      onChange={(e) => handleInputChange("barangaySecretary", e.target.value)}
                      placeholder="Secretary name"
                    />
                  </div>
                  <div>
                    <Label>Secretary Tel. No.</Label>
                    <Input
                      value={formData.secretaryTelNumber || ""}
                      onChange={(e) => handleInputChange("secretaryTelNumber", e.target.value)}
                      placeholder="Telephone number"
                    />
                  </div>
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
                <h3 className="font-semibold text-lg mb-3">PRIMARY CONTACT PERSON</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      aria-invalid={!!fieldErrors.contactPersonName}
                      value={formData.contactPerson?.personName || ""}
                      onChange={(e) => handleContactPersonChange("personName", e.target.value)}
                      placeholder="Primary contact name"
                    />
                    {fieldErrors.contactPersonName && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonName}</p>
                    )}
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input
                      value={formData.contactPerson?.designation || ""}
                      onChange={(e) => handleContactPersonChange("designation", e.target.value)}
                      placeholder="Role/designation"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Email</Label>
                    <div>
                      <Input
                        type="email"
                        value={formData.contactPerson?.email || ""}
                        onChange={(e) => handleContactPersonChange("email", e.target.value)}
                        placeholder="contact@example.com"
                        aria-invalid={
                          !!fieldErrors.contactPersonEmail ||
                          (!!formData.contactPerson?.email && !validateEmail(formData.contactPerson.email))
                        }
                      />
                      {fieldErrors.contactPersonEmail ? (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonEmail}</p>
                      ) : (
                        formData.contactPerson?.email &&
                        !validateEmail(formData.contactPerson.email) && (
                          <p className="mt-1 text-xs text-destructive">Invalid email format</p>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <div>
                      <Input
                        value={formData.contactPerson?.contactNumber || ""}
                        onChange={(e) => handleContactPersonChange("contactNumber", e.target.value)}
                        placeholder="09123456789 or +639123456789"
                        aria-invalid={
                          !!fieldErrors.contactPersonContactNumber ||
                          (!!formData.contactPerson?.contactNumber &&
                            !validatePhoneNumber(formData.contactPerson.contactNumber))
                        }
                      />
                      {fieldErrors.contactPersonContactNumber ? (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonContactNumber}</p>
                      ) : (
                        formData.contactPerson?.contactNumber &&
                        !validatePhoneNumber(formData.contactPerson.contactNumber) && (
                          <p className="mt-1 text-xs text-destructive">Invalid format. Use: 09XX, +63X, or 02 format</p>
                        )
                      )}
                    </div>
                  </div>
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
                        aria-invalid={
                          !!fieldErrors.companyTIN ||
                          (Boolean(formData.companyTIN) && !validateTIN(String(formData.companyTIN)))
                        }
                        value={formData.companyTIN || ""}
                        onChange={(e) => handleInputChange("companyTIN", e.target.value)}
                        placeholder="9-digit TIN (e.g., 123456789)"
                        maxLength={9}
                        className="aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20"
                      />
                      {formData.companyTIN && !validateTIN(formData.companyTIN) && (
                        <p className="text-xs text-destructive mt-1">TIN must be 9 digits</p>
                      )}
                      {fieldErrors.companyTIN && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.companyTIN}</p>
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.srsSubscriber || false}
                    onCheckedChange={(v) => handleInputChange("srsSubscriber", v)}
                  />
                  <Label>Would this establishment desire to be included as subscriber in the SRS when it becomes operational?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isManpowerAgency || false}
                    onCheckedChange={(v) => handleInputChange("isManpowerAgency", v)}
                  />
                  <Label>Is Manpower Agency?</Label>
                </div>
              </div>

              <div className="mt-4">
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="Additional remarks or notes"
                  rows={3}
                />
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
                    aria-invalid={!!fieldErrors.industryType}
                  />
                  {fieldErrors.industryType && (
                    <p className="text-xs text-destructive">{fieldErrors.industryType}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          industryType: industryCodes.map(({ code }) => code),
                        }));
                        clearFieldError("industryType");
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
                <h3 className="font-semibold text-lg mb-3">PREPARED BY</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      aria-invalid={!!fieldErrors.preparedByName}
                      value={formData.preparedByName || ""}
                      onChange={(e) => handleInputChange("preparedByName", e.target.value)}
                      placeholder="Full name"
                    />
                    {fieldErrors.preparedByName && <p className="mt-1 text-xs text-destructive">{fieldErrors.preparedByName}</p>}
                  </div>
                  <div>
                    <Label>Designation *</Label>
                    <Input
                      aria-invalid={!!fieldErrors.preparedByDesignation}
                      value={formData.preparedByDesignation || ""}
                      onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
                      placeholder="Job title"
                    />
                    {fieldErrors.preparedByDesignation && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.preparedByDesignation}</p>
                    )}
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
                    <Label>Date Accomplished</Label>
                    <Input
                      type="date"
                      value={getTodayIsoDate()}
                      disabled
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Auto-filled on submit</p>
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

                {/* DOLE Accreditation */}
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-semibold mb-2 block">DOLE Accreditation</Label>
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
