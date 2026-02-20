import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Settings, Loader2 } from 'lucide-react';
import { useActor } from '../hooks/useActor';

export default function Header() {
  const { isAuthenticated, logout, authStatus } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  console.log('[Header] Render state:', { 
    isAuthenticated, 
    authStatus, 
    actorFetching, 
    actor: !!actor, 
    profileLoading, 
    profileFetched, 
    userProfile: !!userProfile,
    isAdmin,
    adminLoading
  });

  const handleLogout = async () => {
    console.log('[Header] Logout clicked');
    try {
      await logout();
    } catch (error) {
      console.error('[Header] Logout error:', error);
    }
  };

  // Show loading spinner while initializing or actor is not ready
  const isInitializing = authStatus === 'initializing' || actorFetching;
  
  // When authenticated, wait for actor and profile to be ready
  const isLoadingAuthData = isAuthenticated && (!actor || profileLoading);

  console.log('[Header] Display logic:', { isInitializing, isLoadingAuthData });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-900/20 bg-gradient-to-r from-black via-red-950/30 to-black backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/assets/4-removebg-preview.png" alt="FAITH X-Stream" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">FAITH X-Stream</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Home
          </Link>
          <Link
            to="/originals"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Originals
          </Link>
          <Link
            to="/movies"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Movies
          </Link>
          <Link
            to="/tv-shows"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            TV Shows
          </Link>
          <Link
            to="/clips"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Clips
          </Link>
          <Link
            to="/live"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Live TV
          </Link>
          <Link
            to="/networks"
            className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
          >
            Networks
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isInitializing || isLoadingAuthData ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
          ) : isAuthenticated && actor ? (
            <>
              {!adminLoading && isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-red-500">
                    <User className="h-5 w-5 mr-2" />
                    {userProfile?.name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-red-900">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-red-900/20" />
                  <DropdownMenuItem asChild className="text-white hover:bg-red-900/20 cursor-pointer">
                    <Link to="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {userProfile && !userProfile.isPremium && !isAdmin && (
                    <DropdownMenuItem asChild className="text-white hover:bg-red-900/20 cursor-pointer">
                      <Link to="/upgrade">
                        <Settings className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-red-900/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-900/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
