import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Mail, Phone, Building2, ArrowRight, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { EditAdminUserModal } from "@/components/edit-admin-user-modal";

interface AdminAccessRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

/**
 * Admin Access Requests Page
 * Route: /admin/access-requests
 * Shows all pending and processed admin access requests
 */
export default function AdminAccessRequests() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<AdminAccessRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch access requests
  const { data: requests, isLoading, refetch } = useQuery<AdminAccessRequest[]>({
    queryKey: ["/api/admin/access-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/access-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  // Filter requests
  const filteredRequests = requests?.filter(req =>
    filter === "all" ? true : req.status === filter
  ) || [];

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast({
        title: "Success",
        description: "Access request approved",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  // Handle reject
  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to reject");
      toast({
        title: "Success",
        description: "Access request rejected",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1200px]">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Access Requests
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and review admin access requests from users
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <Button
                key={tab}
                variant={filter === tab ? "default" : "outline"}
                onClick={() => setFilter(tab as any)}
                className="capitalize"
              >
                {tab}
                {tab !== "all" && requests && (
                  <span className="ml-2 text-xs font-semibold">
                    ({requests.filter(r => r.status === tab).length})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </>
            ) : filteredRequests.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                    {filter === "all" ? "No access requests yet" : `No ${filter} requests`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(request.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {request.name}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Requested on {new Date(request.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {request.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {request.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Organization</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.organization}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {/* Edit Approved User */}
                    {request.status === "approved" && (
                      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => {
                            setSelectedRequest(request);
                            setModalOpen(true);
                          }}
                        >
                          <Key className="w-4 h-4" />
                          Set Admin Credentials
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Admin User Modal */}
      <EditAdminUserModal
        isOpen={modalOpen}
        request={selectedRequest}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequest(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
