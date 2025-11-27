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
  DollarSign
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

  // Endpoint returns an array of applications (not wrapped)
  const applications = applicationsData || [];
  const jobs = jobsData?.jobs || [];

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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-600 mt-1">
            {user?.role === 'freelancer' ? 'Find your next gig' : 'Your job search journey'}
          </p>
        </div>
        <Button onClick={() => setLocation('/jobseeker/jobs')} size="lg">
          <Search className="h-4 w-4 mr-2" />
          Browse Jobs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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

      {/* Profile Completeness Alert */}
      {stats && stats.profileCompleteness < 100 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-slate-600 mb-3">
                  A complete profile increases your chances of getting hired by 70%
                </p>
                <Progress value={stats.profileCompleteness} className="h-2 mb-2" />
                <p className="text-xs text-slate-500">{stats.profileCompleteness}% complete</p>
              </div>
              <Button onClick={() => setLocation('/jobseeker/profile')} variant="outline">
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="jobs">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{app.job?.title || 'Job Position'}</h3>
                        <p className="text-sm text-slate-600">Applied on {formatDate(app.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation('/jobseeker/applications')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600">No applications yet</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Recommended Jobs</CardTitle>
              <CardDescription>
                Jobs matching your skills and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job: any) => (
                    <div
                      key={job.id}
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => setLocation('/jobseeker/jobs')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{job.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{job.company}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            {job.salaryMin && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ₱{job.salaryMin?.toLocaleString()} - ₱{job.salaryMax?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-600">No jobs available right now</p>
                  <p className="text-sm text-slate-500 mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/jobseeker/jobs')}>
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Jobs
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/jobseeker/applications')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Applications
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setLocation('/jobseeker/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
