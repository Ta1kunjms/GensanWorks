/**
 * Jobseeker Login Page
 * Route: /jobseeker/login
 * Accessible to anyone (before authentication)
 */
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function JobseekerLoginPage() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [authSettings, setAuthSettings] = useState<{ providers: { id: string; enabled: boolean }[] }>({ providers: [] });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/auth');
        if (res.ok) setAuthSettings(await res.json());
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      setLocation('/jobseeker/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/peso-gsc-logo.png" alt="PESO GenSan" className="mx-auto h-20 w-20 mb-4" />
            <h1 className="text-3xl font-bold text-slate-900">GensanWorks</h1>
            <p className="text-slate-600 mt-2">Jobseeker Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="jobseeker@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {isLoading ? 'Logging in...' : 'Login as Jobseeker'}
            </button>

            {authSettings.providers.find(p => p.id === 'google' && p.enabled) && (
              <a href="/auth/google?role=jobseeker&prompt=select_account" className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-purple-600 text-slate-900 py-2 rounded-lg transition shadow-sm hover:shadow">
                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" alt="Google" className="w-5 h-5" />
                Continue with Google
              </a>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <p className="text-sm text-slate-600 text-center">
              Don't have an account?{' '}
              <Link href="/jobseeker/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up here
              </Link>
            </p>
            <Link href="/" className="flex items-center justify-center text-sm text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
