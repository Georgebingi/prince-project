<<<<<<< HEAD
import React, { useEffect, useState, createContext, useContext } from 'react';
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastActive: string;
  joinedDate: string;
}
interface StaffContextType {
  staff: StaffMember[];
  addStaff: (
  staff: Omit<StaffMember, 'id' | 'lastActive' | 'joinedDate'>)
  => void;
  updateStaffStatus: (id: string, status: StaffMember['status']) => void;
  deleteStaff: (id: string) => void;
}
const StaffContext = createContext<StaffContextType | undefined>(undefined);
const INITIAL_STAFF: StaffMember[] = [
{
  id: 'JDG/2024/001',
  name: 'Hon. Justice Ibrahim',
  role: 'Judge',
  department: 'High Court 1',
  email: 'ibrahim@court.gov.ng',
  status: 'Active',
  lastActive: 'Just now',
  joinedDate: '2020-01-15'
},
{
  id: 'REG/2024/015',
  name: 'Registrar Bello',
  role: 'Registrar',
  department: 'Court Registry',
  email: 'bello@court.gov.ng',
  status: 'Active',
  lastActive: '5 mins ago',
  joinedDate: '2021-03-10'
},
{
  id: 'CLK/2024/042',
  name: 'Clerk Amina',
  role: 'Clerk',
  department: 'Filing Department',
  email: 'amina@court.gov.ng',
  status: 'Active',
  lastActive: '1 hour ago',
  joinedDate: '2022-06-20'
},
{
  id: 'ADM/2024/003',
  name: 'SysAdmin Yusuf',
  role: 'IT Admin',
  department: 'IT Systems',
  email: 'yusuf@court.gov.ng',
  status: 'Active',
  lastActive: '2 mins ago',
  joinedDate: '2019-11-05'
},
{
  id: 'LAW/2024/128',
  name: 'Barrister Musa',
  role: 'Lawyer',
  department: 'Legal Practice',
  email: 'musa@law.ng',
  status: 'Inactive',
  lastActive: '2 days ago',
  joinedDate: '2023-01-12'
},
{
  id: 'IT/2024/001',
  name: 'IT Director Sani',
  role: 'IT Admin',
  department: 'Technology Infrastructure',
  email: 'sani@court.gov.ng',
  status: 'Active',
  lastActive: '1 day ago',
  joinedDate: '2020-05-15'
},
{
  id: 'ADM/2024/010',
  name: 'Admin Director Okon',
  role: 'Court Admin',
  department: 'Court Administration',
  email: 'okon@court.gov.ng',
  status: 'Active',
  lastActive: '3 hours ago',
  joinedDate: '2018-09-01'
},
{
  id: 'AUD/2024/007',
  name: 'Auditor Sarah',
  role: 'Auditor',
  department: 'Audit & Compliance',
  email: 'sarah@court.gov.ng',
  status: 'Active',
  lastActive: '4 hours ago',
  joinedDate: '2021-11-20'
},
{
  id: 'EXT/2024/099',
  name: 'Police Liaison Officer',
  role: 'Partner',
  department: 'Nigerian Police Force',
  email: 'police@partners.gov.ng',
  status: 'Active',
  lastActive: '10 mins ago',
  joinedDate: '2022-02-14'
}];

export function StaffProvider({ children }: {children: ReactNode;}) {
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('court_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  useEffect(() => {
    localStorage.setItem('court_staff', JSON.stringify(staff));
  }, [staff]);
  const addStaff = (
  newStaff: Omit<StaffMember, 'id' | 'lastActive' | 'joinedDate'>) =>
  {
    const id = `STF/2024/${String(staff.length + 1).padStart(3, '0')}`;
    const staffMember: StaffMember = {
      ...newStaff,
      id,
      lastActive: 'Never',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setStaff([staffMember, ...staff]);
  };
  const updateStaffStatus = (id: string, status: StaffMember['status']) => {
    setStaff(
      staff.map((s) =>
      s.id === id ?
      {
        ...s,
        status
      } :
      s
      )
    );
  };
  const deleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };
=======
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
        fullName: newStaff.fullName,
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

>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  return (
    <StaffContext.Provider
      value={{
        staff,
<<<<<<< HEAD
        addStaff,
        updateStaffStatus,
        deleteStaff
      }}>

      {children}
    </StaffContext.Provider>);

}
=======
        isLoading,
        error,
        refresh,
        addStaff,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}