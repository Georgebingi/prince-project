import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { removeAuthToken, authApi, usersApi, saveRefreshToken } from '../services/api';

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
  isLoading: boolean;
  login: (role: UserRole) => void;
  /** Set user from backend login response (stores token via api; call after authApi.login success). */
  loginFromApi: (apiUser: { id?: string | number; name: string; email?: string; role: string; department?: string; staffId?: string; staff_id?: string }) => void;
  logout: () => void | Promise<void>;
  refreshAuth: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem('court_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('court_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('court_user');
    }
  }, [user]);

  // On app load, attempt to refresh token if user and refresh token exist
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('court_user');
      const refreshToken = localStorage.getItem('refresh_token');

      if (savedUser && refreshToken) {
        try {
          const refreshResponse = await authApi.refresh();
          if (refreshResponse.success && refreshResponse.user) {
            loginFromApi(refreshResponse.user, refreshResponse.refreshToken);
          }
        } catch (error) {
          console.warn('Token refresh failed, clearing session:', error);
          // Clear invalid session data
          removeAuthToken();
          localStorage.removeItem('court_user');
          localStorage.removeItem('court_last_route');
          setUser(null);
        }
      } else if (savedUser) {
        // User exists but no refresh token - keep cached data for offline mode
        console.log('No refresh token available, keeping cached user data');
        // Parse and set the cached user data
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (parseError) {
          console.warn('Failed to parse cached user data:', parseError);
          localStorage.removeItem('court_user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Periodic user info update
  useEffect(() => {
    if (!user?.id) return;

    const updateUserInfo = async () => {
      try {
        const profileResponse = await usersApi.getProfile();
        if (profileResponse.success && profileResponse.data && typeof profileResponse.data === 'object' && profileResponse.data !== null && !Array.isArray(profileResponse.data)) {
          const userData = profileResponse.data as { [key: string]: unknown };
          setUser(prev => {
            if (!prev) return null;
            return { ...prev, ...userData };
          });
        }
      } catch (error) {
        console.warn('Failed to update user info:', error);
      }
    };

    // Update immediately and then every 5 minutes
    updateUserInfo();
    const interval = setInterval(updateUserInfo, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);
  const loginFromApi = (apiUser: { id?: string | number; name: string; email?: string; role: string; department?: string; staffId?: string; staff_id?: string }, refreshToken?: string) => {
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
    if (refreshToken) {
      saveRefreshToken(refreshToken);
    }
    setIsLoading(false);
  };

  const refreshAuth = async () => {
    try {
      const refreshResponse = await authApi.refresh();
      if (refreshResponse.success && refreshResponse.user) {
        loginFromApi(refreshResponse.user, refreshResponse.refreshToken);
        return;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      console.warn('Auth refresh failed:', error);
      // Clear invalid session
      logout();
      throw error;
    }
  };

  const login = (role: UserRole) => {
    // Mock user data (used when backend is not used)
    const userData: Record<UserRole, User> = {
      judge: {
        id: 1,
        name: 'Hon. Justice Ibrahim',
        role: 'judge',
        staffId: 'JDG/2024/001',
        department: 'High Court 1'
      },
      registrar: {
        id: 2,
        name: 'Registrar Bello',
        role: 'registrar',
        staffId: 'REG/2024/015',
        department: 'Court Registry'
      },
      clerk: {
        id: 3,
        name: 'Clerk Amina',
        role: 'clerk',
        staffId: 'CLK/2024/042',
        department: 'Filing Department'
      },
      admin: {
        id: 4,
        name: 'SysAdmin Yusuf',
        role: 'admin',
        staffId: 'ADM/2024/003',
        department: 'IT Systems'
      },
      it_admin: {
        id: 5,
        name: 'IT Director Sani',
        role: 'it_admin',
        staffId: 'IT/2024/001',
        department: 'Technology Infrastructure'
      },
      court_admin: {
        id: 6,
        name: 'Admin Director Okon',
        role: 'court_admin',
        staffId: 'ADM/2024/010',
        department: 'Court Administration'
      },
      lawyer: {
        id: 7,
        name: 'Barrister Musa',
        role: 'lawyer',
        staffId: 'LAW/2024/128',
        department: 'Legal Practice'
      },
      auditor: {
        id: 8,
        name: 'Auditor Sarah',
        role: 'auditor',
        staffId: 'AUD/2024/007',
        department: 'Audit & Compliance'
      },
      partner: {
        id: 9,
        name: 'Police Liaison Officer',
        role: 'partner',
        staffId: 'EXT/2024/099',
        department: 'Nigerian Police Force'
      }
    };
    setUser(userData[role]);

    // Store mock token for development
    const mockToken = `mock_token_${role}_${Date.now()}`;
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('refresh_token', `mock_refresh_${role}_${Date.now()}`);

    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      removeAuthToken();
      setUser(null);
      localStorage.removeItem('court_user');
      localStorage.removeItem('court_last_route');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginFromApi,
        logout,
        refreshAuth,
      }}>

      {children}
    </AuthContext.Provider>);

}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
