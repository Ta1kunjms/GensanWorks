import AdminAuthSettingsPage from "@/pages/admin/auth-settings";
/**
 * Admin Settings Page - Comprehensive Configuration
 * Route: /admin/settings
 * Only accessible to users with role='admin'
 * Features: General, Notifications, Security, API, Maintenance
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Settings, Lock, Bell, Shield, Database, Mail, 
  Palette, Users, FileText, BarChart3, Key, Eye, EyeOff,
  AlertCircle, CheckCircle2, Copy, Save, Trash2
} from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "GensanWorks",
    siteDescription: "Official Job Assistance Platform of PESO – General Santos City",
    contactEmail: "admin@gensanworks.com",
    contactPhone: "+63 283 889 5200",
    address: "General Santos City, South Cotabato",
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicantNotifications: true,
    employerNotifications: true,
    referralNotifications: true,
    feedbackNotifications: true,
    systemAlerts: true,
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  // API Settings State
  const [apiKey] = useState("pk_live_" + "x".repeat(40));
  const [showApiKey, setShowApiKey] = useState(false);

  const handleGeneralSave = () => {
    toast({
      title: "Success",
      description: "General settings updated successfully",
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: "Success",
      description: "Notification preferences saved",
    });
  };

  const handleSecuritySave = () => {
    toast({
      title: "Success",
      description: "Security settings updated",
    });
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "Logged out",
      description: "All sessions have been terminated",
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Backup Started",
      description: "Database backup initiated. This may take a few minutes.",
    });
  };

  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "System cache has been cleared successfully",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1200px]">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Configure system settings, security, and preferences
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="auth" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Auth</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Maintenance</span>
              </TabsTrigger>
            </TabsList>

            {/* GENERAL SETTINGS */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic system information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        placeholder="GensanWorks"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDesc">Site Description</Label>
                    <textarea
                      id="siteDesc"
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                      placeholder="Describe your platform"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input
                        id="phone"
                        value={generalSettings.contactPhone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                        placeholder="+63 283 889 5200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Office Address</Label>
                      <Input
                        id="address"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                        placeholder="General Santos City, South Cotabato"
                      />
                    </div>
                  </div>

                  <Button onClick={handleGeneralSave} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Password, 2FA, sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lock className="w-5 h-5" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass">Current Password</Label>
                    <Input id="currentPass" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPass">Confirm New Password</Label>
                    <Input id="confirmPass" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                  </div>
                  <Button className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </div>

                  {/* Two Factor Authentication */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                          <Shield className="w-5 h-5" />
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Add extra security to your account
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={security.twoFactorAuth}
                        onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Session Timeout */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Session Timeout</h3>
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Inactivity timeout (minutes)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                        min="5"
                        max="120"
                      />
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Sessions</h3>
                    <div className="space-y-3 mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Current Session</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">This device</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={handleLogoutAllDevices} className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Logout All Devices
                    </Button>
                  </div>

                  <Button onClick={handleSecuritySave} className="flex items-center gap-2 w-full">
                    <Save className="w-4 h-4" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AUTH SETTINGS */}
            <TabsContent value="auth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>Manage sign-in providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AdminAuthSettingsPage />
                </CardContent>
              </Card>
            </TabsContent>

            {/* MAINTENANCE */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>Database and system utilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Database Backup */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                      <Database className="w-5 h-5" />
                      Database Management
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-slate-900 dark:text-white">Last Backup</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">2025-11-24 01:20 AM</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Size: 2.4 MB</p>
                      </div>
                      <Button onClick={handleBackupDatabase} className="w-full flex items-center justify-center gap-2">
                        <Database className="w-4 h-4" />
                        Backup Database Now
                      </Button>
                    </div>
                  </div>

                  {/* System Cache */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">System Cache</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="font-medium text-slate-900 dark:text-white">Cache Status: Enabled</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Cache size: 15.8 MB</p>
                      </div>
                      <Button onClick={handleClearCache} variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear Cache
                      </Button>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-slate-500 dark:text-slate-400">App Version</p>
                        <p className="font-mono text-sm text-slate-900 dark:text-white">1.0.0</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Database Version</p>
                        <p className="font-mono text-sm text-slate-900 dark:text-white">3.44.2</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Node Environment</p>
                        <p className="font-mono text-sm text-slate-900 dark:text-white">Production</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Uptime</p>
                        <p className="font-mono text-sm text-slate-900 dark:text-white">45 days, 3h</p>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-red-200 dark:border-red-900/30 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Reset System (Irreversible)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
