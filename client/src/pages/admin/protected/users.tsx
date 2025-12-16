import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatCard } from "@/components/admin/stat-card";
import { Users, ShieldCheck, Building2, RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  company?: string | null;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");

      const data: AdminUser[] = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Unable to load users",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Remove this user account? This cannot be undone.")) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "User removed",
        description: "The account was deleted successfully.",
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    const role = (user.role ?? "unknown").toLowerCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const adminCount = roleCounts["admin"] ?? 0;
  const employerCount = roleCounts["employer"] ?? 0;
  const organizationCount = new Set(
    users.map((user) => user.company).filter(Boolean)
  ).size;

  const userStatCards = [
    {
      key: "total",
      title: "Total Accounts",
      value: users.length.toLocaleString(),
      helper: loading ? "Refreshing directory..." : "Synced from auth service",
      variant: "blue" as const,
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "admins",
      title: "Admin Seats",
      value: adminCount.toLocaleString(),
      helper: "Users with full console access",
      variant: "emerald" as const,
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      key: "employers",
      title: "Employer Accounts",
      value: employerCount.toLocaleString(),
      helper: "Company-linked logins",
      variant: "purple" as const,
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "organizations",
      title: "Organizations",
      value: organizationCount.toLocaleString(),
      helper: "Unique companies represented",
      variant: "amber" as const,
      icon: <Building2 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Directory"
        description="Manage administrator and employer accounts."
        badge="Access Control"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {userStatCards.map((card) => (
            <AdminStatCard
              key={card.key}
              title={card.title}
              value={card.value}
              helper={card.helper}
              variant={card.variant}
              icon={card.icon}
            />
          ))}
        </div>
      </AdminPageHeader>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600">
                    Loading directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {user.role ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.company || "-"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
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
