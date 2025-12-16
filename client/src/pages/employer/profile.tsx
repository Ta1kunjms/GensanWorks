/**
 * Employer Profile Page
 * Route: /employer/profile
 * Only accessible to users with role='employer'
 */
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Save, X, Edit3, Eye, Download } from "lucide-react";
import { useAuth, authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { industryNameMap } from "@shared/schema";
import { DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE } from "@/lib/locations";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

type ProfileState = {
  establishmentName: string;
  tradeName: string;
  dateEstablished: string;
  numberOfBranches: string;
  website: string;
  companyLogoName: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonNumber: string;
  contactEmail: string;
  contactNumber: string;
  houseStreetVillage: string;
  barangay: string;
  municipality: string;
  province: string;
  geographicCode: string;
  telNumber: string;
  barangayChairperson: string;
  chairpersonTelNumber: string;
  barangaySecretary: string;
  secretaryTelNumber: string;
  chairpersonContact: string;
  secretaryContact: string;
  numberOfPaidEmployees: string;
  numberOfVacantPositions: string;
  industryCodesText: string;
  industryCodes: string[];
  businessPermitNumber: string;
  bir2303Number: string;
  doleCertificationNumber: string;
  companyTin: string;
  remarks: string;
  preparedByName: string;
  preparedByDesignation: string;
  preparedByContact: string;
  dateAccomplished: string;
  srsSubscriber: boolean;
  manpowerAgency: boolean;
};

type AdditionalCompany = {
  id: string;
  establishmentName: string;
  address: string;
  contactEmail: string;
  contactNumber: string;
  industry: string;
  status: "Active" | "Inactive";
};

type NormalizedEmployerProfile = {
  mainCompany: ProfileState;
  additionalCompanies: AdditionalCompany[];
};

const emptyProfile: ProfileState = {
  establishmentName: "",
  tradeName: "",
  dateEstablished: "",
  numberOfBranches: "",
  website: "",
  companyLogoName: "",
  contactPersonName: "",
  contactPersonEmail: "",
  contactPersonNumber: "",
  contactEmail: "",
  contactNumber: "",
  houseStreetVillage: "",
  barangay: "",
  municipality: DEFAULT_MUNICIPALITY,
  province: DEFAULT_PROVINCE,
  geographicCode: "",
  telNumber: "",
  barangayChairperson: "",
  chairpersonTelNumber: "",
  barangaySecretary: "",
  secretaryTelNumber: "",
  chairpersonContact: "",
  secretaryContact: "",
  numberOfPaidEmployees: "",
  numberOfVacantPositions: "",
  industryCodesText: "",
  industryCodes: [],
  businessPermitNumber: "",
  bir2303Number: "",
  doleCertificationNumber: "",
  companyTin: "",
  remarks: "",
  preparedByName: "",
  preparedByDesignation: "",
  preparedByContact: "",
  dateAccomplished: "",
  srsSubscriber: false,
  manpowerAgency: false,
};

const emptyAdditionalCompany: AdditionalCompany = {
  id: "",
  establishmentName: "",
  address: "",
  contactEmail: "",
  contactNumber: "",
  industry: "",
  status: "Active",
};

const cloneCompanies = (companies: AdditionalCompany[]) => companies.map((company) => ({ ...company }));

const generateTempId = () => `temp-${Math.random().toString(36).slice(2, 10)}`;

const barangays = [
  "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang", "City Heights",
  "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West",
  "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
  "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay",
];

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  type EmployerProfileRequiredField =
    | "establishmentName"
    | "contactPersonName"
    | "contactPersonEmail"
    | "contactPersonNumber"
    | "contactEmail"
    | "contactNumber"
    | "houseStreetVillage"
    | "barangay"
    | "municipality"
    | "province"
    | "industryCodes"
    | "newCompanyEstablishmentName";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<EmployerProfileRequiredField>();

  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [formData, setFormData] = useState<ProfileState>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [accountStatus, setAccountStatus] = useState<"pending" | "active" | "rejected">("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [additionalCompanies, setAdditionalCompanies] = useState<AdditionalCompany[]>([]);
  const [additionalDraft, setAdditionalDraft] = useState<AdditionalCompany[]>([]);
  const [newCompanyDraft, setNewCompanyDraft] = useState<AdditionalCompany>(emptyAdditionalCompany);
  const [uploadedFiles, setUploadedFiles] = useState<{
    businessPermitFile?: File;
    bir2303File?: File;
    companyProfileFile?: File;
    doleCertificationFile?: File;
  }>({});
  const [existingFiles, setExistingFiles] = useState<{
    businessPermitFile?: any;
    bir2303File?: any;
    companyProfileFile?: any;
    doleCertificationFile?: any;
  }>({});
  const industryOptions = useMemo(() => Object.entries(industryNameMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([code, label]) => ({ code, label })), []);

  // ...existing code...

  // Show Google profile image if present
  const googleProfileImage = user?.profileImage || null;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await authFetch("/api/employer/profile");
        if (!res.ok) throw new Error("Failed to load employer profile");
        const data = await res.json();
        const normalized = normalizeEmployerProfile(data);
        const clonedAdditional = cloneCompanies(normalized.additionalCompanies);
        setProfile(normalized.mainCompany);
        setFormData(normalized.mainCompany);
        setAdditionalCompanies(clonedAdditional);
        setAdditionalDraft(cloneCompanies(clonedAdditional));
        setAccountStatus((data?.accountStatus || "pending") as any);
        setRejectionReason(typeof data?.rejectionReason === "string" && data.rejectionReason.trim() ? data.rejectionReason : null);
        // Load existing file metadata
        setExistingFiles({
          businessPermitFile: data.businessPermitFile,
          bir2303File: data.bir2303File,
          companyProfileFile: data.companyProfileFile,
          doleCertificationFile: data.doleCertificationFile,
        });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleInputChange = (field: keyof ProfileState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const clearableFields: EmployerProfileRequiredField[] = [
      "establishmentName",
      "contactPersonName",
      "contactPersonEmail",
      "contactPersonNumber",
      "contactEmail",
      "contactNumber",
      "houseStreetVillage",
      "barangay",
      "municipality",
      "province",
      "industryCodes",
    ];
    if (clearableFields.includes(field as EmployerProfileRequiredField)) {
      clearFieldError(field as EmployerProfileRequiredField);
    }
  };

  const startEditing = () => {
    setFormData({
      ...profile,
      municipality: profile.municipality?.trim() ? profile.municipality : DEFAULT_MUNICIPALITY,
      province: profile.province?.trim() ? profile.province : DEFAULT_PROVINCE,
    });
    setAdditionalDraft(cloneCompanies(additionalCompanies));
    setNewCompanyDraft({ ...emptyAdditionalCompany });
    setIsEditing(true);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleInputChange("companyLogoName", file ? file.name : "");
  };

  const handleFileUpload = (fileType: keyof typeof uploadedFiles, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const handleAdditionalChange = <K extends keyof AdditionalCompany>(
    index: number,
    field: K,
    value: AdditionalCompany[K],
  ) => {
    setAdditionalDraft(prev =>
      prev.map((company, i) => (i === index ? { ...company, [field]: value } : company))
    );
  };

  const handleNewCompanyDraftChange = <K extends keyof AdditionalCompany>(
    field: K,
    value: AdditionalCompany[K],
  ) => {
    setNewCompanyDraft(prev => ({ ...prev, [field]: value }));

    if (field === "establishmentName") {
      clearFieldError("newCompanyEstablishmentName");
    }
  };

  const handleAddCompany = () => {
    if (!newCompanyDraft.establishmentName.trim()) {
      const nextErrors: FieldErrors<EmployerProfileRequiredField> = {
        newCompanyEstablishmentName: "Company name is required",
      };
      setErrorsAndFocus(nextErrors);
      return;
    }

    const companyToAdd: AdditionalCompany = {
      ...newCompanyDraft,
      id: newCompanyDraft.id || generateTempId(),
    };

    setAdditionalDraft(prev => [...prev, companyToAdd]);
    setNewCompanyDraft({ ...emptyAdditionalCompany });
  };

  const handleRemoveCompany = (index: number) => {
    setAdditionalDraft(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const nextErrors: FieldErrors<EmployerProfileRequiredField> = {};

      if (!formData.establishmentName?.trim()) {
        nextErrors.establishmentName = "Company name is required";
      }

      if (!formData.contactPersonName?.trim()) {
        nextErrors.contactPersonName = "Contact person name is required";
      }

      if (!formData.contactPersonEmail?.trim()) {
        nextErrors.contactPersonEmail = "Contact person email is required";
      }

      if (!formData.contactPersonNumber?.trim()) {
        nextErrors.contactPersonNumber = "Contact person number is required";
      }

      if (!formData.contactEmail?.trim()) {
        nextErrors.contactEmail = "Email is required";
      }

      if (!formData.contactNumber?.trim()) {
        nextErrors.contactNumber = "Contact number is required";
      }

      if (!formData.houseStreetVillage?.trim()) {
        nextErrors.houseStreetVillage = "Address is required";
      }

      if (!formData.barangay?.trim()) {
        nextErrors.barangay = "Barangay is required";
      }

      if (!formData.municipality?.trim()) {
        nextErrors.municipality = "Municipality/City is required";
      }

      if (!formData.province?.trim()) {
        nextErrors.province = "Province is required";
      }

      if (!formData.industryCodes || formData.industryCodes.length === 0) {
        nextErrors.industryCodes = "Please select at least one industry type for your company.";
      }

      if (Object.keys(nextErrors).length > 0) {
        if (nextErrors.industryCodes) {
          setActiveTab("industry");
        } else if (nextErrors.barangay || nextErrors.municipality || nextErrors.province) {
          setActiveTab("address");
        } else {
          setActiveTab("personal");
        }

        setErrorsAndFocus(nextErrors);
        return;
      }

      setLoading(true);
      
      // Step 1: Upload files if any were selected
      let fileMetadata: any = {};
      if (Object.keys(uploadedFiles).length > 0) {
        const formDataFiles = new FormData();
        Object.entries(uploadedFiles).forEach(([key, file]) => {
          if (file) {
            formDataFiles.append(key, file);
          }
        });

        const uploadResponse = await authFetch("/api/upload/employer-docs", {
          method: "POST",
          body: formDataFiles,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload documents");

        const uploadResult = await uploadResponse.json();
        fileMetadata = uploadResult.files || {};
      }

      // Step 2: Submit employer data with file metadata
      const payload = {
        ...buildEmployerPayload(formData, additionalDraft),
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

      const res = await authFetch("/api/employer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update employer profile");

      const responseData: unknown = await res.json().catch(() => null);

      if (responseData) {
        const normalized = normalizeEmployerProfile(responseData as any);
        setProfile(normalized.mainCompany);
        setFormData(normalized.mainCompany);
        setAdditionalCompanies(cloneCompanies(normalized.additionalCompanies));
        setAdditionalDraft(cloneCompanies(normalized.additionalCompanies));
      } else {
        setProfile({ ...formData });
        setAdditionalCompanies(cloneCompanies(additionalDraft));
        setAdditionalDraft(cloneCompanies(additionalDraft));
      }

      setNewCompanyDraft({ ...emptyAdditionalCompany });
      setUploadedFiles({});
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setAdditionalDraft(cloneCompanies(additionalCompanies));
    setNewCompanyDraft({ ...emptyAdditionalCompany });
    setIsEditing(false);
  };

  if (loading) {
    return <Skeleton className="h-32 rounded-3xl" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 py-8 px-4">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6">
        {/* Profile Card Left */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-blue-100 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              alt="Profile"
              className="w-28 h-28 rounded-2xl object-cover shadow-lg"
            />
            <button
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg"
              onClick={() => {}}
              title="Edit profile image"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mt-4">{user?.name || "Sample Employer"}</h2>
          <p className="text-sm text-slate-500">Employer</p>
          <div className="mt-2 flex flex-col items-center gap-2">
            {accountStatus === "active" ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
            ) : accountStatus === "rejected" ? (
              <Badge variant="destructive">Rejected</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending Approval</Badge>
            )}
            {accountStatus !== "active" && (
              <p className="text-xs text-slate-500">You can edit your profile and upload documents, but job posting is disabled until approved.</p>
            )}
          </div>
        </aside>
        {/* Main Info Card Right */}
        <section className="flex-1">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-500">Profile Overview</p>
                {/* Title handled by TopNavbar. */}
                <p className="text-3xl font-semibold text-slate-900">SRS Form 2</p>
                <p className="text-slate-500 text-sm">Update your contact details and registry info.</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={startEditing} className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md" disabled={loading}>
                    <Edit3 className="w-4 h-4 mr-2" />Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" disabled={loading}>
                      <X className="w-4 h-4 mr-2" />Cancel
                    </Button>
                  </>
                )}
              </div>
            </header>

            {accountStatus !== "active" && (
              <div
                className={
                  accountStatus === "rejected"
                    ? "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    : "rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                }
              >
                <p className="font-semibold">
                  {accountStatus === "rejected" ? "Account rejected" : "Account pending approval"}
                </p>
                <p className="mt-1">
                  {accountStatus === "rejected"
                    ? "You cannot post job vacancies. Please update your details/documents and contact the admin."
                    : "You cannot post job vacancies yet. Complete your profile and upload documents for admin review."}
                </p>
                {accountStatus === "rejected" && rejectionReason && (
                  <p className="mt-2"><span className="font-semibold">Reason:</span> {rejectionReason}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Company Name *</p>
                <Input
                  aria-invalid={!!fieldErrors.establishmentName}
                  value={formData.establishmentName}
                  onChange={e => handleInputChange("establishmentName", e.target.value)}
                  placeholder="Enter company name"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
                {fieldErrors.establishmentName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.establishmentName}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Email *</p>
                <Input
                  aria-invalid={!!fieldErrors.contactEmail}
                  value={formData.contactEmail}
                  onChange={e => handleInputChange("contactEmail", e.target.value)}
                  placeholder="Enter email address"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
                {fieldErrors.contactEmail && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.contactEmail}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Contact Number *</p>
                <Input
                  aria-invalid={!!fieldErrors.contactNumber}
                  value={formData.contactNumber}
                  onChange={e => handleInputChange("contactNumber", e.target.value)}
                  placeholder="Enter contact number"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
                {fieldErrors.contactNumber && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.contactNumber}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Address *</p>
                <Input
                  aria-invalid={!!fieldErrors.houseStreetVillage}
                  value={formData.houseStreetVillage}
                  onChange={e => handleInputChange("houseStreetVillage", e.target.value)}
                  placeholder="Enter address"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
                {fieldErrors.houseStreetVillage && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.houseStreetVillage}</p>
                )}
              </div>
              {/* Additional suggested fields */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Date Established</p>
                <Input
                  type="date"
                  value={formData.dateEstablished || ""}
                  onChange={e => handleInputChange("dateEstablished", e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Number of Branches</p>
                <Input
                  type="number"
                  value={formData.numberOfBranches || ""}
                  onChange={e => handleInputChange("numberOfBranches", e.target.value)}
                  placeholder="Enter number of branches"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Website</p>
                <Input
                  value={formData.website || ""}
                  onChange={e => handleInputChange("website", e.target.value)}
                  placeholder="https://company.com"
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400">Company Logo</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="placeholder:text-slate-400"
                  disabled={!isEditing}
                />
                {formData.companyLogoName && (
                  <p className="mt-2 text-xs text-slate-500">Selected file: {formData.companyLogoName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">SRS Subscriber</p>
                  <p className="text-xs text-slate-500">Mark if this establishment is enrolled for PESO SRS Form 2 submissions.</p>
                </div>
                <Switch
                  checked={formData.srsSubscriber}
                  onCheckedChange={checked => handleInputChange("srsSubscriber", checked)}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Manpower Agency</p>
                  <p className="text-xs text-slate-500">Indicate if the business operates as a recruitment or manpower agency.</p>
                </div>
                <Switch
                  checked={formData.manpowerAgency}
                  onCheckedChange={checked => handleInputChange("manpowerAgency", checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            {/* Tabs for more info */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="mb-4 grid grid-cols-5 gap-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="industry">Industry</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Contact Person *</p>
                    <Input
                      aria-invalid={!!fieldErrors.contactPersonName}
                      value={formData.contactPersonName}
                      onChange={e => handleInputChange("contactPersonName", e.target.value)}
                      placeholder="Enter contact person name"
                      className="placeholder:text-slate-400"
                      disabled={!isEditing}
                    />
                    {fieldErrors.contactPersonName && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonName}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Contact Person Email *</p>
                    <Input
                      aria-invalid={!!fieldErrors.contactPersonEmail}
                      value={formData.contactPersonEmail}
                      onChange={e => handleInputChange("contactPersonEmail", e.target.value)}
                      placeholder="Enter contact person email"
                      className="placeholder:text-slate-400"
                      disabled={!isEditing}
                    />
                    {fieldErrors.contactPersonEmail && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonEmail}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Contact Person Number *</p>
                    <Input
                      aria-invalid={!!fieldErrors.contactPersonNumber}
                      value={formData.contactPersonNumber}
                      onChange={e => handleInputChange("contactPersonNumber", e.target.value)}
                      placeholder="Enter contact person number"
                      className="placeholder:text-slate-400"
                      disabled={!isEditing}
                    />
                    {fieldErrors.contactPersonNumber && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.contactPersonNumber}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Trade Name</p>
                    <Input
                      value={formData.tradeName}
                      onChange={e => handleInputChange("tradeName", e.target.value)}
                      placeholder="Enter trade name"
                      className="placeholder:text-slate-400"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Prepared By Information</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Name</p>
                          <Input
                            value={formData.preparedByName || ""}
                            onChange={(e) => handleInputChange("preparedByName", e.target.value)}
                            placeholder="Prepared by name"
                            className="placeholder:text-slate-400"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Designation</p>
                          <Input
                            value={formData.preparedByDesignation || ""}
                            onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
                            placeholder="Designation"
                            className="placeholder:text-slate-400"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Contact Number</p>
                          <Input
                            value={formData.preparedByContact || ""}
                            onChange={(e) => handleInputChange("preparedByContact", e.target.value)}
                            placeholder="Contact number"
                            className="placeholder:text-slate-400"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Date Accomplished</p>
                          <Input
                            type="date"
                            value={formData.dateAccomplished || ""}
                            className="placeholder:text-slate-400"
                            disabled
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Name</p>
                          <p className="text-sm text-slate-900">{formData.preparedByName?.trim() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Designation</p>
                          <p className="text-sm text-slate-900">{formData.preparedByDesignation?.trim() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Contact Number</p>
                          <p className="text-sm text-slate-900">{formData.preparedByContact?.trim() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Date Accomplished</p>
                          <p className="text-sm text-slate-900">{formData.dateAccomplished?.trim() || "N/A"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              {/* ...existing tab contents remain unchanged, but add placeholder and disabled logic to all inputs ... */}
              {/* Address Tab */}
              <TabsContent value="address">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Barangay *</p>
                      <Select
                        value={formData.barangay}
                        onValueChange={value => handleInputChange("barangay", value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.barangay}>
                          <SelectValue placeholder="Select barangay" />
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
                      <p className="text-xs font-semibold text-slate-500">Municipality/City *</p>
                      <Input
                        aria-invalid={!!fieldErrors.municipality}
                        value={formData.municipality || ""}
                        onChange={e => handleInputChange("municipality", e.target.value)}
                        placeholder="Municipality/City"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      {fieldErrors.municipality && (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.municipality}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Province *</p>
                      <Input
                        aria-invalid={!!fieldErrors.province}
                        value={formData.province || ""}
                        onChange={e => handleInputChange("province", e.target.value)}
                        placeholder="Province"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      {fieldErrors.province && (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.province}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">GEOGRAPHIC IDENTIFICATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Geographic Code</p>
                        <Input
                          value={formData.geographicCode || ""}
                          onChange={e => handleInputChange("geographicCode", e.target.value)}
                          placeholder="Enter geographic code"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Tel. No.</p>
                        <Input
                          value={formData.telNumber || ""}
                          onChange={e => handleInputChange("telNumber", e.target.value)}
                          placeholder="Telephone number"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">BARANGAY OFFICIALS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Barangay Chairperson</p>
                        <Input
                          value={formData.barangayChairperson || ""}
                          onChange={e => handleInputChange("barangayChairperson", e.target.value)}
                          placeholder="Chairperson name"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Chairperson Tel. No.</p>
                        <Input
                          value={formData.chairpersonTelNumber || ""}
                          onChange={e => handleInputChange("chairpersonTelNumber", e.target.value)}
                          placeholder="Telephone number"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Barangay Secretary</p>
                        <Input
                          value={formData.barangaySecretary || ""}
                          onChange={e => handleInputChange("barangaySecretary", e.target.value)}
                          placeholder="Secretary name"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Secretary Tel. No.</p>
                        <Input
                          value={formData.secretaryTelNumber || ""}
                          onChange={e => handleInputChange("secretaryTelNumber", e.target.value)}
                          placeholder="Telephone number"
                          className="placeholder:text-slate-400"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              {/* Employment Tab */}
              <TabsContent value="employment">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Paid Employees</p>
                      <Input
                        type="number"
                        value={formData.numberOfPaidEmployees}
                        onChange={e => handleInputChange("numberOfPaidEmployees", e.target.value)}
                        placeholder="Enter number of paid employees"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Vacant Positions</p>
                      <Input
                        type="number"
                        value={formData.numberOfVacantPositions}
                        onChange={e => handleInputChange("numberOfVacantPositions", e.target.value)}
                        placeholder="Enter number of vacant positions"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Switch
                        checked={formData.srsSubscriber}
                        onCheckedChange={v => handleInputChange("srsSubscriber", v)}
                        disabled={!isEditing}
                      />
                      <label className="text-sm text-slate-700">
                        Would this establishment desire to be included as subscriber in the SRS when it becomes operational?
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.manpowerAgency}
                        onCheckedChange={v => handleInputChange("manpowerAgency", v)}
                        disabled={!isEditing}
                      />
                      <label className="text-sm text-slate-700">Is Manpower Agency?</label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Remarks</p>
                    <Textarea
                      value={formData.remarks || ""}
                      onChange={e => handleInputChange("remarks", e.target.value)}
                      placeholder="Additional remarks or notes"
                      className="placeholder:text-slate-400"
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              {/* Industry Tab */}
              <TabsContent value="industry">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-500">Industry Codes</p>
                    <span className="text-xs text-red-600">* Required - Select at least one</span>
                  </div>
                  {fieldErrors.industryCodes ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      ⚠️ {fieldErrors.industryCodes}
                    </div>
                  ) : formData.industryCodes.length === 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      ⚠️ Please select at least one industry type to save your profile.
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {industryOptions.map((item) => (
                        <label
                          key={item.code}
                          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 aria-[invalid=true]:border-destructive"
                          aria-invalid={!!fieldErrors.industryCodes}
                        >
                          <Checkbox
                            checked={formData.industryCodes.includes(item.code)}
                            onCheckedChange={(checked) => {
                              if (!isEditing) return;
                              handleInputChange(
                                "industryCodes",
                                checked
                                  ? [...formData.industryCodes, item.code]
                                  : formData.industryCodes.filter((c) => c !== item.code)
                              );
                              clearFieldError("industryCodes");
                            }}
                            disabled={!isEditing}
                          />
                          <span className="whitespace-pre-wrap">{item.code} - {item.label}</span>
                        </label>
                      ))}
                  </div>
                  <p className="text-xs text-slate-500">Selected: {formData.industryCodes.join(", ") || "None"}</p>
                </div>
              </TabsContent>
              {/* Documents Tab */}
              <TabsContent value="documents">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Business Permit No.</p>
                      <Input
                        value={formData.businessPermitNumber}
                        onChange={e => handleInputChange("businessPermitNumber", e.target.value)}
                        placeholder="Enter business permit number"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">BIR Form 2303</p>
                      <Input
                        value={formData.bir2303Number}
                        onChange={e => handleInputChange("bir2303Number", e.target.value)}
                        placeholder="Enter BIR 2303 number"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">DOLE Accreditation</p>
                      <Input
                        value={formData.doleCertificationNumber}
                        onChange={e => handleInputChange("doleCertificationNumber", e.target.value)}
                        placeholder="Enter DOLE accreditation number"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Company TIN</p>
                      <Input
                        value={formData.companyTin}
                        onChange={e => handleInputChange("companyTin", e.target.value)}
                        placeholder="Enter company TIN"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Files for Review</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Upload your supporting documents. These will be reviewed by the admin before your account is approved.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Business Permit File */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Business Permit</p>
                        {existingFiles.businessPermitFile && !uploadedFiles.businessPermitFile && (
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">✓ Currently uploaded:</span>
                              <span className="text-xs font-medium">{existingFiles.businessPermitFile.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(existingFiles.businessPermitFile?.path || existingFiles.businessPermitFile?.url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button type="button" variant="outline" size="sm" asChild>
                                <a
                                  href={existingFiles.businessPermitFile?.path || existingFiles.businessPermitFile?.url}
                                  download={existingFiles.businessPermitFile?.name}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.businessPermitFile && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-blue-600">📎 New file selected:</span>
                            <span className="text-xs font-medium">{uploadedFiles.businessPermitFile.name}</span>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload("businessPermitFile", e)}
                          disabled={!isEditing}
                          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      {/* BIR 2303 File */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700 mb-2">BIR Form 2303</p>
                        {existingFiles.bir2303File && !uploadedFiles.bir2303File && (
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">✓ Currently uploaded:</span>
                              <span className="text-xs font-medium">{existingFiles.bir2303File.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(existingFiles.bir2303File?.path || existingFiles.bir2303File?.url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button type="button" variant="outline" size="sm" asChild>
                                <a
                                  href={existingFiles.bir2303File?.path || existingFiles.bir2303File?.url}
                                  download={existingFiles.bir2303File?.name}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.bir2303File && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-blue-600">📎 New file selected:</span>
                            <span className="text-xs font-medium">{uploadedFiles.bir2303File.name}</span>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload("bir2303File", e)}
                          disabled={!isEditing}
                          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      {/* Company Profile File */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Company Profile</p>
                        {existingFiles.companyProfileFile && !uploadedFiles.companyProfileFile && (
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">✓ Currently uploaded:</span>
                              <span className="text-xs font-medium">{existingFiles.companyProfileFile.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(existingFiles.companyProfileFile?.path || existingFiles.companyProfileFile?.url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button type="button" variant="outline" size="sm" asChild>
                                <a
                                  href={existingFiles.companyProfileFile?.path || existingFiles.companyProfileFile?.url}
                                  download={existingFiles.companyProfileFile?.name}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.companyProfileFile && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-blue-600">📎 New file selected:</span>
                            <span className="text-xs font-medium">{uploadedFiles.companyProfileFile.name}</span>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload("companyProfileFile", e)}
                          disabled={!isEditing}
                          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      {/* DOLE Accreditation File */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-700 mb-2">DOLE Accreditation</p>
                          {existingFiles.doleCertificationFile && !uploadedFiles.doleCertificationFile && (
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600">✓ Currently uploaded:</span>
                                <span className="text-xs font-medium">{existingFiles.doleCertificationFile.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(existingFiles.doleCertificationFile?.path || existingFiles.doleCertificationFile?.url, "_blank")}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <a
                                    href={existingFiles.doleCertificationFile?.path || existingFiles.doleCertificationFile?.url}
                                    download={existingFiles.doleCertificationFile?.name}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}
                          {uploadedFiles.doleCertificationFile && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-blue-600">📎 New file selected:</span>
                              <span className="text-xs font-medium">{uploadedFiles.doleCertificationFile.name}</span>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                            onChange={(e) => handleFileUpload("doleCertificationFile", e)}
                            disabled={!isEditing}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-6 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
              Keep your profile up-to-date to comply with PESO employer registry standards.
            </div>
          </div>
          <Card className="mt-6 rounded-3xl border border-slate-100 shadow-xl">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">Additional Companies & Branches</CardTitle>
                <p className="text-sm text-slate-500">Manage other establishments attached to this employer account.</p>
              </div>
              {!isEditing && additionalCompanies.length > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {additionalCompanies.length} registered
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {additionalDraft.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No additional companies yet. {isEditing ? "Use the form below to add one." : "Switch to edit mode to add more establishments."}
                </div>
              ) : (
                additionalDraft.map((company, index) => (
                  <div
                    key={company.id || `company-${index}`}
                    className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={company.establishmentName}
                        onChange={event => handleAdditionalChange(index, "establishmentName", event.target.value)}
                        placeholder="Company or branch name"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      <Input
                        value={company.address}
                        onChange={event => handleAdditionalChange(index, "address", event.target.value)}
                        placeholder="Complete address"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      <Input
                        value={company.contactEmail}
                        onChange={event => handleAdditionalChange(index, "contactEmail", event.target.value)}
                        placeholder="Email address"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      <Input
                        value={company.contactNumber}
                        onChange={event => handleAdditionalChange(index, "contactNumber", event.target.value)}
                        placeholder="Contact number"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      <Input
                        value={company.industry}
                        onChange={event => handleAdditionalChange(index, "industry", event.target.value)}
                        placeholder="Industry or business line"
                        className="placeholder:text-slate-400"
                        disabled={!isEditing}
                      />
                      <select
                        value={company.status}
                        onChange={event => handleAdditionalChange(index, "status", event.target.value as AdditionalCompany["status"])}
                        className="w-full rounded-lg border px-3 py-2 text-slate-700 bg-white"
                        disabled={!isEditing}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    {isEditing && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          className="text-sm text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveCompany(index)}
                        >
                          Remove Company
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isEditing && (
                <div className="space-y-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
                  <h3 className="text-sm font-semibold text-blue-700">Add another company</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={newCompanyDraft.establishmentName}
                      onChange={event => handleNewCompanyDraftChange("establishmentName", event.target.value)}
                      placeholder="Company or branch name"
                      className="placeholder:text-slate-400"
                      aria-invalid={!!fieldErrors.newCompanyEstablishmentName}
                    />
                    {fieldErrors.newCompanyEstablishmentName && (
                      <p className="-mt-2 md:col-span-2 text-xs text-destructive">
                        {fieldErrors.newCompanyEstablishmentName}
                      </p>
                    )}
                    <Input
                      value={newCompanyDraft.address}
                      onChange={event => handleNewCompanyDraftChange("address", event.target.value)}
                      placeholder="Complete address"
                      className="placeholder:text-slate-400"
                    />
                    <Input
                      value={newCompanyDraft.contactEmail}
                      onChange={event => handleNewCompanyDraftChange("contactEmail", event.target.value)}
                      placeholder="Email address"
                      className="placeholder:text-slate-400"
                    />
                    <Input
                      value={newCompanyDraft.contactNumber}
                      onChange={event => handleNewCompanyDraftChange("contactNumber", event.target.value)}
                      placeholder="Contact number"
                      className="placeholder:text-slate-400"
                    />
                    <Input
                      value={newCompanyDraft.industry}
                      onChange={event => handleNewCompanyDraftChange("industry", event.target.value)}
                      placeholder="Industry or business line"
                      className="placeholder:text-slate-400"
                    />
                    <select
                      value={newCompanyDraft.status}
                      onChange={event => handleNewCompanyDraftChange("status", event.target.value as AdditionalCompany["status"])}
                      className="w-full rounded-lg border px-3 py-2 text-slate-700 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddCompany} className="bg-blue-600 text-white hover:bg-blue-700">
                      Save Company
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function normalizeEmployerProfile(data: any): NormalizedEmployerProfile {
  const pickFirstNonEmptyString = (...values: any[]) => {
    for (const value of values) {
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    return "";
  };

  const establishmentsArray = Array.isArray(data?.establishments) ? data.establishments : [];
  const primarySource = establishmentsArray[0] ?? data ?? {};
  const contactPerson = primarySource.contactPerson ?? primarySource.contact_person ?? {};
  const industryCodesRaw = primarySource.industryCodes ?? primarySource.industry_codes ?? primarySource.industryCodesText;
  const industryCodesArr = Array.isArray(industryCodesRaw)
    ? industryCodesRaw.map((c: any) => String(c).trim()).filter(Boolean)
    : typeof industryCodesRaw === "string"
    ? industryCodesRaw.split(",").map((c: string) => c.trim()).filter(Boolean)
    : [];
  const formattedIndustryCodes = industryCodesArr.join(", ");

  const mainCompany: ProfileState = {
    ...emptyProfile,
    establishmentName: primarySource.establishmentName ?? primarySource.companyName ?? "",
    tradeName: primarySource.tradeName ?? primarySource.businessName ?? "",
    dateEstablished: primarySource.dateEstablished ?? primarySource.yearEstablished ?? "",
    numberOfBranches:
      primarySource.numberOfBranches !== undefined && primarySource.numberOfBranches !== null
        ? String(primarySource.numberOfBranches)
        : "",
    website: primarySource.website ?? primarySource.websiteUrl ?? "",
    companyLogoName: primarySource.companyLogoName ?? primarySource.logoFileName ?? "",
    contactPersonName: contactPerson.personName ?? contactPerson.name ?? "",
    contactPersonEmail: contactPerson.email ?? "",
    contactPersonNumber: contactPerson.contactNumber ?? contactPerson.phone ?? "",
    contactEmail: primarySource.contactEmail ?? primarySource.email ?? "",
    contactNumber: primarySource.contactNumber ?? primarySource.phone ?? "",
    houseStreetVillage: primarySource.houseStreetVillage ?? primarySource.street ?? "",
    barangay: primarySource.barangay ?? "",
    municipality: pickFirstNonEmptyString(primarySource.municipality, primarySource.city, DEFAULT_MUNICIPALITY) || DEFAULT_MUNICIPALITY,
    province: pickFirstNonEmptyString(primarySource.province, DEFAULT_PROVINCE) || DEFAULT_PROVINCE,
    geographicCode: primarySource.geographicCode ?? "",
    telNumber: primarySource.telNumber ?? "",
    barangayChairperson: primarySource.barangayChairperson ?? "",
    chairpersonTelNumber: primarySource.chairpersonTelNumber ?? "",
    barangaySecretary: primarySource.barangaySecretary ?? "",
    secretaryTelNumber: primarySource.secretaryTelNumber ?? "",
    chairpersonContact: primarySource.chairpersonContact ?? "",
    secretaryContact: primarySource.secretaryContact ?? "",
    numberOfPaidEmployees:
      primarySource.numberOfPaidEmployees !== undefined && primarySource.numberOfPaidEmployees !== null
        ? String(primarySource.numberOfPaidEmployees)
        : "",
    numberOfVacantPositions:
      primarySource.numberOfVacantPositions !== undefined && primarySource.numberOfVacantPositions !== null
        ? String(primarySource.numberOfVacantPositions)
        : "",
    industryCodesText: formattedIndustryCodes,
    industryCodes: industryCodesArr,
    businessPermitNumber: primarySource.businessPermitNumber ?? "",
    bir2303Number: primarySource.bir2303Number ?? "",
    doleCertificationNumber: primarySource.doleCertificationNumber ?? "",
    companyTin: primarySource.companyTin ?? primarySource.tin ?? "",
    remarks: primarySource.remarks ?? "",
    preparedByName: primarySource.preparedByName ?? "",
    preparedByDesignation: primarySource.preparedByDesignation ?? "",
    preparedByContact: primarySource.preparedByContact ?? "",
    dateAccomplished: primarySource.dateAccomplished ?? "",
    srsSubscriber: Boolean(primarySource.srsSubscriber),
    manpowerAgency: Boolean(primarySource.manpowerAgency),
  };

  const additionalSources = [
    ...establishmentsArray.slice(1),
    ...(Array.isArray(data?.additionalEstablishments) ? data.additionalEstablishments : []),
    ...(Array.isArray(primarySource.additionalEstablishments) ? primarySource.additionalEstablishments : []),
  ];

  const additionalCompaniesMap = new Map<string, AdditionalCompany>();

  additionalSources.forEach((est: any, index: number) => {
    if (!est) return;

    const addressParts = [
      est.address,
      est.houseStreetVillage,
      est.barangay,
      est.municipality,
      est.province,
    ].filter(Boolean);

    const industrySource = est.industryCodes ?? est.industry_codes ?? est.industry;
    const normalizedCompany: AdditionalCompany = {
      id: est.id?.toString?.() ?? est.establishmentId ?? generateTempId(),
      establishmentName: est.establishmentName ?? est.tradeName ?? est.name ?? `Additional Company ${index + 1}`,
      address: addressParts.join(", ") || "",
      contactEmail: est.contactEmail ?? est.email ?? "",
      contactNumber: est.contactNumber ?? est.phone ?? "",
      industry: Array.isArray(industrySource)
        ? industrySource.join(", ")
        : typeof industrySource === "string"
        ? industrySource
        : "",
      status: est.status === "Inactive" ? "Inactive" : "Active",
    };

    additionalCompaniesMap.set(normalizedCompany.id || `est-${index}`, normalizedCompany);
  });

  return {
    mainCompany,
    additionalCompanies: Array.from(additionalCompaniesMap.values()),
  };
}

const buildEmployerPayload = (state: ProfileState, additionalCompanies: AdditionalCompany[]) => {
  const toNumber = (value: string) => {
    if (!value?.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const industryCodes = (state.industryCodes && state.industryCodes.length > 0
    ? state.industryCodes
    : state.industryCodesText
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean)) || [];

  return {
    establishmentName: state.establishmentName,
    tradeName: state.tradeName,
    dateEstablished: state.dateEstablished || undefined,
    numberOfBranches: toNumber(state.numberOfBranches),
    website: state.website || undefined,
    companyLogoName: state.companyLogoName || undefined,
    contactNumber: state.contactNumber,
    contactEmail: state.contactEmail,
    contactPerson: {
      personName: state.contactPersonName,
      email: state.contactPersonEmail,
      contactNumber: state.contactPersonNumber,
    },
    houseStreetVillage: state.houseStreetVillage,
    barangay: state.barangay,
    municipality: state.municipality,
    province: state.province,
    geographicCode: state.geographicCode || undefined,
    telNumber: state.telNumber || undefined,
    barangayChairperson: state.barangayChairperson || undefined,
    chairpersonTelNumber: state.chairpersonTelNumber || undefined,
    barangaySecretary: state.barangaySecretary || undefined,
    secretaryTelNumber: state.secretaryTelNumber || undefined,
    chairpersonContact: state.chairpersonContact || undefined,
    secretaryContact: state.secretaryContact || undefined,
    numberOfPaidEmployees: toNumber(state.numberOfPaidEmployees),
    numberOfVacantPositions: toNumber(state.numberOfVacantPositions),
    industryCodes,
    businessPermitNumber: state.businessPermitNumber || undefined,
    bir2303Number: state.bir2303Number || undefined,
    doleCertificationNumber: state.doleCertificationNumber || undefined,
    companyTin: state.companyTin || undefined,
    remarks: state.remarks || undefined,
    manpowerAgency: state.manpowerAgency,
    srsSubscriber: state.srsSubscriber,
    preparedByName: state.preparedByName || undefined,
    preparedByDesignation: state.preparedByDesignation || undefined,
    preparedByContact: state.preparedByContact || undefined,
    dateAccomplished: state.dateAccomplished || undefined,
    additionalEstablishments: additionalCompanies.map((company) => ({
      id: company.id.startsWith("temp-") ? undefined : company.id,
      establishmentName: company.establishmentName,
      address: company.address,
      contactEmail: company.contactEmail,
      contactNumber: company.contactNumber,
      industry: company.industry,
      status: company.status,
    })),
  };
};
