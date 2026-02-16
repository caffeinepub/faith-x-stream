import { useGetAllSeries } from '../hooks/useQueries';
import SeriesCard from '../components/SeriesCard';
import { Skeleton } from '../components/ui/skeleton';
import { Tv } from 'lucide-react';

export default function TVShowsPage() {
  const { data: series, isLoading } = useGetAllSeries();

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Tv className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">TV Shows</h1>
      </div>
      {series && series.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No TV shows available</p>
        </div>
      )}
    </div>
  );
}

