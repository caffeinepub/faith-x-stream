import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithEmail, loginWithII } = useAuth();
  const { identity, isLoggingIn, loginStatus } = useInternetIdentity();
  const { actor } = useActor();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated || identity) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, identity, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) { setError('Connection not ready. Please wait.'); return; }
    setError('');
    setLoading(true);
    try {
      await actor.login(email, password);
      await loginWithEmail(email, password);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) { setError('Connection not ready. Please wait.'); return; }
    setError('');
    setLoading(true);
    try {
      await actor.register({ name, email, password });
      await loginWithEmail(email, password);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIILogin = async () => {
    setError('');
    try {
      await loginWithII();
    } catch (err: any) {
      setError(err?.message || 'Internet Identity login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
            alt="FAITH X-Stream"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-foreground/60 text-sm mt-1">Sign in to continue watching</p>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5">
          {/* Internet Identity */}
          <Button
            onClick={handleIILogin}
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
          >
            {isLoggingIn ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" /> Sign in with Internet Identity</>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-foreground/40">or continue with email</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-background/50 p-1">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-background/50 border-border/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="mt-1 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="reg-email" className="text-foreground/80">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="reg-password" className="text-foreground/80">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-background/50 border-border/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
