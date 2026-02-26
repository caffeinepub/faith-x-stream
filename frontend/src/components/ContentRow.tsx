import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from './VideoCard';
import SeriesCard from './SeriesCard';
import { VideoContent, TVSeries } from '../backend';

type ContentItem = VideoContent | TVSeries;

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  seeAllPath?: string;
  onSeeAll?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

function isVideoContent(item: ContentItem): item is VideoContent {
  return 'videoUrl' in item;
}

export default function ContentRow({ title, items, onSeeAll, size = 'md' }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative group/row">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display text-xl lg:text-2xl font-bold text-white tracking-wide uppercase">
          {title}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-[oklch(0.55_0.24_25)] hover:text-[oklch(0.65_0.26_22)] uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            See All <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-[oklch(0.12_0.02_15/0.95)] border border-[oklch(0.28_0.04_15)] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-[oklch(0.55_0.24_25)] transition-all shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        >
          {items.map((item) =>
            isVideoContent(item) ? (
              <VideoCard key={item.id} video={item} size={size} />
            ) : (
              <SeriesCard key={item.id} series={item} size={size} />
            )
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-[oklch(0.12_0.02_15/0.95)] border border-[oklch(0.28_0.04_15)] text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-[oklch(0.55_0.24_25)] transition-all shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
