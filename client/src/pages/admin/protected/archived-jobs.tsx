'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ArrowUpDown, MapPin, Search, Trash2, RotateCcw, Calendar, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/time-utils';

interface Job {
  id: string;
  title: string;
  description?: string;
  employerName?: string;
  company?: string;
  location?: string;
  salary?: number;
  datePosted?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
}

export default function ArchivedJobsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [archivedJobs, setArchivedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'restore' | 'delete'>('restore');
  const [confirmJobId, setConfirmJobId] = useState<string | null>(null);
  const [confirmJobTitle, setConfirmJobTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch archived jobs
  useEffect(() => {
    fetchArchivedJobs();
  }, []);

  const fetchArchivedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/jobs/archived');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch archived jobs: ${response.status}`);
      }
      
      const data = await response.json();
      const jobs = Array.isArray(data.jobs) ? data.jobs : (Array.isArray(data) ? data : []);
      
      setArchivedJobs(jobs);
      
      // Extract unique locations
      const uniqueLocations = Array.from(new Set(jobs.map((j: Job) => j.location).filter(Boolean))) as string[];
      setLocations(uniqueLocations);
      
      applyFilters(jobs, searchTerm, filterLocation, sortBy);
    } catch (err) {
      console.error('Error fetching archived jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load archived jobs');
      toast({
        title: 'Error',
        description: 'Failed to load archived jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = (jobs: Job[], search: string, location: string, sort: 'recent' | 'oldest') => {
    let filtered = [...jobs];

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(lowerSearch) ||
        job.description?.toLowerCase().includes(lowerSearch) ||
        (job.employerName?.toLowerCase() || job.company?.toLowerCase() || '').includes(lowerSearch)
      );
    }

    // Location filter
    if (location && location !== 'all') {
      filtered = filtered.filter(job => job.location === location);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.datePosted || a.createdAt || 0).getTime();
      const dateB = new Date(b.datePosted || b.createdAt || 0).getTime();
      return sort === 'recent' ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(filtered);
  };

  // Update filters
  useEffect(() => {
    applyFilters(archivedJobs, searchTerm, filterLocation, sortBy);
  }, [searchTerm, filterLocation, sortBy, archivedJobs]);

  // Open confirmation dialog
  const openConfirmDialog = (jobId: string, jobTitle: string, action: 'restore' | 'delete') => {
    setConfirmJobId(jobId);
    setConfirmJobTitle(jobTitle);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  // Execute confirmed action
  const confirmAndExecute = async () => {
    if (!confirmJobId) return;

    setIsProcessing(true);
    try {
      if (confirmAction === 'restore') {
        const response = await fetch(`/api/jobs/${confirmJobId}/unarchive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to restore job');
        }

        toast({
          title: 'Success',
          description: `"${confirmJobTitle}" has been restored to active jobs`,
        });

        setArchivedJobs(prev => prev.filter(j => j.id !== confirmJobId));
        setFilteredJobs(prev => prev.filter(j => j.id !== confirmJobId));
      } else if (confirmAction === 'delete') {
        const response = await fetch(`/api/jobs/${confirmJobId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete job');
        }

        toast({
          title: 'Success',
          description: `"${confirmJobTitle}" has been permanently deleted`,
        });

        setArchivedJobs(prev => prev.filter(j => j.id !== confirmJobId));
        setFilteredJobs(prev => prev.filter(j => j.id !== confirmJobId));
      }
    } catch (err) {
      console.error(`Error ${confirmAction}ing job:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${confirmAction} job`,
        variant: 'destructive',
      });
    } finally {
      setConfirmDialogOpen(false);
      setConfirmJobId(null);
      setConfirmJobTitle('');
      setIsProcessing(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: archivedJobs.length,
    thisMonth: archivedJobs.filter(j => {
      const date = new Date(j.datePosted || j.createdAt || 0);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgSalary: archivedJobs.length > 0
      ? Math.round(archivedJobs.reduce((sum, j) => sum + (j.salary || 0), 0) / archivedJobs.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading archived jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archived Job Posts</h1>
          <p className="text-gray-600 mt-2">Manage and restore your archived job listings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/jobs')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All archived positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">Archived this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{stats.avgSalary.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Average salary offered</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, description, or employer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'oldest')}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredJobs.length > 0 && (
          <p className="text-sm text-gray-500">Showing {filteredJobs.length} of {archivedJobs.length} archived jobs</p>
        )}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {archivedJobs.length === 0 ? 'No archived jobs yet' : 'No jobs match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {archivedJobs.length === 0
              ? 'Archive job postings to see them here'
              : 'Try adjusting your search or filters'}
          </p>
          {archivedJobs.length === 0 && (
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back to Active Jobs
            </Button>
          )}
        </div>
      )}

      {/* Job Cards Grid */}
      {filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredJobs.map(job => (
            <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">{job.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{job.employerName || job.company || 'Unknown Employer'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-3">
                <div className="space-y-2 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="font-semibold text-green-600">
                      ₱{job.salary.toLocaleString()}
                    </div>
                  )}
                  {job.archivedAt && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Archived {formatRelativeTime(job.archivedAt)}</span>
                    </div>
                  )}
                  {job.description && (
                    <p className="text-gray-600 line-clamp-2">{job.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 gap-1"
                    onClick={() => openConfirmDialog(job.id, job.title, 'restore')}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => openConfirmDialog(job.id, job.title, 'delete')}
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
                ? `Are you sure you want to restore "${confirmJobTitle}" to active jobs? It will be visible to job seekers again.`
                : `Are you sure you want to permanently delete "${confirmJobTitle}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {confirmAction === 'delete' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will permanently remove the job posting. Consider restoring it instead if you want to keep it.
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
              {isProcessing ? 'Processing...' : (confirmAction === 'restore' ? 'Restore Job' : 'Delete Job')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
