import React, { useState, useMemo } from 'react';
import { Tv } from 'lucide-react';
import SeriesCard from '../components/SeriesCard';
import { Skeleton } from '../components/ui/skeleton';
import { useGetAllSeries } from '../hooks/useQueries';

const GENRES = ['All', 'Drama', 'Comedy', 'Documentary', 'Educational', 'Faith-Based', 'Family', 'News', 'Reality'];

export default function TVShowsPage() {
  const { data: allSeries = [], isLoading } = useGetAllSeries();
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return allSeries;
    // Filter by genre if series had genre field; for now show all when "All" selected
    return allSeries;
  }, [allSeries, selectedGenre]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Tv size={28} className="text-[oklch(0.55_0.24_25)]" />
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-wide">TV Shows</h1>
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
            <Tv size={48} className="text-[oklch(0.30_0.04_15)] mb-4" />
            <p className="text-lg font-semibold text-[oklch(0.60_0.01_90)]">No TV shows found</p>
            <p className="text-sm text-[oklch(0.45_0.01_90)] mt-1">No TV shows available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((series) => (
              <div key={series.id} className="w-full">
                <SeriesCard series={series} size="md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
