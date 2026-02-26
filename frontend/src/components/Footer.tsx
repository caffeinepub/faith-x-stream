import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const appId = encodeURIComponent(window.location.hostname || 'faith-xstream');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/30 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png" alt="FAITH X-Stream" className="h-10 object-contain" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Community streaming for the whole family, Watch Movies, TV Shows, Live TV, and Much More.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Browse</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Movies', path: '/movies' },
                { label: 'TV Shows', path: '/tv-shows' },
                { label: 'Live TV', path: '/live' },
                { label: 'Originals', path: '/originals' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Discover</h4>
            <ul className="space-y-2">
              {[
                { label: 'Networks', path: '/networks' },
                { label: 'Clips', path: '/clips' },
                { label: 'Podcasts', path: '/podcasts' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <li>
                    <button
                      onClick={() => navigate({ to: '/login' })}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate({ to: '/login' })}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      Create Account
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => navigate({ to: '/profile' })}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      My Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate({ to: '/upgrade' })}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            © {year} FAITH X-Stream. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1">
            Built with <Heart className="w-3 h-3 fill-primary text-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
