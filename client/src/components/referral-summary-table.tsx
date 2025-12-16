import { Eye, MessageCircle, Download, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { ReferralViewModal } from "./referral-view-modal";
import { FeedbackRequestModal } from "./feedback-request-modal";
import { ShareDropdown } from "./share-dropdown";
import { format } from "date-fns";
import { authFetch } from "@/lib/auth";

export interface ReferralSummaryItem {
  id: string;
  referralId: string;
  applicant: string;
  vacancy: string;
  employer: string;
  barangay: string;
  jobCategory: string;
  dateReferred: string;
  status: "Hired" | "Pending" | "Rejected";
  feedback: string;
}

interface ReferralSummaryTableProps {
  data?: ReferralSummaryItem[];
  onExportCSV?: () => void;
  onRefresh?: () => void;
}

export function ReferralSummaryTable({
  data = [],
  onExportCSV,
  onRefresh,
}: ReferralSummaryTableProps) {
  const { toast } = useToast();
  const [selectedBarangay, setSelectedBarangay] = useState<string>("all");
  const [selectedEmployer, setSelectedEmployer] = useState<string>("all");
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralSummaryItem | null>(null);

  // Use real data from props, no hardcoded defaults
  const displayData = data && data.length > 0 ? data : [];

  // All barangays of General Santos City
  const allBarangays = [
    "Apopong",
    "Baluan",
    "Batomelong",
    "Buayan",
    "Bula",
    "Calumpang",
    "City Heights",
    "Conel",
    "Dadiangas East",
    "Dadiangas North",
    "Dadiangas South",
    "Dadiangas West",
    "Fatima",
    "Katangawan",
    "Labangal",
    "Lagao",
    "Ligaya",
    "Mabuhay",
    "Olympog",
    "San Isidro",
    "San Jose",
    "Siguel",
    "Sinawal",
    "Tambler",
    "Tinagacan",
    "Upper Labay",
  ];

  // Get unique values for dropdowns
  const barangays = useMemo(() => {
    const uniqueBarangays = Array.from(new Set(displayData.map(item => item.barangay).filter(Boolean)));
    return ["all", ...allBarangays.filter(b => uniqueBarangays.includes(b) || true)];
  }, [displayData]);
  const employers = useMemo(() => ["all", ...Array.from(new Set(displayData.map(item => item.employer).filter(Boolean)))], [displayData]);
  const jobCategories = useMemo(() => ["all", ...Array.from(new Set(displayData.map(item => item.jobCategory).filter(Boolean)))], [displayData]);
  const statuses = ["all", "Hired", "Pending", "Rejected"];

  const formatDate = (value: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return format(d, "PP p");
  };

  // Filter data
  const filteredData = useMemo(() => {
    return displayData.filter(item => {
      if (selectedBarangay !== "all" && item.barangay !== selectedBarangay) return false;
      if (selectedEmployer !== "all" && item.employer !== selectedEmployer) return false;
      if (selectedJobCategory !== "all" && item.jobCategory !== selectedJobCategory) return false;
      const status = item.status || "Pending";
      if (selectedStatus !== "all" && status !== selectedStatus) return false;
      return true;
    });
  }, [displayData, selectedBarangay, selectedEmployer, selectedJobCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-green-100";
      case "Pending":
        return "bg-yellow-100";
      case "Rejected":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Referral ID", "Applicant", "Vacancy", "Employer", "Barangay", "Job Category", "Date Referred", "Status", "Feedback"];
    const rows = filteredData.map(item => [
      item.referralId,
      item.applicant,
      item.vacancy,
      item.employer,
      item.barangay,
      item.jobCategory,
      item.dateReferred,
      item.status,
      item.feedback,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-summary-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "CSV Exported",
      description: "Referral data has been exported successfully.",
    });
    onExportCSV?.();
  };

  const handleViewReferral = (item: ReferralSummaryItem) => {
    setSelectedReferral(item);
    setViewModalOpen(true);
  };

  const handleMessageApplicant = (item: ReferralSummaryItem) => {
    setSelectedReferral(item);
    setFeedbackModalOpen(true);
  };

  const handleDeleteReferral = async (item: ReferralSummaryItem) => {
    if (!confirm(`Are you sure you want to delete referral ${item.referralId}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log("Deleting referral with ID:", item.id);
      const response = await authFetch(`/api/referrals/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete referral");
      }

      toast({
        title: "Referral Deleted",
        description: `Referral ${item.referralId} has been deleted successfully.`,
      });

      // Trigger refresh callback to refetch data
      if (onRefresh) {
        onRefresh();
      } else {
        // Fallback to page reload if no refresh callback provided
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting referral:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete referral. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="rounded-xl bg-white border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Overview</p>
            <h3 className="text-xl font-semibold text-slate-900 leading-tight">
              Referral & Placement Summary
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap justify-start md:justify-end">
            {/* Filter Dropdowns */}
            <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay} value={barangay} className="text-xs">
                    {barangay === "all" ? "All Barangays" : barangay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployer} onValueChange={setSelectedEmployer}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Employer" />
              </SelectTrigger>
              <SelectContent>
                {employers.map((employer) => (
                  <SelectItem key={employer} value={employer} className="text-xs">
                    {employer === "all" ? "All Employers" : employer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedJobCategory} onValueChange={setSelectedJobCategory}>
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <SelectValue placeholder="Job Category" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((category) => (
                  <SelectItem key={category} value={category} className="text-xs">
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Dates</SelectItem>
                <SelectItem value="today" className="text-xs">Today</SelectItem>
                <SelectItem value="week" className="text-xs">This Week</SelectItem>
                <SelectItem value="month" className="text-xs">This Month</SelectItem>
                <SelectItem value="quarter" className="text-xs">This Quarter</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status === "all" ? "All Status" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="gap-2 bg-green-600 hover:bg-green-700 text-white text-xs h-9"
              onClick={handleExportCSV}
            >
              <Download className="h-3 w-3" />
              <span className="hidden md:inline">Export CSV</span>
            </Button>
          </div>

        </div>

          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-b border-border bg-slate-50/70">
                  <TableHead className="text-xs font-semibold text-slate-700">Referral ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Applicant</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Vacancy</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Employer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Barangay</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Date Referred</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <TableRow key={item.id} className="border-b border-border hover:bg-slate-50">
                          <TableCell className="text-sm font-medium text-slate-900">{item.referralId}</TableCell>
                          <TableCell className="text-sm text-slate-700">{item.applicant}</TableCell>
                          <TableCell className="text-sm text-slate-700">{item.vacancy}</TableCell>
                          <TableCell className="text-sm text-slate-700">{item.employer}</TableCell>
                          <TableCell className="text-sm text-slate-700">{item.barangay}</TableCell>
                          <TableCell className="text-sm text-slate-700">{item.jobCategory}</TableCell>
                          <TableCell className="text-sm text-slate-700">{formatDate(item.dateReferred)}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`inline-flex items-center gap-2 ${getStatusColor(item.status || "Pending")}`}>
                              <span className={`w-2 h-2 rounded-full ${getStatusBgColor(item.status || "Pending")}`} />
                              {item.status || "Pending"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Details"
                                onClick={() => handleViewReferral(item)}
                              >
                                <Eye className="h-4 w-4 text-slate-600 hover:text-slate-900" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title={item.feedback ? "Feedback Received" : "Request Feedback"}
                                onClick={() => handleMessageApplicant(item)}
                              >
                                <MessageCircle className={`h-4 w-4 ${item.feedback ? "text-green-600" : "text-slate-600"}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Delete"
                                onClick={() => handleDeleteReferral(item)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                          No referrals found with the selected filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 md:hidden">
                {filteredData.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-600">
                    No referrals found with the selected filters.
                  </div>
                )}
                {filteredData.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-4 shadow-xs bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Referral ID</p>
                        <p className="text-base font-semibold text-slate-900">{item.referralId}</p>
                        <p className="text-sm text-slate-700">{item.vacancy}</p>
                        <p className="text-sm text-slate-500">{item.employer}</p>
                      </div>
                      <span className={`inline-flex items-center gap-2 text-sm ${getStatusColor(item.status || "Pending")}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusBgColor(item.status || "Pending")}`} />
                        {item.status || "Pending"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
                      <span className="truncate"><strong className="text-slate-600">Applicant:</strong> {item.applicant}</span>
                      <span className="truncate"><strong className="text-slate-600">Barangay:</strong> {item.barangay}</span>
                      <span className="truncate"><strong className="text-slate-600">Category:</strong> {item.jobCategory}</span>
                      <span className="truncate"><strong className="text-slate-600">Date:</strong> {formatDate(item.dateReferred)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleViewReferral(item)}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleMessageApplicant(item)}>
                        <MessageCircle className="h-4 w-4" /> Feedback
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDeleteReferral(item)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
      </div>

      {/* Modals */}
      <ReferralViewModal 
        open={viewModalOpen} 
        onOpenChange={setViewModalOpen} 
        referral={selectedReferral}
      />
      <FeedbackRequestModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        referral={selectedReferral}
        hasFeedback={!!selectedReferral?.feedback}
      />
    </>
  );
}
