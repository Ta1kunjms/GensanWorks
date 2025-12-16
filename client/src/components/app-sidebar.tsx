import { Home, Users, Briefcase, FileText, BarChart3, LogOut, User, ClipboardList, Settings, HelpCircle, Wand2, MessageCircle, Network, Bell } from "lucide-react";
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
import { BrandSignature } from "@/components/brand-signature";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { useUnreadCounts } from "@/hooks/use-unread-counts";

// Admin role navigation
// NOTE: Certain items are temporarily hidden from the admin sidebar UI.
// They retain their definitions so routes/components remain accessible directly.
const adminMenu = [
  { title: "Home", url: "/admin/dashboard", icon: Home, testId: "nav-admin-dashboard" },
  // { title: "Access Requests", url: "/admin/access-requests", icon: ClipboardList, testId: "nav-admin-access-requests" },
  { title: "Applicants", url: "/admin/applicants", icon: Users, testId: "nav-admin-applicants" },
  { title: "Employers", url: "/admin/employers", icon: Briefcase, testId: "nav-admin-employers" },
  { title: "Jobs", url: "/admin/jobs", icon: FileText, testId: "nav-admin-jobs" },
  { title: "Notifications", url: "/admin/notifications", icon: Bell, testId: "nav-admin-notifications" },
  { title: "Matching", url: "/admin/matching", icon: Wand2, testId: "nav-admin-matching" },
  { title: "Analytics", url: "/admin/reports", icon: BarChart3, testId: "nav-admin-reports" },
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
  { title: "Notifications", url: "/employer/notifications", icon: Bell, testId: "nav-employer-notifications" },
  { title: "Messages", url: "/employer/messages", icon: MessageCircle, testId: "nav-employer-messages" },
  { title: "My Account", url: "/employer/profile", icon: User, testId: "nav-employer-profile" },
  { title: "Settings", url: "/employer/settings", icon: Settings, testId: "nav-employer-settings" },
];

// Jobseeker role navigation
const jobseekerMenu = [
  { title: "Dashboard", url: "/jobseeker/dashboard", icon: Home, testId: "nav-jobseeker-dashboard" },
  { title: "Find Jobs", url: "/jobseeker/jobs", icon: Briefcase, testId: "nav-jobseeker-jobs" },
  { title: "Applications", url: "/jobseeker/applications", icon: ClipboardList, testId: "nav-jobseeker-applications" },
  { title: "Notifications", url: "/jobseeker/notifications", icon: Bell, testId: "nav-jobseeker-notifications" },
  { title: "Messages", url: "/jobseeker/messages", icon: MessageCircle, testId: "nav-jobseeker-messages" },
  { title: "My Account", url: "/jobseeker/profile", icon: User, testId: "nav-jobseeker-profile" },
  { title: "Settings", url: "/jobseeker/settings", icon: Settings, testId: "nav-jobseeker-settings" },
];

// Removed bottomMenuItems (Logout)

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { counts } = useUnreadCounts();

  // Fetch applicant profile to sync name with NSRP data (only for jobseeker/freelancer)
  useEffect(() => {
    const fetchName = async () => {
      if (!user?.id) {
        setDisplayName(null);
        return;
      }
      if (user.role === "jobseeker" || user.role === "freelancer") {
        try {
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
      } else {
        // For admin/employer, use user.name if available
        setDisplayName(user.name || null);
      }
    };
    fetchName();
  }, [user?.id, user?.role, user?.name]);

  const role = user?.role || "jobseeker";

  let menuItems = jobseekerMenu;
  if (role === "admin") menuItems = adminMenu;
  if (role === "employer") menuItems = employerMenu;
  if (role === "jobseeker" || role === "freelancer") menuItems = jobseekerMenu;

  // Helper function to get badge count for a menu item
  const getBadgeCount = (title: string, url: string): number => {
    // Notifications badge (all roles)
    if (title === "Notifications" || url.includes("/notifications")) {
      return counts.notifications;
    }
    
    // Messages badge (all roles)
    if (title === "Messages" || url.includes("/messages")) {
      return counts.messages;
    }
    
    // New jobs badge (jobseeker/freelancer only - jobs posted in last 7 days)
    if ((title === "Find Jobs" || title === "Jobs") && (role === "jobseeker" || role === "freelancer")) {
      return counts.newJobs;
    }
    
    // New applications badge (employer only - pending apps in last 7 days)
    if (title === "Applications" && role === "employer") {
      return counts.applications || 0;
    }
    
    // Admin-specific badges
    if (role === "admin") {
      // Pending applications badge
      if (title === "Applicants" || url.includes("/admin/applicants")) {
        return counts.pendingApplications || 0;
      }
      
      // Pending jobs badge
      if (title === "Jobs" || url.includes("/admin/jobs")) {
        return counts.pendingJobs || 0;
      }
    }
    
    return 0;
  };

  return (
    <Sidebar data-testid="sidebar-main" collapsible="icon">
      <SidebarContent className="gap-0">
        <div className="border-b border-sidebar-border px-4 py-5 group-data-[collapsible=icon]:px-0">
          <div className="group-data-[collapsible=icon]:hidden">
            <BrandSignature tone="sidebar" />
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <img src="/peso-gsc-logo.png" alt="PESO Gensan Logo" className="h-10 w-10" />
            </div>
          </div>
        </div>
        <SidebarGroup className="py-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(i => !(role === 'admin' && (i as any).hidden)).map((item) => {
                const isActive = location === item.url;
                const badgeCount = getBadgeCount(item.title, item.url);
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
                        {badgeCount > 0 && (
                          <NotificationBadge 
                            count={badgeCount} 
                            className="ml-auto"
                            variant={item.title === "Notifications" ? "danger" : "default"}
                          />
                        )}
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
        <Link href={role === "admin" ? "/admin/access-requests" : role === "employer" ? "/employer/profile" : "/jobseeker/profile"} className="no-underline">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0" data-testid="user-profile">
            <Avatar className="h-10 w-10 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 flex-shrink-0">
              <AvatarImage
                src={
                  // Prefer Google profile image for jobseeker/employer
                  (user?.role === 'jobseeker' || user?.role === 'freelancer' || user?.role === 'employer')
                    ? user?.profileImage || undefined
                    : undefined
                }
                alt={displayName || user?.name || "User"}
              />
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
