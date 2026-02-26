import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, Tv, Film, Mic, Star, Play, Clapperboard, Globe } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'faith-xstream');

  return (
    <footer className="bg-[oklch(0.07_0.014_15)] border-t border-[oklch(0.18_0.025_15)] mt-16">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
              alt="FAITH X-Stream"
              className="h-10 w-auto object-contain mb-4"
            />
            <p className="text-sm text-[oklch(0.55_0.01_90)] leading-relaxed">
              Your destination for faith-based entertainment. Stream movies, TV shows, podcasts, and live TV.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.55_0.24_25)] mb-4">Browse</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Movies', path: '/movies', icon: Film },
                { label: 'TV Shows', path: '/tv-shows', icon: Tv },
                { label: 'Podcasts', path: '/podcasts', icon: Mic },
                { label: 'Originals', path: '/originals', icon: Star },
              ].map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="flex items-center gap-2 text-sm text-[oklch(0.65_0.01_90)] hover:text-[oklch(0.55_0.24_25)] transition-colors"
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.55_0.24_25)] mb-4">More</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Live TV', path: '/live', icon: Play },
                { label: 'Clips', path: '/clips', icon: Clapperboard },
                { label: 'Networks', path: '/networks', icon: Globe },
              ].map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="flex items-center gap-2 text-sm text-[oklch(0.65_0.01_90)] hover:text-[oklch(0.55_0.24_25)] transition-colors"
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.55_0.24_25)] mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Sign In', path: '/login' },
                { label: 'Upgrade to Premium', path: '/upgrade' },
                { label: 'Profile', path: '/profile' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="text-sm text-[oklch(0.65_0.01_90)] hover:text-[oklch(0.55_0.24_25)] transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[oklch(0.16_0.022_15)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[oklch(0.45_0.01_90)]">
            © {year} FAITH X-Stream. All rights reserved.
          </p>
          <p className="text-xs text-[oklch(0.45_0.01_90)] flex items-center gap-1">
            Built with <Heart size={11} className="text-[oklch(0.55_0.24_25)] fill-[oklch(0.55_0.24_25)]" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.55_0.24_25)] hover:text-[oklch(0.65_0.26_22)] transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
