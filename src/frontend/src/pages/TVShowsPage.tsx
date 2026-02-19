import { useGetAllSeries } from '../hooks/useQueries';
import SeriesCard from '../components/SeriesCard';
import { Tv } from 'lucide-react';

export default function TVShowsPage() {
  const { data: allSeries, isLoading } = useGetAllSeries();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading TV shows...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Tv className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">TV Shows</h1>
        </div>

        {allSeries && allSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No TV shows available</p>
          </div>
        )}
      </div>
    </div>
  );
}
