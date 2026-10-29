'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SilatUser {
  accountId: string;
  kontingenId: string;
  email: string;
  namaKontingen: string;
  asalSekolah?: string;
  kota?: string;
  picName?: string;
  picPhone?: string;
  status?: string;
}

const STORAGE_KEY = 'silat_user_session';
const AUTH_EVENT_NAME = 'silat-auth-changed';

export function useSilatAuth() {
  const [user, setUser] = useState<SilatUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Load awal dari cache localStorage untuk instant rendering
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Failed to parse cached silat user session:', e);
    }
  }, []);

  // Cek keabsahan sesi aktual ke server (/api/silat/auth/me)
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/silat/auth/me', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
    } catch (err) {
      console.error('Error refreshing silat auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleAuthChange = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        } else {
          setUser(null);
        }
      } catch {}
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    return () => window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
  }, [refresh]);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/silat/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login gagal.' };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Koneksi ke server terputus.' };
    }
  };

  const register = async (payload: {
    nama_kontingen: string;
    email: string;
    password: string;
    asal_sekolah?: string;
    kota?: string;
    pic_phone?: string;
  }) => {
    try {
      const res = await fetch('/api/silat/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Pendaftaran gagal.' };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Koneksi ke server terputus.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/silat/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    logout,
    refresh,
  };
}

