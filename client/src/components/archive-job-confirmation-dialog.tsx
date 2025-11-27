import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ArchiveJobConfirmationDialogProps {
  isOpen: boolean;
  jobTitle: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ArchiveJobConfirmationDialog({
  isOpen,
  jobTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}: ArchiveJobConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <DialogTitle className="text-lg font-semibold">Archive Job Posting?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">"{jobTitle}"</span> will be archived and hidden from the active job list.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>When archived, this job posting will:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Be hidden from job seekers</li>
              <li>Move to the Archived Jobs section</li>
              <li>Remain accessible for viewing history</li>
              <li>Be restorable at any time</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 sm:w-auto"
          >
            {isLoading ? 'Archiving...' : 'Archive Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
