import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ReferralSummaryItem } from "./referral-summary-table";

interface ReferralViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: ReferralSummaryItem | null;
}

export function ReferralViewModal({ open, onOpenChange, referral }: ReferralViewModalProps) {
  if (!referral) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Referral Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Referral ID</label>
              <p className="text-sm font-semibold text-slate-900">{referral.referralId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <Badge className={`mt-1 ${getStatusColor(referral.status)}`}>
                {referral.status}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Applicant Name</label>
            <p className="text-sm font-semibold text-slate-900">{referral.applicant}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Vacancy</label>
              <p className="text-sm font-semibold text-slate-900">{referral.vacancy}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Employer</label>
              <p className="text-sm font-semibold text-slate-900">{referral.employer}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Date Referred</label>
            <p className="text-sm font-semibold text-slate-900">{referral.dateReferred}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Feedback</label>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{referral.feedback}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Contact the employer to follow up on this referral or get additional feedback.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
