import { useState } from 'react';
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
  const { loginWithEmail, registerWithEmail, loginWithInternetIdentity, isAuthenticating, isAuthenticated } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await loginWithEmail(loginEmail, loginPassword);
      toast.success('Login successful!');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });
      toast.success('Account created successfully! Welcome to FAITH X-Stream!');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleAdminLogin = () => {
    loginWithInternetIdentity();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#330000] via-[#1a0000] to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Full Logo */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
            alt="FAITH X-Stream"
            className="h-24 w-auto max-w-full object-contain"
          />
        </div>

        {/* Login/Register Tabs */}
        <Card className="border-2 border-[#660000] bg-[#1a0000]/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Welcome</CardTitle>
            <CardDescription className="text-white/70">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#330000]">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-[#cc0000] data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-[#cc0000] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#cc0000] hover:bg-[#990000] text-white font-bold transition-all duration-300"
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-white">
                      <UserIcon className="h-4 w-4 inline mr-2" />
                      Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#cc0000] hover:bg-[#990000] text-white font-bold transition-all duration-300"
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Admin Login */}
        <Card className="border-2 border-[#660000] bg-[#1a0000]/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#cc0000]" />
              Admin Access
            </CardTitle>
            <CardDescription className="text-white/70">
              For administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAdminLogin}
              variant="outline"
              className="w-full border-2 border-[#660000] hover:bg-[#660000] text-white font-bold transition-all duration-300"
              disabled={isAuthenticating}
            >
              <Shield className="h-4 w-4 mr-2" />
              Login with Internet Identity
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-white/50">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
