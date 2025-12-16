
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label"; // Removed duplicate import
import { useAuth, authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function EmployerSettingsPage() {
    const [notifications, setNotifications] = useState<{
      newApplicants: boolean;
      jobStatus: boolean;
      systemAlerts: boolean;
    }>({
      newApplicants: true,
      jobStatus: true,
      systemAlerts: false
    });
  const { user } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState({
    contactEmail: user?.email || "",
    contactPhone: user && "contactNumber" in user ? (user as any).contactNumber : "",
    officeAddress: user && "companyAddress" in user ? (user as any).companyAddress : "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  // Notifications state for tab
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("profile");
  const [company, setCompany] = useState({
    name: user?.company || "",
    logo: "",
    contactEmail: user?.email || "",
    contactNumber: user && "contactNumber" in user ? (user as any).contactNumber : "",
    address: user && "companyAddress" in user ? (user as any).companyAddress : "",
    industry: ""
  });
  const [privacy, setPrivacy] = useState({
    showCompany: true,
    featuredEmployer: false
  });
  const [team, setTeam] = useState([
    { name: "HR Staff 1", email: "hr1@company.com", role: "HR" },
    { name: "HR Staff 2", email: "hr2@company.com", role: "Manager" }
  ]);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      toast({ title: "Company info updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      toast({ title: "Password changed successfully" });
      setFields(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleSaveNotifications() {
    toast({ title: "Notification preferences saved" });
  }

  function handleDeleteAccount() {
    toast({ title: "Account deleted", description: "Your account has been deleted." });
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-950 text-slate-50 min-h-screen">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-[5%] top-[-10%] h-80 w-80 rounded-full bg-indigo-500 blur-[120px]" />
          <div className="absolute right-[0%] top-[5%] h-72 w-72 rounded-full bg-cyan-400 blur-[120px]" />
        </div>
        <div className="w-full px-8 py-10 max-w-6xl mx-auto space-y-8 relative">
          {/* Title handled by TopNavbar. */}
          <p className="text-3xl font-bold tracking-tight text-white mb-2">Settings</p>
          <p className="text-base text-slate-100/80 mb-6">Configure your company account, security, and preferences</p>
        <Tabs value={tab} onValueChange={setTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 mb-6 gap-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
              <Card className="shadow-xl rounded-2xl border border-slate-200 bg-white shadow-lg w-full p-8 text-slate-900">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Company Information</CardTitle>
                <CardDescription className="text-base text-slate-100/80">Edit your company details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="logo">Company Logo (URL)</Label>
                    <Input id="logo" value={company.logo} onChange={e => setCompany(c => ({ ...c, logo: e.target.value }))} placeholder="Paste image URL" />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" value={company.contactEmail} onChange={e => setCompany(c => ({ ...c, contactEmail: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" value={company.contactNumber} onChange={e => setCompany(c => ({ ...c, contactNumber: e.target.value }))} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Company Address</Label>
                    <Input id="address" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={company.industry} onChange={e => setCompany(c => ({ ...c, industry: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <Button type="button" className="px-6 py-2">Save Company Info</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
              <Card className="shadow-xl rounded-2xl border border-slate-200 bg-white shadow-lg w-full p-8 text-slate-900">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Notifications</CardTitle>
                <CardDescription className="text-base text-slate-100/80">Manage notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.newApplicants} onChange={e => setNotifications(n => ({ ...n, newApplicants: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>New Applicants</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.jobStatus} onChange={e => setNotifications(n => ({ ...n, jobStatus: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Job Post Status</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={notifications.systemAlerts} onChange={e => setNotifications(n => ({ ...n, systemAlerts: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>System Alerts</Label>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <Button type="button" className="px-6 py-2">Save Preferences</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
              <Card className="shadow-xl rounded-2xl border border-slate-200 bg-white shadow-lg w-full p-8 text-slate-900">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Privacy</CardTitle>
                <CardDescription className="text-base text-slate-100/80">Control your company visibility and featured status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.showCompany} onChange={e => setPrivacy(p => ({ ...p, showCompany: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Show company to jobseekers</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={privacy.featuredEmployer} onChange={e => setPrivacy(p => ({ ...p, featuredEmployer: e.target.checked }))} className="w-5 h-5 rounded cursor-pointer" />
                    <Label>Opt-in for featured employer</Label>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <Button type="button" className="px-6 py-2">Save Privacy Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
              <Card className="shadow-xl rounded-2xl border border-slate-200 bg-white shadow-lg w-full p-8 text-slate-900">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Team Management</CardTitle>
                <CardDescription className="text-base text-slate-100/80">Manage company users and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="font-semibold text-white">{member.name}</span>
                      <span className="text-sm text-slate-100/80">{member.email}</span>
                      <span className="text-xs px-2 py-1 rounded bg-cyan-200/30 text-cyan-50 border border-cyan-200/40">{member.role}</span>
                      <Button variant="outline" size="sm" className="ml-auto">Remove</Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Button type="button" size="sm">Add Team Member</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
              <Card className="shadow-xl rounded-2xl border border-slate-200 bg-white shadow-lg w-full p-8 text-slate-900">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Change Password</CardTitle>
                <CardDescription className="text-base text-slate-100/80">Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={fields.currentPassword} onChange={e => setFields(f => ({ ...f, currentPassword: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={fields.newPassword} onChange={e => setFields(f => ({ ...f, newPassword: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={fields.confirmPassword} onChange={e => setFields(f => ({ ...f, confirmPassword: e.target.value }))} required />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <Button type="submit" className="px-6 py-2" disabled={loading}>Change Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
              <Card className="shadow-xl rounded-2xl border border-red-300/40 bg-red-50/10 backdrop-blur-lg w-full p-8 text-slate-900">
              <CardHeader>
                <CardDescription className="text-base text-slate-100/80">Delete your account (irreversible)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleDeleteAccount} className="px-6 py-2">Delete Account</Button>
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
