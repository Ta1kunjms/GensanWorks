/**
 * Admin Applicants Management Page
 * Route: /admin/applicants
 * Only accessible to users with role='admin'
 */
import { useState, useEffect, useMemo } from 'react';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddApplicantModal } from '@/components/add-applicant-modal';
import { ViewApplicantModal } from '@/components/view-applicant-modal';
import { EditApplicantModal } from '@/components/edit-applicant-modal';
import { GenerateReferralSlipModal } from '@/components/generate-referral-slip-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Trash2, Search, Edit, FileText, UserPlus, CheckCircle, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { CreateAccountModal } from '@/components/create-account-modal';
import { nsrpEmploymentTypes, nsrpEmploymentStatusOptions } from '@shared/schema';
import { getEmploymentStatusLabel, getEmploymentBadgeTone } from '@/lib/employment';
import { Skeleton } from '@/components/ui/skeleton';

const badgeToneClassMap: Record<ReturnType<typeof getEmploymentBadgeTone>, string> = {
  employed: 'bg-emerald-100 text-emerald-800',
  selfEmployed: 'bg-purple-100 text-purple-800',
  unemployed: 'bg-rose-100 text-rose-800',
};

const legacyStatusFilters = [
  'Self-employed',
  'New Entrant/Fresh Graduate',
  'Finished Contract',
  'Resigned',
  'Retired',
  'Terminated/Laid off',
];

const employmentStatusFilterOptions = [
  ...nsrpEmploymentStatusOptions,
  ...legacyStatusFilters,
];

const getEmploymentStatusBadgeClass = (applicant: any) => {
  const tone = getEmploymentBadgeTone(applicant);
  return badgeToneClassMap[tone] ?? 'bg-slate-100 text-slate-700';
};

