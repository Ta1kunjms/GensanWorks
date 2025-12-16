import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/lib/auth";
import { AdminGuard, EmployerGuard, JobseekerGuard } from "@/lib/role-guard";
import { useScaleToFitViewportWidth } from "@/lib/use-scale-to-fit";

// Admin Pages
import AdminLogin from "@/pages/admin/login";
import AdminSignup from "@/pages/admin/signup";
import AdminDashboard from "@/pages/admin/protected/dashboard";
import AdminUsers from "@/pages/admin/protected/users";
import AdminJobs from "@/pages/admin/protected/jobs";
import AdminArchivedJobs from "@/pages/admin/protected/archived-jobs";
import AdminArchivedJobVacancies from "@/pages/admin/protected/archived-job-vacancies";
import AdminApplicants from "@/pages/admin/protected/applicants";
import AdminReports from "@/pages/admin/protected/reports";
import AdminEmployers from "@/pages/admin/protected/employers";
import AdminMatching from "@/pages/admin/protected/matching";
import AdminSettings from "@/pages/admin/protected/settings";
import AdminHelp from "@/pages/admin/protected/help";
import AdminAuthSettingsPage from "@/pages/admin/auth-settings";
import AdminAccessRequests from "@/pages/admin/protected/access-requests";
import JobMatchingPage from "@/pages/admin/protected/job-matching";
import AdminNotifications from "@/pages/admin/protected/notifications";
import UseCaseDiagram from "@/pages/admin/use-case-diagram";
import UseCaseDiagramJobseeker from "@/pages/admin/use-case-diagram-jobseeker";
import UseCaseDiagramEmployer from "@/pages/admin/use-case-diagram-employer";

// Employer Pages
import EmployerLogin from "@/pages/employer/login";
import EmployerSignup from "@/pages/employer/signup";
import EmployerDashboard from "@/pages/employer/dashboard";
import EmployerJobs from "@/pages/employer/jobs";
import EmployerApplications from "@/pages/employer/applications";
import EmployerNotifications from "@/pages/employer/notifications";
import EmployerProfile from "@/pages/employer/profile";
import EmployerSettings from "@/pages/employer/settings";
import EmployerMessages from "@/pages/employer/messages";

// Jobseeker Pages
import JobseekerLogin from "@/pages/jobseeker/login";
import JobseekerSignup from "@/pages/jobseeker/signup";
import JobseekerDashboard from "@/pages/jobseeker/dashboard";
import JobseekerJobs from "@/pages/jobseeker/jobs";
import JobseekerApplications from "@/pages/jobseeker/applications";
import JobseekerNotifications from "@/pages/jobseeker/notifications";
import JobseekerProfile from "@/pages/jobseeker/profile";
import JobseekerSettings from "@/pages/jobseeker/settings";
import JobseekerMessages from "@/pages/jobseeker/messages";
import JobseekerUseCases from "@/pages/jobseeker/use-case-descriptions";
import EmployerUseCases from "@/pages/employer/use-case-descriptions";
// Public info pages
import AccessibilityStatement from "@/pages/accessibility";
import PESOHelpdesk from "@/pages/helpdesk";
import AboutPESO from "@/pages/about-peso";
import HelpSupport from "@/pages/help-support";
import PrivacyPolicy from "@/pages/privacy";
import ContactInformation from "@/pages/contact";
import OAuthCallbackPage from "@/pages/oauth-callback";

