import { useGetAllClips } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useRef, useState, useEffect } from 'react';
import { useVerticalScrollSnap } from '../hooks/useVerticalScrollSnap';
import { useIntersectionAutoplay } from '../hooks/useIntersectionAutoplay';
import { Play, Star } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function ClipsShortsFeed() {
  const { data: clips, isLoading } = useGetAllClips();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefsArray = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Filter only clips
  const clipsData = clips?.filter((clip) => clip.isClip) || [];

  // Initialize item refs array
  useEffect(() => {
    itemRefsArray.current = itemRefsArray.current.slice(0, clipsData.length);
  }, [clipsData.length]);

  // Vertical scroll snap behavior
  useVerticalScrollSnap({
    containerRef,
    onScrollEnd: (index) => {
      setVisibleIndex(index);
    },
  });

  // Intersection observer for autoplay (future enhancement)
  useIntersectionAutoplay({
    itemRefs: itemRefsArray,
    onVisibilityChange: (index, isVisible) => {
      if (isVisible) {
        setVisibleIndex(index);
      }
    },
    threshold: 0.7,
  });

  const handleClipClick = (clipId: string) => {
    navigate({ to: '/watch/$contentId', params: { contentId: clipId } });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Skeleton className="w-full h-full bg-[#1a0000]" />
      </div>
    );
  }

  if (!clipsData || clipsData.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[80vh] overflow-y-scroll snap-y snap-mandatory scrollbar-thin scrollbar-thumb-[#cc0000] scrollbar-track-[#1a0000]"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#cc0000 #1a0000',
      }}
    >
      {clipsData.map((clip, index) => (
        <div
          key={clip.id}
          ref={(el) => {
            itemRefsArray.current[index] = el;
          }}
          className="w-full h-[80vh] snap-start snap-always relative flex items-center justify-center bg-black"
        >
          {/* Thumbnail Background */}
          <div className="absolute inset-0">
            <img
              src={clip.thumbnailUrl.getDirectURL()}
              alt={clip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>

          {/* Play Button Overlay */}
          <button
            onClick={() => handleClipClick(clip.id)}
            className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#cc0000] to-[#660000] flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl"
            aria-label={`Play ${clip.title}`}
          >
            <Play className="h-10 w-10 text-white fill-current ml-1" />
          </button>

          {/* Content Info Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="space-y-2">
              {clip.isOriginal && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#cc0000] fill-current" />
                  <span className="text-sm font-semibold text-white">ORIGINAL</span>
                </div>
              )}
              <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-2">
                {clip.title}
              </h3>
              {clip.clipCaption && (
                <p className="text-sm md:text-base text-white/80 line-clamp-2">
                  {clip.clipCaption}
                </p>
              )}
            </div>
          </div>

          {/* Scroll Indicator - Right Side */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
            {clipsData.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-8 rounded-full transition-all duration-300 ${
                  i === visibleIndex ? 'bg-[#cc0000]' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
