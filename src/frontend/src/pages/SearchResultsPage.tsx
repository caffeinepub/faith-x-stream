import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Card, CardContent } from '../components/ui/card';
import { Search, Film, Tv, Scissors, Building2 } from 'lucide-react';
import type { SearchResult } from '../backend';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const { q } = useSearch({ from: '/search' });
  const { actor } = useActor();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!actor || !q) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await actor.search(q);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [actor, q]);

  const films = results.filter(r => r.resultType === 'video' || r.resultType === 'film');
  const series = results.filter(r => r.resultType === 'series');
  const clips = results.filter(r => r.resultType === 'clip');
  const brands = results.filter(r => r.resultType === 'brand');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Searching...</p>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Enter a search query to find content</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No results found for "{q}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">Found {results.length} result(s) for "{q}"</p>
        </div>

        {films.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              Films
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                    videoUrl: null as any,
                    contentType: null as any,
                    eligibleForLive: false,
                    availableAsVOD: true,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {series.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Tv className="h-6 w-6 text-primary" />
              Series
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {series.map((result) => (
                <SeriesCard
                  key={result.id}
                  series={{
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    thumbnailUrl: result.thumbnailUrl!,
                    isOriginal: result.isOriginal,
                    contentType: null as any,
                    seasons: [],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {clips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              Clips
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                    videoUrl: null as any,
                    contentType: null as any,
                    eligibleForLive: false,
                    availableAsVOD: true,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {brands.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Networks & Brands
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brands.map((result) => (
                <Card
                  key={result.id}
                  className="gradient-card border-2 border-primary/30 hover:border-primary/60 transition-all cursor-pointer"
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
                    <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
