import {
  type ReactNode,
  type PropsWithChildren,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import type { RegisterInput } from '../backend';

export type AuthMethod = 'internet-identity' | 'email-password' | null;

export type AuthStatus = 'initializing' | 'idle' | 'authenticating' | 'success' | 'error';

export type AuthContext = {
  /** Whether the user is authenticated (either method) */
  isAuthenticated: boolean;
  
  /** The authentication method used */
  authMethod: AuthMethod;
  
  /** Login with email and password */
  loginWithEmail: (email: string, password: string) => Promise<void>;
  
  /** Register with email and password */
  registerWithEmail: (input: RegisterInput) => Promise<void>;
  
  /** Login with Internet Identity (admin only) */
  loginWithInternetIdentity: () => void;
  
  /** Logout */
  logout: () => Promise<void>;
  
  /** Authentication status */
  authStatus: AuthStatus;
  
  /** Authentication error */
  authError?: Error;
  
  /** Helper states */
  isAuthenticating: boolean;
  isAuthError: boolean;
};

const AuthReactContext = createContext<AuthContext | undefined>(undefined);

function assertProviderPresent(context: AuthContext | undefined): asserts context is AuthContext {
  if (!context) {
    throw new Error('AuthProvider is not present. Wrap your component tree with it.');
  }
}

export const useAuth = (): AuthContext => {
  const context = useContext(AuthReactContext);
  assertProviderPresent(context);
  return context;
};

// Normalize backend error messages into user-friendly errors
function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for common backend error patterns
    if (message.includes('invalid email or password')) {
      return new Error('Invalid email or password. Please try again.');
    }
    if (message.includes('email already registered')) {
      return new Error('This email is already registered. Please login instead.');
    }
    if (message.includes('unauthorized')) {
      return new Error('Authentication failed. Please try again.');
    }
    if (message.includes('actor not available')) {
      return new Error('Service temporarily unavailable. Please wait a moment and try again.');
    }
    
    return error;
  }
  
  return new Error('An unexpected error occurred. Please try again.');
}

