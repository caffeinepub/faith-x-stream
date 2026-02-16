import { useSearch } from '@tanstack/react-router';
import { useSearch as useSearchQuery } from '../hooks/useQueries';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Skeleton } from '../components/ui/skeleton';
import { Search, Film, Tv, Video, Building2 } from 'lucide-react';
import type { SearchResult } from '../backend';

export default function SearchResultsPage() {
  const searchParams = useSearch({ from: '/search' });
  const query = (searchParams as { q?: string }).q || '';
  const navigate = useNavigate();
  const searchMutation = useSearchQuery();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await searchMutation.mutateAsync(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const films = results.filter(r => r.resultType === 'video');
  const seriesResults = results.filter(r => r.resultType === 'series');
  const clips = results.filter(r => r.resultType === 'clip');
  const brands = results.filter(r => r.resultType === 'brand');

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-64 mb-8 bg-[#1a0000]" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-[#1a0000]" />
          ))}
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-[#660000] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Search FAITH X-Stream</h2>
          <p className="text-white/70">Enter a search term to find content</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">
          Search Results for "{query}"
        </h1>
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-[#660000] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-white/70">Try searching with different keywords</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12 space-y-12">
      <h1 className="text-3xl font-bold">
        Search Results for "{query}"
      </h1>

      {films.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Film className="h-6 w-6 text-[#cc0000]" />
            Films ({films.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
                  contentType: 'faithBased' as any,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {seriesResults.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#cc0000]" />
            Series ({seriesResults.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {seriesResults.map((result) => (
              <SeriesCard
                key={result.id}
                series={{
                  id: result.id,
                  title: result.title,
                  description: result.description,
                  thumbnailUrl: result.thumbnailUrl!,
                  isOriginal: result.isOriginal,
                  seasons: [],
                  contentType: 'tvSeries' as any,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {clips.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Video className="h-6 w-6 text-[#cc0000]" />
            Clips ({clips.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
                  contentType: 'faithBased' as any,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#cc0000]" />
            Networks & Brands ({brands.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {brands.map((result) => (
              <div
                key={result.id}
                onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: result.id } })}
                className="group cursor-pointer rounded-lg overflow-hidden bg-[#1a0000] border-2 border-[#660000] hover:border-[#cc0000] transition-all duration-300"
              >
                <div className="aspect-square relative bg-gradient-to-br from-[#330000] to-[#1a0000] flex items-center justify-center p-4">
                  {result.thumbnailUrl ? (
                    <img
                      src={result.thumbnailUrl.getDirectURL()}
                      alt={result.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-[#660000]" />
                  )}
                </div>
                <div className="p-3 bg-[#1a0000]">
                  <h3 className="font-semibold text-sm text-white text-center truncate">{result.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
