import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { formatApiError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSignup(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const { toast } = useToast();
  const { setAuth } = useAuth();
  const [, navigate] = useLocation();

  const handleSignup = async (e:React.FormEvent) => {
    e.preventDefault();
    try{
      if (!name) return toast({ title: 'Validation', description: 'Full name is required', variant: 'destructive' });
      if (!email) return toast({ title: 'Validation', description: 'Email is required', variant: 'destructive' });
      if (!phone) return toast({ title: 'Validation', description: 'Phone number is required', variant: 'destructive' });
      if (!organization) return toast({ title: 'Validation', description: 'Organization is required', variant: 'destructive' });
      if (!password || password.length < 6) return toast({ title: 'Validation', description: 'Password (min 6 chars) is required', variant: 'destructive' });
      if (password !== confirmPassword) return toast({ title: 'Validation', description: 'Passwords do not match', variant: 'destructive' });
      
      setIsLoading(true);
      
      const res = await fetch('/api/admin/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name, email, password, phone, organization }) 
      });
      
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Invalid server response' }; }
      
      if (!res.ok) throw new Error(formatApiError(data));
      if (!data || !data.token || !data.user) throw new Error(formatApiError(data));
      
      setAuth(data.token, data.user);
      toast({ title: 'Success', description: `Welcome ${data.user?.name ?? 'Admin'}! 🎉` });
      navigate('/admin/dashboard');
    }catch(err){
      console.error('Admin signup error:', err);
      toast({ title: 'Error', description: String((err as any)?.message || err || 'Signup failed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async (e:React.FormEvent) => {
    e.preventDefault();
    try{
      if (!name) return toast({ title: 'Validation', description: 'Full name is required', variant: 'destructive' });
      if (!email) return toast({ title: 'Validation', description: 'Email is required', variant: 'destructive' });
      if (!phone) return toast({ title: 'Validation', description: 'Phone number is required', variant: 'destructive' });
      if (!organization) return toast({ title: 'Validation', description: 'Organization is required', variant: 'destructive' });
      
      setIsLoading(true);
      
      const res = await fetch('/api/admin/request-access', { 
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
      
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    }catch(err){
      console.error('Admin access request error:', err);
      toast({ title: 'Error', description: String((err as any)?.message || err || 'Request failed'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
            <p className="text-slate-600 mb-2">Your admin access request has been received.</p>
            <p className="text-slate-500 text-sm mb-6">Our administrators will review your request and contact you at <span className="text-blue-600 font-medium">{email}</span> within 24-48 hours.</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-slate-700 text-sm"><span className="font-semibold">Name:</span> {name}</p>
              <p className="text-slate-700 text-sm"><span className="font-semibold">Organization:</span> {organization}</p>
              <p className="text-slate-700 text-sm"><span className="font-semibold">Email:</span> {email}</p>
            </div>

            <Link href="/admin/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold">
                Back to Login
              </Button>
            </Link>

            <p className="text-slate-500 text-xs mt-4">Redirecting to login in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link href="/admin/login">
            <div className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-700 mb-4 cursor-pointer transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Login</span>
            </div>
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            GensanWorks
          </h1>
          <p className="text-slate-600 text-sm">Admin Access Request</p>
          <p className="text-slate-500 text-xs mt-1">Join the GensanWorks Admin Team</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Request Admin Access</h2>

          <form onSubmit={handleRequestAccess} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <Input 
                type="text" 
                value={name} 
                onChange={e=>setName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <Input 
                type="tel" 
                value={phone} 
                onChange={e=>setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                className="bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            {/* Organization Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Organization / Department</label>
              <Input 
                type="text" 
                value={organization} 
                onChange={e=>setOrganization(e.target.value)}
                placeholder="PESO - General Santos City"
                className="bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">How Admin Access Works</p>
                  <p className="text-xs opacity-90">Submit your details and our administrators will review your request. You'll receive an approval email within 24-48 hours with your login credentials.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 h-11 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Submitting Request...' : 'Request Admin Access'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Already have an admin account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link href="/admin/login">
            <Button 
              type="button"
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Official Job Assistance Platform of PESO – General Santos City
        </p>
      </div>
    </div>
  );
}
