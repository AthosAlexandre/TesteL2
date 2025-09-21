import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEBUG = import.meta.env.DEV;

type AuthState = {
  email: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, apiKey?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_KEY = 'l2_auth_state';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        setEmail(parsed.email ?? null);
        setApiKey(parsed.apiKey ?? null);
        if (DEBUG) {
          console.log('[Auth] restored from localStorage:', parsed);
        }
      }
    } catch (e) {
      if (DEBUG) console.log('[Auth] restore error:', e);
    }
  }, []);

  const persist = (next: AuthState) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    if (DEBUG) console.log('[Auth] persist:', next);
  };

  const login = (emailArg: string, apiKeyArg?: string | null) => {
    const fromEnv = (import.meta as any)?.env?.VITE_API_KEY ?? null;
    const key = (apiKeyArg ?? fromEnv ?? null) as string | null;

    if (DEBUG) {
      console.log('[Auth] .env VITE_API_KEY:', fromEnv);
      console.log('[Auth] login email:', emailArg);
      console.log('[Auth] login apiKeyArg:', apiKeyArg);
      console.log('[Auth] login key to use:', key);
    }

    setEmail(emailArg);
    setApiKey(key);
    persist({ email: emailArg, apiKey: key, isAuthenticated: true });
  };

  const logout = () => {
    if (DEBUG) console.log('[Auth] logout');
    setEmail(null);
    setApiKey(null);
    persist({ email: null, apiKey: null, isAuthenticated: false });
  };

  const value = useMemo<AuthContextValue>(() => ({
    email,
    apiKey,
    isAuthenticated: !!email,
    login,
    logout,
  }), [email, apiKey]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
