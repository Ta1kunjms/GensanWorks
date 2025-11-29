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

    // Debug log all params and location
    console.log("[OAuthCallback] Params:", { token, name, email, role });
    console.log("[OAuthCallback] window.location:", window.location.href);

    if (token) {
      setAuth(token, { id: email || "google-user", name, email, role });
      console.log("[OAuthCallback] setAuth called", { token, user: { id: email || "google-user", name, email, role } });
      // Check localStorage after setAuth
      setTimeout(() => {
        console.log("[OAuthCallback] localStorage gw_token:", localStorage.getItem('gw_token'));
        console.log("[OAuthCallback] localStorage gw_user:", localStorage.getItem('gw_user'));
        // Log navigation intent
        if (role === "admin") console.log("[OAuthCallback] Navigating to /admin/dashboard");
        else if (role === "employer") console.log("[OAuthCallback] Navigating to /employer/dashboard");
        else if (role === "jobseeker" || role === "freelancer") console.log("[OAuthCallback] Navigating to /jobseeker/dashboard");
        else console.log("[OAuthCallback] Navigating to /jobseeker/dashboard (fallback)");
      }, 100);
      // Redirect by role (fallback to jobseeker dashboard if role missing)
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "employer") navigate("/employer/dashboard");
      else if (role === "jobseeker" || role === "freelancer") navigate("/jobseeker/dashboard");
      else navigate("/jobseeker/dashboard");
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
