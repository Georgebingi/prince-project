import { ReactNode } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Card } from './ui/Card';
import { AlertCircle, Lock } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  requireAuth = true
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback || (
      <Card className="p-8 text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-slate-600">
          Please log in to access this content.
        </p>
      </Card>
    );
  }

  // Check role authorization
  if (user && !allowedRoles.includes(user.role)) {
    return fallback || (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Access Denied
        </h3>
        <p className="text-slate-600 mb-4">
          You don't have permission to access this content.
        </p>
        <div className="text-sm text-slate-500">
          Required roles: {allowedRoles.join(', ')}
          <br />
          Your role: {user.role}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}


