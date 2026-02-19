import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSeriesById } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Play, Star, ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function SeriesDetailPage() {
  const { seriesId } = useParams({ from: '/series/$seriesId' });
  const navigate = useNavigate();
  const { data: series, isLoading } = useGetSeriesById(seriesId);

  const handlePlayEpisode = (seriesId: string, seasonId: string, episodeId: string) => {
    navigate({ to: '/watch-episode/$seriesId/$seasonId/$episodeId', params: { seriesId, seasonId, episodeId } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-[60vh] mb-8" />
        <div className="max-w-7xl mx-auto px-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Series not found</p>
          <Button onClick={() => navigate({ to: '/tv-shows' })}>
            Back to TV Shows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={series.thumbnailUrl.getDirectURL()}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/tv-shows' })}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to TV Shows
            </Button>
            
            <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
              {series.title}
              {series.isOriginal && <Star className="h-8 w-8 text-secondary fill-secondary" />}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              {series.description}
            </p>
          </div>
        </div>
      </div>

      {/* Seasons and Episodes */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-6">Seasons & Episodes</h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {series.seasons.map((season) => (
            <AccordionItem
              key={season.id}
              value={season.id}
              className="border border-primary/20 rounded-lg overflow-hidden bg-black/40"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-primary/10">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold">
                    Season {String(season.seasonNumber)}: {season.title}
                  </span>
                  {season.isOriginal && <Star className="h-5 w-5 text-secondary fill-secondary" />}
                  <span className="text-sm text-muted-foreground">
                    ({season.episodes.length} episode{season.episodes.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3 mt-2">
                  {season.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-black/60 border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <img
                        src={episode.thumbnailUrl.getDirectURL()}
                        alt={episode.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          Episode {String(episode.episodeNumber)}: {episode.title}
                          {episode.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {episode.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {episode.isPremium && (
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                          {episode.isFirstEpisode && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              Free Preview
                            </span>
                          )}
                          <span className="text-xs bg-muted/20 text-muted-foreground px-2 py-0.5 rounded">
                            {String(episode.runtimeMinutes)} min
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePlayEpisode(series.id, season.id, episode.id)}
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {series.seasons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No seasons available</p>
          </div>
        )}
      </div>
    </div>
  );
}
