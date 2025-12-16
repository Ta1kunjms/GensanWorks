import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, MessageSquare, FileText, Download } from "lucide-react";
import type { Referral } from "@shared/schema";
import { ViewReferralModal } from "./view-referral-modal";
import { MessageModal } from "./message-modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ReferralTableProps {
  onExportCSV: () => void;
}

export function ReferralTable({ onExportCSV }: ReferralTableProps) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Referral | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.append("status", statusFilter);
    return params.toString();
  };

  const queryParams = buildQueryParams();
  const queryUrl = `/api/referrals${queryParams ? `?${queryParams}` : ""}`;

  const { data: referrals = [], isLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals", statusFilter],
    queryFn: async () => {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }
      return response.json();
    },
  });

  const handleSort = (field: keyof Referral) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aVal < bVal ? -direction : direction;
  });

  const handleView = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsViewModalOpen(true);
  };

  const handleMessage = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsMessageModalOpen(true);
  };

  const handleGenerateSlip = async (referral: Referral) => {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("GensanWorks", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Official Job Assistance Platform of PESO", 105, 28, { align: "center" });
      doc.text("General Santos City", 105, 35, { align: "center" });

      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REFERRAL SLIP", 105, 50, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      let yPos = 65;
      const lineHeight = 8;

      doc.setFont("helvetica", "bold");
      doc.text("Referral ID:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.referralId, 70, yPos);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Date Referred:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.dateReferred, 70, yPos);

      yPos += lineHeight + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("APPLICANT INFORMATION", 20, yPos);
      doc.setFontSize(11);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Name:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.applicant, 70, yPos);

      yPos += lineHeight + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("JOB DETAILS", 20, yPos);
      doc.setFontSize(11);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Position:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.vacancy, 70, yPos);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Employer:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.employer, 70, yPos);

      yPos += lineHeight + 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("REFERRAL STATUS", 20, yPos);
      doc.setFontSize(11);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Status:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(referral.status, 70, yPos);

      yPos += lineHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Feedback:", 20, yPos);
      doc.setFont("helvetica", "normal");

      const feedbackLines = doc.splitTextToSize(referral.feedback, 120);
      doc.text(feedbackLines, 20, yPos + lineHeight);

      yPos += lineHeight * (feedbackLines.length + 2);

      doc.setLineWidth(0.5);
      doc.line(20, 270, 190, 270);

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("This is an official document from GensanWorks PESO", 105, 280, { align: "center" });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" });

      doc.save(`referral-slip-${referral.referralId}.pdf`);

      toast({
        title: "Referral Slip Generated",
        description: `PDF generated successfully for ${referral.referralId}`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!sortedReferrals.length) {
      toast({
        title: "No Data",
        description: "No referrals available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = [
        "Referral ID",
        "Applicant",
        "Vacancy",
        "Employer",
        "Date Referred",
        "Status",
        "Feedback",
      ];

      const csvContent = [
        headers.join(","),
        ...sortedReferrals.map((r) =>
          [
            r.referralId,
            `"${r.applicant}"`,
            `"${r.vacancy}"`,
            `"${r.employer}"`,
            r.dateReferred,
            r.status,
            `"${r.feedback}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referrals-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      onExportCSV();
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Hired: "bg-success/10 text-success border-success/20",
      Pending: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      Rejected: "bg-destructive/10 text-destructive border-destructive/20",
      "For Interview": "bg-primary/10 text-primary border-primary/20",
      Withdrawn: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      <Card data-testid="card-referral-table">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Referral & Placement Summary
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9" data-testid="filter-status">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="default"
                className="gap-2 bg-success hover:bg-success/90 text-success-foreground h-9"
                onClick={handleExport}
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading referrals...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("referralId")}
                    >
                      Referral ID
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("applicant")}
                    >
                      Applicant
                    </TableHead>
                    <TableHead>Vacancy</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("dateReferred")}
                    >
                      Date Referred
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReferrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No referrals found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedReferrals.map((referral) => (
                      <TableRow key={referral.referralId} data-testid={`row-referral-${referral.referralId}`}>
                        <TableCell className="font-medium" data-testid={`cell-id-${referral.referralId}`}>
                          {referral.referralId}
                        </TableCell>
                        <TableCell>{referral.applicant}</TableCell>
                        <TableCell>{referral.vacancy}</TableCell>
                        <TableCell>{referral.employer}</TableCell>
                        <TableCell>{referral.dateReferred}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {referral.feedback}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(referral)}
                              data-testid={`button-view-${referral.referralId}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMessage(referral)}
                              data-testid={`button-message-${referral.referralId}`}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleGenerateSlip(referral)}
                              data-testid={`button-generate-slip-${referral.referralId}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReferral && (
        <>
          <ViewReferralModal
            referral={selectedReferral}
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
          />
          <MessageModal
            referral={selectedReferral}
            open={isMessageModalOpen}
            onOpenChange={setIsMessageModalOpen}
          />
        </>
      )}
    </>
  );
}
