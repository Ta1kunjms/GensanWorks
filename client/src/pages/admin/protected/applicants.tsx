/**
 * Admin Applicants Management Page
 * Route: /admin/applicants
 * Only accessible to users with role='admin'
 */
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Eye, Trash2, Search, Edit, FileText, UserPlus, CheckCircle, Filter, X } from 'lucide-react';
import { CreateAccountModal } from '@/components/create-account-modal';

export default function AdminApplicantsPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [referralSlipModalOpen, setReferralSlipModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applicants');
      if (!res.ok) throw new Error('Failed to fetch applicants');
      const data = await res.json();
      setApplicants(data || []);
      setSelectedIds(new Set());
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(applicants.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one applicant to delete',
        variant: 'destructive',
      });
      return;
    }
    setDeleteTarget(Array.from(selectedIds));
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (Array.isArray(deleteTarget)) {
        // Bulk delete
        const res = await fetch('/api/applicants/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deleteTarget }),
        });

        if (!res.ok) throw new Error('Failed to delete applicants');

        toast({
          title: 'Success',
          description: `${deleteTarget.length} applicant(s) deleted successfully`,
        });
      } else {
        // Single delete
        const res = await fetch(`/api/applicants/${deleteTarget}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete applicant');

        toast({
          title: 'Success',
          description: 'Applicant deleted successfully',
        });
      }

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
    if (!applicant.email) {
      toast({
        title: 'No Email',
        description: 'This applicant must have an email address to create an account',
        variant: 'destructive',
      });
      return;
    }
    setSelectedApplicant(applicant);
    setCreateAccountModalOpen(true);
  };

  // Real-time search and filter
  const filteredApplicants = useMemo(() => {
    let filtered = applicants;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.firstName?.toLowerCase().includes(query) ||
        app.surname?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.contactNumber?.includes(query) ||
        app.barangay?.toLowerCase().includes(query) ||
        app.municipality?.toLowerCase().includes(query) ||
        app.employmentType?.toLowerCase().includes(query)
      );
    }
    
    // Apply barangay filter (case-insensitive)
    if (selectedBarangay !== 'all') {
      filtered = filtered.filter(app => {
        const appBarangay = app.barangay?.toLowerCase() || '';
        const filterBarangay = selectedBarangay.toLowerCase();
        return appBarangay === filterBarangay;
      });
    }
    
    // Apply employment status filter (case-insensitive with flexible matching)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => {
        const appStatus = (app.employmentStatus || '').toLowerCase().trim();
        const filterStatus = selectedStatus.toLowerCase();
        
        // Special handling for "New Entrant/Fresh Graduate" to match variations
        if (filterStatus === 'new entrant/fresh graduate') {
          return appStatus === 'new entrant/fresh graduate' || 
                 appStatus === 'new entrant' || 
                 appStatus === 'fresh graduate';
        }
        
        return appStatus === filterStatus;
      });
    }
    
    // Apply date period filter (registration date)
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedPeriod) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(app => {
        const regDate = app.registrationDate ? new Date(app.registrationDate) : null;
        return regDate && regDate >= cutoffDate;
      });
    }
    
    // Apply employment type filter (case-insensitive)
    if (selectedType !== 'all') {
      filtered = filtered.filter(app => {
        const appType = app.employmentType?.toLowerCase() || '';
        const filterType = selectedType.toLowerCase();
        return appType === filterType;
      });
    }
    
    return filtered;
  }, [applicants, searchQuery, selectedBarangay, selectedStatus, selectedPeriod, selectedType]);
  
  // Get unique barangays from applicants
  const barangayOptions = useMemo(() => {
    const uniqueBarangays = Array.from(new Set(
      applicants.map(a => a.barangay).filter(Boolean)
    )).sort();
    return uniqueBarangays;
  }, [applicants]);
  
  // Check if any filters are active
  const hasActiveFilters = selectedBarangay !== 'all' || selectedStatus !== 'all' || selectedPeriod !== 'all' || selectedType !== 'all';
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBarangay('all');
    setSelectedStatus('all');
    setSelectedPeriod('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  const isAllSelected = filteredApplicants.length > 0 && selectedIds.size === filteredApplicants.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredApplicants.length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applicants Management</h1>
          <p className="text-slate-600 mt-1">View all registered applicants and jobseekers</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Add Applicant
        </Button>
      </div>

      {/* Real-time Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, email, contact, barangay, or type (freelancer/jobseeker)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Barangay Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Barangay</label>
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
            <label className="text-xs font-medium text-slate-700">Employment Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Employed">Employed</SelectItem>
                <SelectItem value="Self-employed">Self-employed</SelectItem>
                <SelectItem value="Unemployed">Unemployed</SelectItem>
                <SelectItem value="New Entrant/Fresh Graduate">New Entrant/Fresh Graduate</SelectItem>
                <SelectItem value="Finished Contract">Finished Contract</SelectItem>
                <SelectItem value="Resigned">Resigned</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
                <SelectItem value="Terminated/Laid off">Terminated/Laid off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registration Period Filter (Date Range) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Registration Period</label>
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
            <label className="text-xs font-medium text-slate-700">Employment Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Wage employed">Wage Employed (Job Seeker)</SelectItem>
                <SelectItem value="Self-employed">Self-Employed (Freelancer)</SelectItem>
                <SelectItem value="Fisherman/Fisherfolk">Fisherman/Fisherfolk</SelectItem>
                <SelectItem value="Vendor/Retailer">Vendor/Retailer</SelectItem>
                <SelectItem value="Home-based worker">Home-based worker</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Domestic Worker">Domestic Worker</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Artisan/Craft Worker">Artisan/Craft Worker</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <span className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredApplicants.length}</span> of <span className="font-semibold text-slate-900">{applicants.length}</span> applicants
          </span>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} applicant(s) selected
          </span>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-visible">
          <table className="w-full table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">First Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Surname</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Barangay</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Account Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Registration Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-slate-600">
                    No applicants found
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedIds.has(applicant.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(applicant.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium break-words whitespace-normal">{applicant.firstName}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium break-words whitespace-normal">{applicant.surname}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        applicant.employmentType?.toLowerCase().includes('freelancer')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {applicant.employmentType || 'N/A'}
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
                      {applicant.createdAt 
                        ? new Date(applicant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Not registered'
                      }
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
                ))
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
              {Array.isArray(deleteTarget)
                ? `Are you sure you want to delete ${deleteTarget.length} applicant(s)? This action cannot be undone.`
                : 'Are you sure you want to delete this applicant? This action cannot be undone.'}
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
  );
}
