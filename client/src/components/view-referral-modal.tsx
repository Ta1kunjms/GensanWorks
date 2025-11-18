import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Referral } from "@shared/schema";

interface ViewReferralModalProps {
  referral: Referral;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReferralModal({
  referral,
  open,
  onOpenChange,
}: ViewReferralModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="modal-view-referral">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Referral Details</DialogTitle>
          <DialogDescription>
            Complete information about referral {referral.referralId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Referral ID</p>
              <p className="text-base font-semibold text-foreground">
                {referral.referralId}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="outline" className={getStatusColor(referral.status)}>
                {referral.status}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Applicant</p>
              <p className="text-base text-foreground">{referral.applicant}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Date Referred</p>
              <p className="text-base text-foreground">{referral.dateReferred}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Vacancy</p>
              <p className="text-base text-foreground">{referral.vacancy}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Employer</p>
              <p className="text-base text-foreground">{referral.employer}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Feedback</p>
            <p className="text-base text-foreground leading-relaxed">
              {referral.feedback}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
