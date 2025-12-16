/**
 * Jobseeker Dashboard
 * Route: /jobseeker/dashboard
 * Only accessible to users with role='jobseeker' or 'freelancer'
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth, authFetch } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  User,
  TrendingUp,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function JobseekerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/jobseeker/dashboard'],
    queryFn: async () => {
      const res = await authFetch('/api/jobseeker/dashboard');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/jobseeker/applications'],
    queryFn: async () => {
      const res = await authFetch('/api/jobseeker/applications');
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    },
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    },
  });

  const totalApplications = stats?.totalApplications || 0;
  const shortlistRate = totalApplications
    ? Math.round(((stats?.shortlistedApplications || 0) / totalApplications) * 100)
    : 0;
  const successRate = totalApplications
    ? Math.round(((stats?.acceptedApplications || 0) / totalApplications) * 100)
    : 0;

  // Endpoint returns an array of applications (not wrapped)
  const applications = applicationsData || [];
  const jobs = Array.isArray(jobsData) ? jobsData : jobsData?.jobs || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100';
      case 'reviewed':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100';
      case 'interview':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 p-6 text-slate-900 dark:from-[#0b1220] dark:via-[#0e172a] dark:to-[#0b1220] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-sky-200 blur-3xl dark:bg-sky-900" />
        <div className="absolute bottom-0 right-6 h-72 w-72 rounded-full bg-indigo-200 blur-3xl dark:bg-indigo-900" />
      </div>
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <Card className="relative overflow-hidden border border-white/40 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.2),transparent_40%)]" />
          <CardContent className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-white/10 dark:text-white/80">
                Live job radar
              </div>
              <p className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Welcome back, {user?.name}.
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200/90">
                {user?.role === 'freelancer'
                  ? 'Curated gigs tailored to your pace and craft.'
                  : 'A calmer job hunt with real-time progress, saved roles, and profile nudges.'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-200/80">
                <span className="rounded-full bg-white/80 px-3 py-1 font-semibold shadow-sm dark:bg-white/10">Signal synced</span>
                <span className="rounded-full bg-white/80 px-3 py-1 font-semibold shadow-sm dark:bg-white/10">Human-reviewed matches</span>
                <span className="rounded-full bg-white/80 px-3 py-1 font-semibold shadow-sm dark:bg-white/10">Personal pace</span>
              </div>
            </div>
            <div className="grid w-full max-w-md gap-3 sm:grid-cols-2 lg:max-w-lg">
              <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-md backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-200/70">
                  Pipeline health
                  <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-100">
                    {statsLoading ? 'Loading' : `${shortlistRate}% shortlisted`}
                  </Badge>
                </div>
                <p className="mt-2 text-3xl font-semibold leading-none">{statsLoading ? '--' : `${successRate}%`}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Acceptance momentum this month</p>
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-lg backdrop-blur-lg dark:border-white/5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                  Profile pulse
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold">Live</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold leading-none">{stats?.profileCompleteness || 0}%</p>
                    <p className="mt-1 text-sm text-white/80">Completeness score</p>
                  </div>
                  <div className="h-14 w-14 rounded-full border border-white/30 bg-white/10 p-2">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                      {stats?.profileCompleteness || 0}%
                    </div>
                  </div>
                </div>
                <Button onClick={() => setLocation('/jobseeker/profile')} size="sm" variant="secondary" className="mt-3 w-full bg-white text-slate-900 hover:bg-white/90">
                  Polish profile
                </Button>
              </div>
            </div>
            <Button onClick={() => setLocation('/jobseeker/jobs')} size="lg" className="w-full max-w-xs bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90">
              <Search className="mr-2 h-4 w-4" />
              Browse roles
            </Button>
          </CardContent>
        </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
            <StatsCard
              title="Applications Sent"
              value={stats?.totalApplications || 0}
              description="Total submitted"
              icon={Send}
            />
            <StatsCard
              title="Pending"
              value={stats?.pendingApplications || 0}
              description="Under review"
              icon={Clock}
            />
            <StatsCard
              title="Shortlisted"
              value={stats?.shortlistedApplications || 0}
              description="Good news!"
              icon={TrendingUp}
            />
            <StatsCard
              title="Accepted"
              value={stats?.acceptedApplications || 0}
              description="Congratulations"
              icon={CheckCircle}
            />
            <StatsCard
              title="Profile"
              value={`${stats?.profileCompleteness || 0}%`}
              description="Completeness"
              icon={User}
            />
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="w-full justify-start gap-2 rounded-full bg-white/70 p-1 shadow-sm backdrop-blur-sm dark:bg-white/5">
          <TabsTrigger value="applications" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">My Applications</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">Activity</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card className="border border-white/60 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>
                Track the status of your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-slate-700 dark:bg-white/10 dark:text-white/80">
                          <Send className="h-3.5 w-3.5" /> Applied
                        </span>
                        <span className="text-slate-400">{formatDate(app.createdAt)}</span>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">{app.job?.title || 'Job Position'}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{app.job?.company || app.job?.establishmentName || 'Hiring company'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(app.status)} capitalize`}>{app.status}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation('/jobseeker/applications')}
                            className="border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-white/5"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-200">No applications yet</p>
                  <Button className="mt-4" onClick={() => setLocation('/jobseeker/jobs')}>
                    <Search className="h-4 w-4 mr-2" />
                    Start Applying
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card className="border border-white/60 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle>Recommended Jobs</CardTitle>
              <CardDescription>
                Jobs matching your skills and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-44" />
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {jobs.slice(0, 6).map((job: any) => {
                    const jobId = job.id;
                    const position = job.positionTitle || job.title || 'Untitled role';
                    const company = job.establishmentName || job.company || 'Confidential company';
                    const location = job.location || [job.barangay, job.municipality, job.province].filter(Boolean).join(', ') || 'General Santos City';
                    const salaryValue = job.startingSalaryOrWage ?? job.salaryMin ?? job.salaryMax ?? null;
                    const salaryRange = job.salaryMin && job.salaryMax
                      ? `₱${job.salaryMin.toLocaleString()} - ₱${job.salaryMax.toLocaleString()}`
                      : salaryValue
                        ? `₱${Number(salaryValue).toLocaleString()}`
                        : 'Negotiable';
                    const status = job.status || job.jobStatus || 'active';
                    const createdAtLabel = job.createdAt
                      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(job.createdAt))
                      : 'New';
                    const tags = [job.jobStatusPTC || job.jobStatus, job.job_category || job.jobCategory, job.job_shift || job.jobShift]
                      .filter(Boolean)
                      .slice(0, 3);

                    const goToJob = () => setLocation(jobId ? `/jobseeker/jobs?job=${jobId}` : '/jobseeker/jobs');

                    return (
                      <div
                        key={jobId || position}
                        className="group rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 p-4 shadow-md transition hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">Recommended · {createdAtLabel}</p>
                            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">{position}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{company}</p>
                          </div>
                          {status && (
                            <Badge variant={status === 'active' ? 'default' : 'secondary'} className="shrink-0 rounded-full px-3 py-1 capitalize">
                              {status}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                            <span className="line-clamp-1">{location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            <span>{salaryRange}</span>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <Button variant="outline" size="sm" className="w-full border-slate-200 bg-white/70 backdrop-blur hover:border-slate-300 dark:border-white/10 dark:bg-white/5" onClick={goToJob}>
                            View Details
                          </Button>
                          <Button size="sm" className="w-full shadow-sm hover:shadow" onClick={goToJob}>
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-200">No jobs available right now</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-white/60 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader>
                <CardTitle>Application Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{stats?.pendingApplications || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Shortlisted</span>
                  </div>
                  <span className="font-medium">{stats?.shortlistedApplications || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Accepted</span>
                  </div>
                  <span className="font-medium">{stats?.acceptedApplications || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="font-medium">{stats?.rejectedApplications || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-white/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl backdrop-blur-xl dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline" onClick={() => setLocation('/jobseeker/jobs')}>
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Jobs
                </Button>
                <Button className="w-full justify-start border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline" onClick={() => setLocation('/jobseeker/applications')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Applications
                </Button>
                <Button className="w-full justify-start border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline" onClick={() => setLocation('/jobseeker/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
