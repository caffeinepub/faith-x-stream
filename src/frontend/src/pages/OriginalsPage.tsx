import { useGetAllVideos, useGetAllSeries } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Star } from 'lucide-react';
import { ContentType } from '../backend';

export default function OriginalsPage() {
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const { data: series, isLoading: seriesLoading } = useGetAllSeries();

  const originalVideos = videos?.filter((v) => v.isOriginal && !v.isClip) || [];
  const originalSeries = series?.filter((s) => s.isOriginal) || [];

  // Separate by content nature
  const films = originalVideos.filter(v => 
    v.contentType === ContentType.film || 
    v.contentType === ContentType.faithBased || 
    v.contentType === ContentType.music
  );
  
  const documentaries = originalVideos.filter(v => v.contentType === ContentType.documentary);
  const educational = originalVideos.filter(v => v.contentType === ContentType.educational);

  const isLoading = videosLoading || seriesLoading;

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

  const hasOriginals = originalVideos.length > 0 || originalSeries.length > 0;

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Star className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">FAITH X-Stream Originals</h1>
      </div>
      {hasOriginals ? (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="gradient-card border-2 border-primary/30">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground">All Originals</TabsTrigger>
            <TabsTrigger value="films" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground">Films</TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground">Series</TabsTrigger>
            <TabsTrigger value="documentaries" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground">Documentaries</TabsTrigger>
            <TabsTrigger value="educational" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground">Educational</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {originalSeries.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Original Series</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {originalSeries.map((s) => (
                    <SeriesCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            )}
            {films.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Original Films</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {films.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
            {documentaries.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Original Documentaries</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {documentaries.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
            {educational.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Original Educational</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {educational.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="films">
            {films.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {films.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No original films available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="series">
            {originalSeries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {originalSeries.map((s) => (
                  <SeriesCard key={s.id} series={s} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No original series available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentaries">
            {documentaries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {documentaries.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No original documentaries available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="educational">
            {educational.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {educational.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No original educational content available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No originals available</p>
        </div>
      )}
    </div>
  );
}
