import { Download, Copy, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ReferralSummaryItem } from "./referral-summary-table";

interface ShareDropdownProps {
  referral: ReferralSummaryItem;
}

export function ShareDropdown({ referral }: ShareDropdownProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    const text = `Referral ${referral.referralId}: ${referral.applicant} for ${referral.vacancy} position at ${referral.employer}. Status: ${referral.status}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Referral details copied to clipboard",
    });
  };

  const handleExportPDF = () => {
    // In a real app, this would generate a PDF
    toast({
      title: "PDF Export",
      description: `Referral ${referral.referralId} exported as PDF`,
    });
  };

  const handleExportCSV = () => {
    const csv = `Referral ID,Applicant,Vacancy,Employer,Date Referred,Status,Feedback\n"${referral.referralId}","${referral.applicant}","${referral.vacancy}","${referral.employer}","${referral.dateReferred}","${referral.status}","${referral.feedback}"`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-${referral.referralId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "CSV Exported",
      description: `Referral ${referral.referralId} exported as CSV`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Share"
        >
          <span className="text-slate-600">⋯</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
