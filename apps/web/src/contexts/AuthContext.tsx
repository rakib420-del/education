'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  mobileNumber?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'elearn_at';
const USER_KEY = 'elearn_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from cookies on mount
  useEffect(() => {
    const token = Cookies.get(TOKEN_KEY);
    const userStr = Cookies.get(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, accessToken: token, isLoading: false, isAuthenticated: true });
        // Set default auth header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback((accessToken: string, user: User) => {
    // Session token has no built-in expiry on client — server enforces single-device
    Cookies.set(TOKEN_KEY, accessToken, { expires: 30, sameSite: 'strict' });
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 30, sameSite: 'strict' });
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setState({ user, accessToken, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch { /* ignore */ }

    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/users/me');
      setState((s) => ({ ...s, user: data }));
      Cookies.set(USER_KEY, JSON.stringify(data), { expires: 30, sameSite: 'strict' });
    } catch { /* token expired — silent */ }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
