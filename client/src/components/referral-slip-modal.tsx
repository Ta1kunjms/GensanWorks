import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";

interface ReferralSlipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
}

export function ReferralSlipModal({
  open,
  onOpenChange,
  applicant,
}: ReferralSlipModalProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  if (!applicant) return null;

  const generateCSV = () => {
    setExporting(true);
    try {
      const csvContent = [
        ["REFERRAL SLIP"],
        [],
        ["Applicant Information"],
        ["Name", `${applicant.firstName} ${applicant.surname}`],
        ["Email", applicant.email || "N/A"],
        ["Contact", applicant.contactNumber || "N/A"],
        ["Barangay", applicant.barangay || "N/A"],
        ["Municipality", applicant.municipality || "N/A"],
        [],
        ["Employment Status", applicant.employmentStatus || "N/A"],
        ["Employment Type", applicant.employmentType || "N/A"],
        ["Date Generated", new Date().toISOString()],
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referral_slip_${applicant.id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Referral slip exported as CSV",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const generatePDF = () => {
    setExporting(true);
    try {
      // Simple PDF generation using HTML to PDF conversion
      const pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; font-size: 12px; color: #333; margin-bottom: 10px; }
              .field { display: flex; margin-bottom: 8px; }
              .label { width: 150px; font-weight: bold; font-size: 11px; }
              .value { flex: 1; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>REFERRAL SLIP</h2>
              <p>Date Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <div class="section-title">APPLICANT INFORMATION</div>
              <div class="field">
                <div class="label">Full Name:</div>
                <div class="value">${applicant.firstName} ${applicant.surname}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${applicant.email || "N/A"}</div>
              </div>
              <div class="field">
                <div class="label">Contact Number:</div>
                <div class="value">${applicant.contactNumber || "N/A"}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ADDRESS INFORMATION</div>
              <div class="field">
                <div class="label">Barangay:</div>
                <div class="value">${applicant.barangay || "N/A"}</div>
              </div>
              <div class="field">
                <div class="label">Municipality:</div>
                <div class="value">${applicant.municipality || "N/A"}</div>
              </div>
              <div class="field">
                <div class="label">Province:</div>
                <div class="value">${applicant.province || "N/A"}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">EMPLOYMENT INFORMATION</div>
              <div class="field">
                <div class="label">Employment Status:</div>
                <div class="value">${applicant.employmentStatus || "N/A"}</div>
              </div>
              <div class="field">
                <div class="label">Employment Type:</div>
                <div class="value">${applicant.employmentType || "N/A"}</div>
              </div>
            </div>

            <div class="section" style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
              <p style="font-size: 11px; color: #666;">This is an automatically generated referral slip.</p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([pdfContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referral_slip_${applicant.id}.html`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Referral slip exported as HTML (save as PDF from browser)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const generateJSON = () => {
    setExporting(true);
    try {
      const jsonContent = JSON.stringify(
        {
          type: "REFERRAL_SLIP",
          generatedDate: new Date().toISOString(),
          applicant: {
            id: applicant.id,
            fullName: `${applicant.firstName} ${applicant.surname}`,
            email: applicant.email,
            contactNumber: applicant.contactNumber,
            dateOfBirth: applicant.dateOfBirth,
            sex: applicant.sex,
            civilStatus: applicant.civilStatus,
          },
          address: {
            street: applicant.houseStreetVillage,
            barangay: applicant.barangay,
            municipality: applicant.municipality,
            province: applicant.province,
          },
          employment: {
            status: applicant.employmentStatus,
            type: applicant.employmentType,
          },
        },
        null,
        2
      );

      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referral_slip_${applicant.id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Referral slip exported as JSON",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export JSON",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Referral Slip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm font-semibold text-slate-900 mb-1">
              {applicant.firstName} {applicant.surname}
            </p>
            <p className="text-xs text-slate-600">{applicant.email}</p>
            <p className="text-xs text-slate-600">{applicant.barangay}</p>
          </div>

          <p className="text-sm text-slate-600">
            Choose the format to export the referral slip:
          </p>
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={generateCSV}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={generateJSON}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
          <Button
            onClick={generatePDF}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            PDF/HTML
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
