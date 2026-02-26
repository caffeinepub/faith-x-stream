import { Star, Film, Tv, BookOpen, Clapperboard } from 'lucide-react';
import { useGetAllVideos, useGetAllSeries } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Star className="w-14 h-14 text-foreground/20 mb-4" />
      <h3 className="text-lg font-semibold text-foreground/50 mb-1">No {label} yet</h3>
      <p className="text-foreground/30 text-sm">Original {label.toLowerCase()} will appear here once added.</p>
    </div>
  );
}

export default function OriginalsPage() {
  const { data: allVideos = [], isLoading: videosLoading } = useGetAllVideos();
  const { data: allSeries = [], isLoading: seriesLoading } = useGetAllSeries();

  const isLoading = videosLoading || seriesLoading;

  const originalFilms = allVideos.filter(
    (v) => !v.isClip && v.isOriginal && (v.contentType === 'film' || v.contentType === 'movie') && v.availableAsVOD
  );
  const originalSeries = allSeries.filter((s) => s.isOriginal);
  const originalDocs = allVideos.filter(
    (v) => !v.isClip && v.isOriginal && v.contentType === 'documentary' && v.availableAsVOD
  );
  const originalEducational = allVideos.filter(
    (v) => !v.isClip && v.isOriginal && v.contentType === 'educational' && v.availableAsVOD
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-7 h-7 text-primary fill-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">FAITH X-Stream Originals</h1>
            <p className="text-foreground/60 text-sm mt-0.5">
              Exclusive content produced by FAITH X-Stream
            </p>
          </div>
        </div>

        <Tabs defaultValue="films">
          <TabsList className="mb-6 bg-card border border-border/40">
            <TabsTrigger value="films" className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Films
              {!isLoading && originalFilms.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {originalFilms.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              Series
              {!isLoading && originalSeries.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {originalSeries.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documentaries" className="flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" />
              Documentaries
              {!isLoading && originalDocs.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {originalDocs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="educational" className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Educational
              {!isLoading && originalEducational.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {originalEducational.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="films">
            {isLoading ? <GridSkeleton /> : originalFilms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {originalFilms.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            ) : <EmptyState label="Films" />}
          </TabsContent>

          <TabsContent value="series">
            {isLoading ? <GridSkeleton /> : originalSeries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {originalSeries.map((s) => <SeriesCard key={s.id} series={s} />)}
              </div>
            ) : <EmptyState label="Series" />}
          </TabsContent>

          <TabsContent value="documentaries">
            {isLoading ? <GridSkeleton /> : originalDocs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {originalDocs.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            ) : <EmptyState label="Documentaries" />}
          </TabsContent>

          <TabsContent value="educational">
            {isLoading ? <GridSkeleton /> : originalEducational.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {originalEducational.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            ) : <EmptyState label="Educational" />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
