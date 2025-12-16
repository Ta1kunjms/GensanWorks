import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2, Eye, Info, Printer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

interface GenerateReferralSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
}

interface JobVacancy {
  id: string;
  positionTitle: string;
  establishmentName: string;
  startingSalaryOrWage?: number;
  salaryType?: string;
  mainSkillOrSpecialization?: string;
  numberOfVacancies?: number;
  minimumEducationRequired?: string;
  employerId?: string;
  locationSummary?: string;
}

const parseJsonField = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  if (typeof value === "object") {
    return value as Record<string, any>;
  }
  return undefined;
};

const normalizeJobForReferral = (job: any): JobVacancy => {
  const salaryInfo = parseJsonField(job?.salary) ?? job?.salary ?? {};
  const salaryCandidate =
    typeof job?.startingSalaryOrWage === "number"
      ? job.startingSalaryOrWage
      : typeof salaryInfo?.amount === "number"
        ? salaryInfo.amount
        : typeof salaryInfo?.min === "number"
          ? salaryInfo.min
          : typeof salaryInfo?.max === "number"
            ? salaryInfo.max
            : typeof job?.salaryAmount === "number"
              ? job.salaryAmount
              : undefined;

  const salaryTypeCandidate =
    job?.salaryType ||
    job?.salaryPeriod ||
    job?.salary?.period ||
    salaryInfo?.period ||
    salaryInfo?.type ||
    salaryInfo?.frequency;

  const positionTitle = job?.positionTitle || job?.title || "Untitled Position";
  const establishmentName =
    job?.establishmentName ||
    job?.company ||
    job?.companyName ||
    job?.employerName ||
    "Unspecified Employer";

  const numberOfVacancies =
    job?.numberOfVacancies ??
    job?.vacantPositions ??
    job?.openings ??
    job?.vacancies ??
    job?.vacantPosition ??
    1;

  const locationParts = [job?.location, job?.barangay, job?.municipality, job?.province]
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .map((part) => part.trim());

  return {
    id: job?.id,
    positionTitle,
    establishmentName,
    startingSalaryOrWage: salaryCandidate,
    salaryType: typeof salaryTypeCandidate === "string" ? salaryTypeCandidate : undefined,
    mainSkillOrSpecialization: job?.mainSkillOrSpecialization || job?.mainSkill,
    numberOfVacancies,
    minimumEducationRequired: job?.minimumEducationRequired || job?.minimumEducation,
    employerId: job?.employerId,
    locationSummary: locationParts.length ? Array.from(new Set(locationParts)).join(", ") : undefined,
  };
};

