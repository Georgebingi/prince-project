/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { authApi, ApiError } from '../services/api';

export type UserRole = 'judge' | 'registrar' | 'clerk' | 'admin' | 'it_admin' | 'court_admin' | 'lawyer' | 'auditor' | 'partner';

interface User {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
  staffId: string;
  department?: string;
}

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
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem('court_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('court_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('court_user');
    }
  }, [user]);

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
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}