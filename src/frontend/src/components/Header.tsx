import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Menu, User, Search } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from './ui/input';
import { useActor } from '../hooks/useActor';

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isAuthenticated, logout, authStatus } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Show loading while actor is initializing OR while profile/admin data is loading after authentication
  const isLoadingUserData = actorFetching || (isAuthenticated && (profileLoading || adminLoading));

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = () => {
    navigate({ to: '/login' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery.trim() } });
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Live', path: '/live' },
    { label: 'Guide', path: '/live', search: { mode: 'guide' } },
    { label: 'Originals', path: '/originals' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv-shows' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#330000] shadow-2xl">
      <div className="container flex h-20 items-center justify-between px-6 md:px-12">
        {/* Logo - X Icon for compact branding */}
        <Link 
          to="/" 
          className="flex items-center transition-opacity duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] rounded"
        >
          <img
            src="/assets/4-removebg-preview.png"
            alt="FAITH X-Stream"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 bg-[#4d0000] rounded-full px-4 py-2">
          {navItems.map((item) => {
            const isActive = item.search 
              ? currentPath === item.path && (routerState.location.search as any)?.mode === item.search.mode
              : currentPath === item.path;
            
            return (
              <Link
                key={`${item.path}-${item.search?.mode || 'default'}`}
                to={item.path}
                search={item.search as any}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] ${
                  isActive
                    ? 'bg-[#cc0000] text-white shadow-lg shadow-[#cc0000]/50'
                    : 'text-white/80 hover:text-white hover:bg-[#660000]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 bg-[#4d0000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000] pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Show loading state while fetching user data after authentication */}
          {isLoadingUserData ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="w-6 h-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-white/70">Loading...</span>
            </div>
          ) : isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 hover:bg-[#660000] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cc0000] to-[#990000] flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{userProfile.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a0000] border-2 border-[#660000]">
                <DropdownMenuItem 
                  onClick={() => navigate({ to: '/profile' })} 
                  className="cursor-pointer hover:bg-[#660000] transition-colors duration-300 focus:bg-[#660000] text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem 
                    onClick={() => navigate({ to: '/admin' })} 
                    className="cursor-pointer hover:bg-[#660000] transition-colors duration-300 focus:bg-[#660000] text-white"
                  >
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#660000]" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-[#ff6666] hover:bg-[#660000] transition-colors duration-300 focus:bg-[#660000]"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-[#cc0000] to-[#990000] hover:from-[#990000] hover:to-[#660000] text-white font-bold px-8 py-2.5 rounded-full shadow-lg shadow-[#cc0000]/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000]"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#660000]">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-gradient-to-b from-[#1a0000] to-[#000000] border-l-2 border-[#660000]">
            <div className="flex flex-col gap-6 mt-8">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#4d0000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000] pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = item.search 
                    ? currentPath === item.path && (routerState.location.search as any)?.mode === item.search.mode
                    : currentPath === item.path;
                  
                  return (
                    <Link
                      key={`${item.path}-${item.search?.mode || 'default'}`}
                      to={item.path}
                      search={item.search as any}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-[#cc0000] text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-[#660000]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Auth Actions */}
              <div className="border-t border-[#660000] pt-6">
                {isLoadingUserData ? (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-6 h-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-white/70">Loading...</span>
                  </div>
                ) : isAuthenticated && userProfile ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        navigate({ to: '/profile' });
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="justify-start text-white hover:bg-[#660000]"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                    {isAdmin && (
                      <Button
                        onClick={() => {
                          navigate({ to: '/admin' });
                          setMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="justify-start text-white hover:bg-[#660000]"
                      >
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="justify-start text-[#ff6666] hover:bg-[#660000]"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#cc0000] to-[#990000] hover:from-[#990000] hover:to-[#660000] text-white font-bold"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
