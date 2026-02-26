import { Tv, Search } from 'lucide-react';
import { useState } from 'react';
import { useGetAllSeries } from '../hooks/useQueries';
import SeriesCard from '../components/SeriesCard';
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

export default function TVShowsPage() {
  const { data: allSeries = [], isLoading } = useGetAllSeries();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery.trim()
    ? allSeries.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSeries;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Tv className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">TV Shows</h1>
              <p className="text-foreground/60 text-sm mt-0.5">
                {isLoading ? 'Loading...' : `${allSeries.length} series available`}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search TV shows..."
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
            {filtered.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tv className="w-16 h-16 text-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold text-foreground/60 mb-2">
              {searchQuery ? 'No results found' : 'No TV shows yet'}
            </h3>
            <p className="text-foreground/40 text-sm max-w-sm">
              {searchQuery
                ? `No shows match "${searchQuery}". Try a different search.`
                : 'TV shows and series will appear here once they are added to the platform.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
