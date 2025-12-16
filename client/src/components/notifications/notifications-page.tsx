import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Trash2, ChevronDown, ChevronUp, Briefcase, Users, Clock, Check, Bell, Sparkles, RefreshCw, Search, Undo2, FileText, Mail, AlertCircle } from "lucide-react";
import { fetchNotifications, markNotificationRead, subscribeNotifications } from "@/api/notifications";
import { Notification } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const deleteNotification = async (id: string) => {
  const response = await authFetch(`/api/notifications/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete notification");
  return response.json();
};

function formatDistanceToNow(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleString();
}

interface ShortlistDetails {
  jobId: string;
  jobTitle: string;
  company: string;
  applicants: Array<{
    id: string;
    name: string;
    profile: any;
  }>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-dashed border-2 border-border bg-white">
      <CardContent className="text-center py-10">
        <p className="text-slate-600">{message}</p>
      </CardContent>
    </Card>
  );
}

export function NotificationsPage({ role }: { role: "jobseeker" | "employer" | "admin" }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [shortlistModal, setShortlistModal] = useState<ShortlistDetails | null>(null);
  const [expandedApplicants, setExpandedApplicants] = useState<Set<string>>(new Set());
  const [loadingApplicants, setLoadingApplicants] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Marked as read" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Notification deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    },
  });

  useEffect(() => {
    const unsubscribe = subscribeNotifications((eventType) => {
      if (eventType === "new" || eventType === "seed" || eventType === "read" || eventType === "delete") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });
    return unsubscribe;
  }, [queryClient]);

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCreatedAtMs = (value: string) => {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let items = notifications;

    if (unreadOnly) {
      items = items.filter((n) => !n.read);
    }

    if (q) {
      items = items.filter((n) => `${n.message} ${n.type}`.toLowerCase().includes(q));
    }

    return [...items].sort((a, b) => getCreatedAtMs(b.createdAt) - getCreatedAtMs(a.createdAt));
  }, [notifications, searchQuery, unreadOnly]);

  const parseShortlistNotification = (message: string) => {
    // Extract job title from message like: "3 candidates have been shortlisted for "Job Title": Names..."
    const match = message.match(/for "([^"]+)"/);
    return match ? match[1] : null;
  };

  const handleViewShortlist = async (notification: Notification) => {
    const jobTitle = parseShortlistNotification(notification.message);
    if (!jobTitle) return;

    try {
      setLoadingApplicants(new Set()); // Reset loading state
      
      // Fetch job details to get job ID
      const jobsResponse = await authFetch("/api/jobs");
      if (!jobsResponse.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const jobs = await jobsResponse.json();
      const job = jobs.find((j: any) => 
        (j.positionTitle || j.title)?.toLowerCase() === jobTitle.toLowerCase()
      );

      if (!job) {
        toast({ title: "Error", description: "Job not found", variant: "destructive" });
        return;
      }

      // Fetch applications for this specific job
      const applicationsResponse = await authFetch(`/api/jobs/${job.id}/applications`);
      if (!applicationsResponse.ok) {
        throw new Error("Failed to fetch applications");
      }
      const applications = await applicationsResponse.json();

      // Filter only shortlisted applications
      const shortlistedApps = applications.filter((app: any) => app.status === "shortlisted");

      if (shortlistedApps.length === 0) {
        toast({ title: "No candidates", description: "No shortlisted candidates found for this job", variant: "destructive" });
        return;
      }

      // Fetch full applicant profiles for each shortlisted candidate
      const applicantsWithDetails = await Promise.all(
        shortlistedApps.map(async (app: any) => {
          try {
            // First try to use the applicant data that came with the application
            if (app.applicant && app.applicant.name) {
              // Fetch full profile for additional details
              try {
                const response = await authFetch(`/api/applicants/${app.applicantId}`);
                if (response.ok) {
                  const fullProfile = await response.json();
                  return {
                    id: app.applicantId,
                    name: fullProfile.fullName || fullProfile.name || app.applicant.name,
                    profile: fullProfile,
                  };
                }
              } catch (profileError) {
                console.warn(`Could not fetch full profile for ${app.applicantId}, using basic data`);
              }
              
              // Fall back to application data
              return {
                id: app.applicantId,
                name: app.applicant.name,
                profile: app.applicant,
              };
            }
            
            // If no applicant data in application, fetch from API
            const response = await authFetch(`/api/applicants/${app.applicantId}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch applicant ${app.applicantId}`);
            }
            const profile = await response.json();
            return {
              id: app.applicantId,
              name: profile.fullName || profile.name || profile.firstName || profile.lastName || 'Unknown Applicant',
              profile: profile,
            };
          } catch (error) {
            console.error(`Error fetching applicant ${app.applicantId}:`, error);
            // Return with ID at least
            return {
              id: app.applicantId,
              name: `Applicant ${app.applicantId.substring(0, 8)}`,
              profile: null,
            };
          }
        })
      );

      setShortlistModal({
        jobId: job.id,
        jobTitle: job.positionTitle || job.title,
        company: job.companyName || job.employerName || "Company",
        applicants: applicantsWithDetails.filter(Boolean) as any,
      });

      // Mark as read when viewing
      if (!notification.read) {
        markReadMutation.mutate(notification.id);
      }
    } catch (error) {
      console.error("Error opening shortlist details:", error);
      toast({
        title: "Error",
        description: "Failed to load candidate details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleApplicantProfile = async (applicantId: string) => {
    const expanded = new Set(expandedApplicants);
    if (expanded.has(applicantId)) {
      expanded.delete(applicantId);
      setExpandedApplicants(expanded);
    } else {
      expanded.add(applicantId);
      setExpandedApplicants(expanded);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClass = "h-6 w-6 text-white";
    switch (type) {
      case "application":
        return <FileText className={iconClass} />;
      case "job":
        return <Briefcase className={iconClass} />;
      case "message":
        return <Mail className={iconClass} />;
      case "system":
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "application":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm";
      case "job":
        return "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-sm";
      case "message":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm";
      case "system":
        return "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm";
    }
  };

  const getNotificationBadgeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "application":
        return "Application";
      case "job":
        return "Job";
      case "message":
        return "Message";
      case "system":
        return "System";
      default:
        return "Update";
    }
  };

  const isShortlistNotification = (message: string) => {
    return message.includes("shortlisted for");
  };

  const emptyMessage = useMemo(() => {
    if (notifications.length === 0) return "No notifications yet.";
    if (unreadOnly && unreadCount === 0) return "No unread notifications.";
    return "No notifications found.";
  }, [notifications.length, unreadCount, unreadOnly]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
        <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant={unreadOnly ? "default" : "outline"}
                onClick={() => setUnreadOnly((v) => !v)}
                className="h-9"
                disabled={isLoading}
              >
                Unread only
                {unreadOnly ? ` (${unreadCount})` : ""}
              </Button>
              <Button variant="outline" onClick={() => refetch()} className="gap-2" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-semibold text-slate-700">{filteredNotifications.length}</span> of {notifications.length} notifications
            </p>
            {searchQuery.trim() && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setSearchQuery("")}
              >
                <Undo2 className="h-4 w-4" />
                Clear search
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center p-8 text-slate-600">
              <div className="mx-auto max-w-xl space-y-3">
                <div className="h-4 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-24 rounded-xl border border-slate-200 bg-white shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const isUnread = !notification.read;
                const showCandidates = isShortlistNotification(notification.message) && role === "employer";

                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-3 shadow-sm transition lg:flex-row lg:items-start lg:justify-between ${
                      isUnread ? "ring-2 ring-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 h-9 w-9 rounded-md flex items-center justify-center ${
                          isUnread ? "bg-slate-900" : "bg-slate-200"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={`${getNotificationBadgeColor(notification.type)} text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md`}
                          >
                            {getNotificationBadgeLabel(notification.type)}
                          </Badge>
                          {isUnread && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              New
                            </Badge>
                          )}
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(notification.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-900 break-words">
                          {showCandidates ? notification.message.split(":")[0] : notification.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end lg:justify-start">
                      {showCandidates && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewShortlist(notification)}
                        >
                          <Users className="h-4 w-4" />
                          View Candidates
                        </Button>
                      )}
                      {isUnread && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2"
                          onClick={() => markReadMutation.mutate(notification.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => deleteMutation.mutate(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Dialog open={!!shortlistModal} onOpenChange={() => setShortlistModal(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="h-7 w-7" />
                Shortlisted Candidates
              </DialogTitle>
            </DialogHeader>

            {shortlistModal && (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Job Info Card */}
                <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{shortlistModal.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{shortlistModal.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {shortlistModal.applicants.length} candidate{shortlistModal.applicants.length !== 1 ? 's' : ''} shortlisted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="space-y-4">
                  {shortlistModal.applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Candidate Header */}
                      <div className="p-5 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {applicant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">{applicant.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Check className="h-3 w-3 text-green-500" />
                                Shortlisted Candidate
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleApplicantProfile(applicant.id)}
                            disabled={loadingApplicants.has(applicant.id)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            {loadingApplicants.has(applicant.id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Loading...
                              </>
                            ) : expandedApplicants.has(applicant.id) ? (
                              <>
                                Hide Profile
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                View Profile
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Profile */}
                      {expandedApplicants.has(applicant.id) && applicant.profile && (
                        <div className="border-t bg-gradient-to-br from-gray-50 to-white p-6 space-y-6">
                          {/* Personal Information */}
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                            <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded"></div>
                              Personal Information
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                                <p className="text-sm font-medium text-gray-900">{applicant.profile.email || 'Not provided'}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</p>
                                <p className="text-sm font-medium text-gray-900">{applicant.profile.contactNumber || 'Not provided'}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</p>
                                <p className="text-sm font-medium text-gray-900">{applicant.profile.age || 'Not provided'}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</p>
                                <p className="text-sm font-medium text-gray-900">{applicant.profile.gender || 'Not provided'}</p>
                              </div>
                              <div className="col-span-2 space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                                <p className="text-sm font-medium text-gray-900">{applicant.profile.address || applicant.profile.barangay || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Education */}
                          {applicant.profile.education && Array.isArray(applicant.profile.education) && applicant.profile.education.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                              <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-600 rounded"></div>
                                Education
                              </h5>
                              <div className="space-y-3">
                                {applicant.profile.education.map((edu: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                    <p className="font-bold text-sm text-gray-900">{edu.degree || edu.course}</p>
                                    <p className="text-sm text-gray-700 mt-1">{edu.school || edu.institution}</p>
                                    <p className="text-xs text-gray-500 mt-1">{edu.year || edu.yearGraduated}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {applicant.profile.skills && Array.isArray(applicant.profile.skills) && applicant.profile.skills.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                              <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-600 rounded"></div>
                                Skills
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {applicant.profile.skills.map((skill: string, idx: number) => (
                                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Work Experience */}
                          {applicant.profile.workExperience && Array.isArray(applicant.profile.workExperience) && applicant.profile.workExperience.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                              <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-600 rounded"></div>
                                Work Experience
                              </h5>
                              <div className="space-y-3">
                                {applicant.profile.workExperience.map((work: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                                    <p className="font-bold text-sm text-gray-900">{work.position || work.jobTitle}</p>
                                    <p className="text-sm text-gray-700 mt-1">{work.company}</p>
                                    <p className="text-xs text-gray-500 mt-1">{work.duration || `${work.from} - ${work.to}`}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
