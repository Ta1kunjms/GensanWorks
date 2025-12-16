/**
 * Apply Job Modal Component
 * Allows jobseekers to apply for a job with a cover letter
 */
import { useState, useEffect } from 'react';
import type { JobVacancy } from '@shared/schema';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/auth';
import { 
  Briefcase, 
  Send, 
  Loader2, 
  FileText, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const resolveEmployerId = (vacancy: JobVacancy) =>
  (vacancy as any).employerId || (vacancy as any).employer_id || (vacancy as any).employerid || (vacancy as any).employer || null;

const resolveApplyEndpoint = (vacancy: JobVacancy) => {
  if (!vacancy?.id) return null;
  return `/api/jobs/${vacancy.id}/apply`;
};

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
    if (!vacancy?.id) return;

    try {
      const res = await authFetch('/api/jobseeker/applications');
      if (res.ok) {
        const data = await res.json();
        const applications = Array.isArray(data) ? data : data?.applications || [];
        const alreadyApplied = applications.some((app: any) => app.jobId === vacancy.id || app.job_id === vacancy.id);
        setHasApplied(alreadyApplied);
      }
    } catch (error) {
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
      const endpoint = resolveApplyEndpoint(vacancy) || `/api/job-vacancies/${vacancy.id}/apply`;
      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: coverLetter.trim(),
          jobId: vacancy.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend signals already applied, convert to friendly toast
        if (res.status === 400 && (data?.message || '').toLowerCase().includes('already applied')) {
          setHasApplied(true);
          toast({
            title: 'Already applied',
            description: 'You have already submitted an application. We will keep your latest update.',
          });
          return;
        }
        throw new Error(data.message || data.error?.message || 'Failed to submit application');
      }

      toast({
        title: 'Application Submitted!',
        description: `Your application for ${vacancy.positionTitle} has been sent successfully.`,
      });

      // Fire-and-forget notification to the employer's inbox
      notifyEmployerOfApplication(vacancy, coverLetter.trim());

      setHasApplied(true);

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

  const notifyEmployerOfApplication = async (appliedVacancy: JobVacancy, coverLetterText: string) => {
    const employerId = resolveEmployerId(appliedVacancy);
    if (!employerId) return;

    const subject = `New application: ${appliedVacancy.positionTitle || 'Job'}`;
    const preview = coverLetterText.length > 240 ? `${coverLetterText.slice(0, 237)}...` : coverLetterText;
    const location = (appliedVacancy as any).location;
    const content = [
      `Hi, I just applied for ${appliedVacancy.positionTitle || 'your job posting'}.`,
      '',
      `Role: ${appliedVacancy.positionTitle || 'Job'}`,
      `Company: ${appliedVacancy.establishmentName || 'Your organization'}`,
      location ? `Location: ${location}` : null,
      '',
      'Cover letter preview:',
      preview || 'I submitted my application without a cover letter.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await authFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: employerId, receiverRole: 'employer', subject, content }),
      });
    } catch (err) {
      console.error('Unable to notify employer of application', err);
      toast({
        title: 'Employer notification queued',
        description: 'We could not send an instant inbox alert, but your application was submitted.',
      });
    }
  };

  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
      'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500',
      'bg-amber-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!vacancy) return null;

  const employerName = vacancy.establishmentName || 'Company';
  const companyColor = getCompanyColor(employerName);
  const companyInitial = employerName.charAt(0).toUpperCase();
  const location = (vacancy as any).location || 
    [(vacancy as any).barangay, (vacancy as any).municipality, (vacancy as any).province].filter(Boolean).join(', ');
  const salary = vacancy.startingSalaryOrWage ? `₱${vacancy.startingSalaryOrWage.toLocaleString()}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border-slate-200 shadow-2xl">
        {/* Top Accent Bar */}
        <div className={cn("h-20 w-full shrink-0", companyColor)} />
        
        <div className="px-8 pb-6 -mt-10 flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-end gap-5 mb-6">
            <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-lg shrink-0">
              <div className={cn("h-full w-full rounded-lg flex items-center justify-center text-white font-bold text-3xl", companyColor)}>
                {companyInitial}
              </div>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{vacancy.positionTitle}</h2>
              <div className="flex items-center gap-2 text-slate-600 mt-1">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{employerName}</span>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-8 px-8">
            <div className="space-y-6 pb-6">
              {/* Job Summary Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {salary && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Salary</div>
                      <div className="text-sm font-bold text-slate-900">{salary}</div>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Location</div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">{location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Already Applied Alert */}
              {hasApplied && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    You have already applied to this position. Submitting again will update your previous application.
                  </AlertDescription>
                </Alert>
              )}

              {/* Cover Letter Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Cover Letter
                  </label>
                  <span className="text-xs font-medium text-slate-500">Required</span>
                </div>
                
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${vacancy.positionTitle} position at ${employerName}...\n\n[Explain your qualifications and why you're a good fit]\n\nSincerely,\n[Your Name]`}
                  className="min-h-[200px] resize-y font-sans text-base p-4 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  disabled={isSubmitting}
                />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{coverLetter.trim().length} characters</span>
                  {coverLetter.trim().length > 0 && (
                    <span className={cn(
                      "font-medium flex items-center gap-1.5",
                      coverLetter.trim().length < 50 ? 'text-amber-600' : 'text-emerald-600'
                    )}>
                      {coverLetter.trim().length < 50 ? (
                        <>Minimum 50 characters needed</>
                      ) : (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Looks good!</>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Application Tips */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-indigo-500" />
                  Tips for a strong application
                </h4>
                <ul className="space-y-2">
                  {[
                    "Highlight specific skills relevant to this role",
                    "Mention why you want to work for this specific company",
                    "Keep your tone professional but enthusiastic",
                    "Proofread for any spelling or grammar mistakes"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-800/80">
                      <span className="block h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-slate-100 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || coverLetter.trim().length < 50}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-sm hover:shadow min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
