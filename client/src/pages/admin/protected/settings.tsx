import AdminAuthSettingsPage from "@/pages/admin/auth-settings";
/**
 * Admin Settings Page - Comprehensive Configuration
 * Route: /admin/settings
 * Only accessible to users with role='admin'
 * Features: General, Notifications, Security, API, Maintenance
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { authFetch, useAuth } from "@/lib/auth";
import type { GeneralSettings } from "@shared/schema";
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

  const defaultGeneralSettings: GeneralSettings = {
    siteName: "GensanWorks",
    siteDescription: "Official Job Assistance Platform of PESO – General Santos City",
    contactEmail: "admin@gensanworks.com",
    contactPhone: "+63 283 889 5200",
    address: "General Santos City, South Cotabato",
    heroHeadline: "Connecting jobseekers and employers in General Santos City",
    heroSubheadline: "A single window for opportunities, referrals, and PESO services",
    primaryCTA: "Browse Jobs",
    secondaryCTA: "Post a Vacancy",
    aboutTitle: "Why GensanWorks",
    aboutBody: "PESO-led platform for job matching, referrals, and analytics across the city.",
    heroBackgroundImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
    seoKeywords: "peso gensan jobs, job portal gensan, peso referrals",
  };

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [hasUnsavedGeneral, setHasUnsavedGeneral] = useState(false);
  const generalSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // General Settings State
  const currentGeneralSettings = generalSettings ?? defaultGeneralSettings;

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

  const loadGeneralSettings = async () => {
    setIsLoadingGeneral(true);
    try {
      const response = await authFetch("/api/settings/general");
      if (!response.ok) {
        throw new Error("Failed to load general settings");
      }
      const data: GeneralSettings = await response.json();
      setGeneralSettings(data);
    } catch (error: any) {
      toast({
        title: "Failed to load settings",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      setGeneralSettings(defaultGeneralSettings);
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  useEffect(() => {
    loadGeneralSettings();
    return () => {
      if (generalSaveTimer.current) {
        clearTimeout(generalSaveTimer.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistGeneralSettings = async (next: GeneralSettings) => {
    setIsSavingGeneral(true);
    try {
      const response = await authFetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        throw new Error("Failed to save general settings");
      }

      const saved: GeneralSettings = await response.json();
      setGeneralSettings(saved);
      setHasUnsavedGeneral(false);
      toast({
        title: "Saved",
        description: "General settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Could not persist settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleGeneralSave = () => {
    const next = currentGeneralSettings;
    persistGeneralSettings(next);
  };

  const scheduleGeneralAutoSave = (next: GeneralSettings) => {
    if (generalSaveTimer.current) {
      clearTimeout(generalSaveTimer.current);
    }
    generalSaveTimer.current = setTimeout(() => {
      persistGeneralSettings(next);
    }, 800);
  };

  const handleGeneralChange = (partial: Partial<GeneralSettings>) => {
    const next = { ...currentGeneralSettings, ...partial };
    setGeneralSettings(next);
    setHasUnsavedGeneral(true);
    scheduleGeneralAutoSave(next);
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
                        value={currentGeneralSettings.siteName}
                        onChange={(e) => handleGeneralChange({ siteName: e.target.value })}
                        placeholder="GensanWorks"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={currentGeneralSettings.contactEmail}
                        onChange={(e) => handleGeneralChange({ contactEmail: e.target.value })}
                        placeholder="admin@example.com"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDesc">Site Description</Label>
                    <Textarea
                      id="siteDesc"
                      value={currentGeneralSettings.siteDescription}
                      onChange={(e) => handleGeneralChange({ siteDescription: e.target.value })}
                      placeholder="Describe your platform"
                      className="min-h-[100px]"
                      disabled={isLoadingGeneral || isSavingGeneral}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="heroHeadline">Hero Headline</Label>
                      <Input
                        id="heroHeadline"
                        value={currentGeneralSettings.heroHeadline}
                        onChange={(e) => handleGeneralChange({ heroHeadline: e.target.value })}
                        placeholder="Connecting jobseekers and employers in General Santos City"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroSubheadline">Hero Subheadline</Label>
                      <Input
                        id="heroSubheadline"
                        value={currentGeneralSettings.heroSubheadline}
                        onChange={(e) => handleGeneralChange({ heroSubheadline: e.target.value })}
                        placeholder="A single window for opportunities, referrals, and PESO services"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryCTA">Primary CTA Label</Label>
                      <Input
                        id="primaryCTA"
                        value={currentGeneralSettings.primaryCTA}
                        onChange={(e) => handleGeneralChange({ primaryCTA: e.target.value })}
                        placeholder="Browse Jobs"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryCTA">Secondary CTA Label</Label>
                      <Input
                        id="secondaryCTA"
                        value={currentGeneralSettings.secondaryCTA}
                        onChange={(e) => handleGeneralChange({ secondaryCTA: e.target.value })}
                        placeholder="Post a Vacancy"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heroBackgroundImage">Hero Background Image URL</Label>
                    <Input
                      id="heroBackgroundImage"
                      value={currentGeneralSettings.heroBackgroundImage}
                        onChange={(e) => handleGeneralChange({ heroBackgroundImage: e.target.value })}
                      placeholder="https://..."
                      disabled={isLoadingGeneral || isSavingGeneral}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="aboutTitle">About Title</Label>
                      <Input
                        id="aboutTitle"
                        value={currentGeneralSettings.aboutTitle}
                        onChange={(e) => handleGeneralChange({ aboutTitle: e.target.value })}
                        placeholder="Why GensanWorks"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">SEO Keywords</Label>
                      <Input
                        id="seoKeywords"
                        value={currentGeneralSettings.seoKeywords}
                        onChange={(e) => handleGeneralChange({ seoKeywords: e.target.value })}
                        placeholder="peso gensan jobs, job portal gensan, peso referrals"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutBody">About Body</Label>
                    <Textarea
                      id="aboutBody"
                      value={currentGeneralSettings.aboutBody}
                      onChange={(e) => handleGeneralChange({ aboutBody: e.target.value })}
                      placeholder="PESO-led platform for job matching, referrals, and analytics across the city."
                      className="min-h-[120px]"
                      disabled={isLoadingGeneral || isSavingGeneral}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input
                        id="phone"
                        value={currentGeneralSettings.contactPhone}
                        onChange={(e) => handleGeneralChange({ contactPhone: e.target.value })}
                        placeholder="+63 283 889 5200"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Office Address</Label>
                      <Input
                        id="address"
                        value={currentGeneralSettings.address}
                        onChange={(e) => handleGeneralChange({ address: e.target.value })}
                        placeholder="General Santos City, South Cotabato"
                        disabled={isLoadingGeneral || isSavingGeneral}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={handleGeneralSave} className="flex items-center gap-2" disabled={isSavingGeneral}>
                      <Save className="w-4 h-4" />
                      {isSavingGeneral ? "Saving..." : hasUnsavedGeneral ? "Save Changes" : "Saved"}
                    </Button>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isLoadingGeneral
                        ? "Loading current settings..."
                        : isSavingGeneral
                          ? "Persisting updates"
                          : hasUnsavedGeneral
                            ? "Unsaved changes pending"
                            : "All changes synced"}
                    </p>
                  </div>
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