export function AuthProvider({ children }: PropsWithChildren<{ children: ReactNode }>) {
  const { identity, login: iiLogin, clear: iiClear, loginStatus: iiStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [authError, setAuthError] = useState<Error | undefined>(undefined);
  const [emailAuthActive, setEmailAuthActive] = useState(false);

  console.log('[AuthProvider] State:', { authStatus, authMethod, emailAuthActive, isIIAuthenticated: !!identity && !identity.getPrincipal().isAnonymous(), actorFetching });

  // Check if user is authenticated via Internet Identity
  const isIIAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Initialize: restore email auth session if exists, then transition to idle
  useEffect(() => {
    if (!actor || actorFetching) {
      console.log('[AuthProvider] Waiting for actor...', { actor: !!actor, actorFetching });
      return;
    }

    console.log('[AuthProvider] Actor ready, restoring session...');

    const restoreSession = async () => {
      const storedAuth = localStorage.getItem('emailAuth');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          
          if (parsed.authenticated && parsed.email && parsed.password) {
            console.log('[AuthProvider] Restoring email auth session for:', parsed.email);
            // Re-authenticate with backend to restore session
            try {
              const success = await actor.login(parsed.email, parsed.password);
              if (success) {
                console.log('[AuthProvider] Session restored successfully');
                setEmailAuthActive(true);
                setAuthMethod('email-password');
                setAuthStatus('success');
                // Invalidate queries to fetch fresh data
                await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
                await queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
              } else {
                console.log('[AuthProvider] Session restore failed');
                localStorage.removeItem('emailAuth');
                setAuthStatus('idle');
              }
            } catch (error) {
              console.error('[AuthProvider] Session restore error:', error);
              localStorage.removeItem('emailAuth');
              setAuthStatus('idle');
            }
          } else {
            console.log('[AuthProvider] No valid session data');
            setAuthStatus('idle');
          }
        } catch (e) {
          console.error('[AuthProvider] Session parse error:', e);
          localStorage.removeItem('emailAuth');
          setAuthStatus('idle');
        }
      } else {
        console.log('[AuthProvider] No stored session');
        setAuthStatus('idle');
      }
    };

    restoreSession();
  }, [actor, actorFetching, queryClient]);

  // Update auth method when II authentication changes
  useEffect(() => {
    if (isIIAuthenticated && authStatus !== 'initializing') {
      console.log('[AuthProvider] II authenticated, updating state');
      setAuthMethod('internet-identity');
      setAuthStatus('success');
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    } else if (!emailAuthActive && !isIIAuthenticated && authStatus !== 'initializing' && authStatus !== 'authenticating') {
      console.log('[AuthProvider] Not authenticated, resetting state');
      setAuthMethod(null);
      if (authStatus !== 'error') {
        setAuthStatus('idle');
      }
    }
  }, [isIIAuthenticated, emailAuthActive, authStatus]);

  // Track Internet Identity login status changes
  useEffect(() => {
    console.log('[AuthProvider] II status changed:', iiStatus);
    if (iiStatus === 'logging-in') {
      setAuthStatus('authenticating');
    } else if (iiStatus === 'success' && isIIAuthenticated) {
      console.log('[AuthProvider] II login success');
      setAuthMethod('internet-identity');
      setAuthStatus('success');
      setAuthError(undefined);
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
    } else if (iiStatus === 'loginError') {
      console.error('[AuthProvider] II login error');
      setAuthStatus('error');
      setAuthError(new Error('Internet Identity login failed. Please try again.'));
      setAuthMethod(null);
    } else if (iiStatus === 'idle' && !isIIAuthenticated && authStatus === 'authenticating') {
      console.log('[AuthProvider] II login cancelled');
      setAuthStatus('idle');
      setAuthMethod(null);
    }
  }, [iiStatus, isIIAuthenticated, authStatus, queryClient]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    console.log('[AuthProvider] loginWithEmail called for:', email);
    const startTime = Date.now();
    
    // Wait for actor to be ready
    if (!actor) {
      console.log('[AuthProvider] Actor not ready, waiting...');
      if (actorFetching) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!actor) {
          console.error('[AuthProvider] Actor still not ready after wait');
          throw new Error('Service temporarily unavailable. Please wait a moment and try again.');
        }
      } else {
        console.error('[AuthProvider] Actor not available');
        throw new Error('Service temporarily unavailable. Please try again.');
      }
    }
    
    console.log('[AuthProvider] Actor ready, proceeding with login');
    setAuthStatus('authenticating');
    setAuthError(undefined);
    
    try {
      const success = await actor.login(email, password);
      console.log('[AuthProvider] Backend login result:', success);
      
      if (success) {
        // Store authentication state
        localStorage.setItem('emailAuth', JSON.stringify({ 
          email, 
          password,
          authenticated: true,
          timestamp: Date.now()
        }));
        
        console.log('[AuthProvider] Setting authenticated state...');
        // Set authenticated state IMMEDIATELY and SYNCHRONOUSLY
        setEmailAuthActive(true);
        setAuthMethod('email-password');
        setAuthStatus('success');
        
        console.log('[AuthProvider] Invalidating queries...');
        // Invalidate queries AFTER state is set
        await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        await queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
        
        const elapsed = Date.now() - startTime;
        console.log(`[AuthProvider] Login completed successfully in ${elapsed}ms`);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('[AuthProvider] Login error:', error);
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
      throw normalizedError;
    }
  }, [actor, actorFetching, queryClient]);

  const registerWithEmail = useCallback(async (input: RegisterInput) => {
    console.log('[AuthProvider] registerWithEmail called for:', input.email);
    
    // Wait for actor to be ready
    if (!actor) {
      if (actorFetching) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!actor) {
          throw new Error('Service temporarily unavailable. Please wait a moment and try again.');
        }
      } else {
        throw new Error('Service temporarily unavailable. Please try again.');
      }
    }
    
    setAuthStatus('authenticating');
    setAuthError(undefined);
    
    try {
      await actor.register(input);
      console.log('[AuthProvider] Registration successful, logging in...');
      // After registration, automatically log in
      await loginWithEmail(input.email, input.password);
    } catch (error) {
      console.error('[AuthProvider] Registration error:', error);
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      throw normalizedError;
    }
  }, [actor, actorFetching, loginWithEmail]);

  const loginWithInternetIdentity = useCallback(() => {
    console.log('[AuthProvider] loginWithInternetIdentity called');
    setAuthStatus('authenticating');
    setAuthError(undefined);
    localStorage.removeItem('emailAuth');
    setEmailAuthActive(false);
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(async () => {
    console.log('[AuthProvider] logout called, method:', authMethod);
    
    if (authMethod === 'internet-identity') {
      await iiClear();
    } else if (authMethod === 'email-password') {
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    }
    
    setAuthMethod(null);
    setAuthStatus('idle');
    setAuthError(undefined);
    
    // Clear all cached queries on logout
    queryClient.clear();
    console.log('[AuthProvider] Logout complete');
  }, [authMethod, iiClear, queryClient]);

  const isAuthenticated = isIIAuthenticated || emailAuthActive;

  console.log('[AuthProvider] Computed isAuthenticated:', isAuthenticated);

  const value = useMemo<AuthContext>(
    () => ({
      isAuthenticated,
      authMethod,
      loginWithEmail,
      registerWithEmail,
      loginWithInternetIdentity,
      logout,
      authStatus,
      authError,
      isAuthenticating: authStatus === 'authenticating',
      isAuthError: authStatus === 'error',
    }),
    [
      isAuthenticated,
      authMethod,
      loginWithEmail,
      registerWithEmail,
      loginWithInternetIdentity,
      logout,
      authStatus,
      authError,
    ]
  );

  return createElement(AuthReactContext.Provider, { value, children });
}
