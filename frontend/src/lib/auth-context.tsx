'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, clearToken, getToken, setToken } from './api';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .get<AuthUser>('/auth/me')
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    setToken(result.token);
    setUser(result.user);
  }

  async function register(email: string, password: string) {
    const result = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      email,
      password,
    });
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}
