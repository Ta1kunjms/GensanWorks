/**
 * Jobseeker Applications Tracking Page
 * Route: /jobseeker/applications
 * Only accessible to users with role='jobseeker' or 'freelancer'
 */
import { useMemo } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchJobseekerApplications } from '@/api/applications';

export default function JobseekerApplicationsPage() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobseeker','applications'],
    queryFn: fetchJobseekerApplications,
    staleTime: 60_000,
  });

  const applications = useMemo(() => data || [], [data]);

  if (error instanceof Error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'hired':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-600 mt-1">Track your job applications</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Job Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-slate-600">No applications yet</div>
                      <Link href="/jobseeker/jobs">
                        <a className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <span className="material-icons">search</span>
                          Start Applying
                        </a>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 text-slate-900 font-medium">{app.job?.title || 'Unknown Job'}</td>
                    <td className="px-6 py-4 text-slate-600">{app.job?.employer?.company || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{app.job?.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
