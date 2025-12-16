import { useEffect, useState } from "react";
import { useAuth, authFetch } from "@/lib/auth";

interface UnreadCounts {
  notifications: number;
  messages: number;
  newJobs: number;
  applications?: number; // for employers - new pending applications
  pendingApplications?: number; // for admin - all pending applications
  pendingJobs?: number; // for admin - jobs needing approval
}

/**
 * useUnreadCounts - Custom hook to fetch and manage unread counts
 * Polls every 30 seconds for real-time updates
 * 
 * Returns count of:
 * - Unread notifications (all roles)
 * - Unread messages (all roles)
 * - New jobs posted in last 7 days (jobseekers only)
 * - New pending applications in last 7 days (employers only)
 * - Total pending applications (admin only)
 * - Pending jobs needing approval (admin only)
 */
export function useUnreadCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    notifications: 0,
    messages: 0,
    newJobs: 0,
    applications: 0,
    pendingApplications: 0,
    pendingJobs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = async () => {
    if (!user) {
      setCounts({ 
        notifications: 0, 
        messages: 0, 
        newJobs: 0, 
        applications: 0,
        pendingApplications: 0,
        pendingJobs: 0,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Fetch notifications count
      const notificationsRes = await authFetch("/api/notifications");
      const notifications = notificationsRes.ok ? await notificationsRes.json() : [];
      const unreadNotifications = Array.isArray(notifications)
        ? notifications.filter((n: any) => !n.read).length
        : 0;

      // Fetch messages count
      const messagesRes = await authFetch("/api/messages/unread/count");
      const messagesData = messagesRes.ok ? await messagesRes.json() : { count: 0 };
      const unreadMessages = messagesData.count || 0;

      // Fetch new jobs count (for jobseekers) - jobs posted in last 7 days
      let newJobsCount = 0;
      if (user.role === "jobseeker" || user.role === "freelancer") {
        const jobsRes = await authFetch("/api/jobs");
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          newJobsCount = Array.isArray(jobs)
            ? jobs.filter((job: any) => {
                const postedDate = new Date(job.postedDate || job.createdAt);
                return postedDate >= sevenDaysAgo;
              }).length
            : 0;
        }
      }

      // Fetch new applications count (for employers)
      let newApplicationsCount = 0;
      if (user.role === "employer") {
        const applicationsRes = await authFetch("/api/employer/applications");
        if (applicationsRes.ok) {
          const applications = await applicationsRes.json();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          newApplicationsCount = Array.isArray(applications)
            ? applications.filter((app: any) => {
                const appliedDate = new Date(app.appliedDate || app.createdAt);
                return appliedDate >= sevenDaysAgo && app.status === "pending";
              }).length
            : 0;
        }
      }

      // Fetch pending applications and jobs (for admin)
      let pendingApplicationsCount = 0;
      let pendingJobsCount = 0;
      if (user.role === "admin") {
        // Get all pending applications
        const applicationsRes = await authFetch("/api/admin/applications");
        if (applicationsRes.ok) {
          const applications = await applicationsRes.json();
          pendingApplicationsCount = Array.isArray(applications)
            ? applications.filter((app: any) => app.status === "pending").length
            : 0;
        }

        // Get all jobs that need approval (pending status)
        const jobsRes = await authFetch("/api/jobs");
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          pendingJobsCount = Array.isArray(jobs)
            ? jobs.filter((job: any) => job.status === "pending").length
            : 0;
        }
      }

      setCounts({
        notifications: unreadNotifications,
        messages: unreadMessages,
        newJobs: newJobsCount,
        applications: newApplicationsCount,
        pendingApplications: pendingApplicationsCount,
        pendingJobs: pendingJobsCount,
      });
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCounts, 30000);

    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  return { counts, isLoading, refetch: fetchCounts };
}
