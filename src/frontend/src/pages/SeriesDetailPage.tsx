import { useParams } from '@tanstack/react-router';
import { useGetSeriesById } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Play, Star, Crown } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { TVSeries, ContentType } from '../backend';

export default function SeriesDetailPage() {
  const { seriesId } = useParams({ from: '/series/$seriesId' });
  const navigate = useNavigate();
  const getSeriesById = useGetSeriesById();
  const [series, setSeries] = useState<TVSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const result = await getSeriesById.mutateAsync(seriesId);
        setSeries(result);
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [seriesId]);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="w-full h-96 mb-8 bg-[#1a0000]" />
        <Skeleton className="h-8 w-64 mb-4 bg-[#1a0000]" />
        <Skeleton className="h-24 w-full bg-[#1a0000]" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
          <Button onClick={() => navigate({ to: '/tv-shows' })}>
            Back to TV Shows
          </Button>
        </div>
      </div>
    );
  }

  const totalEpisodes = series.seasons.reduce((sum, season) => sum + season.episodes.length, 0);

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case 'documentary':
        return 'Documentary';
      case 'faithBased':
        return 'Faith-Based';
      case 'music':
        return 'Music';
      case 'educational':
        return 'Educational';
      case 'news':
        return 'News';
      case 'tvSeries':
        return 'TV Series';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={series.thumbnailUrl.getDirectURL()}
            alt={series.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="relative container px-4 md:px-8 h-full flex flex-col justify-end pb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 flex items-center gap-3">
              {series.title}
              {series.isOriginal && (
                <Star className="h-8 w-8 md:h-10 md:w-10 text-secondary fill-secondary" />
              )}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">{series.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
                {getContentTypeLabel(series.contentType)}
              </span>
              <span className="text-white/80">
                {series.seasons.length} Season{series.seasons.length !== 1 ? 's' : ''}
              </span>
              <span className="text-white/80">
                {totalEpisodes} Episode{totalEpisodes !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes */}
      <div className="container px-4 md:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Seasons & Episodes</h2>
        <Accordion type="single" collapsible className="space-y-4">
          {series.seasons.map((season) => (
            <AccordionItem
              key={season.id}
              value={season.id}
              className="border-2 border-[#660000] rounded-lg overflow-hidden bg-[#1a0000]"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-[#330000] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">
                    Season {Number(season.seasonNumber)}
                  </span>
                  {season.isOriginal && (
                    <Star className="h-5 w-5 text-secondary fill-secondary" />
                  )}
                  <span className="text-sm text-white/60">
                    ({season.episodes.length} episodes)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3 mt-3">
                  {season.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-[#330000] hover:bg-[#4d0000] transition-all duration-300 cursor-pointer group"
                      onClick={() =>
                        navigate({
                          to: '/watch-episode/$seriesId/$seasonId/$episodeId',
                          params: {
                            seriesId: series.id,
                            seasonId: season.id,
                            episodeId: episode.id,
                          },
                        })
                      }
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={episode.thumbnailUrl.getDirectURL()}
                          alt={episode.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {Number(episode.episodeNumber)}. {episode.title}
                          </h3>
                          {episode.isPremium && (
                            <Crown className="h-4 w-4 text-secondary flex-shrink-0" />
                          )}
                          {episode.isOriginal && (
                            <Star className="h-4 w-4 text-secondary fill-secondary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">{episode.description}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {Number(episode.runtimeMinutes)} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
