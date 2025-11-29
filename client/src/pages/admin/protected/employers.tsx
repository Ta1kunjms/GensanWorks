/**
 * Admin Employers Page
 * Route: /admin/employers
 * Only accessible to users with role='admin'
 */
import { useState, useEffect } from "react";
import { authFetch } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Eye, Edit, Trash2, Archive, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { AddEmployerModal } from "@/components/add-employer-modal";
import { ViewEmployerModal } from "@/components/view-employer-modal";
import { EditEmployerModal } from "@/components/edit-employer-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminEmployersPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employerModalOpen, setEmployerModalOpen] = useState(false);
  const [viewEmployerModalOpen, setViewEmployerModalOpen] = useState(false);
  const [editEmployerModalOpen, setEditEmployerModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployerIds, setSelectedEmployerIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employerToDelete, setEmployerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/employers?limit=10000");
      if (!res.ok) throw new Error("Failed to fetch employers");
      const data = await res.json();
      // If API returns { employers: [...] }, use that, else fallback to data as array
      if (Array.isArray(data)) {
        setEmployers(data);
      } else if (data && Array.isArray(data.employers)) {
        setEmployers(data.employers);
      } else {
        setEmployers([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setViewEmployerModalOpen(true);
  };

  const handleEditEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setEditEmployerModalOpen(true);
  };

  const handleSelectEmployer = (employerId: string) => {
    const newSelected = new Set(selectedEmployerIds);
    if (newSelected.has(employerId)) {
      newSelected.delete(employerId);
    } else {
      newSelected.add(employerId);
    }
    setSelectedEmployerIds(newSelected);
  };

  const handleSelectAllEmployers = () => {
    if (selectedEmployerIds.size === filteredEmployers.length) {
      setSelectedEmployerIds(new Set());
    } else {
      setSelectedEmployerIds(new Set(filteredEmployers.map((e) => e.id)));
    }
  };

  const handleDeleteEmployer = async (employerId: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/employers/${employerId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete employer");

      toast({
        title: "Success",
        description: "Employer deleted successfully",
      });

      setEmployers(employers.filter((e) => e.id !== employerId));
      setSelectedEmployerIds(new Set(Array.from(selectedEmployerIds).filter((id) => id !== employerId)));
      setDeleteDialogOpen(false);
      setEmployerToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveEmployer = async (employerId: string, employerName: string) => {
    try {
      const res = await fetch(`/api/employers/${employerId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to archive employer");

      toast({
        title: "Success",
        description: `"${employerName}" has been archived successfully`,
      });

      setEmployers(employers.filter((e) => e.id !== employerId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch("/api/employers/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedEmployerIds) }),
      });

      if (!res.ok) throw new Error("Failed to delete employers");

      toast({
        title: "Success",
        description: `${selectedEmployerIds.size} employer(s) deleted successfully`,
      });

      setEmployers(employers.filter((e) => !selectedEmployerIds.has(e.id)));
      setSelectedEmployerIds(new Set());
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployers = employers.filter((emp) =>
    emp.establishmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.municipality?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employers</h1>
            <p className="text-slate-600 mt-1">Manage and view all registered employers</p>
          </div>
          <div className="flex gap-2">
            {selectedEmployerIds.size > 0 && (
              <Button
                onClick={() => {
                  setDeleteDialogOpen(true);
                  setEmployerToDelete(null);
                }}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedEmployerIds.size})
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/employers/archived')}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Archived Employers
            </Button>
            <Button onClick={() => setEmployerModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employer
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employers by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {loading ? (
          <div className="text-center p-8 text-slate-600">Loading employers...</div>
        ) : filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <p className="text-slate-600">No employers found. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmployers.length > 0 && (
              <div className="bg-white rounded-lg border border-border p-3 flex items-center gap-3">
                <Checkbox
                  checked={selectedEmployerIds.size === filteredEmployers.length && filteredEmployers.length > 0}
                  onCheckedChange={handleSelectAllEmployers}
                />
                <span className="text-sm text-slate-600">
                  {selectedEmployerIds.size > 0 ? `${selectedEmployerIds.size} selected` : "Select all employers"}
                </span>
              </div>
            )}
            {filteredEmployers.map((employer) => {
              const isSelected = selectedEmployerIds.has(employer.id);
              return (
                <div key={employer.id} className={`bg-white rounded-lg border border-border p-4 ${isSelected ? "bg-blue-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectEmployer(employer.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{employer.establishmentName}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {employer.houseStreetVillage}, {employer.barangay && employer.barangay + ", "}{employer.municipality}, {employer.province}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div className="text-sm">
                          <span className="text-slate-600">Employees:</span>
                          <p className="font-semibold">{employer.numberOfPaidEmployees || 0}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-600">Vacant Positions:</span>
                          <p className="font-semibold">{employer.numberOfVacantPositions || 0}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-600">Contact:</span>
                          <p className="font-semibold text-xs">{employer.contactNumber || "N/A"}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-600">SRS Subscriber:</span>
                          <p className="font-semibold">{employer.srsSubscriber ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEmployer(employer)}
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployer(employer)}
                        className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveEmployer(employer.id, employer.establishmentName)}
                        className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Archive employer"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmployerToDelete(employer.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddEmployerModal
        open={employerModalOpen}
        onOpenChange={setEmployerModalOpen}
        onEmployerAdded={(employer) => {
          // Add newly created employer to the list
          if (employer && employer.id) {
            setEmployers((prev) => [employer, ...prev]);
            // Automatically select the new employer
            setSelectedEmployer(employer);
          } else {
            // Fallback to fetching if employer data isn't returned
            fetchEmployers();
          }
        }}
      />

      {selectedEmployer && (
        <ViewEmployerModal
          open={viewEmployerModalOpen}
          onOpenChange={setViewEmployerModalOpen}
          employer={selectedEmployer}
        />
      )}

      {selectedEmployer && (
        <EditEmployerModal
          open={editEmployerModalOpen}
          onOpenChange={setEditEmployerModalOpen}
          employer={selectedEmployer}
          onEmployerUpdated={fetchEmployers}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer{employerToDelete ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {employerToDelete
                ? "This employer will be permanently deleted. This action cannot be undone."
                : `${selectedEmployerIds.size} employer(s) will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (employerToDelete) {
                handleDeleteEmployer(employerToDelete);
              } else {
                handleBulkDelete();
              }
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
