import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Menu, X, User, LogOut, Settings, ChevronDown, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isInitializing } = useAuth();
  const { identity } = useInternetIdentity();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery.trim() } });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  const displayName = userProfile?.name || (identity ? 'User' : '');

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/tv-shows', label: 'TV Shows' },
    { to: '/live', label: 'Live TV' },
    { to: '/originals', label: 'Originals' },
    { to: '/networks', label: 'Networks' },
    { to: '/clips', label: 'Clips' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
            alt="FAITH X-Stream"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-white/5"
              activeProps={{ className: 'px-3 py-2 text-sm font-medium text-primary' }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-md hover:bg-primary/10 flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-white/10 border border-border/50 rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary w-48"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-foreground/60 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Auth area */}
          {isInitializing ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {displayName || 'Profile'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                {userProfile?.isPremium && (
                  <div className="px-2 py-1.5 flex items-center gap-1.5 text-xs text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    Premium Member
                  </div>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                {!userProfile?.isPremium && !isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/upgrade' })}>
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate({ to: '/login' })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-foreground/60 hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/30 bg-background/98 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-md hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => { navigate({ to: '/login' }); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-primary"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
