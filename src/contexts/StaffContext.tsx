import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { authApi, usersApi, ApiError } from '../services/api';
import { useAuth } from './AuthContext';

export interface StaffMember {
  id: string; // backend user id as string
  name: string;
  role: string;
  department?: string;
  email?: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  lastActive?: string;
  joinedDate?: string;
}

interface StaffContextType {
  staff: StaffMember[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addStaff: (staff: {
    fullName: string;
    email: string;
    phone?: string;
    staffId?: string;
    role: string;
    department?: string;
    password: string;
  }) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  approveStaff: (id: string, staffId?: string) => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const mapUserToStaff = (user: any): StaffMember => ({
  id: String(user.id ?? user.staff_id ?? user.email ?? crypto.randomUUID()),
  name: user.name,
  role: user.role,
  department: user.department,
  email: user.email,
  status: (user.status || 'pending') as StaffMember['status'],
  lastActive: user.updated_at,
  joinedDate: user.created_at,
});

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Only fetch users if user is authenticated
    if (!user) {
      setStaff([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Only admin and registrar roles can access /api/users endpoint
    // Other roles will get 403 Forbidden, which is expected behavior
    const allowedRoles = ['admin', 'registrar'];
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have permission to view all users - this is expected
      // Silently skip the request to avoid 403 errors in console
      setStaff([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers();
      if (res.success && res.data) {
        const mapped = (res.data as any[]).map(mapUserToStaff);
        setStaff(mapped);
      } else {
        throw new Error(res.error?.message || 'Failed to load users');
      }
    } catch (err) {
      // Handle 401 (unauthorized) and 403 (forbidden) gracefully
      // These are expected when user doesn't have permission
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setStaff([]);
        setError(null);
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load users';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

const addStaff = async (newStaff: {
  fullName: string;
  email: string;
  phone?: string;
  staffId?: string;
  role: string;
  department?: string;
  password: string;
}) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await authApi.register({
      name: newStaff.fullName, // ✅ changed from fullName to name
      email: newStaff.email,
      phone: newStaff.phone,
      staffId: newStaff.staffId || newStaff.email,
      role: newStaff.role,
      department: newStaff.department,
      password: newStaff.password,
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Registration failed');
    }

    await refresh();
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to register staff';

    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};

const deleteStaff = async (id: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await usersApi.deleteUser(id);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete user');
    }

    await refresh();
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to delete staff';

    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};

const approveStaff = async (id: string, staffId?: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await usersApi.approveUser(id, staffId);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to approve user');
    }

    await refresh();
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to approve staff';

    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};


  return (
    <StaffContext.Provider
      value={{
        staff,
        isLoading,
        error,
        refresh,
        addStaff,
        deleteStaff,
        approveStaff,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}