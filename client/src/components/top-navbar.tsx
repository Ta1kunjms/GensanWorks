import { Search, Plus, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from 'wouter';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function TopNavbar() {
  const { user } = useAuth();
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
      <div className="flex h-[72px] items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-2" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                <span className="text-primary">Gensan</span>
                <span className="text-destructive">Works</span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Job Assistance Platform of PESO – General Santos City
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(role === "admin" || role === "employer") && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applicants, employers, job posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-9 w-[300px] lg:w-[350px] h-10 bg-background"
                data-testid="input-search"
              />
            </div>
          )}

          {role === "employer" && (
            <Link href="/employer/jobs">
              <Button
                variant="outline"
                size="default"
                className="gap-2 hidden sm:flex"
                data-testid="button-new-job-post"
              >
                <Plus className="h-4 w-4" />
                Manage Jobs
              </Button>
            </Link>
          )}

          {(role === "jobseeker" || role === "freelancer") && (
            <div className="flex items-center gap-2">
              <Link href="/jobseeker/profile">
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 hidden sm:flex"
                  data-testid="button-view-profile"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="default"
                className="text-destructive"
                onClick={() => setShowLogoutConfirm(true)}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          )}

          {role === "admin" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="default"
                className="gap-2 hidden sm:flex"
                data-testid="button-new-job-post"
                onClick={() => navigate('/admin/jobs')}
              >
                <Plus className="h-4 w-4" />
                New Job Post
              </Button>
              <Button
                variant="outline"
                size="default"
                className="gap-2 hidden sm:flex"
                data-testid="button-add-applicant"
                onClick={() => navigate('/admin/applicants')}
              >
                <Plus className="h-4 w-4" />
                Add Applicant
              </Button>
              <Link href="/admin/reports">
                <Button
                  size="default"
                  className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                  data-testid="button-generate-report"
                >
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </Link>
            </div>
          )}

          {role === "employer" && (
            <Button
              variant="ghost"
              size="default"
              className="text-destructive"
              onClick={() => setShowLogoutConfirm(true)}
              data-testid="button-logout"
            >
              Logout
            </Button>
          )}
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
