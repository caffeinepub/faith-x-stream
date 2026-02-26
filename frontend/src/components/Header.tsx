import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Search, Menu, X, ChevronDown, Star, Crown, Tv, Film, Mic, Play, Clapperboard, Globe, Home, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Movies', path: '/movies', icon: Film },
  { label: 'TV Shows', path: '/tv-shows', icon: Tv },
  { label: 'Podcasts', path: '/podcasts', icon: Mic },
  { label: 'Originals', path: '/originals', icon: Star },
  { label: 'Live TV', path: '/live', icon: Play },
  { label: 'Clips', path: '/clips', icon: Clapperboard },
  { label: 'Networks', path: '/networks', icon: Globe },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isInitializing = actorFetching || !actor;
  const currentPath = location.pathname;

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    queryClient.clear();
    setProfileMenuOpen(false);
    navigate({ to: '/' });
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[oklch(0.06_0.012_15/0.97)] backdrop-blur-md border-b border-[oklch(0.22_0.03_15)]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex-shrink-0 flex items-center gap-2 mr-2"
          >
            <img
              src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
              alt="FAITH X-Stream"
              className="h-8 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate({ to: link.path })}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150
                  ${isActive(link.path)
                    ? 'text-[oklch(0.98_0.005_90)] bg-[oklch(0.55_0.24_25/0.2)] border border-[oklch(0.55_0.24_25/0.4)]'
                    : 'text-[oklch(0.72_0.01_90)] hover:text-[oklch(0.97_0.005_90)] hover:bg-[oklch(0.55_0.24_25/0.1)]'
                  }
                `}
              >
                <link.icon size={14} />
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="flex items-center bg-[oklch(0.15_0.022_15)] border border-[oklch(0.30_0.05_15)] rounded-full overflow-hidden">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, genres..."
                    className="bg-transparent text-sm text-[oklch(0.97_0.005_90)] placeholder-[oklch(0.50_0.01_90)] px-4 py-2 w-56 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="p-2 text-[oklch(0.60_0.01_90)] hover:text-[oklch(0.97_0.005_90)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-[oklch(0.72_0.01_90)] hover:text-[oklch(0.97_0.005_90)] hover:bg-[oklch(0.55_0.24_25/0.15)] transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            {/* Auth area */}
            {!isInitializing && (
              <>
                {isAuthenticated ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.16_0.025_15)] border border-[oklch(0.28_0.04_15)] hover:border-[oklch(0.55_0.24_25/0.6)] transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-[oklch(0.55_0.24_25)] flex items-center justify-center text-xs font-bold text-white">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm text-[oklch(0.90_0.01_90)] max-w-[100px] truncate">
                        {userProfile?.name || 'User'}
                      </span>
                      {(isAdmin || userProfile?.isPremium) && (
                        <Crown size={12} className="text-[oklch(0.75_0.18_60)]" />
                      )}
                      <ChevronDown size={14} className="text-[oklch(0.60_0.01_90)]" />
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[oklch(0.12_0.02_15)] border border-[oklch(0.22_0.03_15)] rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-[oklch(0.20_0.025_15)]">
                          <p className="text-sm font-semibold text-[oklch(0.97_0.005_90)] truncate">{userProfile?.name}</p>
                          <p className="text-xs text-[oklch(0.55_0.01_90)] truncate">{userProfile?.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-[oklch(0.75_0.18_60)] font-medium">
                              <Crown size={10} /> Admin
                            </span>
                          )}
                          {!isAdmin && userProfile?.isPremium && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-[oklch(0.75_0.18_60)] font-medium">
                              <Crown size={10} /> Premium
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { navigate({ to: '/profile' }); setProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.85_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.15)] hover:text-white transition-colors"
                          >
                            <User size={15} /> Profile
                          </button>
                          {!adminLoading && isAdmin && (
                            <button
                              onClick={() => { navigate({ to: '/admin' }); setProfileMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.85_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.15)] hover:text-white transition-colors"
                            >
                              <Settings size={15} /> Admin Panel
                            </button>
                          )}
                          {!adminLoading && !isAdmin && !userProfile?.isPremium && (
                            <button
                              onClick={() => { navigate({ to: '/upgrade' }); setProfileMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.75_0.18_60)] hover:bg-[oklch(0.55_0.24_25/0.15)] transition-colors"
                            >
                              <Crown size={15} /> Upgrade to Premium
                            </button>
                          )}
                          <div className="border-t border-[oklch(0.20_0.025_15)] mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[oklch(0.65_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.1)] hover:text-[oklch(0.85_0.01_90)] transition-colors"
                            >
                              <LogOut size={15} /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate({ to: '/login' })}
                    className="px-4 py-2 rounded-full bg-[oklch(0.55_0.24_25)] hover:bg-[oklch(0.60_0.26_22)] text-white text-sm font-semibold transition-all"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[oklch(0.72_0.01_90)] hover:text-white hover:bg-[oklch(0.55_0.24_25/0.15)] transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[oklch(0.06_0.012_15/0.98)] backdrop-blur-md animate-fade-in">
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Mobile Search */}
            <div className="px-4 py-4 border-b border-[oklch(0.18_0.025_15)]">
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="flex items-center gap-2 bg-[oklch(0.15_0.022_15)] border border-[oklch(0.28_0.04_15)] rounded-full px-4 py-2.5">
                <Search size={16} className="text-[oklch(0.55_0.01_90)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, genres..."
                  className="bg-transparent text-sm text-[oklch(0.97_0.005_90)] placeholder-[oklch(0.50_0.01_90)] flex-1 outline-none"
                />
              </form>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col px-4 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate({ to: link.path }); setMobileMenuOpen(false); }}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all
                    ${isActive(link.path)
                      ? 'bg-[oklch(0.55_0.24_25/0.2)] text-white border border-[oklch(0.55_0.24_25/0.4)]'
                      : 'text-[oklch(0.75_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.1)] hover:text-white'
                    }
                  `}
                >
                  <link.icon size={18} />
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Mobile Auth */}
            {!isInitializing && (
              <div className="px-4 py-4 border-t border-[oklch(0.18_0.025_15)] mt-auto">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[oklch(0.14_0.02_15)] rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-[oklch(0.55_0.24_25)] flex items-center justify-center text-sm font-bold text-white">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{userProfile?.name}</p>
                        <p className="text-xs text-[oklch(0.55_0.01_90)]">{isAdmin ? 'Admin' : userProfile?.isPremium ? 'Premium' : 'Free'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate({ to: '/profile' }); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[oklch(0.80_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.1)] transition-colors"
                    >
                      <User size={16} /> Profile
                    </button>
                    {!adminLoading && isAdmin && (
                      <button
                        onClick={() => { navigate({ to: '/admin' }); setMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[oklch(0.80_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.1)] transition-colors"
                      >
                        <Settings size={16} /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[oklch(0.65_0.01_90)] hover:bg-[oklch(0.55_0.24_25/0.1)] transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { navigate({ to: '/login' }); setMobileMenuOpen(false); }}
                    className="w-full py-3.5 rounded-xl bg-[oklch(0.55_0.24_25)] hover:bg-[oklch(0.60_0.26_22)] text-white font-semibold transition-all"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
