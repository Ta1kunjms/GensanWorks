/**
 * Create Account Modal
 * Modal for creating a user account from an applicant
 */
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFieldErrors } from '@/lib/field-errors';
import { Eye, EyeOff } from 'lucide-react';

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
  onAccountCreated?: () => void;
}

export function CreateAccountModal({
  open,
  onOpenChange,
  applicant,
  onAccountCreated,
}: CreateAccountModalProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  type CreateAccountField = 'password' | 'confirmPassword' | 'email';
  const { fieldErrors, clearFieldError, setErrorsAndFocus, setFieldErrors } =
    useFieldErrors<CreateAccountField>();

  useEffect(() => {
    if (!open) return;

    const email = applicant?.email;
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (!email) {
        next.email = 'Applicant must have an email address to create an account';
      } else {
        delete next.email;
      }
      return next;
    });
  }, [open, applicant?.email, setFieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Partial<Record<CreateAccountField, string>> = {};

    if (!applicant?.email) {
      nextErrors.email = 'Applicant must have an email address to create an account';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch(`/api/applicants/${applicant.id}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      toast({
        title: 'Success',
        description: data.message || 'Account created successfully',
      });

      // Reset form
      setPassword('');
      setConfirmPassword('');
      setFieldErrors({});
      
      // Close modal and refresh
      onOpenChange(false);
      onAccountCreated?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setFieldErrors({});
    onOpenChange(false);
  };

  if (!applicant) return null;

  const fullName = `${applicant.firstName} ${applicant.surname}`;
  const role = applicant.employmentType?.toLowerCase().includes('freelancer') 
    ? 'Freelancer' 
    : 'Jobseeker';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create User Account</DialogTitle>
          <DialogDescription>
            Create a login account for this applicant to access the jobseeker portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Applicant Info */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-sm font-medium text-slate-700">Name:</span>
              <p className="text-slate-900">{fullName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Email:</span>
              <p
                className={applicant.email ? 'text-slate-900' : 'text-destructive'}
                aria-invalid={!!fieldErrors.email}
                tabIndex={fieldErrors.email ? -1 : undefined}
              >
                {applicant.email || 'No email'}
              </p>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Role:</span>
              <p className="text-slate-900">{role}</p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                  aria-invalid={!!fieldErrors.password}
                  className="aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Confirm password"
                required
                minLength={6}
                aria-invalid={!!fieldErrors.confirmPassword}
                className="aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
