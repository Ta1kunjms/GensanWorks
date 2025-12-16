/**
 * Employer Login Page
 * Route: /employer/login
 * Accessible to anyone (before authentication)
 */
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthShell } from '@/components/auth/auth-shell';

export default function EmployerLoginPage() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [authSettings, setAuthSettings] = useState<{ providers: { id: string; enabled: boolean }[] }>({ providers: [] });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/auth/public');
        if (res.ok) setAuthSettings(await res.json());
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextErrors: Record<string, string> = {};
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = 'Enter a valid email';
    if (!formData.password) nextErrors.password = 'Password is required';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
        el?.focus?.();
        el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }, 0);
      return;
    }

    try {
      await login(formData.email, formData.password);
      setLocation('/employer/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Manage your job posts and applicants in one place."
      roleLabel="Employer Portal"
      formVariant="plain"
      layout="split"
      nav={{
        loginHref: "/employer/login",
        joinHref: "/employer/signup",
        homeHref: "/",
        aboutHref: "/about",
        activePortalId: "employer",
      }}
      footer={
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Link href="/employer/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground">
              Create one
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => {
                const v = e.target.value;
                setFormData((prev) => ({ ...prev, email: v }));
                setFieldErrors((prev) => {
                  if (!prev.email) return prev;
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              aria-invalid={!!fieldErrors.email}
              className="h-11 pl-9"
              placeholder="employer@example.com"
              autoComplete="email"
            />
          </div>
          {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                const v = e.target.value;
                setFormData((prev) => ({ ...prev, password: v }));
                setFieldErrors((prev) => {
                  if (!prev.password) return prev;
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              aria-invalid={!!fieldErrors.password}
              className="h-11 pl-9 pr-10"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password ? <p className="text-xs text-destructive">{fieldErrors.password}</p> : null}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>

        {authSettings.providers.find((p) => p.id === 'google' && p.enabled) ? (
          <Button variant="outline" className="w-full" asChild>
            <a href="/auth/google?role=employer&prompt=select_account&redirect=/oauth-callback">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </a>
          </Button>
        ) : null}
      </form>
    </AuthShell>
  );
}
