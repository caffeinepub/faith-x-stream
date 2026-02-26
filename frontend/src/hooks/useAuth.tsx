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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated via Internet Identity
  const isIIAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Initialize: restore email auth session if exists, then transition to idle
  useEffect(() => {
    if (!actor || actorFetching) {
      return;
    }

    const restoreSession = async () => {
      const storedAuth = localStorage.getItem('emailAuth');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          
          if (parsed.authenticated && parsed.email && parsed.password) {
            // Re-authenticate with backend to restore session
            try {
              const success = await actor.login(parsed.email, parsed.password);
              if (success) {
                setEmailAuthActive(true);
                setAuthMethod('email-password');
                setIsAuthenticated(true);
                setAuthStatus('success');
                // Invalidate queries to fetch fresh data
                await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
                await queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
              } else {
                localStorage.removeItem('emailAuth');
                setAuthStatus('idle');
              }
            } catch (error) {
              localStorage.removeItem('emailAuth');
              setAuthStatus('idle');
            }
          } else {
            setAuthStatus('idle');
          }
        } catch (e) {
          localStorage.removeItem('emailAuth');
          setAuthStatus('idle');
        }
      } else {
        setAuthStatus('idle');
      }
    };

    restoreSession();
  }, [actor, actorFetching, queryClient]);

  // Update auth method when II authentication changes
  useEffect(() => {
    if (isIIAuthenticated && authStatus !== 'initializing') {
      setAuthMethod('internet-identity');
      setIsAuthenticated(true);
      setAuthStatus('success');
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    } else if (!emailAuthActive && !isIIAuthenticated && authStatus !== 'initializing' && authStatus !== 'authenticating') {
      setAuthMethod(null);
      setIsAuthenticated(false);
      if (authStatus !== 'error') {
        setAuthStatus('idle');
      }
    }
  }, [isIIAuthenticated, emailAuthActive, authStatus]);

  // Track Internet Identity login status changes
  useEffect(() => {
    if (iiStatus === 'logging-in') {
      setAuthStatus('authenticating');
    } else if (iiStatus === 'success' && isIIAuthenticated) {
      setAuthMethod('internet-identity');
      setIsAuthenticated(true);
      setAuthStatus('success');
      setAuthError(undefined);
      // Invalidate queries immediately
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
    } else if (iiStatus === 'loginError') {
      setAuthStatus('error');
      setAuthError(new Error('Internet Identity login failed. Please try again.'));
      setAuthMethod(null);
      setIsAuthenticated(false);
    } else if (iiStatus === 'idle' && !isIIAuthenticated && authStatus === 'authenticating') {
      setAuthStatus('idle');
      setAuthMethod(null);
      setIsAuthenticated(false);
    }
  }, [iiStatus, isIIAuthenticated, authStatus, queryClient]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!actor) {
      throw new Error('Service not ready. Please try again.');
    }

    try {
      setAuthStatus('authenticating');
      setAuthError(undefined);
      
      const success = await actor.login(email, password);
      
      if (success) {
        // Update state synchronously
        setEmailAuthActive(true);
        setAuthMethod('email-password');
        setIsAuthenticated(true);
        setAuthStatus('success');
        
        // Store credentials for session persistence
        localStorage.setItem('emailAuth', JSON.stringify({
          authenticated: true,
          email,
          password
        }));
        
        // Invalidate queries after state update
        await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        await queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      setIsAuthenticated(false);
      throw normalizedError;
    }
  }, [actor, queryClient]);

  const registerWithEmail = useCallback(async (input: RegisterInput) => {
    if (!actor) {
      throw new Error('Service not ready. Please try again.');
    }

    try {
      setAuthStatus('authenticating');
      setAuthError(undefined);
      
      await actor.register(input);
      
      // Update state synchronously
      setEmailAuthActive(true);
      setAuthMethod('email-password');
      setIsAuthenticated(true);
      setAuthStatus('success');
      
      // Store credentials for session persistence
      localStorage.setItem('emailAuth', JSON.stringify({
        authenticated: true,
        email: input.email,
        password: input.password
      }));
      
      // Invalidate queries after state update
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['loginStatus'] });
    } catch (error) {
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      setIsAuthenticated(false);
      throw normalizedError;
    }
  }, [actor, queryClient]);

  const loginWithInternetIdentity = useCallback(() => {
    setAuthError(undefined);
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(async () => {
    // Clear email auth
    if (emailAuthActive) {
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    }
    
    // Clear II auth
    if (isIIAuthenticated) {
      await iiClear();
    }
    
    // Reset state
    setAuthMethod(null);
    setIsAuthenticated(false);
    setAuthStatus('idle');
    setAuthError(undefined);
    
    // Clear all cached data
    queryClient.clear();
  }, [emailAuthActive, isIIAuthenticated, iiClear, queryClient]);

  const contextValue = useMemo<AuthContext>(() => ({
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
  }), [
    isAuthenticated,
    authMethod,
    loginWithEmail,
    registerWithEmail,
    loginWithInternetIdentity,
    logout,
    authStatus,
    authError,
  ]);

  return createElement(AuthReactContext.Provider, { value: contextValue }, children);
}
