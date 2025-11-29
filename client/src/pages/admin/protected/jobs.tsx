/**
 * Admin Job Vacancies Page
 * Route: /admin/jobs
 * Display job vacancies (SRS Form 2A) in card format
 * Only accessible to users with role='admin'
 */
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus, Archive, Eye, Edit, Briefcase } from 'lucide-react';
import { AddJobVacancyModal } from '@/components/add-job-vacancy-modal';
import { ViewEditJobVacancyModal } from '@/components/view-edit-job-vacancy-modal';
import { formatRelativeTime } from '@/lib/time-utils';
import { authFetch } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [viewEditModalOpen, setViewEditModalOpen] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [vacancyToArchive, setVacancyToArchive] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      // Use authFetch to get all jobs from /api/admin/jobs
      const res = await authFetch('/api/admin/jobs');
      if (!res.ok) throw new Error('Failed to fetch vacancies');
      const data = await res.json();
      // API may return array or { jobs: [] }
      let jobs: any[] = [];
      if (Array.isArray(data)) {
        jobs = data;
      } else if (data.jobs) {
        jobs = data.jobs;
      }
      setVacancies(jobs);
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

  const filteredVacancies = vacancies.filter(
    (v) =>
      v.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.establishmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mainSkillOrSpecialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArchiveVacancy = async (vacancyId: string) => {
    try {
      setIsArchiving(true);
      const res = await fetch(`/api/job-vacancies/${vacancyId}/archive`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Failed to archive vacancy');

      toast({
        title: 'Success',
        description: 'Job vacancy archived successfully',
      });

      fetchVacancies();
      setArchiveDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleViewVacancy = (vacancy: any) => {
    setSelectedVacancyId(vacancy.id);
    setViewEditModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={28} />
            Job Vacancies (SRS Form 2A)
          </h1>
          <p className="text-slate-600 mt-1">Manage all job vacancies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/jobs/vacancies/archived')}
            className="flex items-center gap-2"
          >
            <Archive size={20} />
            Archived Vacancies
          </Button>
          <Button onClick={() => setVacancyModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Post New Vacancy
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search by position, employer, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading vacancies...</p>
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'No vacancies match your search' : 'No job vacancies posted yet'}
          </p>
          <Button onClick={() => setVacancyModalOpen(true)} className="flex items-center gap-2 mx-auto">
            <Plus size={20} />
            Post First Vacancy
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                      {vacancy.positionTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {vacancy.establishmentName}
                    </p>
                </div>
              </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Salary</p>
                    <p className="font-semibold text-slate-900">
                      ₱{(vacancy.startingSalaryOrWage || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Openings</p>
                    <p className="font-semibold text-slate-900">
                      {typeof vacancy.vacantPositions === 'number' ? vacancy.vacantPositions : Number(vacancy.vacantPositions || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Status</p>
                    <p className="font-semibold text-slate-900">
                      {vacancy.jobStatus === 'P' ? 'Permanent (P)' : 
                       vacancy.jobStatus === 'T' ? 'Temporary (T)' : 
                       vacancy.jobStatus === 'C' ? 'Contractual (C)' : 
                       vacancy.jobStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Education</p>
                    <p className="font-semibold text-slate-900 line-clamp-1">
                      {vacancy.minimumEducationRequired || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium mb-1">Experience</p>
                    <p className="font-semibold text-slate-900">
                      {vacancy.yearsOfExperienceRequired || 0}+ yrs
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {vacancy.mainSkillOrSpecialization && (
                  <div className="mb-3 pb-3 border-b border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Main Skill</p>
                    <p className="text-sm text-slate-900 line-clamp-2">
                      {vacancy.mainSkillOrSpecialization}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-slate-500 mb-3">
                  Posted {formatRelativeTime(vacancy.createdAt || new Date().toISOString())}
                </p>
              </div>

              {/* Footer - Action Buttons */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1"
                    onClick={() => {
                      setSelectedVacancyId(vacancy.id);
                      setViewEditModalOpen(true);
                    }}
                  >
                    <Eye size={14} />
                    View / Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                    onClick={() => {
                      setVacancyToArchive(vacancy);
                      setArchiveDialogOpen(true);
                    }}
                  >
                    <Archive size={14} />
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Vacancy Modal */}
      <AddJobVacancyModal
        open={vacancyModalOpen}
        onOpenChange={setVacancyModalOpen}
        onJobVacancyAdded={fetchVacancies}
      />

      {/* View/Edit Job Vacancy Modal */}
      <ViewEditJobVacancyModal
        open={viewEditModalOpen}
        onOpenChange={setViewEditModalOpen}
        vacancyId={selectedVacancyId || undefined}
        onSave={fetchVacancies}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Vacancy?</AlertDialogTitle>
            <AlertDialogDescription>
              Job vacancy "{vacancyToArchive?.positionTitle}" at {vacancyToArchive?.establishmentName} will be archived. You can view and restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (vacancyToArchive) {
                handleArchiveVacancy(vacancyToArchive.id);
              }
            }}
            disabled={isArchiving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