export default function AdminApplicantsPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [referralSlipModalOpen, setReferralSlipModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Sorting states
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch applicants when filters, sort, search, or page changes
  useEffect(() => {
    fetchApplicants();
  }, [sortBy, sortOrder, page, selectedBarangay, selectedStatus, selectedPeriod, selectedType, searchQuery]);

  // Reset pagination when filters or search change to keep results consistent
  useEffect(() => {
    setPage(1);
  }, [selectedBarangay, selectedStatus, selectedPeriod, selectedType, searchQuery]);

  // Debounce search to reduce fetch churn
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Helper to convert registration period to date range
  function getPeriodDate(period: string): { from?: string; to?: string } {
    if (period === 'all') return {};
    const now = new Date();
    let from: Date;
    switch (period) {
      case '7days':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return {};
    }
    return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
  }

  const fetchApplicants = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((page - 1) * itemsPerPage).toString());
      if (selectedBarangay && selectedBarangay !== 'all') params.append('barangay', selectedBarangay);
      if (selectedStatus && selectedStatus !== 'all') params.append('employmentStatus', selectedStatus);
      if (selectedType && selectedType !== 'all') params.append('employmentType', selectedType);
      if (searchQuery) params.append('search', searchQuery);
      // Registration period as date range
      if (selectedPeriod && selectedPeriod !== 'all') {
        const { from, to } = getPeriodDate(selectedPeriod);
        if (from) params.append('registeredFrom', from);
        if (to) params.append('registeredTo', to);
      }
      const res = await authFetch(`/api/admin/applicants?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch applicants');
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplicants(data);
        setTotal(data.length);
      } else if (data && Array.isArray(data.applicants)) {
        setApplicants(data.applicants);
        setTotal(data.total || data.applicants.length);
      } else {
        setApplicants([]);
        setTotal(0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      setDeleteConfirmOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      await authFetch(`/api/applicants/${deleteTarget}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Success',
        description: 'Applicant deleted successfully',
      });

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      await fetchApplicants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewApplicant = (applicant: any) => {
    setSelectedApplicant(applicant);
    setViewModalOpen(true);
  };



  const handleEditApplicant = (applicant: any) => {
    setSelectedApplicant(applicant);
    setEditModalOpen(true);
  };

  const handleReferralSlip = (applicant: any) => {
    setSelectedApplicant(applicant);
    setReferralSlipModalOpen(true);
  };

  const handleCreateAccount = (applicant: any) => {
    setSelectedApplicant(applicant);
    setCreateAccountModalOpen(true);
  };

  // No client-side filtering for pagination version; all filters should be sent to backend for real scalability
  const filteredApplicants = applicants;
  
  // Get unique barangays from applicants
  const barangayOptions = useMemo(() => {
    const uniqueBarangays = Array.from(new Set(
      applicants.map(a => a.barangay).filter(Boolean)
    )).sort();
    return uniqueBarangays;
  }, [applicants]);
  
  // Check if any filters are active
  const hasActiveFilters = selectedBarangay !== 'all' || selectedStatus !== 'all' || selectedPeriod !== 'all' || selectedType !== 'all';

  const activeFilters = useMemo(() => {
    const chips: { label: string; value: string }[] = [];
    if (selectedBarangay !== 'all') chips.push({ label: 'Barangay', value: selectedBarangay });
    if (selectedStatus !== 'all') chips.push({ label: 'Status', value: selectedStatus });
    if (selectedPeriod !== 'all') chips.push({ label: 'Registered', value: selectedPeriod });
    if (selectedType !== 'all') chips.push({ label: 'Type', value: selectedType });
    if (searchQuery) chips.push({ label: 'Search', value: searchQuery });
    return chips;
  }, [searchQuery, selectedBarangay, selectedPeriod, selectedStatus, selectedType]);
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBarangay('all');
    setSelectedStatus('all');
    setSelectedPeriod('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  // Handle sorting by column
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending (newest first)
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const loadingRows = Array.from({ length: 6 }).map((_, idx) => (
    <tr key={`loading-${idx}`}>
      {Array.from({ length: 10 }).map((__, colIdx) => (
        <td key={colIdx} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1400px]">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => fetchApplicants()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </Button>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Applicant
            </Button>
          </div>

          {/* Real-time Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name, email, contact, barangay, or type (freelancer/jobseeker)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-800/70"
            />
          </div>

          {/* Filter Bar */}
          <div className="bg-white/90 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="ml-auto text-xs h-7 gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </Button>
              )}
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((chip) => (
                  <span key={`${chip.label}-${chip.value}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 px-3 py-1 text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">{chip.label}:</span> {chip.value}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Barangay Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Barangay</label>
                <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Barangays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Barangays</SelectItem>
                    {barangayOptions.map((barangay) => (
                      <SelectItem key={barangay} value={barangay}>
                        {barangay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Employment Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {employmentStatusFilterOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Registration Period Filter (Date Range) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Registration Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Type Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Employment Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {nsrpEmploymentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Showing page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of <span className="font-semibold text-slate-900 dark:text-white">{Math.ceil(total / itemsPerPage) || 1}</span> — <span className="font-semibold text-slate-900 dark:text-white">{total}</span> total applicants (50 per page)
              </span>
              <div className="flex justify-center items-center gap-2">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)} size="sm" variant="outline">Previous</Button>
                <span className="text-sm text-slate-700 dark:text-slate-200">Page {page} of {Math.ceil(total / itemsPerPage) || 1}</span>
                <Button disabled={page >= Math.ceil(total / itemsPerPage)} onClick={() => setPage(page + 1)} size="sm" variant="outline">Next</Button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="overflow-x-visible">
              <table className="w-full table-fixed">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">First Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Surname</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Employment Summary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Barangay</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Account Status</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={() => handleSort('createdAt')}
                      title="Click to sort by registration date"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Registration Date</span>
                        {sortBy === 'createdAt' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
              {loading ? (
                loadingRows
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-slate-600">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">😶‍🌫️</div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">No applicants found for these filters.</p>
                      <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-1">Reset filters</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const registrationDate = applicant.registrationDate || applicant.createdAt;
                  const employmentSummary = getEmploymentStatusLabel(applicant);
                  const statusBadgeClass = getEmploymentStatusBadgeClass(applicant);
                  return (
                    <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-900 font-medium break-words whitespace-normal">{applicant.firstName}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium break-words whitespace-normal">{applicant.surname}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                        {employmentSummary || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass}`}>
                        {applicant.employmentStatus || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 break-words whitespace-normal">{applicant.barangay || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 break-words whitespace-normal">{applicant.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 break-words whitespace-normal">{applicant.contactNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {applicant.hasAccount ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCreateAccount(applicant)}
                          disabled={!applicant.email}
                          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={applicant.email ? "Create account" : "Email required"}
                        >
                          <UserPlus className="w-4 h-4" />
                          Create
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 break-words whitespace-normal">
                      {registrationDate
                        ? new Date(registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Not registered'}
                    </td>
                    <td className="px-4 py-3 w-40 whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-start">
                        <button
                          onClick={() => handleViewApplicant(applicant)}
                          className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditApplicant(applicant)}
                          className="p-1 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          title="Edit applicant"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReferralSlip(applicant)}
                          className="p-1 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                          title="Generate referral slip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(applicant.id)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Delete applicant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddApplicantModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApplicantAdded={fetchApplicants}
      />

      <ViewApplicantModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        applicant={selectedApplicant}
      />

      <EditApplicantModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        applicant={selectedApplicant}
        onApplicantUpdated={fetchApplicants}
      />

      <GenerateReferralSlipModal
        open={referralSlipModalOpen}
        onOpenChange={setReferralSlipModalOpen}
        applicant={selectedApplicant}
      />

      <CreateAccountModal
        open={createAccountModalOpen}
        onOpenChange={setCreateAccountModalOpen}
        applicant={selectedApplicant}
        onAccountCreated={fetchApplicants}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this applicant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </div>
  );
}
