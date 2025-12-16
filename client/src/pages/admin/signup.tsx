import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatApiError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, CheckCircle2, Mail, Phone, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthShell } from '@/components/auth/auth-shell';

export default function AdminSignup(){
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!requestSubmitted) return;
    const t = setTimeout(() => navigate('/admin/login'), 3000);
    return () => clearTimeout(t);
  }, [requestSubmitted, navigate]);

  const handleRequestAccess = async (e:React.FormEvent) => {
    e.preventDefault();
    try{
      setError('');
      const nextErrors: Record<string, string> = {};
      if (!name.trim()) nextErrors.name = 'Full name is required';
      if (!email.trim()) nextErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter a valid email';
      if (!phone.trim()) nextErrors.phone = 'Phone number is required';
      if (!organization.trim()) nextErrors.organization = 'Organization is required';

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
      
      const res = await fetch('/api/admin/access-requests', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name, email, phone, organization }) 
      });
      
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Invalid server response' }; }
      
      if (!res.ok) throw new Error(formatApiError(data));
      
      setRequestSubmitted(true);
      toast({ title: 'Request Submitted', description: 'Your admin access request has been sent to administrators.' });
    }catch(err){
      console.error('Admin access request error:', err);
      setError(String((err as any)?.message || err || 'Request failed'));
      toast({ title: 'Error', description: String((err as any)?.message || err || 'Request failed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (requestSubmitted) {
    return (
      <AuthShell
        title="Request submitted"
        subtitle="We&apos;ll review your request and email you updates."
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
            <p className="text-sm font-medium">What happens next</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Admins review your request</li>
              <li>You receive updates via email</li>
              <li>Approved users can sign in</li>
            </ul>
          </div>
        }
        footer={
          <p className="text-xs text-muted-foreground text-center">Redirecting to login in ~3 seconds…</p>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <CheckCircle2 className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium">Request received</p>
              <p className="text-muted-foreground">We&apos;ll contact you at {email}.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/50 p-4 text-sm">
            <p><span className="font-medium">Name:</span> {name}</p>
            <p><span className="font-medium">Organization:</span> {organization}</p>
            <p><span className="font-medium">Phone:</span> {phone}</p>
          </div>

          <Button className="w-full" asChild>
            <Link href="/admin/login">Back to login</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Request access"
      subtitle="Submit details for admin approval."
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
          <p className="text-sm font-medium">Admin access</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Requires approval from administrators</li>
            <li>Use an official email if available</li>
            <li>Provide a reachable contact number</li>
          </ul>
        </div>
      }
      footer={
        <p className="text-sm text-muted-foreground text-center">
          Already have an admin account?{' '}
          <Link href="/admin/login" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRequestAccess} className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  setFieldErrors((prev) => {
                    if (!prev.name) return prev;
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }}
                placeholder="Juan Dela Cruz"
                aria-invalid={!!fieldErrors.name}
                className="h-11 pl-9"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
          </div>

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
                placeholder="admin@example.com"
                aria-invalid={!!fieldErrors.email}
                className="h-11 pl-9"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email ? <p className="text-xs text-destructive">{fieldErrors.email}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value;
                  setPhone(v);
                  setFieldErrors((prev) => {
                    if (!prev.phone) return prev;
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }}
                placeholder="+63 912 345 6789"
                aria-invalid={!!fieldErrors.phone}
                className="h-11 pl-9"
                autoComplete="tel"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.phone ? <p className="text-xs text-destructive">{fieldErrors.phone}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Organization / department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={organization}
                onChange={(e) => {
                  const v = e.target.value;
                  setOrganization(v);
                  setFieldErrors((prev) => {
                    if (!prev.organization) return prev;
                    const next = { ...prev };
                    delete next.organization;
                    return next;
                  });
                }}
                placeholder="PESO - General Santos City"
                aria-invalid={!!fieldErrors.organization}
                className="h-11 pl-9"
                autoComplete="organization"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.organization ? <p className="text-xs text-destructive">{fieldErrors.organization}</p> : null}
          </div>
        </div>

        <Alert>
          <AlertTitle>How admin access works</AlertTitle>
          <AlertDescription>
            Submit your details and administrators will review your request. You&apos;ll receive updates via email.
          </AlertDescription>
        </Alert>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Submitting request…' : 'Request admin access'}
        </Button>
      </form>
    </AuthShell>
  );
}
