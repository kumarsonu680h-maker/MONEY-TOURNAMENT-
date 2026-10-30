import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    mobile: string;
    name: string;
    ign: string;
    ffUid: string;
    password: string;
    referralCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  unreadNotifsCount: number;
  setUnreadNotifsCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadNotifs: () => Promise<void>;

  // Admin authentication
  adminUser: User | null;
  adminToken: string | null;
  isAdmin: boolean;
  adminLogin: (mobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Admin state
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('mt_admin_token');
  });

  const fetchUnreadNotifs = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/notifications', {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        const data = await res.json();
        const unread = (data.notifications || []).filter((n: any) => !n.isRead).length;
        setUnreadNotifsCount(unread);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('mt_user_id', data.user.id);
        }
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  // Initial user & admin load
  useEffect(() => {
    const savedUserId = localStorage.getItem('mt_user_id') || 'user-1';
    fetch(`/api/auth/me`, {
      headers: { 'x-user-id': savedUserId },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Initial user fetch error:', err))
      .finally(() => setLoading(false));

    // Check admin session if token exists
    const savedAdminToken = localStorage.getItem('mt_admin_token');
    if (savedAdminToken) {
      fetch('/api/admin/me', {
        headers: { 'x-admin-token': savedAdminToken },
      })
        .then(res => res.json())
        .then(data => {
          if (data.admin) {
            setAdminUser(data.admin);
          } else {
            localStorage.removeItem('mt_admin_token');
            setAdminToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('mt_admin_token');
          setAdminToken(null);
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadNotifs();
    }
  }, [user?.id]);

  const login = async (mobile: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      localStorage.setItem('mt_user_id', data.user.id);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const register = async (formData: {
    mobile: string;
    name: string;
    ign: string;
    ffUid: string;
    password: string;
    referralCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      localStorage.setItem('mt_user_id', data.user.id);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mt_user_id');
  };

  const adminLogin = async (mobile: string, pass: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin login failed' };
      }
      setAdminUser(data.admin);
      setAdminToken(data.token);
      localStorage.setItem('mt_admin_token', data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('mt_admin_token');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return false;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        setUser(resData.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating profile', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        unreadNotifsCount,
        setUnreadNotifsCount,
        fetchUnreadNotifs,
        adminUser,
        adminToken,
        isAdmin: !!adminUser,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
