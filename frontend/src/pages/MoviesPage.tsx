import React, { useState, useMemo } from 'react';
import { Film } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { Skeleton } from '../components/ui/skeleton';
import { useGetAllVideos } from '../hooks/useQueries';
import { ContentType } from '../backend';

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Documentary', 'Faith-Based', 'Family', 'Thriller', 'Romance', 'Educational'];

export default function MoviesPage() {
  const { data: videos = [], isLoading } = useGetAllVideos();
  const [selectedGenre, setSelectedGenre] = useState('All');

  const movies = useMemo(() => {
    return videos.filter(
      (v) =>
        !v.isClip &&
        v.availableAsVOD &&
        (v.contentType === ContentType.movie ||
          v.contentType === ContentType.film ||
          v.contentType === ContentType.documentary)
    );
  }, [videos]);

  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((m) => { if (m.genre) genreSet.add(m.genre); });
    return ['All', ...GENRES.filter((g) => g !== 'All' && (genreSet.has(g) || movies.length > 0))];
  }, [movies]);

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return movies;
    return movies.filter((m) => m.genre === selectedGenre);
  }, [movies, selectedGenre]);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page header */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Film size={28} className="text-[oklch(0.55_0.24_25)]" />
          <h1 className="font-display text-4xl font-bold text-white uppercase tracking-wide">Movies</h1>
        </div>

        {/* Genre filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {availableGenres.map((genre) => (
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
            <Film size={48} className="text-[oklch(0.30_0.04_15)] mb-4" />
            <p className="text-lg font-semibold text-[oklch(0.60_0.01_90)]">No movies found</p>
            <p className="text-sm text-[oklch(0.45_0.01_90)] mt-1">
              {selectedGenre !== 'All' ? `No movies in the "${selectedGenre}" genre yet.` : 'No movies available yet.'}
            </p>
            {selectedGenre !== 'All' && (
              <button
                onClick={() => setSelectedGenre('All')}
                className="mt-4 px-5 py-2 rounded-full bg-[oklch(0.55_0.24_25)] text-white text-sm font-semibold hover:bg-[oklch(0.60_0.26_22)] transition-colors"
              >
                Show All Movies
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
