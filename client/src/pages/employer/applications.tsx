/**
 * Employer Applications Page
 * Route: /employer/applications
 * Only accessible to users with role='employer'
 */
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Eye, Save, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmployerApplicationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [nextStatusMap, setNextStatusMap] = useState<Record<string, string>>({});
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'interview' | 'shortlisted' | 'accepted' | 'hired' | 'rejected'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const normalizeStatus = (status: string | null | undefined) => (status || "").toLowerCase();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/employer/applications');
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

  const pendingCount = useMemo(() => applications.filter((a) => normalizeStatus(a.status) === 'pending').length, [applications]);
  const jobOptions = useMemo(() => {
    const uniq = new Map<string, string>();
    applications.forEach((a) => {
      const id = a.job?.id || a.jobId;
      const label = a.job?.title || a.job?.positionTitle || 'Untitled role';
      if (id && !uniq.has(id)) uniq.set(id, label);
    });
    return Array.from(uniq.entries()).map(([id, label]) => ({ id, label }));
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const byJob = jobFilter === 'all' ? true : (a.job?.id || a.jobId) === jobFilter;
      const byStatus = statusFilter === 'all' ? true : normalizeStatus(a.status) === statusFilter;
      return byJob && byStatus;
    });
  }, [applications, jobFilter, statusFilter]);

  const handleCopy = async (value: string, label = 'ID') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    } catch (err: any) {
      toast({ title: 'Copy failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const openModal = (app: any) => {
    setSelected(app);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      if (!newStatus) {
        toast({ title: 'Select a status', variant: 'destructive' });
        return;
      }

      const notes = notesMap[applicationId]?.trim();
      const res = await authFetch(`/api/employer/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast({ title: 'Status updated', description: `Marked as ${newStatus}` });
      setNextStatusMap((prev) => ({ ...prev, [applicationId]: '' }));
      fetchApplications();
      
      // Invalidate React Query cache to refresh all referrals data across the app
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (app: any) => {
    setApplicationToDelete(app);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const res = await authFetch(`/api/employer/applications/${applicationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete application');

      toast({
        title: 'Application deleted',
        description: 'The application has been removed successfully',
      });

      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
      fetchApplications();

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/employer/applications'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
            <p className="text-sm text-slate-600 mt-1">Review and manage job applications</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-slate-700 mb-2 block">Filter by Job</label>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All jobs</SelectItem>
                    {jobOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-slate-700 mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No applications found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app) => {
                      const rawStatus = normalizeStatus(app.status) || 'pending';
                      const statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
                      const nextStatus = nextStatusMap[app.id] ?? '';
                      const notes = notesMap[app.id] ?? '';
                      
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{app.applicant?.name || 'Unknown'}</p>
                              <p className="text-sm text-slate-500">{app.applicant?.email || 'No email'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{app.job?.title || app.job?.positionTitle || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                rawStatus === 'hired' ? 'default' : 
                                rawStatus === 'rejected' ? 'destructive' : 
                                rawStatus === 'pending' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-600">
                              {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal(app)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select
                                value={nextStatus}
                                onValueChange={(val) => setNextStatusMap((prev) => ({ ...prev, [app.id]: val }))}
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="hired">Hired</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(app.id, nextStatus)}
                                disabled={!nextStatus}
                                title="Save status"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmDelete(app)}
                                title="Delete application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            {selected && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Application Details</DialogTitle>
                  <DialogDescription>
                    {selected.job?.title || selected.job?.positionTitle || 'Job Application'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Applicant Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                      <p className="mt-1 text-sm">{selected.applicant?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                      <p className="mt-1 text-sm">{selected.applicant?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                      <p className="mt-1 text-sm">{selected.applicant?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Applied Date</label>
                      <p className="mt-1 text-sm">
                        {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {(selected.coverLetter || selected.cover_letter) && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Cover Letter</label>
                      <div className="mt-2 p-4 bg-slate-50 rounded-lg text-sm">
                        {selected.coverLetter || selected.cover_letter}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Add Notes (Optional)</label>
                    <Textarea
                      value={notesMap[selected.id] ?? ''}
                      onChange={(e) => setNotesMap((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                      placeholder="Add internal notes about this applicant..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  {/* Quick Status Update */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Update Status</label>
                      <Select
                        value={nextStatusMap[selected.id] ?? ''}
                        onValueChange={(val) => setNextStatusMap((prev) => ({ ...prev, [selected.id]: val }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        handleStatusChange(selected.id, nextStatusMap[selected.id]);
                        closeModal();
                      }}
                      disabled={!nextStatusMap[selected.id]}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this application from{' '}
                <strong>{applicationToDelete?.applicant?.name || 'this applicant'}</strong>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setApplicationToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
