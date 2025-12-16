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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authFetch } from "@/lib/auth";
import { industryNameMap } from "@shared/schema";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

type ContactPerson = {
  personName: string;
  email: string;
  contactNumber: string;
  designation: string;
};

interface EditEmployerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employer: any;
  onEmployerUpdated?: () => void;
}

const industryEntries = Object.entries(industryNameMap)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => Number(a.code) - Number(b.code));

const industryLabelLookup = industryEntries.reduce<Record<string, string>>((acc, { code, label }) => {
  acc[label.toLowerCase()] = code;
  acc[`${code} - ${label}`.toLowerCase()] = code;
  return acc;
}, {});

const normalizeIndustrySelection = (values?: Array<unknown> | null) => {
  if (!Array.isArray(values)) return [];
  const deduped = new Set<string>();
  values.forEach((raw) => {
    if (raw == null) return;

    let value: string | undefined;
    if (typeof raw === "string" || typeof raw === "number") {
      value = String(raw);
    } else if (typeof raw === "object") {
      const candidate =
        (raw as { code?: string }).code ??
        (raw as { value?: string }).value ??
        (raw as { label?: string }).label;
      if (typeof candidate === "string") {
        value = candidate;
      }
    }

    if (!value) return;
    value = value.trim();
    if (!value) return;
    if (industryNameMap[value as keyof typeof industryNameMap]) {
      deduped.add(value);
      return;
    }
    const lookupKey = value.toLowerCase();
    const fromLabel = industryLabelLookup[lookupKey];
    if (fromLabel) {
      deduped.add(fromLabel);
      return;
    }
    const numericMatch = value.match(/^(\d{1,2})/);
    if (numericMatch) {
      const candidate = numericMatch[1].padStart(2, "0");
      if (industryNameMap[candidate as keyof typeof industryNameMap]) {
        deduped.add(candidate);
      }
    }
  });
  return Array.from(deduped);
};

const normalizeContactPerson = (value?: Partial<ContactPerson> | null): ContactPerson => ({
  personName: value?.personName || "",
  email: value?.email || "",
  contactNumber: value?.contactNumber || "",
  designation: value?.designation || "",
});

