import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function OAuthCallbackPage() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name") || "Google User";
    const email = params.get("email") || "";
    const role = (params.get("role") || "jobseeker") as "admin" | "employer" | "jobseeker" | "freelancer";
    const applicantId = params.get("applicantId");

    // Debug log all params and location
    console.log("[OAuthCallback] Params:", { token, name, email, role, applicantId });
    console.log("[OAuthCallback] window.location:", window.location.href);

    if (token) {
      // Use applicantId as user.id if present, else fallback to email
      const userId = applicantId || email || "google-user";
      // Persist token+user immediately and log results
      try {
        setAuth(token, { id: userId, name, email, role });
        console.log("[OAuthCallback] setAuth called", { token, user: { id: userId, name, email, role } });
        console.log("[OAuthCallback] localStorage gw_token after setAuth:", localStorage.getItem('gw_token'));
        console.log("[OAuthCallback] localStorage gw_user after setAuth:", localStorage.getItem('gw_user'));
      } catch (e) {
        console.error('[OAuthCallback] setAuth error:', e);
      }

      // Do a hard redirect to ensure the SPA initialises with auth state
      const target = role === "admin" ? "/admin/dashboard" : role === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard";
      console.log('[OAuthCallback] Redirecting (replace) to', target);
      // Use replace to avoid keeping token-containing URL in history
      window.location.replace(target);
      return;
    } else {
      // If no token, try to fetch user profile and redirect by role
      fetch("/api/profile", { credentials: "include" })
        .then(async (res) => {
          if (!res.ok) throw new Error("No profile");
          const user = await res.json();
          console.log("[OAuthCallback] /api/profile user:", user);
          if (user.role === "admin") {
            console.log("[OAuthCallback] Navigating to /admin/dashboard (profile)");
            navigate("/admin/dashboard");
          } else if (user.role === "employer") {
            console.log("[OAuthCallback] Navigating to /employer/dashboard (profile)");
            navigate("/employer/dashboard");
          } else {
            console.log("[OAuthCallback] Navigating to /jobseeker/dashboard (profile)");
            navigate("/jobseeker/dashboard");
          }
        })
        .catch((e) => {
          console.log("[OAuthCallback] /api/profile error:", e);
          console.log("[OAuthCallback] Navigating to landing page (/) due to error");
          navigate("/");
        });
    }
  }, [navigate, setAuth]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="text-center">
        <div className="text-lg">Signing you in via Google…</div>
        <div className="text-sm text-muted-foreground">Please wait</div>
      </div>
    </div>
  );
}
