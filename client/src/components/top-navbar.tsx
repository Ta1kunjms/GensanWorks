import { Search, Plus, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from 'wouter';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { BrandSignature } from "@/components/brand-signature";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { state: sidebarState } = useSidebar();
  const sidebarCollapsed = sidebarState === "collapsed";
  // Disable theme toggling across the app (force light mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
    } catch {
      // ignore
    }
  }, []);

  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const role = user?.role || "guest";

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
      // In a real app, this would trigger a search API call
    }
  };

  // Page title logic
  const [pageTitle, setPageTitle] = useState<string>("");
  const [location] = useLocation();
  useEffect(() => {
    // Simple route-to-title mapping for admin, employer, jobseeker
    if (role === "admin") {
      if (location.startsWith("/admin/dashboard")) setPageTitle("Admin Dashboard");
      else if (location.startsWith("/admin/access-requests")) setPageTitle("Admin Access Requests");
      else if (location.startsWith("/admin/applicants")) setPageTitle("Applicants Management");
      else if (location.startsWith("/admin/employers")) setPageTitle("Employers Management");
      else if (location.startsWith("/admin/jobs")) setPageTitle("Job Vacancies (SRS Form 2A)");
      else if (location.startsWith("/admin/reports")) setPageTitle("Analytics");
      else if (location.startsWith("/admin/settings")) setPageTitle("Settings");
      else if (location.startsWith("/admin/help")) setPageTitle("Help & Support");
      else setPageTitle("Admin Panel");
    } else if (role === "employer") {
      if (location.startsWith("/employer/dashboard")) setPageTitle("Employer Dashboard");
      else if (location.startsWith("/employer/jobs")) setPageTitle("Manage Job Posts");
      else if (location.startsWith("/employer/applications")) setPageTitle("Applications");
      else if (location.startsWith("/employer/notifications")) setPageTitle("Notifications");
      else if (location.startsWith("/employer/profile")) setPageTitle("My Account");
      else if (location.startsWith("/employer/settings")) setPageTitle("Settings");
      else setPageTitle("Employer Panel");
    } else if (role === "jobseeker" || role === "freelancer") {
      if (location.startsWith("/jobseeker/dashboard")) setPageTitle("Jobseeker Dashboard");
      else if (location.startsWith("/jobseeker/jobs")) setPageTitle("Find Jobs");
      else if (location.startsWith("/jobseeker/applications")) setPageTitle("My Applications");
      else if (location.startsWith("/jobseeker/notifications")) setPageTitle("Notifications");
      else if (location.startsWith("/jobseeker/profile")) setPageTitle("My Account");
      else if (location.startsWith("/jobseeker/settings")) setPageTitle("Settings");
      else setPageTitle("Jobseeker Panel");
    } else {
      setPageTitle("");
    }
  }, [location, role]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50 to-slate-100 text-slate-900 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-0 sm:h-[76px] sm:flex-row sm:items-center sm:gap-4 sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
          <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-2 rounded-full border border-slate-200/80 bg-white/80 p-2 text-slate-700 shadow-sm hover:bg-white" />
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>

        {role === "employer" && (
          <div className="relative order-3 w-full sm:order-none sm:flex-1 sm:min-w-[320px] sm:max-w-[520px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search applicants, employers, job posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-9 h-11 rounded-full border-slate-200/80 bg-white/90 text-slate-900 placeholder:text-slate-500 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-200"
              data-testid="input-search"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto sm:flex-shrink-0">
          {role === "jobseeker" || role === "freelancer" ? (
            <div className="flex items-center gap-2">
              <Link href="/jobseeker/jobs">
                <Button variant="secondary" size="sm" className="rounded-full border border-slate-200/80 bg-white/90 text-slate-900 shadow-sm hover:bg-white">
                  Find Jobs
                </Button>
              </Link>
              <Link href="/jobseeker/applications">
                <Button variant="ghost" size="sm" className="rounded-full border border-slate-200/80 bg-white/90 text-slate-800 hover:bg-white">
                  My Applications
                </Button>
              </Link>
              <Link href="/jobseeker/notifications">
                <Button variant="ghost" size="sm" className="rounded-full border border-slate-200/80 bg-white/90 text-slate-800 hover:bg-white">
                  Notifications
                </Button>
              </Link>
            </div>
          ) : role === "employer" ? (
            <div className="flex items-center gap-2">
              <Link href="/employer/jobs">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 hidden sm:flex rounded-full border border-slate-200/80 bg-white/90 text-slate-900 shadow-sm hover:bg-white"
                  data-testid="button-new-job-post"
                >
                  <Plus className="h-4 w-4" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/employer/applications">
                <Button variant="ghost" size="sm" className="rounded-full border border-slate-200/80 bg-white/90 text-slate-800 hover:bg-white">
                  Applications
                </Button>
              </Link>
              <Link href="/employer/notifications">
                <Button variant="ghost" size="sm" className="rounded-full border border-slate-200/80 bg-white/90 text-slate-800 hover:bg-white">
                  Notifications
                </Button>
              </Link>
            </div>
          ) : null}

          {/* Top navbar right-side actions (hidden for admin) */}
          {role !== 'admin' && (
            <>
              {/* Help (hidden for jobseeker/freelancer) */}
              {!(role === 'jobseeker' || role === 'freelancer') && (
                <button className="p-2 rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm hover:bg-white" title="Help / Support" data-testid="button-help">
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
              {/* Logout */}
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg border border-red-500 bg-red-500 px-4 font-semibold text-white shadow-md hover:bg-red-600 hover:border-red-600"
                onClick={() => setShowLogoutConfirm(true)}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          )}

          {role === "admin" && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex"
                data-testid="button-new-job-post"
                onClick={() => navigate('/admin/jobs')}
              >
                <Plus className="h-4 w-4" />
                New Job Post
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex"
                data-testid="button-add-applicant"
                onClick={() => navigate('/admin/applicants')}
              >
                <Plus className="h-4 w-4" />
                Add Applicant
              </Button>
              <Link href="/admin/reports">
                <Button
                  size="sm"
                  className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                  data-testid="button-generate-report"
                >
                  <FileText className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </div>
          )}

          {/* Removed Logout for employer */}
        </div>
      </div>

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
                toast({ title: 'Logged out', description: 'You have been logged out' });
                const loginUrl = role === 'admin' ? '/admin/login' : role === 'employer' ? '/employer/login' : '/jobseeker/login';
                navigate(loginUrl);
              } catch (e) {
                // ignore
              }
            }}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
