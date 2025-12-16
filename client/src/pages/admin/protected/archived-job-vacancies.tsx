import { useState, useEffect } from 'react';
import type { JobVacancy as BaseJobVacancy } from '@shared/schema';
import { AlertCircle, ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ViewEditJobVacancyModal } from '@/components/view-edit-job-vacancy-modal';
import { formatRelativeTime } from '@/lib/time-utils';

type ArchivedJobVacancy = BaseJobVacancy & {
  numberOfVacancies?: number; // maps to vacantPositions
  salaryType?: string;
  archivedAt?: string;
};

export default function ArchivedJobVacanciesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [archivedVacancies, setArchivedVacancies] = useState<ArchivedJobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'restore' | 'delete'>('restore');
  const [confirmVacancyId, setConfirmVacancyId] = useState<string | null>(null);
  const [confirmVacancyTitle, setConfirmVacancyTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // View/Edit modal state
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedVacancies();
  }, []);

  const fetchArchivedVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/job-vacancies/archived');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch archived vacancies: ${response.status}`);
      }
      
      const data = await response.json();
      const vacancies = Array.isArray(data) ? data : [];
      
      setArchivedVacancies(vacancies);
    } catch (err) {
      console.error('Error fetching archived vacancies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load archived vacancies');
      toast({
        title: 'Error',
        description: 'Failed to load archived vacancies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = archivedVacancies.filter(vacancy =>
    vacancy.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacancy.establishmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vacancy.mainSkillOrSpecialization?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Open confirmation dialog
  const openConfirmDialog = (vacancyId: string, vacancyTitle: string, action: 'restore' | 'delete') => {
    setConfirmVacancyId(vacancyId);
    setConfirmVacancyTitle(vacancyTitle);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  // Execute confirmed action
  const confirmAndExecute = async () => {
    if (!confirmVacancyId) return;

    setIsProcessing(true);
    try {
      if (confirmAction === 'restore') {
        const response = await fetch(`/api/job-vacancies/${confirmVacancyId}/unarchive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to restore vacancy');
        }

        toast({
          title: 'Success',
          description: `"${confirmVacancyTitle}" has been restored to active jobs`,
        });

        setArchivedVacancies(prev => prev.filter(v => v.id !== confirmVacancyId));
      } else if (confirmAction === 'delete') {
        const response = await fetch(`/api/job-vacancies/${confirmVacancyId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete vacancy');
        }

        toast({
          title: 'Success',
          description: `"${confirmVacancyTitle}" has been permanently deleted`,
        });

        setArchivedVacancies(prev => prev.filter(v => v.id !== confirmVacancyId));
      }
    } catch (err) {
      console.error(`Error ${confirmAction}ing vacancy:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${confirmAction} vacancy`,
        variant: 'destructive',
      });
    } finally {
      setConfirmDialogOpen(false);
      setConfirmVacancyId(null);
      setConfirmVacancyTitle('');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading archived vacancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button (title handled by TopNavbar) */}
      <div className="flex items-center justify-end">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/jobs')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Active Jobs
        </Button>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Archived</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{archivedVacancies.length}</div>
          <p className="text-xs text-gray-500 mt-1">Archived job vacancies</p>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by position, establishment, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {filteredVacancies.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">Showing {filteredVacancies.length} of {archivedVacancies.length} archived vacancies</p>
        )}
      </div>

      {/* No Results */}
      {filteredVacancies.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {archivedVacancies.length === 0 ? 'No archived vacancies yet' : 'No vacancies match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {archivedVacancies.length === 0
              ? 'Archive job vacancies to see them here'
              : 'Try adjusting your search'}
          </p>
          {archivedVacancies.length === 0 && (
            <Button variant="outline" onClick={() => navigate('/admin/jobs')}>
              Go to Active Jobs
            </Button>
          )}
        </div>
      )}

      {/* Job Vacancies Grid */}
      {filteredVacancies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacancies.map(vacancy => (
            <Card key={vacancy.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{vacancy.positionTitle}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{vacancy.establishmentName}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-3">
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-green-600">
                    ₱{(vacancy.startingSalaryOrWage || 0).toLocaleString()} {vacancy.salaryType || 'Monthly'}
                  </div>
                  {vacancy.mainSkillOrSpecialization && (
                    <p className="text-gray-600 line-clamp-2">{vacancy.mainSkillOrSpecialization}</p>
                  )}
                  <div className="text-gray-500 text-xs">
                    Vacancies: {vacancy.numberOfVacancies}
                  </div>
                  {vacancy.archivedAt && (
                    <div className="text-gray-500 text-xs">
                      Archived {formatRelativeTime(vacancy.archivedAt)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => {
                      if (vacancy.id) {
                        setSelectedVacancyId(vacancy.id);
                        setViewEditModalOpen(true);
                      }
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 gap-1"
                    onClick={() => vacancy.id && openConfirmDialog(vacancy.id, vacancy.positionTitle, 'restore')}
                    disabled={!vacancy.id}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => vacancy.id && openConfirmDialog(vacancy.id, vacancy.positionTitle, 'delete')}
                    disabled={!vacancy.id}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View/Edit Modal */}
      <ViewEditJobVacancyModal
        open={viewEditModalOpen}
        onOpenChange={setViewEditModalOpen}
        vacancyId={selectedVacancyId || undefined}
        viewOnly={true}
        onSave={fetchArchivedVacancies}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirm {confirmAction === 'restore' ? 'Restore' : 'Delete'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'restore'
                ? `Are you sure you want to restore "${confirmVacancyTitle}" to active jobs? It will be visible again.`
                : `Are you sure you want to delete "${confirmVacancyTitle}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {confirmAction === 'delete' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will permanently remove the job vacancy. Consider restoring it instead if you want to keep it.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'delete' ? 'destructive' : 'default'}
              onClick={confirmAndExecute}
              disabled={isProcessing}
              className="gap-1"
            >
              {isProcessing ? 'Processing...' : (confirmAction === 'restore' ? 'Restore' : 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
