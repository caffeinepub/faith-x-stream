import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import VideoCard from './VideoCard';
import SeriesCard from './SeriesCard';
import { Brand, VideoContent, TVSeries } from '../backend';

interface BrandRailProps {
  brand: Brand;
  films: VideoContent[];
  series: TVSeries[];
  clips: VideoContent[];
}

export default function BrandRail({ brand, films, series, clips }: BrandRailProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const allContent: (VideoContent | TVSeries)[] = [
    ...films,
    ...series,
    ...clips,
  ];

  if (allContent.length === 0) return null;

  const logoUrl = brand.logo?.getDirectURL?.() || '';

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const isVideoContent = (item: VideoContent | TVSeries): item is VideoContent => 'videoUrl' in item;

  return (
    <section className="relative group/brand-rail">
      {/* Brand header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: brand.id } })}
          className="flex items-center gap-3 group/logo"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brand.name}
              className="h-8 w-auto max-w-[140px] object-contain brand-logo-hover"
            />
          ) : (
            <span className="font-display text-xl font-bold text-white uppercase tracking-wide group-hover/logo:text-[oklch(0.55_0.24_25)] transition-colors">
              {brand.name}
            </span>
          )}
          {logoUrl && (
            <span className="text-sm font-semibold text-[oklch(0.65_0.01_90)] group-hover/logo:text-white transition-colors">
              {brand.name}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: brand.id } })}
          className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.55_0.24_25)] hover:text-[oklch(0.65_0.26_22)] uppercase tracking-widest transition-colors"
        >
          See All <ArrowRight size={13} />
        </button>
      </div>

      {/* Scroll row */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-[oklch(0.12_0.02_15/0.95)] border border-[oklch(0.28_0.04_15)] text-white flex items-center justify-center opacity-0 group-hover/brand-rail:opacity-100 hover:bg-[oklch(0.55_0.24_25)] transition-all shadow-lg"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        >
          {allContent.map((item) =>
            isVideoContent(item) ? (
              <VideoCard key={item.id} video={item} size="md" />
            ) : (
              <SeriesCard key={item.id} series={item} size="md" />
            )
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-[oklch(0.12_0.02_15/0.95)] border border-[oklch(0.28_0.04_15)] text-white flex items-center justify-center opacity-0 group-hover/brand-rail:opacity-100 hover:bg-[oklch(0.55_0.24_25)] transition-all shadow-lg"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
