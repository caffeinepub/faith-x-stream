import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export type AuthUser = {
  name: string;
  email: string;
  isPremium: boolean;
  hasPrioritySupport: boolean;
  loginMethod: 'internet-identity' | 'email';
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithII: () => Promise<void>;
  logout: () => Promise<void>;
  setUserProfile: (profile: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'faith_xstream_session';

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login: iiLogin, clear: iiClear, identity, isInitializing: iiInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Restore session synchronously from localStorage
  const [user, setUser] = useState<AuthUser | null>(() => loadSession());
  const [isInitializing, setIsInitializing] = useState(true);

  // Once II finishes initializing, reconcile II identity with our session
  useEffect(() => {
    if (iiInitializing) return;

    if (identity) {
      // II is authenticated — ensure we have a session marked as II login
      const existing = loadSession();
      if (!existing || existing.loginMethod !== 'internet-identity') {
        // We have an II identity but no matching session — create a placeholder
        // The actual profile will be loaded by useGetCallerUserProfile
        const iiUser: AuthUser = {
          name: existing?.name || 'User',
          email: existing?.email || '',
          isPremium: existing?.isPremium || false,
          hasPrioritySupport: existing?.hasPrioritySupport || false,
          loginMethod: 'internet-identity',
        };
        setUser(iiUser);
        saveSession(iiUser);
      }
    } else {
      // No II identity — check if we have an email session
      const existing = loadSession();
      if (existing && existing.loginMethod === 'internet-identity') {
        // Had an II session but identity is gone — clear it
        clearSession();
        setUser(null);
      }
      // Email sessions remain as-is
    }

    setIsInitializing(false);
  }, [iiInitializing, identity]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    // The actual backend login call is done in LoginPage via actor
    // Here we just set the session state
    const emailUser: AuthUser = {
      name: email.split('@')[0],
      email,
      isPremium: false,
      hasPrioritySupport: false,
      loginMethod: 'email',
    };
    setUser(emailUser);
    saveSession(emailUser);
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const loginWithII = useCallback(async () => {
    await iiLogin();
    await queryClient.invalidateQueries();
  }, [iiLogin, queryClient]);

  const logout = useCallback(async () => {
    if (identity) {
      await iiClear();
    }
    clearSession();
    setUser(null);
    queryClient.clear();
  }, [identity, iiClear, queryClient]);

  const setUserProfile = useCallback((profile: AuthUser) => {
    setUser(profile);
    saveSession(profile);
  }, []);

  const isAuthenticated = !!user || !!identity;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isInitializing,
      user,
      loginWithEmail,
      loginWithII,
      logout,
      setUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
