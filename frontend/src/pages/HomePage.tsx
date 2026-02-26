import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Play, ChevronRight, Tv, Film, Mic, Star } from 'lucide-react';
import { useGetAllVideos, useGetAllSeries, useGetAllBrands, useGetAllClips } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from '../components/HeroSection';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import ClipsShortsFeed from '../components/ClipsShortsFeed';
import BrandRail from '../components/BrandRail';
import type { VideoContent, TVSeries } from '../backend';

function ContentRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 w-40">
          <Skeleton className="w-40 h-56 rounded-lg" />
          <Skeleton className="w-32 h-3 mt-2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  // All queries run independently of auth state — public content
  const { data: allVideos = [], isLoading: videosLoading } = useGetAllVideos();
  const { data: allSeries = [], isLoading: seriesLoading } = useGetAllSeries();
  const { data: brands = [], isLoading: brandsLoading } = useGetAllBrands();

  const isLoading = videosLoading || seriesLoading;

  // Filter content by type
  const movies = allVideos.filter(
    (v) => !v.isClip && (v.contentType === 'movie' || v.contentType === 'film') && v.availableAsVOD
  );
  const podcasts = allVideos.filter(
    (v) => !v.isClip && v.contentType === 'podcast' && v.availableAsVOD
  );
  const originals = allVideos.filter((v) => !v.isClip && v.isOriginal && v.availableAsVOD);
  const originalSeries = allSeries.filter((s) => s.isOriginal);

  // Hero items: featured originals + series
  const heroContent = useMemo(() => {
    const items: (VideoContent | TVSeries)[] = [
      ...originals.slice(0, 3),
      ...originalSeries.slice(0, 2),
    ];
    if (items.length > 0) return items.slice(0, 5);
    // Fallback: any available VOD content
    return (allVideos.filter((v) => !v.isClip && v.availableAsVOD) as (VideoContent | TVSeries)[]).slice(0, 5);
  }, [originals, originalSeries, allVideos]);

  // Brand rails: resolve assigned content per brand
  const brandRails = useMemo(() => {
    return brands
      .map((brand) => {
        const films = brand.assignedFilms
          .map((id) => allVideos.find((v) => v.id === id))
          .filter((v): v is VideoContent => !!v);
        const series = brand.assignedSeries
          .map((id) => allSeries.find((s) => s.id === id))
          .filter((s): s is TVSeries => !!s);
        const clips = brand.assignedClips
          .map((id) => allVideos.find((v) => v.id === id))
          .filter((v): v is VideoContent => !!v);
        const total = films.length + series.length + clips.length;
        return { brand, films, series, clips, total };
      })
      .filter((d) => d.total > 0)
      .slice(0, 4);
  }, [brands, allVideos, allSeries]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {isLoading ? (
        <div className="relative w-full h-[60vh] min-h-[400px]">
          <Skeleton className="absolute inset-0 rounded-none" />
        </div>
      ) : heroContent.length > 0 ? (
        <HeroSection items={heroContent} />
      ) : (
        <div className="relative w-full h-[50vh] min-h-[360px] flex items-center justify-center bg-gradient-to-b from-[oklch(0.15_0.05_15)] to-background">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to FAITH X-Stream</h1>
            <p className="text-foreground/60 mb-6">Faith-based content for the whole family</p>
            <Link to="/live" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
              <Tv className="w-4 h-4" />
              Watch Live TV
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-10">
        {/* Movies Row */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Movies
            </h2>
            <Link to="/movies" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {videosLoading ? (
            <ContentRowSkeleton />
          ) : movies.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {movies.slice(0, 12).map((video) => (
                <div key={video.id} className="shrink-0 w-40">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/40 text-sm py-4">No movies available yet.</p>
          )}
        </section>

        {/* TV Shows Row */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Tv className="w-5 h-5 text-primary" />
              TV Shows
            </h2>
            <Link to="/tv-shows" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {seriesLoading ? (
            <ContentRowSkeleton />
          ) : allSeries.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {allSeries.slice(0, 12).map((s) => (
                <div key={s.id} className="shrink-0 w-40">
                  <SeriesCard series={s} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/40 text-sm py-4">No TV shows available yet.</p>
          )}
        </section>

        {/* Podcasts Row */}
        {(podcasts.length > 0 || videosLoading) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Podcasts
              </h2>
              <Link to="/podcasts" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {videosLoading ? (
              <ContentRowSkeleton />
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {podcasts.slice(0, 12).map((video) => (
                  <div key={video.id} className="shrink-0 w-40">
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Originals Row */}
        {(originals.length > 0 || originalSeries.length > 0 || isLoading) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                Originals
              </h2>
              <Link to="/originals" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <ContentRowSkeleton />
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {originals.slice(0, 8).map((video) => (
                  <div key={video.id} className="shrink-0 w-40">
                    <VideoCard video={video} />
                  </div>
                ))}
                {originalSeries.slice(0, 4).map((s) => (
                  <div key={s.id} className="shrink-0 w-40">
                    <SeriesCard series={s} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Brand Rails */}
        {!brandsLoading && brandRails.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-6">Networks &amp; Brands</h2>
            <div className="space-y-8">
              {brandRails.map(({ brand, films, series, clips }) => (
                <BrandRail
                  key={brand.id}
                  brand={brand}
                  films={films}
                  series={series}
                  clips={clips}
                />
              ))}
            </div>
          </section>
        )}

        {/* Clips / Shorts Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Short Clips
            </h2>
            <Link to="/clips" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ClipsShortsFeed />
        </section>
      </div>
    </div>
  );
}
