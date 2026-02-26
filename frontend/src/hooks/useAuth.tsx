import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, UserRole__1 } from '../backend';

interface AuthUser {
  name: string;
  email: string;
  isPremium: boolean;
  principal?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  role: UserRole__1 | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithII: () => Promise<void>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'faith_xstream_auth';

function loadStoredAuth(): { user: AuthUser | null; role: UserRole__1 | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user || null, role: parsed.role || null };
    }
  } catch {
    // ignore
  }
  return { user: null, role: null };
}

function saveStoredAuth(user: AuthUser | null, role: UserRole__1 | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, role }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identity, login: iiLogin, clear: iiClear, isInitializing: iiInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const stored = loadStoredAuth();
  const [user, setUser] = useState<AuthUser | null>(stored.user);
  const [role, setRole] = useState<UserRole__1 | null>(stored.role);
  const [isInitializing, setIsInitializing] = useState(true);
  const initializedRef = useRef(false);
  const roleInitializedRef = useRef(false);

  // Once II and actor are ready, reconcile state
  useEffect(() => {
    if (iiInitializing || actorFetching) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!identity) {
      // No II identity - keep email-based auth if present, but clear role if no user
      if (!user) {
        setRole(null);
        saveStoredAuth(null, null);
      }
      setIsInitializing(false);
      return;
    }

    // II identity present - set up user from identity
    const principal = identity.getPrincipal().toString();
    const iiUser: AuthUser = {
      name: user?.name || 'User',
      email: user?.email || '',
      isPremium: user?.isPremium || false,
      principal,
    };

    setUser(iiUser);
    setIsInitializing(false);
  }, [iiInitializing, actorFetching, identity]);

  // Fetch and set role whenever actor + identity are available
  useEffect(() => {
    if (!actor || actorFetching || !identity) return;
    if (roleInitializedRef.current) return;
    roleInitializedRef.current = true;

    const initRole = async () => {
      try {
        // Initialize access control (makes first caller master admin)
        await actor.initializeAccessControl();
        const fetchedRole = await actor.getCallerFullUserRole();
        setRole(fetchedRole);

        const principal = identity.getPrincipal().toString();
        const currentUser: AuthUser = {
          name: user?.name || 'User',
          email: user?.email || '',
          isPremium: user?.isPremium || false,
          principal,
        };
        setUser(currentUser);
        saveStoredAuth(currentUser, fetchedRole);
        setIsInitializing(false);
      } catch (err) {
        console.error('Failed to initialize role:', err);
        setIsInitializing(false);
      }
    };

    initRole();
  }, [actor, actorFetching, identity]);

  // When identity disappears (logout), clear II-based auth
  useEffect(() => {
    if (iiInitializing) return;
    if (!identity && initializedRef.current) {
      // Only clear if the user was II-based (has principal)
      if (user?.principal) {
        setUser(null);
        setRole(null);
        saveStoredAuth(null, null);
      }
      roleInitializedRef.current = false;
    }
  }, [identity, iiInitializing]);

  const refreshRole = useCallback(async () => {
    if (!actor || !identity) return;
    try {
      const fetchedRole = await actor.getCallerFullUserRole();
      setRole(fetchedRole);
      const currentUser = user;
      if (currentUser) {
        saveStoredAuth(currentUser, fetchedRole);
      }
    } catch (err) {
      console.error('Failed to refresh role:', err);
    }
  }, [actor, identity, user]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!actor) throw new Error('Actor not available');
    await actor.login(email, password);
    // Initialize access control for this principal
    try {
      await actor.initializeAccessControl();
    } catch {
      // may already be initialized
    }
    const fetchedRole = await actor.getCallerFullUserRole();
    const profile = await actor.getCallerUserProfile();
    const authUser: AuthUser = {
      name: profile?.name || email,
      email: profile?.email || email,
      isPremium: profile?.isPremium || false,
    };
    setUser(authUser);
    setRole(fetchedRole);
    saveStoredAuth(authUser, fetchedRole);
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
  }, [actor, queryClient]);

  const loginWithII = useCallback(async () => {
    try {
      await iiLogin();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await iiClear();
        setTimeout(() => iiLogin(), 300);
        return;
      }
      throw error;
    }
  }, [iiLogin, iiClear]);

  const logout = useCallback(async () => {
    if (identity) {
      await iiClear();
    }
    setUser(null);
    setRole(null);
    roleInitializedRef.current = false;
    initializedRef.current = false;
    saveStoredAuth(null, null);
    queryClient.clear();
  }, [identity, iiClear, queryClient]);

  const isAuthenticated = !!user || !!identity;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isInitializing: isInitializing || iiInitializing,
      role,
      loginWithEmail,
      loginWithII,
      logout,
      refreshRole,
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
