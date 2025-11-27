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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.company || user?.name}!
          </h1>
          <p className="text-slate-600 mt-1">Manage your job postings and applications</p>
        </div>
        <Button onClick={() => setLocation('/employer/jobs')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <TabsList>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="jobs">Your Job Postings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{app.applicantName}</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{job.title}</h3>
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
            <Card>
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

            <Card>
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
  );
}
