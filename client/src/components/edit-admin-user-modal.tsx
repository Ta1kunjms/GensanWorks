import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Save, AlertCircle, Shield, Edit3, Lock, Eye as ViewIcon, Zap } from "lucide-react";
import { useFieldErrors, type FieldErrors } from "@/lib/field-errors";

interface AdminAccessRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  role?: string;
  adminRole?: string;
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
  type CredentialField = "password" | "confirmPassword";
  const { fieldErrors, clearFieldError, setErrorsAndFocus } = useFieldErrors<CredentialField>();
  const [formData, setFormData] = useState({
    email: request?.email || "",
    password: "",
    confirmPassword: "",
  });

  const livePasswordError =
    formData.password && formData.password.length < 8
      ? "Password must be at least 8 characters"
      : undefined;
  const liveConfirmError =
    formData.confirmPassword && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : undefined;

  const passwordError = fieldErrors.password || livePasswordError;
  const confirmPasswordError = fieldErrors.confirmPassword || liveConfirmError;

  // Always sync email with request
  // (if request changes, update formData.email)
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, email: request?.email || "" }));
    if (request?.role && ADMIN_ROLES.some((role) => role.id === request.role)) {
      setSelectedRole(request.role);
    } else if (request?.adminRole && ADMIN_ROLES.some((role) => role.id === request.adminRole)) {
      setSelectedRole(request.adminRole);
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const nextErrors: FieldErrors<CredentialField> = {};
    if (!formData.password) nextErrors.password = "Password is required";
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Confirm password is required";
    if (formData.password && formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
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
          name: request?.name || "",
          email: formData.email,
          password: formData.password,
          requestId: request?.id,
          role: selectedRole,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const parsedBody = isJson ? await res.json() : await res.text();

      // Improved error handling
      let errorMsg = "";
      if (!isJson) {
        errorMsg = typeof parsedBody === "string" ? parsedBody : "Server returned an unexpected response format";
        throw new Error(errorMsg);
      }

      if (!res.ok) {
        if (typeof parsedBody === "object" && parsedBody !== null) {
          const body = parsedBody as Record<string, any>;
          if (typeof body.message === "string") {
            errorMsg = body.message;
          }
          if (!errorMsg && typeof body.error === "string") {
            errorMsg = body.error;
          }
          if (!errorMsg && typeof body.error === "object" && body.error !== null) {
            errorMsg =
              typeof body.error.message === "string"
                ? body.error.message
                : body.error.code
                ? `Server error: ${body.error.code}`
                : JSON.stringify(body.error);
          }
          if (!errorMsg && typeof body.details === "string") {
            errorMsg = body.details;
          }
          if (!errorMsg) {
            errorMsg = JSON.stringify(body);
          }
        } else if (typeof parsedBody === "string") {
          errorMsg = parsedBody;
        } else {
          errorMsg = "Failed to create/update admin user";
        }
        throw new Error(errorMsg);
      }

      if (parsedBody?.action === "updated") {
        toast({
          title: "Success",
          description: `Admin password and role updated for ${formData.email} (${selectedRole})`,
        });
        onSuccess();
        onClose();
        return;
      }

      toast({
        title: "Success",
        description: `Admin user created successfully as ${selectedRole}`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Create admin error:", err);
      toast({
        title: "Error",
        description: err?.message || (typeof err === "string" ? err : "Failed to create/update admin user"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = ADMIN_ROLES.find(r => r.id === selectedRole);
  const IconComponent = selectedRoleData?.icon;

  if (!isOpen || !request) return null;

  // Determine if admin already exists (based on request.status or other prop)
  const isExistingAdmin = request?.status === "approved";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-4 flex flex-col items-center">
        <div className="w-full text-center mb-2">
          <h2 className="text-xl font-bold mb-1">{isExistingAdmin ? "Set Admin Password" : "Create Admin User Account"}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isExistingAdmin
              ? `Set or update password and role for ${request.name}`
              : `Set up login credentials and admin role for ${request.name}`}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex gap-6 items-start">
          {/* Left: Admin Role Selection & Permissions */}
          <div className="w-7/12 flex flex-col gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-1">
              <div className="flex gap-2 items-center">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
            <div>
              <Label className="text-base font-semibold mb-1 block">Select Admin Role</Label>
              <div className="flex flex-col gap-1">
                {ADMIN_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    disabled={loading}
                    className={`p-2 rounded-lg border-2 text-left transition-all flex items-center gap-2 focus:outline-none text-sm ${
                      selectedRole === role.id
                        ? role.badgeColor + " border-2 border-blue-600"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                    } ${role.badgeColor}`}
                  >
                    {role.icon && <role.icon className="w-4 h-4 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-semibold">{role.name}</p>
                      <p className="text-xs mt-1 opacity-90">{role.description}</p>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={() => setSelectedRole(role.id)}
                      disabled={loading}
                      className="w-4 h-4 ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PERMISSIONS:</p>
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
            {isExistingAdmin && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Last updated: {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "N/A"}</span>
              </div>
            )}
          </div>
          {/* Right: Credentials */}
          <div className="w-5/12 flex flex-col gap-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                placeholder="admin@example.com"
                disabled={loading}
              />
              {isExistingAdmin && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This admin already exists. You can set or update their password and role below.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  aria-invalid={!!passwordError}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    clearFieldError("password");
                    clearFieldError("confirmPassword");
                  }}
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
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                aria-invalid={!!confirmPasswordError}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  clearFieldError("confirmPassword");
                }}
                placeholder="••••••••"
                disabled={loading}
              />
              {confirmPasswordError && (
                <p className="text-xs text-destructive">{confirmPasswordError}</p>
              )}
            </div>
            {/* Password strength meter */}
            <div className="mt-1">
              {formData.password && (
                <div className="h-2 w-full bg-slate-200 rounded">
                  <div
                    className={`h-2 rounded transition-all ${
                      formData.password.length >= 12
                        ? "bg-green-500 w-full"
                        : formData.password.length >= 8
                        ? "bg-yellow-400 w-2/3"
                        : "bg-red-500 w-1/3"
                    }`}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
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
                  disabled={loading || formData.password.length < 8 || formData.password !== formData.confirmPassword}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading
                    ? (isExistingAdmin ? "Saving..." : "Creating...")
                    : (isExistingAdmin ? "Set Password" : "Create Admin User")}
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