export function EditEmployerModal({
  open,
  onOpenChange,
  employer,
  onEmployerUpdated,
}: EditEmployerModalProps) {
  const { toast } = useToast();

  type EditEmployerRequiredField = "establishmentName" | "industryType";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<EditEmployerRequiredField>();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    ...(employer || {}),
    industryType: Array.isArray(employer?.industryType) ? employer.industryType : normalizeIndustrySelection(employer?.industryType),
    industryCodes: Array.isArray(employer?.industryCodes) ? employer.industryCodes : normalizeIndustrySelection(employer?.industryCodes),
    contactPerson: normalizeContactPerson(employer?.contactPerson),
    alternateContacts: Array.isArray(employer?.alternateContacts) ? employer.alternateContacts : [],
    requirements: Array.isArray(employer?.requirements) ? employer.requirements : [],
    attachments: Array.isArray(employer?.attachments) ? employer.attachments : [],
    archived: !!employer?.archived,
    complianceStatus: employer?.complianceStatus || "pending",
  }));

  useEffect(() => {
    if (!employer) {
      setFormData({ industryType: [] });
      return;
    }
    const normalizedIndustry = normalizeIndustrySelection(employer.industryCodes || employer.industryType);
    setFormData({
      ...employer,
      industryType: Array.isArray(employer?.industryType) ? employer.industryType : normalizedIndustry,
      industryCodes: Array.isArray(employer?.industryCodes) ? employer.industryCodes : normalizedIndustry,
      contactPerson: normalizeContactPerson(employer?.contactPerson),
      alternateContacts: Array.isArray(employer?.alternateContacts) ? employer.alternateContacts : [],
      requirements: Array.isArray(employer?.requirements) ? employer.requirements : [],
      attachments: Array.isArray(employer?.attachments) ? employer.attachments : [],
      archived: !!employer?.archived,
      complianceStatus: employer?.complianceStatus || "pending",
    });
  }, [employer, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "establishmentName") {
      clearFieldError("establishmentName");
    }
  };

  const handleIndustryToggle = (code: string) => {
    setFormData((prev: any) => {
      const current = prev.industryType || [];
      const nextSelection = current.includes(code)
        ? current.filter((c: string) => c !== code)
        : [...current, code];
      return {
        ...prev,
        industryType: nextSelection,
        industryCodes: nextSelection,
      };
    });

    clearFieldError("industryType");
  };

  const handleContactPersonChange = (field: keyof ContactPerson, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      contactPerson: {
        ...normalizeContactPerson(prev.contactPerson as ContactPerson),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const nextErrors: FieldErrors<EditEmployerRequiredField> = {};
    if (!String(formData.establishmentName || "").trim()) {
      nextErrors.establishmentName = "Establishment name is required";
    }
    const industrySelection = (formData.industryType || []).filter(Boolean);
    if (industrySelection.length === 0) {
      nextErrors.industryType = "Please select at least one industry";
    }
    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return;
    }

    setLoading(true);
    try {
      // Normalize all fields before sending
      const payload = {
        ...formData,
        industryType: Array.isArray(formData.industryType) ? formData.industryType : normalizeIndustrySelection(formData.industryType),
        industryCodes: Array.isArray(formData.industryCodes) ? formData.industryCodes : normalizeIndustrySelection(formData.industryCodes),
        contactPerson: normalizeContactPerson(formData.contactPerson),
        alternateContacts: Array.isArray(formData.alternateContacts) ? formData.alternateContacts : [],
        requirements: typeof formData.requirements === 'object' && !Array.isArray(formData.requirements) ? formData.requirements : {},
        attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
        archived: !!formData.archived,
        complianceStatus: formData.complianceStatus || "pending",
        numberOfPaidEmployees: Number(formData.numberOfPaidEmployees) || 0,
        numberOfVacantPositions: Number(formData.numberOfVacantPositions) || 0,
        addressDetails: {
          barangay: formData.barangay || "",
          municipality: formData.municipality || "",
          province: formData.province || "",
          ...(typeof formData.addressDetails === 'object' && formData.addressDetails !== null ? formData.addressDetails : {})
        },
        geographicIdentification: {
          barangay: formData.barangay || "",
          municipality: formData.municipality || "",
          province: formData.province || "",
          ...(typeof formData.geographicIdentification === 'object' && formData.geographicIdentification !== null ? formData.geographicIdentification : {})
        },
        contactEmail: typeof formData.contactEmail === 'string' && formData.contactEmail.includes('@') ? formData.contactEmail : (formData.email && formData.email.includes('@') ? formData.email : ""),
        subscriptionStatus: ['subscriber', 'non-subscriber', 'undecided'].includes(formData.subscriptionStatus) ? formData.subscriptionStatus : 'undecided',
        additionalEstablishments: Array.isArray(formData.additionalEstablishments) ? formData.additionalEstablishments : [],
      };
      const res = await authFetch(`/api/employers/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to update employer";
        try {
          const errorBody = await res.json();
          message = errorBody?.message || errorBody?.error || message;
        } catch (parseError) {
          // ignore JSON parse issues and fall back to default message
        }
        throw new Error(message);
      }

      toast({
        title: "Success",
        description: "Employer updated successfully",
      });

      onOpenChange(false);
      onEmployerUpdated?.();
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-blue-700 dark:text-blue-300">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 rounded-full p-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M6 10h.01M6 13h.01M6 16h.01M9 10h.01M9 13h.01M9 16h.01M12 10h.01M12 13h.01M12 16h.01M15 10h.01M15 13h.01M15 16h.01"/></svg>
            </span>
            Edit Employer — {formData.establishmentName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 sticky top-0 mb-4">
            <TabsTrigger value="info">Establishment Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="geo">Geographic</TabsTrigger>
            <TabsTrigger value="employment">Employment & Industry</TabsTrigger>
            <TabsTrigger value="details">Documents & Officials</TabsTrigger>
          </TabsList>

                            <div className="p-4 overflow-y-auto flex-1 space-y-10">
                              {/* Contact & Company Tab */}
                              <TabsContent value="info" className="space-y-8">
                                <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                                  <span className="font-semibold text-lg">Contact & Company Info</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label>Establishment Name *</Label>
                                    <Input
                                      aria-invalid={!!fieldErrors.establishmentName}
                                      value={formData.establishmentName || ""}
                                      onChange={(e) => handleInputChange("establishmentName", e.target.value)}
                                      placeholder="Establishment Name"
                                    />
                                    {fieldErrors.establishmentName && (
                                      <p className="mt-1 text-xs text-destructive">{fieldErrors.establishmentName}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Contact Number</Label>
                                    <Input value={formData.contactNumber || ""} onChange={e => handleInputChange("contactNumber", e.target.value)} placeholder="Contact Number" />
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <Input type="email" value={formData.email || ""} onChange={e => handleInputChange("email", e.target.value)} placeholder="Email" />
                                  </div>
                                  <div>
                                    <Label>Contact Person Name *</Label>
                                    <Input value={formData.contactPerson?.personName || ""} onChange={e => handleContactPersonChange("personName", e.target.value)} placeholder="Primary contact name" />
                                  </div>
                                  <div>
                                    <Label>Contact Person Designation</Label>
                                    <Input value={formData.contactPerson?.designation || ""} onChange={e => handleContactPersonChange("designation", e.target.value)} placeholder="Designation" />
                                  </div>
                                  <div>
                                    <Label>Contact Person Email</Label>
                                    <Input type="email" value={formData.contactPerson?.email || ""} onChange={e => handleContactPersonChange("email", e.target.value)} placeholder="name@company.com" />
                                  </div>
                                  <div>
                                    <Label>Contact Person Number</Label>
                                    <Input value={formData.contactPerson?.contactNumber || ""} onChange={e => handleContactPersonChange("contactNumber", e.target.value)} placeholder="09XXXXXXXXX" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                  <div>
                                    <Label>Company TIN</Label>
                                    <Input value={formData.companyTIN || ""} onChange={e => handleInputChange("companyTIN", e.target.value)} placeholder="Company TIN" />
                                  </div>
                                  <div>
                                    <Label>Business Permit Number</Label>
                                    <Input value={formData.businessPermitNumber || ""} onChange={e => handleInputChange("businessPermitNumber", e.target.value)} placeholder="Business Permit Number" />
                                  </div>
                                  <div>
                                    <Label>BIR 2303 Number</Label>
                                    <Input value={formData.bir2303Number || ""} onChange={e => handleInputChange("bir2303Number", e.target.value)} placeholder="BIR 2303 Number" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 mt-6">
                                  <Checkbox checked={formData.srsSubscriber || false} onCheckedChange={checked => handleInputChange("srsSubscriber", checked)} />
                                  <Label className="text-sm font-normal cursor-pointer">SRS Subscriber</Label>
                                  <Checkbox checked={formData.isManpowerAgency || false} onCheckedChange={checked => handleInputChange("isManpowerAgency", checked)} />
                                  <Label className="text-sm font-normal cursor-pointer">Is Manpower Agency</Label>
                                  {formData.isManpowerAgency && (
                                    <div className="flex flex-col">
                                      <Label>DOLE Certification Number</Label>
                                      <Input value={formData.doleCertificationNumber || ""} onChange={e => handleInputChange("doleCertificationNumber", e.target.value)} placeholder="DOLE Certification Number" />
                                    </div>
                                  )}
                                </div>
                              </TabsContent>

                              {/* Address Tab */}
                              <TabsContent value="address" className="space-y-8">
                                <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l6 4"/></svg>
                                  <span className="font-semibold text-lg">Complete Address (SRS Form 2)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label>House/Street/Village</Label>
                                    <Input value={formData.houseStreetVillage || ""} onChange={e => handleInputChange("houseStreetVillage", e.target.value)} placeholder="House/Street/Village" />
                                  </div>
                                  <div>
                                    <Label>Barangay</Label>
                                    <Input value={formData.barangay || ""} onChange={e => handleInputChange("barangay", e.target.value)} placeholder="Barangay" />
                                  </div>
                                  <div>
                                    <Label>Municipality</Label>
                                    <Input value={formData.municipality || ""} onChange={e => handleInputChange("municipality", e.target.value)} placeholder="Municipality" />
                                  </div>
                                  <div>
                                    <Label>Province</Label>
                                    <Input value={formData.province || ""} onChange={e => handleInputChange("province", e.target.value)} placeholder="Province" />
                                  </div>
                                </div>
                              </TabsContent>

                              {/* Geographic Identification Tab */}
                              <TabsContent value="geo" className="space-y-8">
                                <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                  <span className="font-semibold text-lg">Geographic Identification (SRS Form 2)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label>Province</Label>
                                    <Input value={formData.province || ""} onChange={e => handleInputChange("province", e.target.value)} placeholder="Province" />
                                  </div>
                                  <div>
                                    <Label>Municipality/City</Label>
                                    <Input value={formData.municipality || ""} onChange={e => handleInputChange("municipality", e.target.value)} placeholder="Municipality/City" />
                                  </div>
                                  <div>
                                    <Label>Barangay</Label>
                                    <Input value={formData.barangay || ""} onChange={e => handleInputChange("barangay", e.target.value)} placeholder="Barangay" />
                                  </div>
                                  <div>
                                    <Label>Geographic Code</Label>
                                    <Input value={formData.geographicCode || ""} onChange={e => handleInputChange("geographicCode", e.target.value)} placeholder="Geographic Code" />
                                  </div>
                                  <div>
                                    <Label>Tel. No.</Label>
                                    <Input value={formData.telNumber || ""} onChange={e => handleInputChange("telNumber", e.target.value)} placeholder="Telephone Number" />
                                  </div>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                  <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                                    <span className="font-semibold text-base">Barangay Officials</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                      <Label>Bgy Chairperson</Label>
                                      <Input value={formData.barangayChairperson || ""} onChange={e => handleInputChange("barangayChairperson", e.target.value)} placeholder="Chairperson Name" />
                                    </div>
                                    <div>
                                      <Label>Chairperson Tel. No.</Label>
                                      <Input value={formData.chairpersonTelNumber || ""} onChange={e => handleInputChange("chairpersonTelNumber", e.target.value)} placeholder="Tel Number" />
                                    </div>
                                    <div>
                                      <Label>Bgy Secretary</Label>
                                      <Input value={formData.barangaySecretary || ""} onChange={e => handleInputChange("barangaySecretary", e.target.value)} placeholder="Secretary Name" />
                                    </div>
                                    <div>
                                      <Label>Secretary Tel. No.</Label>
                                      <Input value={formData.secretaryTelNumber || ""} onChange={e => handleInputChange("secretaryTelNumber", e.target.value)} placeholder="Tel Number" />
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              {/* Employment Tab */}
                              <TabsContent value="employment" className="space-y-8">
                                <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M7 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                                  <span className="font-semibold text-lg">Employment & Industry</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label>Number of Paid Employees *</Label>
                                    <Input type="number" value={formData.numberOfPaidEmployees || ""} onChange={e => handleInputChange("numberOfPaidEmployees", parseInt(e.target.value) || 0)} placeholder="Number of Paid Employees" />
                                  </div>
                                  <div>
                                    <Label>Number of Vacant Positions *</Label>
                                    <Input type="number" value={formData.numberOfVacantPositions || ""} onChange={e => handleInputChange("numberOfVacantPositions", parseInt(e.target.value) || 0)} placeholder="Number of Vacant Positions" />
                                  </div>
                                </div>
                                <div>
                                  <Label className="block mb-3">Industry Type</Label>
                                  {fieldErrors.industryType && (
                                    <p className="mb-2 text-xs text-destructive">{fieldErrors.industryType}</p>
                                  )}
                                  <div
                                    aria-invalid={!!fieldErrors.industryType}
                                    tabIndex={-1}
                                    className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border p-3 rounded bg-white dark:bg-slate-900 aria-[invalid=true]:border-destructive"
                                  >
                                    {industryEntries.map(({ code, label }) => (
                                      <div key={code} className="flex items-start space-x-2">
                                        <Checkbox checked={(formData.industryType || []).includes(code)} onCheckedChange={() => handleIndustryToggle(code)} id={`industry-${code}`} />
                                        <label htmlFor={`industry-${code}`} className="text-sm font-normal cursor-pointer leading-tight">{code} - {label}</label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>

                              {/* Compliance Tab */}
                              <TabsContent value="details" className="space-y-8">
                                <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                  <span className="font-semibold text-lg">Documents & Prepared By (SRS Form 2)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label>Prepared By Name *</Label>
                                    <Input value={formData.preparedByName || ""} onChange={e => handleInputChange("preparedByName", e.target.value)} placeholder="Prepared By Name" />
                                  </div>
                                  <div>
                                    <Label>Prepared By Designation</Label>
                                    <Input value={formData.preparedByDesignation || ""} onChange={e => handleInputChange("preparedByDesignation", e.target.value)} placeholder="Designation" />
                                  </div>
                                  <div>
                                    <Label>Prepared By Contact</Label>
                                    <Input value={formData.preparedByContact || ""} onChange={e => handleInputChange("preparedByContact", e.target.value)} placeholder="Contact" />
                                  </div>
                                  <div>
                                    <Label>Date Accomplished</Label>
                                    <Input type="date" value={formData.dateAccomplished || ""} onChange={e => handleInputChange("dateAccomplished", e.target.value)} />
                                  </div>
                                  <div>
                                    <Label>Remarks</Label>
                                    <Input value={formData.remarks || ""} onChange={e => handleInputChange("remarks", e.target.value)} placeholder="Remarks" />
                                  </div>
                                </div>
                                {/* Alternate Contacts */}
                                <div className="mt-6">
                                  <Label>Alternate Contacts</Label>
                                  <div className="space-y-2">
                                    {(formData.alternateContacts || []).map((contact: any, idx: number) => (
                                      <div key={idx} className="flex gap-2">
                                        <Input value={contact.name || ""} onChange={e => { const updated = [...formData.alternateContacts]; updated[idx].name = e.target.value; handleInputChange("alternateContacts", updated); }} placeholder="Name" />
                                        <Input value={contact.email || ""} onChange={e => { const updated = [...formData.alternateContacts]; updated[idx].email = e.target.value; handleInputChange("alternateContacts", updated); }} placeholder="Email" />
                                        <Input value={contact.phone || ""} onChange={e => { const updated = [...formData.alternateContacts]; updated[idx].phone = e.target.value; handleInputChange("alternateContacts", updated); }} placeholder="Phone" />
                                        <Button size="sm" variant="outline" onClick={() => { const updated = [...formData.alternateContacts]; updated.splice(idx, 1); handleInputChange("alternateContacts", updated); }}>Remove</Button>
                                      </div>
                                    ))}
                                    <Button size="sm" onClick={() => handleInputChange("alternateContacts", [...(formData.alternateContacts || []), { name: "", email: "", phone: "" }])}>Add Alternate Contact</Button>
                                  </div>
                                </div>
                                {/* Requirements */}
                                <div className="mt-6">
                                  <Label>Requirements</Label>
                                  <div className="space-y-2">
                                    {(formData.requirements || []).map((req: string, idx: number) => (
                                      <div key={idx} className="flex gap-2">
                                        <Input value={req} onChange={e => { const updated = [...formData.requirements]; updated[idx] = e.target.value; handleInputChange("requirements", updated); }} placeholder="Requirement" />
                                        <Button size="sm" variant="outline" onClick={() => { const updated = [...formData.requirements]; updated.splice(idx, 1); handleInputChange("requirements", updated); }}>Remove</Button>
                                      </div>
                                    ))}
                                    <Button size="sm" onClick={() => handleInputChange("requirements", [...(formData.requirements || []), ""])}>Add Requirement</Button>
                                  </div>
                                </div>
                                {/* Attachments */}
                                <div className="mt-6">
                                  <Label>Attachments</Label>
                                  <div className="space-y-2">
                                    {(formData.attachments || []).map((att: string, idx: number) => (
                                      <div key={idx} className="flex gap-2">
                                        <Input value={att} onChange={e => { const updated = [...formData.attachments]; updated[idx] = e.target.value; handleInputChange("attachments", updated); }} placeholder="Attachment URL or description" />
                                        <Button size="sm" variant="outline" onClick={() => { const updated = [...formData.attachments]; updated.splice(idx, 1); handleInputChange("attachments", updated); }}>Remove</Button>
                                      </div>
                                    ))}
                                    <Button size="sm" onClick={() => handleInputChange("attachments", [...(formData.attachments || []), ""])}>Add Attachment</Button>
                                  </div>
                                </div>
                                {/* Compliance Status & Archive Toggle */}
                                <div className="mt-8 flex items-center gap-4">
                                  <Label>Compliance Status:</Label>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${formData.complianceStatus === "complete" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{formData.complianceStatus || "Pending"}</span>
                                  <Checkbox checked={formData.archived} onCheckedChange={checked => handleInputChange("archived", checked)} />
                                  <Label className="text-sm">Archived</Label>
                                </div>
                              </TabsContent>
                            </div>
                          </Tabs>

                          <DialogFooter className="border-t pt-4 flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6 py-2 text-base">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-base font-semibold text-white rounded-lg shadow-md">
                              {loading ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
  );
}
