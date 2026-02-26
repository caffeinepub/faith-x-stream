import { Mic, Search } from 'lucide-react';
import { useState } from 'react';
import { useGetAllVideos } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="w-full aspect-[2/3] rounded-lg" />
          <Skeleton className="w-3/4 h-3 mt-2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function PodcastsPage() {
  const { data: allVideos = [], isLoading } = useGetAllVideos();
  const [searchQuery, setSearchQuery] = useState('');

  const podcasts = allVideos.filter(
    (v) => !v.isClip && v.contentType === 'podcast' && v.availableAsVOD
  );

  const filtered = searchQuery.trim()
    ? podcasts.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : podcasts;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Mic className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Podcasts</h1>
              <p className="text-foreground/60 text-sm mt-0.5">
                {isLoading ? 'Loading...' : `${podcasts.length} podcast${podcasts.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border/40 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <GridSkeleton />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Mic className="w-16 h-16 text-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold text-foreground/60 mb-2">
              {searchQuery ? 'No results found' : 'No podcasts yet'}
            </h3>
            <p className="text-foreground/40 text-sm max-w-sm">
              {searchQuery
                ? `No podcasts match "${searchQuery}". Try a different search.`
                : 'Podcasts will appear here once they are added to the platform.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
