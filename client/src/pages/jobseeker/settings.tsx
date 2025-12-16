
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function JobseekerSettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState("notifications");
  const [notifications, setNotifications] = useState({
    jobMatches: true,
    applicationStatus: true,
    announcements: false,
    weeklyDigest: true,
    interviewReminders: true,
    smsAlerts: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    resumeSearch: false,
    shareWithBarangay: false,
    dataExportReminders: true,
  });

  const SETTINGS_KEY = "jobseeker-settings";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) setNotifications((prev) => ({ ...prev, ...parsed.notifications }));
        if (parsed.privacy) setPrivacy((prev) => ({ ...prev, ...parsed.privacy }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persistSettings = (section: "notifications" | "privacy") => {
    const payload = { notifications, privacy };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    toast({ title: "Saved", description: `${section === "notifications" ? "Notification" : "Privacy"} preferences updated` });
  };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Failed to change password");
      toast({ title: "Password changed successfully" });
      setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await authFetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete account");
      }
      toast({ title: "Account deleted successfully" });
      setShowDeleteDialog(false);
      logout();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 min-h-screen">
      <div className="w-full px-8 py-10 max-w-full mx-auto space-y-8">
        {/* Page title rendered in TopNavbar. */}
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Settings</p>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-6">Configure your account, security, and preferences</p>
        <Tabs value={tab} onValueChange={setTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 mb-6 gap-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card className="shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 w-full p-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">Notifications</CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">Manage notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.jobMatches} onChange={e => setNotifications(n => ({ ...n, jobMatches: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Job Matches</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.applicationStatus} onChange={e => setNotifications(n => ({ ...n, applicationStatus: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Application Status</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.announcements} onChange={e => setNotifications(n => ({ ...n, announcements: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Announcements</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={notifications.weeklyDigest} onChange={e => setNotifications(n => ({ ...n, weeklyDigest: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                      <Label>Weekly email digest</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={notifications.interviewReminders} onChange={e => setNotifications(n => ({ ...n, interviewReminders: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                      <Label>Interview reminders</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={notifications.smsAlerts} onChange={e => setNotifications(n => ({ ...n, smsAlerts: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                      <Label>SMS alerts</Label>
                    </div>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <Button type="button" className="px-6 py-2" onClick={() => persistSettings("notifications")}>Save Preferences</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 w-full p-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">Privacy</CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">Control your visibility and resume search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.showProfile} onChange={e => setPrivacy(p => ({ ...p, showProfile: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Show my profile to employers</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.resumeSearch} onChange={e => setPrivacy(p => ({ ...p, resumeSearch: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Opt-in for resume search</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.shareWithBarangay} onChange={e => setPrivacy(p => ({ ...p, shareWithBarangay: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Share profile with PESO barangay officer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.dataExportReminders} onChange={e => setPrivacy(p => ({ ...p, dataExportReminders: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Send data export reminders</Label>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <Button type="button" className="px-6 py-2" onClick={() => persistSettings("privacy")}>Save Privacy Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 w-full p-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">Account Security</CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">Change your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold mb-2 text-slate-700 dark:text-slate-200">Current Password</label>
                    <Input type="password" value={fields.currentPassword} onChange={e => setFields(f => ({ ...f, currentPassword: e.target.value }))} required className="h-11 text-base" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2 text-slate-700 dark:text-slate-200">New Password</label>
                    <Input type="password" value={fields.newPassword} onChange={e => setFields(f => ({ ...f, newPassword: e.target.value }))} required className="h-11 text-base" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2 text-slate-700 dark:text-slate-200">Confirm New Password</label>
                    <Input type="password" value={fields.confirmPassword} onChange={e => setFields(f => ({ ...f, confirmPassword: e.target.value }))} required className="h-11 text-base" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-base font-semibold" disabled={loading}>Change Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="shadow-xl rounded-2xl border border-red-200 dark:border-red-800 w-full p-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">Delete your account (irreversible)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="destructive" className="mt-2 px-6 py-2 text-base font-semibold" onClick={() => setShowDeleteDialog(true)}>Delete Account</Button>
                </div>
                {/* Delete Account Confirmation Dialog */}
                {showDeleteDialog && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-xl mb-2 text-red-700 dark:text-red-400">Confirm Account Deletion</h4>
                      <p className="mb-6 text-base text-slate-700 dark:text-slate-300">Are you sure you want to delete your account? This action cannot be undone.</p>
                      <div className="flex gap-4 justify-end">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="px-5 py-2 text-base">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="px-5 py-2 text-base">{deleting ? "Deleting..." : "Delete"}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
