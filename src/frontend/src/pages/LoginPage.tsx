import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Shield, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithEmail, registerWithEmail, loginWithInternetIdentity, isAuthenticating, isAuthenticated, authStatus } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  console.log('[LoginPage] State:', { isAuthenticated, authStatus, isAuthenticating });

  // Effect-based redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && authStatus === 'success') {
      console.log('[LoginPage] Authenticated, redirecting to home...');
      // Small delay to ensure state is fully propagated
      const timer = setTimeout(() => {
        navigate({ to: '/' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authStatus, navigate]);

  // Don't render login form if already authenticated
  if (isAuthenticated && authStatus === 'success') {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] Login form submitted');
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await loginWithEmail(loginEmail, loginPassword);
      console.log('[LoginPage] Login successful');
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('[LoginPage] Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] Register form submitted');
    
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await registerWithEmail({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      console.log('[LoginPage] Registration successful');
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('[LoginPage] Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleInternetIdentityLogin = () => {
    console.log('[LoginPage] Internet Identity login clicked');
    loginWithInternetIdentity();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-950/20 to-black px-4 py-12">
      <Card className="w-full max-w-md bg-black/80 border-red-900/50 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/assets/4-removebg-preview.png" alt="FAITH X-Stream" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Welcome to FAITH X-Stream
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to access premium content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-red-950/30">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-600">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-600">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-red-900/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-red-900/50 text-white hover:bg-red-900/20"
                onClick={handleInternetIdentityLogin}
                disabled={isAuthenticating}
              >
                <Shield className="mr-2 h-4 w-4" />
                Internet Identity
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white">
                    <UserIcon className="inline h-4 w-4 mr-2" />
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/50 border-red-900/50 text-white"
                    disabled={isAuthenticating}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
