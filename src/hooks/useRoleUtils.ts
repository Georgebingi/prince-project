import { useAuth, UserRole } from '../contexts/AuthContext';

// Utility functions for role checking
export const useRoleCheck = (allowedRoles: UserRole[]): boolean => {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
};

// Utility functions for permission checking
export const useHasPermission = (permission: string): boolean => {
  const { user } = useAuth();

  if (!user) return false;

  // Define permissions based on roles
  const rolePermissions: Record<UserRole, string[]> = {
    judge: ['view_cases', 'manage_cases', 'view_lawyers', 'write_judgments', 'review_motions', 'sign_orders'],
    registrar: ['view_cases', 'manage_cases', 'view_users', 'approve_users', 'manage_documents'],
    clerk: ['view_cases', 'manage_documents', 'file_cases'],
    admin: ['view_all', 'manage_users', 'manage_system', 'view_reports'],
    it_admin: ['manage_system', 'view_logs', 'manage_infrastructure'],
    court_admin: ['view_cases', 'manage_court', 'view_reports', 'manage_staff'],
    lawyer: ['view_assigned_cases', 'file_motions', 'view_documents'],
    auditor: ['view_logs', 'view_reports', 'audit_system'],
    partner: ['view_shared_cases', 'submit_reports']
  };

  return rolePermissions[user.role]?.includes(permission) || false;
};
