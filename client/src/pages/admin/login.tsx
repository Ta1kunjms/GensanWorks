import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { formatApiError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthShell } from '@/components/auth/auth-shell';

export default function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSettings, setAuthSettings] = useState<{ providers: { id: string; enabled: boolean }[] }>({ providers: [] });
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { setAuth } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/auth/public');
        if (res.ok) {
          const data = await res.json();
          setAuthSettings(data);
        }
      } catch {}
    })();
  }, []);

  const handleLogin = async (e:React.FormEvent) => {
    e.preventDefault();
    try{
      setError('');
      const nextErrors: Record<string, string> = {};
      if (!email.trim()) nextErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter a valid email';
      if (!password) nextErrors.password = 'Password is required';
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
          el?.focus?.();
          el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        }, 0);
        return;
      }
      
      setIsLoading(true);
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      });
      
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Invalid server response' }; }
      
      if (!res.ok) throw new Error(formatApiError(data));
      if (!data || !data.token || !data.user) throw new Error(formatApiError(data));
      
      setAuth(data.token, data.user);
      toast({ title: 'Success', description: `Welcome back, ${data.user?.name ?? 'Admin'}! 🎉` });
      navigate('/admin/dashboard');
    }catch(err){
      console.error('Admin login error:', err);
      setError(String((err as any)?.message || err || 'Login failed'));
      toast({ title: 'Error', description: String((err as any)?.message || err || 'Login failed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Admin portal access"
      roleLabel="Admin Portal"
      formVariant="card"
      layout="split"
      nav={{
        loginHref: "/admin/login",
        joinHref: "/admin/signup",
        homeHref: "/",
        aboutHref: "/about",
        activePortalId: "admin",
      }}
      sideContent={
        <div className="space-y-3">
          <p className="text-sm font-medium">Admin tools</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Manage postings and employers</li>
            <li>Review access requests and activity</li>
            <li>Monitor platform notifications</li>
          </ul>
        </div>
      }
      footer={
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an admin account?{' '}
            <Link href="/admin/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground">
              Request access
            </Link>
          </p>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">Demo credentials:</span> admin@local.test / adminpass
          </div>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
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
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                setFieldErrors((prev) => {
                  if (!prev.email) return prev;
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              aria-invalid={!!fieldErrors.email}
              className="h-11 pl-9"
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={isLoading}
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
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
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
              disabled={isLoading}
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
            <a href="/auth/google?role=admin&prompt=select_account&redirect=/oauth-callback">
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
