/**
 * Employer Dashboard
 * Route: /employer/dashboard
 * Only accessible to users with role='employer'
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth, authFetch } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/employer/dashboard'],
    queryFn: async () => {
      const res = await authFetch('/api/employer/dashboard');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/employer/applications'],
    queryFn: async () => {
      const res = await authFetch('/api/employer/applications');
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    },
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/employer/jobs'],
    queryFn: async () => {
      const res = await authFetch('/api/employer/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interview':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 text-slate-900">
      <div className="relative isolate overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-8">
          {/* Hero */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Employer workspace</p>
                {/* Title handled by TopNavbar. */}
                <p className="text-3xl md:text-4xl font-semibold text-slate-900">
                  Welcome back, {user?.company || user?.name}!
                </p>
                <p className="text-slate-600">Orchestrate your roles, applicants, and teams in one clean view.</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Live postings synced</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Realtime analytics</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Collaborative hiring</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50" onClick={() => setLocation('/employer/profile')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Company profile
                </Button>
                <Button onClick={() => setLocation('/employer/jobs')} size="lg" className="bg-sky-600 text-white hover:bg-sky-500 shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Post new job
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <StatsCard
                  title="Total Job Postings"
                  value={stats?.totalJobPostings || 0}
                  description={`${stats?.activeJobPostings || 0} active`}
                  icon={Briefcase}
                />
                <StatsCard
                  title="Total Applications"
                  value={stats?.totalApplications || 0}
                  description="From all job postings"
                  icon={Users}
                />
                <StatsCard
                  title="Pending Review"
                  value={stats?.pendingApplications || 0}
                  description="Awaiting your action"
                  icon={Clock}
                />
                <StatsCard
                  title="Hired Candidates"
                  value={stats?.hiredCandidates || 0}
                  description="Successfully hired"
                  icon={UserCheck}
                />
              </>
            )}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList className="bg-white border border-slate-200 text-slate-700 shadow-sm">
              <TabsTrigger value="applications">Recent Applications</TabsTrigger>
              <TabsTrigger value="jobs">Your Job Postings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-4">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Recent Applications</CardTitle>
                  <CardDescription className="text-slate-600">
                    Review and manage applications to your job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : Array.isArray(applications) && applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 10).map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-sky-100 border border-slate-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-sky-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{app.applicantName}</p>
                            <p className="text-sm text-slate-600">Applied on {formatDate(app.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/employer/applications`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600">No applications yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Applications will appear here when candidates apply to your jobs
                  </p>
                </div>
              )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Your Job Postings</CardTitle>
                  <CardDescription className="text-slate-600">
                    Manage your active and draft job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : Array.isArray(jobs) && jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-slate-600">{job.location}</p>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/employer/jobs')}
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600">No job postings yet</p>
                  <Button className="mt-4" onClick={() => setLocation('/employer/jobs')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Job Posting
                  </Button>
                </div>
              )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle>Application Status Overview</CardTitle>
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
                  <span className="font-medium">{stats?.shortlistedCandidates || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hired</span>
                  </div>
                  <span className="font-medium">{stats?.hiredCandidates || 0}</span>
                </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/employer/jobs')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/employer/applications')}>
                      <Users className="h-4 w-4 mr-2" />
                      Review Applications
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/employer/profile')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Update Company Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