export function GenerateReferralSlipModal({
  open,
  onOpenChange,
  applicant,
}: GenerateReferralSlipModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  type ReferralSlipField = "selectedVacancy";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } =
    useFieldErrors<ReferralSlipField>();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [employersById, setEmployersById] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
  // Legacy fields kept for backward compatibility when saving to server
  const [pesoOfficer, setPesoOfficer] = useState("NURHASAN A. JUANDAY");
  const [pesoDesignation, setPesoDesignation] = useState("Supervising Labor and Employment Officer, PESO Gensan");

  // New, more detailed letter fields
  const [recipientTitle, setRecipientTitle] = useState("THE PERSONNEL MANAGER");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [branchOrLocation, setBranchOrLocation] = useState("");
  const [positionOverride, setPositionOverride] = useState("");
  const [cityMayorName, setCityMayorName] = useState("LORELIE GERONIMO PACQUIAO");
  const [supervisingOfficerName, setSupervisingOfficerName] = useState("NURHASAN A. JUANDAY");
  const [mayorSignatureUrl, setMayorSignatureUrl] = useState("");
  const [supervisingSignatureUrl, setSupervisingSignatureUrl] = useState("");
  const [designVariant, setDesignVariant] = useState<"formal"|"simple">("formal");
  const [applicantPhotoUrl, setApplicantPhotoUrl] = useState("");
  const [letterDate, setLetterDate] = useState<string>(() => {
    // Get current date/time in local timezone for datetime-local input
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [notes, setNotes] = useState("");
  const [referralNumber, setReferralNumber] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate unique referral number based on date and random
  const generateNewReferralNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const newRefNumber = `PESO-GSC-${year}${month}${day}-${random}`;
    setReferralNumber(newRefNumber);
    return newRefNumber;
  };

  useEffect(() => {
    if (open) {
      fetchOpenVacancies();
      fetchEmployers();
      generateNewReferralNumber();
    }
  }, [open]);

  const fetchOpenVacancies = async () => {
    setLoading(true);
    try {
      let response = await authFetch("/api/admin/jobs");
      if (!response.ok) {
        // fall back to public jobs endpoint if admin route fails
        response = await fetch("/api/jobs");
      }
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch jobs");
      }
      const payload = await response.json();
      const jobsArray = Array.isArray(payload) ? payload : payload?.jobs || [];
      const normalized = jobsArray
        .filter((job: any) => {
          const status = typeof job?.status === "string" ? job.status.toLowerCase() : "active";
          return !job?.archived && ["active", "approved", "open", "published"].includes(status);
        })
        .map(normalizeJobForReferral);
      setVacancies(normalized);
    } catch (error: any) {
      console.error("Failed to load referral jobs", error);
      toast({
        title: "Error",
        description: error?.message || "Unable to load available jobs. Please try again.",
        variant: "destructive",
      });
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployers = async () => {
    try {
      const res = await fetch("/api/employers");
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, any> = {};
      for (const e of data || []) map[e.id] = e;
      setEmployersById(map);
    } catch {}
  };

  if (!applicant) return null;

  const handleVacancySelect = (vacancyId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    setSelectedVacancy(vacancy || null);
    clearFieldError("selectedVacancy");
    // Pre-fill company and position fields when a vacancy is chosen
    if (vacancy) {
      setCompanyName(vacancy.establishmentName || "");
      setPositionOverride(vacancy.positionTitle || "");
      if (vacancy.employerId && employersById[vacancy.employerId]) {
        const emp = employersById[vacancy.employerId];
        const addrParts = [emp.houseStreetVillage, emp.barangay, emp.municipality, emp.province].filter(Boolean);
        setCompanyAddress(addrParts.join(", "));
      } else if (vacancy.locationSummary) {
        setCompanyAddress(vacancy.locationSummary);
      } else {
        setCompanyAddress("");
      }
    }
  };

  const generateReferralSlipHTML = () => {
    const currentDateLong = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentDateTimePretty = new Date(letterDate || new Date().toISOString()).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PESO Referral Slip</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 0;
          }
          /* Strict A4 sizing with generous margins */
          .container {
            width: 210mm;
            height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 18mm 18mm 16mm 18mm; /* top/right/bottom/left */
            box-shadow: 0 0 10px rgba(0,0,0,0.08);
            position: relative;
            page-break-after: always;
            overflow: hidden;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #003366;
            padding-bottom: 15px;
          }
          
          .header-logo-section {
            display: flex;
            justify-content: center;
            gap: 30px;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .header-text h1 {
            font-size: 18px;
            font-weight: bold;
            color: #003366;
            margin: 5px 0;
          }
          
          .header-text p {
            font-size: 11px;
            color: #333;
            margin: 3px 0;
          }
          
          .header-text .office-title {
            font-size: 13px;
            font-weight: bold;
            color: #003366;
          }
          
          .referral-number {
            text-align: right;
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
          }
          
          .referral-number strong {
            font-weight: bold;
          }
          
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 10px;
            color: #333;
            margin-bottom: 10px;
          }

          .photo-box {
            width: 90px;
            height: 110px;
            border: 1px solid #ccc;
            border-radius: 4px;
            overflow: hidden;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 10px;
          }

          .watermark {
            position: absolute;
            top: 42%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-20deg);
            font-size: 48px;
            color: rgba(0, 51, 102, 0.06);
            font-weight: 800;
            letter-spacing: 2px;
            white-space: nowrap;
            pointer-events: none;
          }

          .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #003366;
            margin: 25px 0 20px 0;
            text-decoration: underline;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          /* Neutral section header without blue background */
          .section-title {
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
            background-color: transparent;
            padding: 0 0 6px 0;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            letter-spacing: 0.2px;
          }
          
          .field-row {
            display: flex;
            margin-bottom: 10px;
            gap: 20px;
          }
          
          .field-row.full {
            flex-direction: column;
          }
          
          .field {
            flex: 1;
            display: flex;
            gap: 10px;
          }
          
          .field-label {
            font-weight: bold;
            font-size: 11px;
            color: #003366;
            min-width: 140px;
          }
          
          .field-value {
            font-size: 11px;
            color: #333;
            flex: 1;
            border-bottom: 1px solid #999;
            padding-bottom: 2px;
          }
          
          .field-value.highlight {
            background-color: #fff3cd;
            padding: 3px 5px;
            border-radius: 3px;
            font-weight: bold;
          }
          
          .two-column {
            display: flex;
            gap: 20px;
          }
          
          .two-column .field {
            flex: 1;
          }
          
          .signature-section {
            margin-top: 18mm;
            display: flex;
            gap: 28mm;
            justify-content: flex-end;
          }
          
          .signature-block {
            text-align: center;
            width: 200px;
            border-top: 2px solid #003366;
            padding-top: 5px;
          }
          
          .signature-space {
            height: 60px;
            margin-bottom: 5px;
          }
          
          .signature-name {
            font-size: 10px;
            font-weight: bold;
            color: #003366;
          }
          
          .signature-title {
            font-size: 9px;
            color: #666;
            margin-top: 2px;
          }
          
          .footer {
            position: absolute;
            bottom: 12mm;
            left: 18mm;
            right: 18mm;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 6px;
          }
          
          .note-section {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 3px solid #ffc107;
            font-size: 10px;
            margin-top: 15px;
            color: #555;
          }
          
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .container { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="referral-number">
            <strong>Referral #:</strong> ${referralNumber}
          </div>
          
          <div class="header">
            <div class="header-logo-section">
              <div class="header-text">
                <p style="margin-bottom: 5px; color: #003366; font-weight: bold;">Republic of the Philippines</p>
                <h1>OFFICE OF THE CITY MAYOR</h1>
                <p class="office-title">Public Employment Service Office</p>
                <p>General Santos City</p>
              </div>
            </div>
          </div>
          
          <div class="title">${designVariant === "formal" ? "JOB REFERRAL SLIP" : "REFERRAL SLIP"}</div>
          
          ${designVariant === "formal" ? `<div class="meta-row">
            <div>
              <strong>Applicant Profile:</strong> PESO
            </div>
            <div><strong>Date:</strong> ${currentDateTimePretty}</div>
            <div class="photo-box">
              ${applicantPhotoUrl
                ? `<img src="${applicantPhotoUrl}" style="width:100%;height:100%;object-fit:cover;"/>`
                : `Photo`}
            </div>
          </div>` : ""}

          
          
          
          
          
          
          
          
          <!-- LETTER SECTION (ADDRESS + BODY) -->
          ${designVariant === "formal" ? `<div class="section">
            <div class="field-row full" style="margin-bottom:14px">
              <div class="field">
                <span class="field-label">To:</span>
                <span class="field-value">${recipientTitle}</span>
              </div>
            </div>
            <div class="field-row full" style="margin-bottom:4px">
              <div class="field">
                <span class="field-label">Company:</span>
                <span class="field-value">${companyName || (selectedVacancy?.establishmentName || "")}</span>
              </div>
            </div>
            ${companyAddress ? `
            <div class="field-row full" style="margin-bottom:14px">
              <div class="field">
                <span class="field-label">Address:</span>
                <span class="field-value">${companyAddress}</span>
              </div>
            </div>` : ""}

            <div style="font-size:12px; color:#222; line-height:1.6; margin-top:8px; text-align:justify">
              <p style="margin-bottom:10px">Dear Sir/Madam:</p>
              <p style="text-indent:28px; margin-bottom:10px">This office has arranged for Mr./Ms./Mrs. <strong>${(
                `${applicant.firstName} ${applicant.middleName || ""} ${applicant.surname}`
              ).toUpperCase()}</strong> to call on you regarding your opening for a/an <strong>${(positionOverride || selectedVacancy?.positionTitle || "").toUpperCase()}</strong>${branchOrLocation ? ` <strong>${branchOrLocation.toUpperCase()}</strong>` : ""}.</p>
              <p style="text-indent:28px; margin-bottom:10px">We would appreciate it very much if you would let us know the status of application of the said applicant.</p>
              <p>Thank you.</p>
            </div>
          </div>` : ""}

          <!-- SIGNATURE SECTION -->
          <div class="signature-section" style="margin-top:30px">
            <div class="signature-block" style="border:none">
              <div class="signature-space"></div>
              <div class="signature-name" style="visibility:hidden">&nbsp;</div>
              <div class="signature-title" style="visibility:hidden">&nbsp;</div>
            </div>
            <div class="signature-block" style="border:none; width:auto">
              ${designVariant === "formal" ? `<div class="signature-title" style="text-transform:uppercase; font-weight:bold; color:#003366; margin-bottom:18px; text-align:left">Very Truly Yours,</div>` : ''}
              ${mayorSignatureUrl ? `<img src="${mayorSignatureUrl}" style="height:40px; margin-bottom:2px; object-fit:contain;" />` : ''}
              <div class="signature-name" style="text-align:left">${cityMayorName}</div>
              <div class="signature-title" style="text-align:left">CITY MAYOR</div>
              ${designVariant === "formal" ? `<div class="signature-title" style="text-align:left; margin-top:8px; font-weight:bold">BY THE AUTHORITY OF THE CITY MAYOR</div>` : ''}
              ${supervisingSignatureUrl ? `<img src="${supervisingSignatureUrl}" style="height:38px; margin:4px 0 2px; object-fit:contain;" />` : ''}
              <div class="signature-name" style="text-align:left; margin-top:8px">${supervisingOfficerName}</div>
              <div class="signature-title" style="text-align:left">SUPERVISING LABOR AND EMPLOYMENT OFFICER, PESO GENSAN</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official job referral slip issued by PESO General Santos City</p>
            <p>Referral No: ${referralNumber} | Generated on: ${new Date().toLocaleString()}</p>
          </div>
          ${designVariant === "formal" ? `<div class="watermark">PUBLIC EMPLOYMENT SERVICE OFFICE</div>` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const recordReferralSlip = async () => {
    if (!selectedVacancy) return;

    try {
      const employerName =
        selectedVacancy.establishmentName ||
        companyName ||
        (selectedVacancy.employerId ? employersById[selectedVacancy.employerId]?.companyName || employersById[selectedVacancy.employerId]?.name : "") ||
        "Unspecified Employer";

      const payload = {
        referralId: referralNumber,
        applicantId: applicant.id,
        applicant: `${applicant.firstName} ${applicant.middleName || ""} ${applicant.surname}`.trim(),
        employerId: selectedVacancy.employerId || null,
        employer: employerName,
        vacancyId: selectedVacancy.id,
        vacancy: positionOverride || selectedVacancy.positionTitle,
        barangay: applicant.barangay || null,
        jobCategory: selectedVacancy.mainSkillOrSpecialization || selectedVacancy.locationSummary || null,
        dateReferred: new Date().toISOString(),
        status: "Pending",
        feedback: "",
        referralSlipNumber: referralNumber,
        pesoOfficerName: pesoOfficer,
        pesoOfficerDesignation: pesoDesignation,
      };

      const res = await authFetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to record referral slip");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    } catch (error: any) {
      console.error("Failed to record referral slip:", error);
      toast({
        title: "Warning",
        description: error?.message || "Referral slip printed but not saved to tracking table.",
        variant: "destructive",
      });
    }
  };

  const printReferral = async () => {
    setGenerating(true);
    try {
      if (!selectedVacancy) {
        const nextErrors: FieldErrors<ReferralSlipField> = {
          selectedVacancy: "Please select a job vacancy first",
        };
        setErrorsAndFocus(nextErrors);
        setGenerating(false);
        return;
      }

      const htmlContent = generateReferralSlipHTML();
      const printWindow = window.open("", "_blank", "width=900,height=1200");

      if (!printWindow) {
        throw new Error("Please allow popups to print the referral slip.");
      }

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      setTimeout(() => {
        try { printWindow.close(); } catch {}
      }, 500);

      await recordReferralSlip();

      toast({
        title: "Referral slip ready",
        description: "Printed/Saved and logged to referral tracking.",
      });
    } catch (error: any) {
      console.error("Print error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to print referral slip",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateHTMLFile = async () => {
    if (!selectedVacancy) {
      const nextErrors: FieldErrors<ReferralSlipField> = {
        selectedVacancy: "Please select a job vacancy first",
      };
      setErrorsAndFocus(nextErrors);
      return;
    }

    const htmlContent = generateReferralSlipHTML();
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `referral_slip_${referralNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    await recordReferralSlip();

    toast({
      title: "Success",
      description: "HTML downloaded and referral logged.",
    });
  };

  const renderPreviewContent = () => {
    if (!selectedVacancy) {
      return (
        <div className="flex items-center justify-center p-8 text-slate-500">
          <p>Please select a job vacancy to preview the referral slip</p>
        </div>
      );
    }

    return (
      <div
        ref={previewRef}
        dangerouslySetInnerHTML={{
          __html: generateReferralSlipHTML(),
        }}
        className="bg-white p-4"
      />
    );
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-5 w-5" />
                Generate Job Referral Slip
              </DialogTitle>
              <DialogDescription className="text-blue-50">
                Configure and generate an official referral slip for {applicant.firstName} {applicant.surname}. Referral #: <span className="font-mono text-sm">{referralNumber}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-6">
            {/* Step 1: Applicant Information */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                Step 1: Applicant Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Full Name</p>
                  <p className="font-medium text-slate-900">
                    {applicant.firstName} {applicant.middleName || ""} {applicant.surname}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Email</p>
                  <p className="font-medium text-slate-900">{applicant.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-600">Contact</p>
                  <p className="font-medium text-slate-900">{applicant.contactNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-600">Barangay</p>
                  <p className="font-medium text-slate-900">{applicant.barangay || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Step 2: Job Vacancy Selection */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-sm">
                Step 2: Select Job Vacancy *
              </h3>
              {fieldErrors.selectedVacancy && (
                <p className="text-xs text-destructive" aria-invalid={!!fieldErrors.selectedVacancy} tabIndex={-1}>
                  {fieldErrors.selectedVacancy}
                </p>
              )}
              <div className="flex gap-2">
                <Select value={selectedVacancy?.id || ""} onValueChange={handleVacancySelect} disabled={loading}>
                  <SelectTrigger className="flex-1" aria-invalid={!!fieldErrors.selectedVacancy}>
                    <SelectValue placeholder={loading ? "Loading vacancies..." : "Choose a job vacancy..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {loading ? (
                      <div className="p-2 text-sm text-slate-500">Loading vacancies...</div>
                    ) : vacancies.length === 0 ? (
                      <div className="p-3 text-sm text-slate-600">
                        <p className="font-medium">No open vacancies available</p>
                        <p className="text-xs mt-1">Please create job vacancies in the Jobs section first</p>
                      </div>
                    ) : (
                      vacancies.map((vacancy) => {
                        const slots = vacancy.numberOfVacancies ?? 1;
                        return (
                          <SelectItem key={vacancy.id} value={vacancy.id}>
                            <div className="flex flex-col">
                              <span>
                                {vacancy.positionTitle} ({slots} {slots === 1 ? "slot" : "slots"})
                              </span>
                              <span className="text-xs text-slate-500">
                                {vacancy.establishmentName}
                                {vacancy.locationSummary ? ` • ${vacancy.locationSummary}` : ""}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchOpenVacancies}
                  disabled={loading}
                  title="Refresh vacancies"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 3: Position Details Preview */}
            {selectedVacancy && (
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-3 text-sm">
                  Step 3: Position Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium text-xs">Position Title</p>
                    <p className="font-semibold text-blue-900">{selectedVacancy.positionTitle}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium text-xs">Company</p>
                    <p className="font-semibold text-blue-900">{selectedVacancy.establishmentName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium text-xs">Salary Range</p>
                    <p className="font-semibold text-blue-900">
                      ₱{selectedVacancy.startingSalaryOrWage?.toLocaleString() || "N/A"}{" "}
                      <span className="text-blue-700">{selectedVacancy.salaryType}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium text-xs">Vacancies</p>
                    <p className="font-semibold text-blue-900">{selectedVacancy.numberOfVacancies}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-700 font-medium text-xs">Required Education</p>
                    <p className="text-blue-900">{selectedVacancy.minimumEducationRequired || "Not specified"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-700 font-medium text-xs">Required Skills</p>
                    <p className="text-blue-900">{selectedVacancy.mainSkillOrSpecialization || "Not specified"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Letter Details (Recipient, Company, Signatories) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Step 4: Letter Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="design-variant" className="text-xs">Design</Label>
                  <Select value={designVariant} onValueChange={(v)=>setDesignVariant(v as any)}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Design"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal Letter</SelectItem>
                      <SelectItem value="simple">Simple Slip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient-title" className="text-xs">Recipient/Attention</Label>
                  <Input id="recipient-title" value={recipientTitle} onChange={(e)=>setRecipientTitle(e.target.value)} className="text-sm" placeholder="THE PERSONNEL MANAGER" />
                </div>
                <div>
                  <Label htmlFor="company-name" className="text-xs">Company/Establishment</Label>
                  <Input id="company-name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} className="text-sm" placeholder="Company name" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="company-address" className="text-xs">Company Address (optional)</Label>
                  <Input id="company-address" value={companyAddress} onChange={(e)=>setCompanyAddress(e.target.value)} className="text-sm" placeholder="Address, City/Barangay" />
                </div>
                <div>
                  <Label htmlFor="position-title" className="text-xs">Position Title</Label>
                  <Input id="position-title" value={positionOverride} onChange={(e)=>setPositionOverride(e.target.value)} className="text-sm" placeholder="Will use vacancy title by default" />
                </div>
                <div>
                  <Label htmlFor="branch-location" className="text-xs">Branch/Location (optional)</Label>
                  <Input id="branch-location" value={branchOrLocation} onChange={(e)=>setBranchOrLocation(e.target.value)} className="text-sm" placeholder="e.g., VERANZA/KCC" />
                </div>
                <div>
                  <Label htmlFor="mayor-name" className="text-xs">City Mayor (editable)</Label>
                  <Input id="mayor-name" value={cityMayorName} onChange={(e)=>setCityMayorName(e.target.value)} className="text-sm" placeholder="City Mayor name" />
                </div>
                <div>
                  <Label htmlFor="supervising-name" className="text-xs">Supervising Labor and Employment Officer (editable)</Label>
                  <Input id="supervising-name" value={supervisingOfficerName} onChange={(e)=>setSupervisingOfficerName(e.target.value)} className="text-sm" placeholder="PESO Gensan officer name" />
                </div>
                <div>
                  <Label htmlFor="letter-date" className="text-xs">Letter Date & Time</Label>
                  <Input id="letter-date" type="datetime-local" value={letterDate} onChange={(e)=>setLetterDate(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="photo-url" className="text-xs">Applicant Photo URL (optional)</Label>
                  <Input id="photo-url" value={applicantPhotoUrl} onChange={(e)=>setApplicantPhotoUrl(e.target.value)} className="text-sm" placeholder="https://.../photo.jpg" />
                </div>
                <div>
                  <Label htmlFor="mayor-signature" className="text-xs">Mayor Signature Image URL (optional)</Label>
                  <Input id="mayor-signature" value={mayorSignatureUrl} onChange={(e)=>setMayorSignatureUrl(e.target.value)} className="text-sm" placeholder="https://.../sign.png" />
                </div>
                <div>
                  <Label htmlFor="sup-signature" className="text-xs">Supervising Officer Signature URL (optional)</Label>
                  <Input id="sup-signature" value={supervisingSignatureUrl} onChange={(e)=>setSupervisingSignatureUrl(e.target.value)} className="text-sm" placeholder="https://.../sign.png" />
                </div>
              </div>
            </div>

            {/* Step 5: Additional Notes */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-sm">
                Step 5: Additional Notes (Optional)
              </h3>
              <Textarea
                placeholder="Add any special instructions or notes for the referral..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm h-24 resize-none"
              />
            </div>

            {/* Info Alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> The referral slip will include all applicant information, position details,
                and a unique referral number ({referralNumber}). You can preview before printing.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between border-t bg-white px-6 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!selectedVacancy}
                className="w-full sm:w-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={generateHTMLFile}
                disabled={!selectedVacancy || generating}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                HTML
              </Button>
            </div>
            <Button
              onClick={printReferral}
              disabled={!selectedVacancy || generating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Eye className="h-5 w-5" />
                Referral Slip Preview
              </DialogTitle>
              <DialogDescription className="text-slate-200">
                Review the referral slip before generating the final PDF. Referral #: <span className="font-mono">{referralNumber}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 border-t border-slate-200 bg-white overflow-auto px-4 py-4">
            {renderPreviewContent()}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center px-6 pb-4 pt-2 bg-white border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
            <Button onClick={printReferral} disabled={generating} className="bg-blue-600 hover:bg-blue-700">
              {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
