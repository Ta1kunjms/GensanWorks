'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, differenceInMinutes, differenceInHours, differenceInDays, isYesterday } from 'date-fns';
import { AlertCircle, ArrowUpDown, Search, RotateCcw, Calendar, ArrowLeft, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ViewEmployerModal } from '@/components/view-employer-modal';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/auth';

interface Employer {
  id: string;
  establishmentName: string;
  municipality: string;
  province: string;
  contactNumber?: string;
  numberOfPaidEmployees?: number;
  industryType?: string[];
  createdAt?: string;
  archivedAt?: string;
  archived?: boolean;
}

export default function ArchivedEmployersPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [archivedEmployers, setArchivedEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('all');
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'restore' | 'delete'>('restore');
  const [confirmEmployerId, setConfirmEmployerId] = useState<string | null>(null);
  const [confirmEmployerName, setConfirmEmployerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);

  // Fetch archived employers
  useEffect(() => {
    fetchArchivedEmployers();
  }, []);

  const fetchArchivedEmployers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch('/api/employers/archived');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch archived employers: ${response.status}`);
      }
      
      const data = await response.json();
      const employers = Array.isArray(data.employers) ? data.employers : (Array.isArray(data) ? data : []);
      
      setArchivedEmployers(employers);
      
      // Extract unique municipalities
      const uniqueMunicipalities = Array.from(new Set(employers.map((e: Employer) => e.municipality).filter(Boolean))) as string[];
      setMunicipalities(uniqueMunicipalities.sort());
      
      applyFilters(employers, searchTerm, filterMunicipality, sortBy);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching archived employers:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    employers: Employer[],
    search: string,
    municipality: string,
    sort: 'recent' | 'oldest'
  ) => {
    let filtered = [...employers];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.establishmentName.toLowerCase().includes(searchLower) ||
          e.contactNumber?.toLowerCase().includes(searchLower) ||
          e.municipality?.toLowerCase().includes(searchLower)
      );
    }

    // Municipality filter
    if (municipality !== 'all') {
      filtered = filtered.filter((e) => e.municipality === municipality);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.archivedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.archivedAt || b.createdAt || 0).getTime();
      return sort === 'recent' ? dateB - dateA : dateA - dateB;
    });

    setFilteredEmployers(filtered);
  };

  useEffect(() => {
    applyFilters(archivedEmployers, searchTerm, filterMunicipality, sortBy);
  }, [searchTerm, filterMunicipality, sortBy, archivedEmployers]);

  const stats = {
    total: archivedEmployers.length,
    thisMonth: archivedEmployers.filter((e) => {
      const date = new Date(e.archivedAt || e.createdAt || 0);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgEmployees: archivedEmployers.length > 0
      ? Math.round(archivedEmployers.reduce((sum, e) => sum + (e.numberOfPaidEmployees || 0), 0) / archivedEmployers.length)
      : 0,
  };

  const confirmAndExecute = async () => {
    if (!confirmEmployerId) return;

    setIsProcessing(true);
    try {
      if (confirmAction === 'restore') {

        const response = await authFetch(`/api/employers/${confirmEmployerId}/archive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false }),
        });

        if (!response.ok) {
          throw new Error('Failed to restore employer');
        }

        toast({
          title: 'Success',
          description: `"${confirmEmployerName}" has been restored to active employers`,
        });

        setArchivedEmployers(prev => prev.filter(e => e.id !== confirmEmployerId));
        setFilteredEmployers(prev => prev.filter(e => e.id !== confirmEmployerId));
      } else if (confirmAction === 'delete') {
        const response = await authFetch(`/api/employers/${confirmEmployerId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete employer');
        }

        toast({
          title: 'Success',
          description: `"${confirmEmployerName}" has been permanently deleted`,
        });

        setArchivedEmployers(prev => prev.filter(e => e.id !== confirmEmployerId));
        setFilteredEmployers(prev => prev.filter(e => e.id !== confirmEmployerId));
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setConfirmDialogOpen(false);
      setConfirmEmployerId(null);
    }
  };

  const handleRestore = (employer: Employer) => {
    setConfirmEmployerId(employer.id);
    setConfirmEmployerName(employer.establishmentName);
    setConfirmAction('restore');
    setConfirmDialogOpen(true);
  };

  const handleDelete = (employer: Employer) => {
    setConfirmEmployerId(employer.id);
    setConfirmEmployerName(employer.establishmentName);
    setConfirmAction('delete');
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading archived employers...</p>
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
          onClick={() => navigate('/admin/employers')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employers
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
            <p className="text-xs text-gray-500 mt-1">All archived employers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Archived This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">Current month archives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">Average per employer</p>
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, contact, municipality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterMunicipality} onValueChange={setFilterMunicipality}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by municipality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Municipalities</SelectItem>
              {municipalities.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Recently Archived
                </div>
              </SelectItem>
              <SelectItem value="oldest">Oldest Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 items-center">
          {searchTerm && (
            <Badge variant="secondary" className="gap-2">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="ml-1">×</button>
            </Badge>
          )}
          {filterMunicipality !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              Municipality: {filterMunicipality}
              <button onClick={() => setFilterMunicipality('all')} className="ml-1">×</button>
            </Badge>
          )}
          {sortBy !== 'recent' && (
            <Badge variant="secondary" className="gap-2">
              Sort: {sortBy === 'oldest' ? 'Oldest' : 'Recent'}
              <button onClick={() => setSortBy('recent')} className="ml-1">×</button>
            </Badge>
          )}
        </div>

        {(searchTerm || filterMunicipality !== 'all' || sortBy !== 'recent') && (
          <p className="text-sm text-gray-600">
            Showing {filteredEmployers.length} of {archivedEmployers.length} archived employers
          </p>
        )}
      </div>

      {/* No Results */}
      {filteredEmployers.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {archivedEmployers.length === 0 ? 'No archived employers yet' : 'No employers match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {archivedEmployers.length === 0
              ? 'Archive employers to see them here'
              : 'Try adjusting your search or filters'}
          </p>
          {archivedEmployers.length === 0 && (
            <Button variant="outline" onClick={() => navigate('/admin/employers')}>
              Go Back to Active Employers
            </Button>
          )}
        </div>
      )}

      {/* Employer Cards Grid */}
      {filteredEmployers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployers.map((employer) => (
            <Card key={employer.id} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{employer.establishmentName}</CardTitle>
                    <CardDescription className="truncate">{employer.municipality}, {employer.province}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 whitespace-nowrap">
                    Archived
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Key Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">Employees</p>
                    <p className="text-lg font-bold text-blue-600">{employer.numberOfPaidEmployees || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">Contact</p>
                    <p className="text-sm text-gray-900">{employer.contactNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* Industries */}
                {employer.industryType && employer.industryType.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Industries</p>
                    <div className="flex flex-wrap gap-1">
                      {employer.industryType.slice(0, 2).map((industry) => (
                        <Badge key={industry} variant="outline" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                      {employer.industryType.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{employer.industryType.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Archive Date - Enhanced Human Friendly */}
                <div className={
                  `flex items-center gap-2 text-sm ${(() => {
                    const archivedDate = employer.archivedAt ? new Date(employer.archivedAt) : (employer.createdAt ? new Date(employer.createdAt) : null);
                    if (!archivedDate) return 'text-gray-600';
                    const now = new Date();
                    const diffHours = differenceInHours(now, archivedDate);
                    return diffHours < 24 ? 'text-orange-700' : 'text-gray-600';
                  })()}`
                }>
                  <Calendar className="h-4 w-4" />
                  <span
                    title={(() => {
                      const archivedDate = employer.archivedAt ? new Date(employer.archivedAt) : (employer.createdAt ? new Date(employer.createdAt) : null);
                      if (!archivedDate) return '';
                      return format(archivedDate, 'PPpp');
                    })()}
                  >
                    {(() => {
                      const archivedDate = employer.archivedAt ? new Date(employer.archivedAt) : (employer.createdAt ? new Date(employer.createdAt) : null);
                      if (!archivedDate) return null;
                      const now = new Date();
                      const diffMins = differenceInMinutes(now, archivedDate);
                      const diffHours = differenceInHours(now, archivedDate);
                      const diffDays = differenceInDays(now, archivedDate);
                      if (diffMins < 1) return 'Archived just now';
                      if (diffMins < 60) return `Archived ${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
                      if (diffHours < 24) return `Archived ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
                      if (isYesterday(archivedDate)) return 'Archived yesterday';
                      if (diffDays < 7) return `Archived ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
                      return `Archived on ${format(archivedDate, 'MMM d, yyyy')}`;
                    })()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedEmployer(employer);
                      setViewModalOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => handleRestore(employer)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(employer)}
                  >
                    <Trash2 className="h-4 w-4" />
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
            <DialogTitle>
              {confirmAction === 'restore' ? 'Restore Employer' : 'Delete Employer'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'restore'
                ? `Are you sure you want to restore "${confirmEmployerName}" to active employers? It will be visible to everyone again.`
                : `Are you sure you want to permanently delete "${confirmEmployerName}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAndExecute}
              disabled={isProcessing}
              className={confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isProcessing ? 'Processing...' : confirmAction === 'restore' ? 'Restore' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employer Modal */}
      {selectedEmployer && (
        <ViewEmployerModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          employer={selectedEmployer}
          onEmployerUpdated={() => {
            fetchArchivedEmployers();
            setSelectedEmployer(null);
          }}
        />
      )}
    </div>
  );
}
