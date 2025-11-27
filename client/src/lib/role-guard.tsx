import React from 'react';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string | string[];
  fallbackTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRoles, 
  fallbackTo = '/' 
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
  }

  if (!user) {
    setLocation(fallbackTo);
    return null;
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (!roles.includes(user.role)) {
    setLocation(fallbackTo);
    return null;
  }

  return <>{children}</>;
};

/**
 * Admin Guard - Only admin users can access
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredRoles="admin" fallbackTo="/admin/login">
    {children}
  </RoleGuard>
);

/**
 * Employer Guard - Only employer users can access
 */
export const EmployerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredRoles="employer" fallbackTo="/employer/login">
    {children}
  </RoleGuard>
);

/**
 * Jobseeker Guard - Jobseeker or freelancer users can access
 */
export const JobseekerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredRoles={['jobseeker', 'freelancer']} fallbackTo="/jobseeker/login">
    {children}
  </RoleGuard>
);
