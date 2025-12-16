import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";

export default function JobseekerSignup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const scrollToFirstInvalid = () => {
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
      el?.focus?.();
      el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = "Enter a valid email";
    if (!formData.password) nextErrors.password = "Password is required";
    else if (formData.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      scrollToFirstInvalid();
      return;
    }
    
    setLoading(true);

    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        "jobseeker"
      );

      toast({
        title: "Success!",
        description: "Your account has been created. Complete your profile in the dashboard.",
      });

      setLocation("/jobseeker/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join as a jobseeker and start applying today."
      roleLabel="Jobseeker Portal"
      formVariant="plain"
      layout="split"
      nav={{
        loginHref: "/jobseeker/login",
        joinHref: "/jobseeker/signup",
        homeHref: "/",
        aboutHref: "/about",
        activePortalId: "jobseeker",
      }}
      footer={
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/jobseeker/login" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">First name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                aria-invalid={!!fieldErrors.firstName}
                className="h-11 pl-9"
                placeholder="Juan"
                autoComplete="given-name"
              />
            </div>
            {fieldErrors.firstName ? <p className="text-xs text-destructive">{fieldErrors.firstName}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                aria-invalid={!!fieldErrors.lastName}
                className="h-11 pl-9"
                placeholder="Dela Cruz"
                autoComplete="family-name"
              />
            </div>
            {fieldErrors.lastName ? <p className="text-xs text-destructive">{fieldErrors.lastName}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              aria-invalid={!!fieldErrors.email}
              className="h-11 pl-9"
              placeholder="juan@example.com"
              autoComplete="email"
            />
          </div>
          {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
                aria-invalid={!!fieldErrors.password}
                className="h-11 pl-9 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            {fieldErrors.password ? <p className="text-xs text-destructive">{fieldErrors.password}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                aria-invalid={!!fieldErrors.confirmPassword}
                className="h-11 pl-9 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
