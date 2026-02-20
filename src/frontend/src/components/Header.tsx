import { Link } from '@tanstack/react-router';
import { Search, User, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  
  // Only fetch profile and admin status when authenticated and actor is ready
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery } });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  // Show loading state while actor is initializing
  const isInitializing = actorFetching || !actor;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-900/20 bg-gradient-to-r from-black via-red-950/30 to-black backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/4-removebg-preview.png" alt="FAITH X-Stream" className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
            >
              Home
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
              to="/originals"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
            >
              Originals
            </Link>
            <Link
              to="/live"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
            >
              Live TV
            </Link>
            <Link
              to="/clips"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
            >
              Clips
            </Link>
            <Link
              to="/networks"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-red-500"
            >
              Networks
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[200px] lg:w-[300px] bg-black/50 border-red-900/30 text-white placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {isAuthenticated && !isInitializing ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-red-900/20">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/95 border-red-900/30">
                {!profileLoading && userProfile && (
                  <>
                    <div className="px-2 py-1.5 text-sm text-gray-400">
                      {userProfile.name}
                    </div>
                    <DropdownMenuSeparator className="bg-red-900/30" />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer text-white hover:bg-red-900/20">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {!adminLoading && isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer text-white hover:bg-red-900/20">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-red-900/30" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-red-900/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
