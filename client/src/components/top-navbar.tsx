import { Search, Plus, FileText, User, Bell, HelpCircle, SunMoon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from 'wouter';
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead, subscribeNotifications } from '@/api/notifications';
import { Notification } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  // Theme state persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  const toggleTheme = () => setDarkMode(d => !d);

  // Notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // SSE real-time subscription: invalidate/refetch on events
  useEffect(() => {
    const unsubscribe = subscribeNotifications((eventType, data) => {
      if (eventType === 'new' || eventType === 'seed' || eventType === 'read') {
        // Simply refetch to sync
        refetchNotifications();
      }
    });
    return unsubscribe;
  }, [refetchNotifications]);
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

          {/* Top navbar right-side actions (hidden for admin) */}
          {role !== 'admin' && (
            <>
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-accent relative"
                  title="Notifications"
                  onClick={() => {
                    if (!showNotifications) refetchNotifications();
                    setShowNotifications(s => !s);
                  }}
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-2 shadow-sm z-50" data-testid="notifications-dropdown">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-xs text-muted-foreground">Close</button>
                    </div>
                    {notificationsLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                    )}
                    {!notificationsLoading && (!notifications || notifications.length === 0) && (
                      <div className="text-sm text-muted-foreground py-4">No notifications</div>
                    )}
                    {!notificationsLoading && notifications && notifications.length > 0 && (
                      <ul className="space-y-1 max-h-64 overflow-y-auto">
                        {notifications.map(n => (
                          <li
                            key={n.id}
                            className={`rounded-md px-2 py-2 text-sm flex gap-2 items-start hover:bg-accent cursor-pointer ${n.read ? 'opacity-70' : ''}`}
                            onClick={async () => {
                              if (!n.read) {
                                try {
                                  await markNotificationRead(n.id);
                                  refetchNotifications();
                                } catch (e) {
                                  toast({ title: 'Error', description: 'Failed to mark notification read', variant: 'destructive' });
                                }
                              }
                            }}
                          >
                            <span className={`mt-0.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary'}`} />
                            <div className="flex flex-col">
                              <span className={`leading-snug ${n.read ? 'font-normal' : 'font-medium'}`}>{n.message}</span>
                              <span className="text-xs text-muted-foreground mt-0.5">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              {/* Help (hidden for jobseeker/freelancer) */}
              {!(role === 'jobseeker' || role === 'freelancer') && (
                <button className="p-2 rounded-full hover:bg-accent" title="Help / Support" data-testid="button-help">
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
              {/* Theme Switcher */}
              <button
                className="p-2 rounded-full hover:bg-accent"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                <SunMoon className="w-5 h-5" />
              </button>
              {/* Logout */}
              <Button
                variant="ghost"
                size="default"
                className="text-destructive"
                onClick={() => setShowLogoutConfirm(true)}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
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

          {/* Removed Logout for employer */}
        </div>
      </div>

      {/* Removed Logout dialog */}
          {/* Logout dialog */}
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
