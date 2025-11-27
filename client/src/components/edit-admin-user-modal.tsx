import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Save, AlertCircle, Shield, Edit3, Lock, Eye as ViewIcon, Zap } from "lucide-react";

interface AdminAccessRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface EditAdminUserModalProps {
  isOpen: boolean;
  request: AdminAccessRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_ROLES = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full access to all features and settings",
    icon: Shield,
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    badgeColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full access with basic restrictions",
    icon: Zap,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    badgeColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Can create and edit content, limited deletion rights",
    icon: Edit3,
    color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    badgeColor: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  },
  {
    id: "viewer",
    name: "Viewer (Read-Only)",
    description: "Can only view data, no editing or deletion",
    icon: ViewIcon,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    badgeColor: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Can manage users and moderate content",
    icon: Lock,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    badgeColor: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  },
];

export function EditAdminUserModal({ isOpen, request, onClose, onSuccess }: EditAdminUserModalProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [formData, setFormData] = useState({
    email: request?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-admin-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          requestId: request?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || data.details || "Failed to create admin user");
      }

      toast({
        title: "Success",
        description: `Admin user created successfully as ${selectedRole}`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Create admin error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = ADMIN_ROLES.find(r => r.id === selectedRole);
  const IconComponent = selectedRoleData?.icon;

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Admin User Account</CardTitle>
          <CardDescription>Set up login credentials and admin role for {request.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {request.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {request.email} • {request.organization}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Admin Role</Label>
              <div className="grid grid-cols-1 gap-3">
                {ADMIN_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedRole === role.id
                        ? role.badgeColor + " border-current"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    } ${role.badgeColor}`}
                  >
                    <div className="flex items-start gap-3">
                      {IconComponent && <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="font-semibold">{role.name}</p>
                        <p className="text-xs mt-1 opacity-90">{role.description}</p>
                      </div>
                      <div className="ml-2 mt-1">
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={() => setSelectedRole(role.id)}
                          disabled={loading}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Permissions Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">PERMISSIONS:</p>
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {selectedRole === "super_admin" && (
                  <>
                    <p>✓ Full system access</p>
                    <p>✓ Create/edit/delete all content</p>
                    <p>✓ Manage all admin users</p>
                    <p>✓ Access all settings</p>
                  </>
                )}
                {selectedRole === "admin" && (
                  <>
                    <p>✓ Create/edit content</p>
                    <p>✓ Manage applicants & employers</p>
                    <p>✓ Create admin users</p>
                    <p>✓ Cannot delete other admins</p>
                  </>
                )}
                {selectedRole === "contributor" && (
                  <>
                    <p>✓ Create and edit content</p>
                    <p>✓ Manage referrals</p>
                    <p>✗ Cannot delete content</p>
                    <p>✗ Cannot manage admin users</p>
                  </>
                )}
                {selectedRole === "viewer" && (
                  <>
                    <p>✓ View all dashboards</p>
                    <p>✓ View reports</p>
                    <p>✗ Cannot create/edit/delete</p>
                    <p>✗ Read-only access</p>
                  </>
                )}
                {selectedRole === "moderator" && (
                  <>
                    <p>✓ Manage users and content</p>
                    <p>✓ Moderate feedback</p>
                    <p>✓ Manage access requests</p>
                    <p>✗ Cannot change system settings</p>
                  </>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Creating..." : "Create Admin User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