export default function App() {
  useScaleToFitViewportWidth({ minScale: 0.1 });

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-[100svh] w-full overflow-hidden bg-background">
            <InnerApp />
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function InnerApp() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
  }

  // ========== PUBLIC ROUTES (No authentication required) ==========
  if (!user) {
    return (
      <main className="flex-1 min-h-0 overflow-auto">
        <Switch>
          {/* Landing Page */}
          <Route path="/" component={Landing} />

          {/* Public Info Pages */}
          <Route path="/accessibility" component={AccessibilityStatement} />
          <Route path="/helpdesk" component={PESOHelpdesk} />
          <Route path="/about" component={AboutPESO} />
          <Route path="/help" component={HelpSupport} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/contact" component={ContactInformation} />

          {/* OAuth callback (support old and new paths) */}
          <Route path="/oauth/callback" component={OAuthCallbackPage} />
          <Route path="/oauth-callback" component={OAuthCallbackPage} />

          {/* Admin Login */}
          <Route path="/admin/login" component={AdminLogin} />

          {/* Admin Signup / Request Access */}
          <Route path="/admin/signup" component={AdminSignup} />

          {/* Employer Login & Signup */}
          <Route path="/employer/login" component={EmployerLogin} />
          <Route path="/employer/signup" component={EmployerSignup} />

          {/* Jobseeker Login & Signup */}
          <Route path="/jobseeker/login" component={JobseekerLogin} />
          <Route path="/jobseeker/signup" component={JobseekerSignup} />

          {/* Fallback to landing */}
          <Route component={Landing} />
        </Switch>
      </main>
    );
  }

  // ========== ADMIN ROUTES (role='admin') ==========
  if (user.role === "admin") {
    const isMessagesPage = location.startsWith("/admin/messages");
    return (
      <>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <main className={`flex-1 min-h-0 ${isMessagesPage ? "overflow-hidden" : "overflow-auto"}`}>
            <TopNavbar />
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/access-requests" component={AdminAccessRequests} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/jobs/archived" component={AdminArchivedJobs} />
              <Route path="/admin/jobs/vacancies/archived" component={AdminArchivedJobVacancies} />
              <Route path="/admin/jobs/:id/match" component={JobMatchingPage} />
              <Route path="/admin/jobs" component={AdminJobs} />
              <Route path="/admin/notifications" component={AdminNotifications} />
              <Route path="/admin/applicants" component={AdminApplicants} />
              <Route path="/admin/reports" component={AdminReports} />
              <Route path="/admin/employers" component={AdminEmployers} />
              <Route path="/admin/matching" component={AdminMatching} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route path="/admin/settings/auth" component={AdminAuthSettingsPage} />
              <Route path="/admin/help" component={AdminHelp} />
              <Route path="/admin/use-case-diagram" component={UseCaseDiagram} />
              <Route path="/admin/use-case-diagram/jobseeker" component={UseCaseDiagramJobseeker} />
              <Route path="/admin/use-case-diagram/employer" component={UseCaseDiagramEmployer} />
              <Route path="/admin/use-cases/jobseeker" component={JobseekerUseCases} />
              <Route path="/admin/use-cases/employer" component={EmployerUseCases} />
              {/* Redirect root to admin dashboard */}
              <Route path="/" component={AdminDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </>
    );
  }

  // ========== EMPLOYER ROUTES (role='employer') ==========
  if (user.role === "employer") {
    const isMessagesPage = location.startsWith("/employer/messages");
    return (
      <>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <main className={`flex-1 min-h-0 ${isMessagesPage ? "overflow-hidden" : "overflow-auto"}`}>
            <TopNavbar />
            <Switch>
              <Route path="/employer/dashboard" component={EmployerDashboard} />
              <Route path="/employer/jobs" component={EmployerJobs} />
              <Route path="/employer/applications" component={EmployerApplications} />
              <Route path="/employer/notifications" component={EmployerNotifications} />
              <Route path="/employer/messages" component={EmployerMessages} />
              <Route path="/employer/profile" component={EmployerProfile} />
              <Route path="/employer/settings" component={EmployerSettings} />
              {/* Redirect root to employer dashboard */}
              <Route path="/" component={EmployerDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </>
    );
  }

  // ========== JOBSEEKER ROUTES (role='jobseeker' or 'freelancer') ==========
  return <JobseekerShell />;
}

function JobseekerShell() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("job");

    if (targetId && !location.startsWith("/jobseeker/jobs")) {
      setLocation(`/jobseeker/jobs?job=${targetId}`);
    }
  }, [location, setLocation]);

  const isMessagesPage = location.startsWith("/jobseeker/messages");

  return (
    <>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <main className={`flex-1 min-h-0 ${isMessagesPage ? "overflow-hidden" : "overflow-auto"}`}>
          <TopNavbar />
          <Switch>
            <Route path="/jobseeker/dashboard" component={JobseekerDashboard} />
            <Route path="/jobseeker/jobs" component={JobseekerJobs} />
            <Route path="/jobseeker/applications" component={JobseekerApplications} />
            <Route path="/jobseeker/notifications" component={JobseekerNotifications} />
            <Route path="/jobseeker/messages" component={JobseekerMessages} />
            <Route path="/jobseeker/profile" component={JobseekerProfile} />
            <Route path="/jobseeker/settings" component={JobseekerSettings} />
            {/* Redirect root to jobseeker dashboard */}
            <Route path="/" component={JobseekerDashboard} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </>
  );
}
