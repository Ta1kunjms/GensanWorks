import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employer' | 'jobseeker' | 'freelancer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    navigate("/");
    return null;
  }

  return <>{children}</>;
}
