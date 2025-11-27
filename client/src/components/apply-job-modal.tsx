/**
 * Apply Job Modal Component
 * Allows jobseekers to apply for a job with a cover letter
 */
import { useState, useEffect } from 'react';
import type { JobVacancy } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/auth';
import { Briefcase, Send, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';


interface ApplyJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: JobVacancy | null;
  onSuccess?: () => void;
}

export function ApplyJobModal({
  open,
  onOpenChange,
  vacancy,
  onSuccess,
}: ApplyJobModalProps) {
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCoverLetter('');
      setHasApplied(false);
      checkIfAlreadyApplied();
    }
  }, [open, vacancy]);

  const checkIfAlreadyApplied = async () => {
    if (!vacancy) return;
    
    try {
      const res = await authFetch(`/api/job-vacancies/${vacancy.id}/check-application`);
      if (res.ok) {
        const data = await res.json();
        setHasApplied(data.hasApplied || false);
      }
    } catch (error) {
      // Silently fail - user can still try to apply
      console.error('Error checking application status:', error);
    }
  };

  const handleSubmit = async () => {
    if (!vacancy) return;

    // Validate cover letter
    if (!coverLetter.trim()) {
      toast({
        title: 'Cover Letter Required',
        description: 'Please write a cover letter to explain why you\'re interested in this position.',
        variant: 'destructive',
      });
      return;
    }

    if (coverLetter.trim().length < 50) {
      toast({
        title: 'Cover Letter Too Short',
        description: 'Please write at least 50 characters to describe your interest and qualifications.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authFetch(`/api/job-vacancies/${vacancy.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          coverLetter: coverLetter.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to submit application');
      }

      toast({
        title: 'Application Submitted!',
        description: `Your application for ${vacancy.positionTitle} has been sent successfully.`,
      });

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Application Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="text-purple-600" size={24} />
            Apply for Position
          </DialogTitle>
          <DialogDescription className="text-base">
            Submit your application for this position at {vacancy.establishmentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {vacancy.positionTitle}
            </h3>
            <p className="text-slate-700 font-medium mb-3">{vacancy.establishmentName}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {vacancy.startingSalaryOrWage && (
                <div>
                  <p className="text-slate-600 font-medium">Salary</p>
                  <p className="text-slate-900 font-semibold">
                    ₱{vacancy.startingSalaryOrWage.toLocaleString()} / Monthly
                  </p>
                </div>
              )}
              {vacancy.minimumEducationRequired && (
                <div>
                  <p className="text-slate-600 font-medium">Education</p>
                  <p className="text-slate-900 font-semibold">
                    {vacancy.minimumEducationRequired}
                  </p>
                </div>
              )}
              {vacancy.yearsOfExperienceRequired !== undefined && (
                <div>
                  <p className="text-slate-600 font-medium">Experience</p>
                  <p className="text-slate-900 font-semibold">
                    {vacancy.yearsOfExperienceRequired === 0 
                      ? 'No experience required' 
                      : `${vacancy.yearsOfExperienceRequired}+ years`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Already Applied Alert */}
          {hasApplied && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have already applied to this position. Submitting again will update your previous application.
              </AlertDescription>
            </Alert>
          )}

          {/* Cover Letter Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} />
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-600 mb-2">
              Tell the employer why you're interested in this position and what makes you a great fit. 
              Highlight your relevant skills and experience.
            </p>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my strong interest in the position of [Position Title] at [Company Name]. With my background in [your relevant experience], I am confident that I can contribute effectively to your team.&#10;&#10;[Explain your qualifications and why you're a good fit]&#10;&#10;I am excited about the opportunity to bring my skills to your organization and would welcome the chance to discuss how I can contribute to your team's success.&#10;&#10;Sincerely,&#10;[Your Name]"
              className="min-h-[250px] resize-y font-sans text-base"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{coverLetter.trim().length} characters</span>
              <span className={coverLetter.trim().length < 50 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                {coverLetter.trim().length < 50 ? `Minimum 50 characters (${50 - coverLetter.trim().length} more needed)` : 'Looks good!'}
              </span>
            </div>
          </div>

          {/* Application Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Application Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Be specific about your relevant skills and experience</li>
              <li>Show enthusiasm for the role and company</li>
              <li>Proofread your letter for spelling and grammar</li>
              <li>Keep it professional but let your personality shine</li>
              <li>Explain how you can add value to the organization</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || coverLetter.trim().length < 50}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
