import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Referral } from "@shared/schema";

interface MessageModalProps {
  referral: Referral;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageModal({ referral, open, onOpenChange }: MessageModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent",
      description: `Your message has been sent regarding ${referral.referralId}`,
    });
    
    setMessage("");
    setIsSending(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-message">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Send Message</DialogTitle>
          <DialogDescription>
            Send a message about referral {referral.referralId} - {referral.applicant}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-[150px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-testid="textarea-message"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            data-testid="button-cancel-message"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
            data-testid="button-send-message"
          >
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
