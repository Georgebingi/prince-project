<<<<<<< HEAD
import React, { useEffect, useState, createContext, useContext } from 'react';
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
  name: string;
=======
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { authApi, ApiError } from '../services/api';

export type UserRole = 'judge' | 'registrar' | 'clerk' | 'admin' | 'it_admin' | 'court_admin' | 'lawyer' | 'auditor' | 'partner';

interface User {
  id?: string;
  name: string;
  email?: string;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  role: UserRole;
  staffId: string;
  department?: string;
}
<<<<<<< HEAD
interface AuthContextType {
  user: User | null;
  login: (role: UserRole, username: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: ReactNode;}) {
=======

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem('court_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
<<<<<<< HEAD
=======
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('court_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('court_user');
    }
  }, [user]);
<<<<<<< HEAD
  const login = (role: UserRole, username: string) => {
    // Mock user data based on role
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
  const logout = () => {
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}>

      {children}
    </AuthContext.Provider>);

=======

  const login = async (username: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(username, password, role);
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email ?? "",
          role: response.user.role as UserRole,
          staffId: response.user.staffId || response.user.staff_id || "",
          department: response.user.department,
        };
        setUser(userData);
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };
  return <AuthContext.Provider value={{
    user,
    login,
    logout,
    isLoading,
    error
  }}>
      {children}
    </AuthContext.Provider>;
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}