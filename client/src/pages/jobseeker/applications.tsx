/**
 * Jobseeker Applications Tracking Page
 * Route: /jobseeker/applications
 * Only accessible to users with role='jobseeker' or 'freelancer'
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchJobseekerApplications } from '@/api/applications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Briefcase, Clock, MapPin, Search, FileText, Building2, Send, DollarSign, GraduationCap, ArrowRight, Filter } from 'lucide-react';

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending review', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100' },
  interviewed: { label: 'Interview', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100' },
  shortlisted: { label: 'Shortlisted', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100' },
  hired: { label: 'Hired', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100' },
};

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently submitted');

export default function JobseekerApplicationsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['jobseeker', 'applications'],
    queryFn: fetchJobseekerApplications,
    staleTime: 60_000,
  });

  const applications = useMemo(() => data || [], [data]);

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications
      .filter((app) => {
        if (statusFilter !== 'all' && app.status !== statusFilter) return false;
        if (!term) return true;
        const job: any = (app as any).job || {};
        const haystack = [
          job.title,
          job.positionTitle,
          job.employer?.company,
          job.establishmentName,
          job.location,
          job.barangay,
          job.municipality,
          job.province,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
  }, [applications, searchTerm, statusFilter]);

  useEffect(() => {
    if (error instanceof Error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [error, toast]);

  const summary = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'pending').length;
    const hired = applications.filter((app) => app.status === 'hired').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;
    return { total, pending, hired, rejected };
  }, [applications]);

  const openDetail = (app: any) => {
    setSelectedApplication(app);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedApplication(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-bold leading-tight">My Applications</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Track progress, follow up quickly, and jump back into jobs that match.</p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <Clock className="h-4 w-4" />
            {isFetching ? 'Refreshing...' : 'Live view synced with employer decisions.'}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Total</p>
              <p className="mt-2 text-3xl font-semibold">{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/90 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-100">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-amber-800 dark:text-amber-50">{summary.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/90 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-100">Hired</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-800 dark:text-emerald-50">{summary.hired}</p>
            </CardContent>
          </Card>
          <Card className="border-rose-200 bg-rose-50/90 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700 dark:text-rose-100">Rejected</p>
              <p className="mt-2 text-3xl font-semibold text-rose-800 dark:text-rose-50">{summary.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">Recent updates</CardTitle>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setLocation('/jobseeker/jobs')}>
              <Search className="h-4 w-4" />
              Find more jobs
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    className={statusFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'border-slate-200'}
                    onClick={() => setStatusFilter('all')}
                    role="button"
                  >
                  All
                </Badge>
                {Object.entries(statusStyles).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant={statusFilter === key ? 'default' : 'outline'}
                      className={statusFilter === key ? `${value.className} shadow-sm` : 'cursor-pointer border-slate-200'}
                    onClick={() => setStatusFilter(key)}
                    role="button"
                  >
                    {value.label}
                  </Badge>
                ))}
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search title, company, location"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setLocation('/jobseeker/jobs')}>
                  <Filter className="h-4 w-4" />
                  New matches
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1,2,3].map((key) => (
                  <Card key={key} className="border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                    <CardContent className="space-y-3 pt-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && applications.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/70">
                <Briefcase className="h-10 w-10 text-slate-400" />
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No applications yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Start applying to track status in real time.</p>
                </div>
                <Button className="gap-2" onClick={() => setLocation('/jobseeker/jobs')}>
                  <Search className="h-4 w-4" />
                  Browse jobs
                </Button>
              </div>
            )}

            {!isLoading && applications.length > 0 && filteredApplications.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/70">
                <Search className="h-10 w-10 text-slate-400" />
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No matches found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Try adjusting filters or search keywords.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <Button size="sm" variant="outline" onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}>Reset filters</Button>
                </div>
              </div>
            )}

            {!isLoading && filteredApplications.length > 0 && (
              <div className="space-y-3">
                {filteredApplications.map((app) => {
                  const job: any = app.job || {};
                  const status = statusStyles[app.status] || { label: app.status || 'In progress', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100' };
                  const company = job.employer?.company || job.establishmentName || 'Employer pending';
                  const location = job.location || [job.barangay, job.municipality, job.province].filter(Boolean).join(', ') || 'Location not provided';
                  const title = job.title || job.positionTitle || 'Job opportunity';
                  const salary = job.startingSalaryOrWage || job.salaryMin || job.salaryMax;
                  const followUpMessage = `Hello, I am following up on my application for ${title} at ${company}${app.id ? ` (Application ID: ${app.id})` : ''}.`;
                  const followUpLink = `/jobseeker/messages?prefill=${encodeURIComponent(followUpMessage)}`;
                  return (
                    <Card
                      key={app.id}
                      className="border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
                      role="button"
                      onClick={() => openDetail(app)}
                    >
                      <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={status.className}>{status.label}</Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-300">Applied {formatDate(app.createdAt)}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{company}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{location}</span>
                            <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />{salary ? `₱${Number(salary).toLocaleString()}` : 'Negotiable'}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
                          <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); setLocation('/jobseeker/jobs'); }}>
                            <Search className="h-4 w-4" />
                            View jobs
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setLocation(followUpLink); }} className="gap-1">
                            <Send className="h-4 w-4" />
                            Follow up
                          </Button>
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); openDetail(app); }} className="gap-1">
                            <FileText className="h-4 w-4" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  {selectedApplication.job?.title || selectedApplication.job?.positionTitle || 'Job application'}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Badge className={(statusStyles[selectedApplication.status]?.className) || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}>
                    {statusStyles[selectedApplication.status]?.label || selectedApplication.status || 'In progress'}
                  </Badge>
                  <span>Applied {formatDate(selectedApplication.createdAt)}</span>
                  {selectedApplication.id && <span className="text-xs text-slate-500 dark:text-slate-300">Application ID: {selectedApplication.id}</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Company</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedApplication.job?.employer?.company || selectedApplication.job?.establishmentName || 'Employer pending'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedApplication.job?.contact_email || selectedApplication.job?.job_contact_email || 'No contact email provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Location</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedApplication.job?.location || [selectedApplication.job?.barangay, selectedApplication.job?.municipality, selectedApplication.job?.province].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">Posted {formatDate(selectedApplication.job?.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-[11px] uppercase text-slate-500 dark:text-slate-300">Salary</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {selectedApplication.job?.startingSalaryOrWage || selectedApplication.job?.salaryMin || selectedApplication.job?.salaryMax
                        ? `₱${Number(selectedApplication.job?.startingSalaryOrWage || selectedApplication.job?.salaryMin || selectedApplication.job?.salaryMax).toLocaleString()}`
                        : 'Negotiable'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-[11px] uppercase text-slate-500 dark:text-slate-300">Education</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {selectedApplication.job?.minimumEducationRequired || selectedApplication.job?.educationLevel || 'Any'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-[11px] uppercase text-slate-500 dark:text-slate-300">Schedule</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {(selectedApplication.job as any)?.job_schedule || 'Standard'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <FileText className="h-4 w-4" />
                  Cover letter
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
                  {selectedApplication.coverLetter || selectedApplication.cover_letter || 'No cover letter on record.'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Send className="h-4 w-4" />
                  Suggested next steps
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <li>• Confirm your interview availability by messaging the employer.</li>
                  <li>• Bring printed copies of your resume and IDs for on-site interviews.</li>
                  <li>• Keep your phone reachable; update status after employer feedback.</li>
                </ul>
              </div>

              <Separator className="dark:bg-neutral-800" />

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setLocation('/jobseeker/messages')}>
                  Message employer
                </Button>
                <Button onClick={closeDetail} className="gap-1">
                  <ArrowRight className="h-4 w-4" />
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
