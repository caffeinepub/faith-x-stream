import { useEffect, useState } from 'react';
import { useSearch as useTanStackSearch } from '@tanstack/react-router';
import { useSearch } from '../hooks/useQueries';
import { Search, Film, Tv, Video, Building2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useNavigate } from '@tanstack/react-router';

export default function SearchResultsPage() {
  const searchParams = useTanStackSearch({ from: '/search' });
  const query = (searchParams as any)?.q || '';
  const searchMutation = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      searchMutation.mutate(query);
    }
  }, [query]);

  const results = searchMutation.data || [];

  const films = results.filter(r => r.resultType === 'video' && !r.isPremium);
  const series = results.filter(r => r.resultType === 'series');
  const clips = results.filter(r => r.resultType === 'clip');
  const brands = results.filter(r => r.resultType === 'brand');

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
        <div className="container mx-auto">
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Search Query</h2>
            <p className="text-muted-foreground">Please enter a search term</p>
          </div>
        </div>
      </div>
    );
  }

  if (searchMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>

        {films.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Film className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Films</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {films.map((result) => (
                <VideoCard
                  key={result.id}
                  video={{
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    thumbnailUrl: result.thumbnailUrl!,
                    isPremium: result.isPremium,
                    isOriginal: result.isOriginal,
                    isClip: false,
                    videoUrl: (result as any).videoUrl,
                    contentType: (result as any).contentType,
                    eligibleForLive: false,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Tv className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Series</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {series.map((result) => (
                <SeriesCard
                  key={result.id}
                  series={{
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    thumbnailUrl: result.thumbnailUrl!,
                    isOriginal: result.isOriginal,
                    seasons: [],
                    contentType: (result as any).contentType,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {clips.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Clips</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {clips.map((result) => (
                <VideoCard
                  key={result.id}
                  video={{
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    thumbnailUrl: result.thumbnailUrl!,
                    isPremium: result.isPremium,
                    isOriginal: result.isOriginal,
                    isClip: true,
                    videoUrl: (result as any).videoUrl,
                    contentType: (result as any).contentType,
                    eligibleForLive: false,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {brands.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Networks & Brands</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brands.map((result) => (
                <Card
                  key={result.id}
                  className="gradient-card border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-all"
                  onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: result.id } })}
                >
                  <CardContent className="p-6">
                    {result.thumbnailUrl && (
                      <img
                        src={result.thumbnailUrl.getDirectURL()}
                        alt={result.title}
                        className="w-full h-32 object-contain mb-4"
                      />
                    )}
                    <h3 className="font-bold text-lg mb-2">{result.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
