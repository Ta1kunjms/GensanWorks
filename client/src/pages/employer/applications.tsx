/**
 * Employer Applications Page
 * Route: /employer/applications
 * Only accessible to users with role='employer'
 */
import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function EmployerApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/referrals');
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (refId: string, newStatus: string) => {
    try {
      const res = await authFetch(`/api/referrals/${refId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast({
        title: 'Success',
        description: `Application ${newStatus}`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Applications Received</h1>
        <p className="text-slate-600 mt-1">Manage job applications from candidates</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Applicant Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Job Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600">
                    No applications received
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.referralId}>
                    <td className="px-6 py-4 text-slate-900 font-medium">{app.applicant?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{app.applicant?.email}</td>
                    <td className="px-6 py-4 text-slate-600">{app.job?.title || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : app.status === 'hired'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.referralId, 'hired')}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Hire
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.referralId, 'rejected')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
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
