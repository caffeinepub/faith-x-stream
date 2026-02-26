import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithInternetIdentity,
    authStatus, 
    authError 
  } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && authStatus === 'success') {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, authStatus, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginWithEmail(loginEmail, loginPassword);
      // Navigation will happen via useEffect after state updates
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await registerWithEmail({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      // Navigation will happen via useEffect after state updates
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleInternetIdentityLogin = () => {
    setError(null);
    loginWithInternetIdentity();
  };

  const isLoading = authStatus === 'authenticating';

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md bg-black/80 border-red-900/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Welcome to FAITH X-Stream</CardTitle>
          <CardDescription className="text-gray-400">
            Login or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Internet Identity Login Button */}
          <div className="space-y-2">
            <Button
              onClick={handleInternetIdentityLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              {isLoading && authStatus === 'authenticating' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Internet Identity...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Secure, decentralized authentication
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-red-900/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Authentication */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-red-900/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-600">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-600">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-black/50 border-red-900/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-black/50 border-red-900/30 text-white"
                  />
                </div>
                {(error || authError) && (
                  <p className="text-sm text-red-500">{error || authError?.message}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white">Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-black/50 border-red-900/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-black/50 border-red-900/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-black/50 border-red-900/30 text-white"
                  />
                </div>
                {(error || authError) && (
                  <p className="text-sm text-red-500">{error || authError?.message}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
