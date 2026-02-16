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

export function AuthProvider({ children }: PropsWithChildren<{ children: ReactNode }>) {
  const { identity, login: iiLogin, clear: iiClear, loginStatus: iiStatus } = useInternetIdentity();
  const { actor } = useActor();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [authError, setAuthError] = useState<Error | undefined>(undefined);
  const [emailAuthActive, setEmailAuthActive] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Check if user is authenticated via Internet Identity
  const isIIAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Initialize: restore email auth session if exists
  useEffect(() => {
    if (!actor || sessionRestored) return;

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
        setAuthStatus('idle');
      }
      setSessionRestored(true);
    };

    restoreSession();
  }, [actor, sessionRestored]);

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
      if (authStatus !== 'initializing') {
        setAuthStatus('idle');
      }
    }
  }, [isIIAuthenticated, emailAuthActive, authStatus, sessionRestored]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!actor) {
      throw new Error('Actor not available');
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
        throw new Error('Login failed');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Login failed');
      setAuthError(err);
      setAuthStatus('error');
      localStorage.removeItem('emailAuth');
      setEmailAuthActive(false);
      throw err;
    }
  }, [actor]);

  const registerWithEmail = useCallback(async (input: RegisterInput) => {
    if (!actor) {
      throw new Error('Actor not available');
    }
    
    setAuthStatus('authenticating');
    setAuthError(undefined);
    
    try {
      await actor.register(input);
      // After registration, automatically log in
      await loginWithEmail(input.email, input.password);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Registration failed');
      setAuthError(err);
      setAuthStatus('error');
      throw err;
    }
  }, [actor, loginWithEmail]);

  const loginWithInternetIdentity = useCallback(() => {
    setAuthStatus('authenticating');
    setAuthError(undefined);
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
