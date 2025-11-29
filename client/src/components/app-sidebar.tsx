import { Home, Users, Briefcase, FileText, BarChart3, LogOut, User, ClipboardList, Settings, HelpCircle, Wand2, MessageCircle, Network } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth, authFetch } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Admin role navigation
// NOTE: Certain items are temporarily hidden from the admin sidebar UI.
// They retain their definitions so routes/components remain accessible directly.
const adminMenu = [
  { title: "Home", url: "/admin/dashboard", icon: Home, testId: "nav-admin-dashboard" },
  { title: "Access Requests", url: "/admin/access-requests", icon: ClipboardList, testId: "nav-admin-access-requests" },
  { title: "Applicants", url: "/admin/applicants", icon: Users, testId: "nav-admin-applicants" },
  { title: "Employers", url: "/admin/employers", icon: Briefcase, testId: "nav-admin-employers" },
  { title: "Jobs", url: "/admin/jobs", icon: FileText, testId: "nav-admin-jobs" },
  { title: "Matching", url: "/admin/matching", icon: Wand2, testId: "nav-admin-matching" },
  { title: "Reports", url: "/admin/reports", icon: BarChart3, testId: "nav-admin-reports" },
  // Hidden items (keep code, do not render for admin sidebar)
  { title: "Use Case Diagram", url: "/admin/use-case-diagram", icon: Network, testId: "nav-admin-use-case", hidden: true },
  { title: "Diagram: Jobseeker", url: "/admin/use-case-diagram/jobseeker", icon: Network, testId: "nav-admin-use-case-jobseeker", hidden: true },
  { title: "Diagram: Employer", url: "/admin/use-case-diagram/employer", icon: Network, testId: "nav-admin-use-case-employer", hidden: true },
  { title: "Use Cases: Jobseeker", url: "/admin/use-cases/jobseeker", icon: FileText, testId: "nav-admin-use-cases-jobseeker", hidden: true },
  { title: "Use Cases: Employer", url: "/admin/use-cases/employer", icon: FileText, testId: "nav-admin-use-cases-employer", hidden: true },
  { title: "Settings", url: "/admin/settings", icon: Settings, testId: "nav-admin-settings" },
  { title: "Help", url: "/admin/help", icon: HelpCircle, testId: "nav-admin-help" },
];

// Employer role navigation
const employerMenu = [
  { title: "Dashboard", url: "/employer/dashboard", icon: Home, testId: "nav-employer-dashboard" },
  { title: "Jobs", url: "/employer/jobs", icon: ClipboardList, testId: "nav-employer-jobs" },
  { title: "Applications", url: "/employer/applications", icon: Users, testId: "nav-employer-applications" },
  { title: "Messages", url: "/employer/messages", icon: MessageCircle, testId: "nav-employer-messages" },
  { title: "Profile", url: "/employer/profile", icon: User, testId: "nav-employer-profile" },
];

// Jobseeker role navigation
const jobseekerMenu = [
  { title: "Dashboard", url: "/jobseeker/dashboard", icon: Home, testId: "nav-jobseeker-dashboard" },
  { title: "Find Jobs", url: "/jobseeker/jobs", icon: Briefcase, testId: "nav-jobseeker-jobs" },
  { title: "Applications", url: "/jobseeker/applications", icon: ClipboardList, testId: "nav-jobseeker-applications" },
  { title: "Messages", url: "/jobseeker/messages", icon: MessageCircle, testId: "nav-jobseeker-messages" },
  { title: "Profile", url: "/jobseeker/profile", icon: User, testId: "nav-jobseeker-profile" },
];

// Removed bottomMenuItems (Logout)

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Fetch applicant profile to sync name with NSRP data
  useEffect(() => {
    const fetchName = async () => {
      try {
        if (!user?.id) {
          setDisplayName(null);
          return;
        }
        const res = await authFetch(`/api/applicants/${user.id}`);
        if (!res.ok) {
          setDisplayName(null);
          return;
        }
        const data = await res.json();
        // Prefer fullName or compose from first/last if available
        const name = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(" ");
        setDisplayName(name || null);
      } catch {
        setDisplayName(null);
      }
    };
    fetchName();
  }, [user?.id]);

  const role = user?.role || "jobseeker";

  let menuItems = jobseekerMenu;
  if (role === "admin") menuItems = adminMenu;
  if (role === "employer") menuItems = employerMenu;
  if (role === "jobseeker" || role === "freelancer") menuItems = jobseekerMenu;

  return (
    <Sidebar data-testid="sidebar-main" collapsible="icon">
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(i => !(role === 'admin' && (i as any).hidden)).map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={item.testId}
                      className="h-11"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin-only logout group */}
        {role === 'admin' && (
          <SidebarGroup className="mt-auto py-2">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key="logout">
                  <SidebarMenuButton asChild className="h-11" data-testid="nav-logout">
                    <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      <span className="text-[15px]">Logout</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-start group-data-[collapsible=icon]:p-2">
        <Link href={role === "admin" ? "/admin/users" : role === "employer" ? "/employer/profile" : "/jobseeker/profile"} className="no-underline">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0" data-testid="user-profile">
            <Avatar className="h-10 w-10 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 flex-shrink-0">
              <AvatarImage src="" alt={displayName || user?.name || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold rounded-full flex items-center justify-center">
                {(displayName || user?.name || "U").split(" ").map((s: string) => s[0]).slice(0,2).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground truncate" data-testid="user-name">
                {displayName || user?.name || "User"}
              </span>
              <span className="text-xs text-sidebar-foreground/70 truncate" data-testid="user-role">
                {role === "jobseeker" || role === "freelancer" ? "Applicant" : role}
              </span>
            </div>
          </div>
        </Link>
      </SidebarFooter>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to log in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              try {
                logout();
                toast({ title: 'Logged out', description: 'You have been logged out', });
                const loginUrl = role === 'admin' ? '/admin/login' : role === 'employer' ? '/employer/login' : '/jobseeker/login';
                setLocation(loginUrl);
              } catch (e) {
                // ignore
              }
            }}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
