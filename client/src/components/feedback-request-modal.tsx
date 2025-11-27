import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReferralSummaryItem } from "./referral-summary-table";

interface FeedbackRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: ReferralSummaryItem | null;
  hasFeedback: boolean;
}

export function FeedbackRequestModal({ open, onOpenChange, referral, hasFeedback }: FeedbackRequestModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("Feedback Request - Referral Status");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!referral) return;

    setIsLoading(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email Sent",
        description: `Feedback request email sent to ${referral.employer}`,
      });
      
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!referral) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {hasFeedback ? "Feedback Already Received" : "Request Employer Feedback"}
          </DialogTitle>
        </DialogHeader>

        {hasFeedback ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">Feedback Received</p>
              <p className="text-sm text-green-800">{referral.feedback}</p>
            </div>
            <p className="text-xs text-slate-600">
              Feedback has already been received for this referral. No further action is needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">To</Label>
              <Input
                type="email"
                placeholder={referral.employer}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Subject</Label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Message</Label>
              <Textarea
                placeholder={`Hi ${referral.employer},\n\nCould you please provide feedback on ${referral.applicant} who was referred for the ${referral.vacancy} position?\n\nThank you,\nGensanWorks Team`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 min-h-[150px]"
              />
            </div>

            <p className="text-xs text-slate-600">
              <strong>Referral:</strong> {referral.applicant} → {referral.vacancy}
            </p>
          </div>
        )}

        {!hasFeedback && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
