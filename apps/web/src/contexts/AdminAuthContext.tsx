'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { apiClient } from '@/lib/api-client';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'MODERATOR';
}

interface AdminAuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  adminLogin: (token: string, admin: AdminUser) => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const ADMIN_TOKEN_KEY = 'elearn_admin_at';
const ADMIN_USER_KEY  = 'elearn_admin_user';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    admin: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const userStr = localStorage.getItem(ADMIN_USER_KEY);

    if (token && userStr) {
      try {
        const admin = JSON.parse(userStr);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setState({ admin, accessToken: token, isLoading: false, isAuthenticated: true });
      } catch {
        setState({ admin: null, accessToken: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const adminLogin = useCallback((token: string, admin: AdminUser) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ admin, accessToken: token, isLoading: false, isAuthenticated: true });
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
    setState({ admin: null, accessToken: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/admin/login';
  }, []);

  return (
    <AdminAuthContext.Provider value={{ ...state, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
