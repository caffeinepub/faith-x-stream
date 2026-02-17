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
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [authError, setAuthError] = useState<Error | undefined>(undefined);
  const [emailAuthActive, setEmailAuthActive] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Check if user is authenticated via Internet Identity
  const isIIAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Initialize: restore email auth session if exists, then transition to idle
  useEffect(() => {
    if (!actor || sessionRestored || actorFetching) return;

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
                setAuthStatus('success');
              } else {
                // Session invalid, clear it
                localStorage.removeItem('emailAuth');
                setAuthStatus('idle');
              }
            } catch (error) {
              // Session invalid, clear it
              console.error('Failed to restore session:', error);
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
        // No stored session, transition to idle
        setAuthStatus('idle');
      }
      setSessionRestored(true);
    };

    restoreSession();
  }, [actor, sessionRestored, actorFetching]);

  // Update auth method when II authentication changes
  useEffect(() => {
    if (isIIAuthenticated) {
      setAuthMethod('internet-identity');
      setAuthStatus('success');
      // Clear email auth if II is used
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    } else if (!emailAuthActive && sessionRestored) {
      setAuthMethod(null);
      // Only set to idle if we're not in the middle of authenticating
      if (authStatus !== 'authenticating') {
        setAuthStatus('idle');
      }
    }
  }, [isIIAuthenticated, emailAuthActive, authStatus, sessionRestored]);

  // Track Internet Identity login status changes
  useEffect(() => {
    if (authMethod === 'internet-identity' || iiStatus === 'logging-in') {
      if (iiStatus === 'logging-in') {
        setAuthStatus('authenticating');
      } else if (iiStatus === 'success' && isIIAuthenticated) {
        setAuthMethod('internet-identity');
        setAuthStatus('success');
        setAuthError(undefined);
      } else if (iiStatus === 'loginError') {
        setAuthStatus('error');
        setAuthError(new Error('Internet Identity login failed. Please try again.'));
        setAuthMethod(null);
      } else if (iiStatus === 'idle' && !isIIAuthenticated && authStatus === 'authenticating') {
        // Login was cancelled or failed
        setAuthStatus('idle');
        setAuthMethod(null);
      }
    }
  }, [iiStatus, isIIAuthenticated, authMethod, authStatus]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    // Wait for actor to be ready (with timeout)
    if (!actor) {
      if (actorFetching) {
        // Actor is still initializing, wait a bit
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
      const success = await actor.login(email, password);
      if (success) {
        // Store authentication state with credentials for session restoration
        localStorage.setItem('emailAuth', JSON.stringify({ 
          email, 
          password, // Store for session restoration
          authenticated: true,
          timestamp: Date.now()
        }));
        setEmailAuthActive(true);
        setAuthMethod('email-password');
        setAuthStatus('success');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
      throw normalizedError;
    }
  }, [actor, actorFetching]);

  const registerWithEmail = useCallback(async (input: RegisterInput) => {
    // Wait for actor to be ready (with timeout)
    if (!actor) {
      if (actorFetching) {
        // Actor is still initializing, wait a bit
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
      // After registration, automatically log in
      await loginWithEmail(input.email, input.password);
    } catch (error) {
      const normalizedError = normalizeError(error);
      setAuthError(normalizedError);
      setAuthStatus('error');
      throw normalizedError;
    }
  }, [actor, actorFetching, loginWithEmail]);

  const loginWithInternetIdentity = useCallback(() => {
    setAuthStatus('authenticating');
    setAuthError(undefined);
    // Clear any email auth session
    localStorage.removeItem('emailAuth');
    setEmailAuthActive(false);
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(async () => {
    if (authMethod === 'internet-identity') {
      await iiClear();
    } else if (authMethod === 'email-password') {
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
    }
    setAuthMethod(null);
    setAuthStatus('idle');
    setAuthError(undefined);
  }, [authMethod, iiClear]);

  const isAuthenticated = isIIAuthenticated || emailAuthActive;

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
