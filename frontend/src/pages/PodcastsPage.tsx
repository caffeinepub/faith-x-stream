import React, { useState, useMemo } from 'react';
import { Mic } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { Skeleton } from '../components/ui/skeleton';
import { useGetAllVideos } from '../hooks/useQueries';
import { ContentType } from '../backend';

const GENRES = ['All', 'Educational', 'Faith-Based', 'News', 'Interviews', 'Devotional', 'Music', 'Family'];

export default function PodcastsPage() {
  const { data: videos = [], isLoading } = useGetAllVideos();
  const [selectedGenre, setSelectedGenre] = useState('All');

  const podcasts = useMemo(() => {
    return videos.filter(
      (v) => !v.isClip && v.availableAsVOD && v.contentType === ContentType.podcast
    );
  }, [videos]);

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return podcasts;
    return podcasts.filter((p) => p.genre === selectedGenre);
  }, [podcasts, selectedGenre]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Mic size={28} className="text-[oklch(0.55_0.24_25)]" />
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-wide">Podcasts</h1>
        </div>

        {/* Genre filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedGenre === genre
                  ? 'bg-[oklch(0.55_0.24_25)] border-[oklch(0.55_0.24_25)] text-white shadow-red-glow-sm'
                  : 'bg-transparent border-[oklch(0.28_0.04_15)] text-[oklch(0.70_0.01_90)] hover:border-[oklch(0.55_0.24_25/0.6)] hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Content grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Mic size={48} className="text-[oklch(0.30_0.04_15)] mb-4" />
            <p className="text-lg font-semibold text-[oklch(0.60_0.01_90)]">No podcasts found</p>
            <p className="text-sm text-[oklch(0.45_0.01_90)] mt-1">
              {selectedGenre !== 'All'
                ? `No podcasts in the "${selectedGenre}" category yet.`
                : 'No podcasts available yet.'}
            </p>
            {selectedGenre !== 'All' && (
              <button
                onClick={() => setSelectedGenre('All')}
                className="mt-4 px-5 py-2 rounded-full bg-[oklch(0.55_0.24_25)] text-white text-sm font-semibold hover:bg-[oklch(0.60_0.26_22)] transition-colors"
              >
                Show All Podcasts
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((video) => (
              <div key={video.id} className="w-full">
                <VideoCard video={video} size="md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
