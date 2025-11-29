import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { formatApiError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSettings, setAuthSettings] = useState<{ providers: { id: string; enabled: boolean }[] }>({ providers: [] });
  const { toast } = useToast();
  const { setAuth } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/auth');
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
      if (!email) return toast({ title: 'Validation', description: 'Email is required', variant: 'destructive' });
      if (!password) return toast({ title: 'Validation', description: 'Password is required', variant: 'destructive' });
      
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
      toast({ title: 'Error', description: String((err as any)?.message || err || 'Login failed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            GensanWorks
          </h1>
          <p className="text-slate-600 text-sm">Admin Portal</p>
          <p className="text-slate-500 text-xs mt-1">Official Job Assistance Platform of PESO – General Santos City</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Admin Login</h2>
          <p className="text-slate-600 text-sm mb-6">Sign in to your admin account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="admin@gensanworks.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-12 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 hover:text-slate-700 cursor-pointer transition">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-slate-50 accent-blue-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <Link href="#" className="text-blue-600 hover:text-blue-700 transition">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or</span>
            </div>
          </div>

          {/* OAuth Providers */}
          {authSettings.providers.find(p => p.id === 'google' && p.enabled) && (
            <a
              href="/auth/google"
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-blue-500 text-slate-900 py-3 rounded-lg transition shadow-sm hover:shadow"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </a>
          )}

          {/* Sign Up Link */}
          <div className="text-center text-sm">
            <p className="text-slate-600">
              Don't have an admin account?{' '}
              <Link href="/admin/signup">
                <span className="text-blue-600 hover:text-blue-700 font-semibold transition">
                  Request Access
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700">
          <p className="text-center">
            <span className="font-semibold text-blue-700">Demo Credentials:</span><br />
            Email: admin@local.test | Password: adminpass
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 GensanWorks. All rights reserved. | PESO General Santos City
        </p>
      </div>
    </div>
  );
}
