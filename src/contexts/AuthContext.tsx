import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { removeAuthToken, authApi } from '../services/api';

export type UserRole =
  'judge' |
  'registrar' |
  'clerk' |
  'admin' |
  'it_admin' |
  'court_admin' |
  'lawyer' |
  'auditor' |
  'partner';

interface User {
  id?: string | number;
  name: string;
  role: UserRole;
  staffId: string;
  department?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, username: string) => void;
  /** Set user from backend login response (stores token via api; call after authApi.login success). */
  loginFromApi: (apiUser: { id?: string | number; name: string; email?: string; role: string; department?: string; staffId?: string; staff_id?: string }) => void;
  logout: () => void | Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem('court_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('court_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('court_user');
    }
  }, [user]);
  const loginFromApi = (apiUser: { id?: string | number; name: string; email?: string; role: string; department?: string; staffId?: string; staff_id?: string }) => {
    const role = apiUser.role as UserRole;
    const staffId = apiUser.staffId ?? apiUser.staff_id ?? '';
    setUser({
      id: apiUser.id,
      name: apiUser.name,
      role,
      staffId,
      department: apiUser.department,
      email: apiUser.email,
    });
  };

  const login = (role: UserRole, _username: string) => {
    // Mock user data (used when backend is not used)
    const userData: Record<UserRole, User> = {
      judge: {
        name: 'Hon. Justice Ibrahim',
        role: 'judge',
        staffId: 'JDG/2024/001',
        department: 'High Court 1'
      },
      registrar: {
        name: 'Registrar Bello',
        role: 'registrar',
        staffId: 'REG/2024/015',
        department: 'Court Registry'
      },
      clerk: {
        name: 'Clerk Amina',
        role: 'clerk',
        staffId: 'CLK/2024/042',
        department: 'Filing Department'
      },
      admin: {
        name: 'SysAdmin Yusuf',
        role: 'admin',
        staffId: 'ADM/2024/003',
        department: 'IT Systems'
      },
      it_admin: {
        name: 'IT Director Sani',
        role: 'it_admin',
        staffId: 'IT/2024/001',
        department: 'Technology Infrastructure'
      },
      court_admin: {
        name: 'Admin Director Okon',
        role: 'court_admin',
        staffId: 'ADM/2024/010',
        department: 'Court Administration'
      },
      lawyer: {
        name: 'Barrister Musa',
        role: 'lawyer',
        staffId: 'LAW/2024/128',
        department: 'Legal Practice'
      },
      auditor: {
        name: 'Auditor Sarah',
        role: 'auditor',
        staffId: 'AUD/2024/007',
        department: 'Audit & Compliance'
      },
      partner: {
        name: 'Police Liaison Officer',
        role: 'partner',
        staffId: 'EXT/2024/099',
        department: 'Nigerian Police Force'
      }
    };
    setUser(userData[role]);
  };
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore; clear local state anyway
    }
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginFromApi,
        logout,
      }}>

      {children}
    </AuthContext.Provider>);

}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}