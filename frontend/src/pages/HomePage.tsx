import React, { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clapperboard } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ContentRow from '../components/ContentRow';
import BrandRail from '../components/BrandRail';
import ClipsShortsFeed from '../components/ClipsShortsFeed';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetAllVideos,
  useGetAllSeries,
  useGetAllBrands,
  useGetWatchHistory,
} from '../hooks/useQueries';
import { VideoContent, TVSeries, ContentType } from '../backend';

function isMovie(v: VideoContent) {
  return (
    !v.isClip &&
    v.availableAsVOD &&
    (v.contentType === ContentType.movie ||
      v.contentType === ContentType.film ||
      v.contentType === ContentType.documentary)
  );
}

function isPodcast(v: VideoContent) {
  return !v.isClip && v.availableAsVOD && v.contentType === ContentType.podcast;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: videos = [], isLoading: videosLoading } = useGetAllVideos();
  const { data: allSeries = [], isLoading: seriesLoading } = useGetAllSeries();
  const { data: brands = [], isLoading: brandsLoading } = useGetAllBrands();
  const { data: watchHistoryIds = [] } = useGetWatchHistory();

  const isLoading = videosLoading || seriesLoading;

  // Hero items: featured originals or first few VOD items
  const heroItems = useMemo(() => {
    const originals: (VideoContent | TVSeries)[] = [
      ...videos.filter((v) => v.isOriginal && v.availableAsVOD && !v.isClip),
      ...allSeries.filter((s) => s.isOriginal),
    ];
    if (originals.length > 0) return originals.slice(0, 5);
    const vodVideos = videos.filter((v) => v.availableAsVOD && !v.isClip);
    return ([...vodVideos, ...allSeries] as (VideoContent | TVSeries)[]).slice(0, 5);
  }, [videos, allSeries]);

  // Content rows
  const movies = useMemo(() => videos.filter(isMovie), [videos]);
  const podcasts = useMemo(() => videos.filter(isPodcast), [videos]);
  const originals = useMemo(
    () => [
      ...videos.filter((v) => v.isOriginal && !v.isClip && v.availableAsVOD),
      ...allSeries.filter((s) => s.isOriginal),
    ] as (VideoContent | TVSeries)[],
    [videos, allSeries]
  );

  // Continue watching
  const continueWatching = useMemo(() => {
    if (!watchHistoryIds.length) return [];
    const videoMap = new Map(videos.map((v) => [v.id, v]));
    return watchHistoryIds
      .map((id) => videoMap.get(id))
      .filter((v): v is VideoContent => !!v)
      .slice(0, 10);
  }, [watchHistoryIds, videos]);

  // Brand rails data
  const brandRailData = useMemo(() => {
    return brands
      .map((brand) => {
        const brandFilms = brand.assignedFilms
          .map((id) => videos.find((v) => v.id === id))
          .filter((v): v is VideoContent => !!v);
        const brandSeries = brand.assignedSeries
          .map((id) => allSeries.find((s) => s.id === id))
          .filter((s): s is TVSeries => !!s);
        const brandClips = brand.assignedClips
          .map((id) => videos.find((v) => v.id === id))
          .filter((v): v is VideoContent => !!v);
        const total = brandFilms.length + brandSeries.length + brandClips.length;
        return { brand, films: brandFilms, series: brandSeries, clips: brandClips, total };
      })
      .filter((d) => d.total > 0);
  }, [brands, videos, allSeries]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[70vh]" />
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-10 space-y-10">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="w-44 aspect-[2/3] rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      {heroItems.length > 0 && <HeroSection items={heroItems} />}

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-10 space-y-12">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <ContentRow
            title="Continue Watching"
            items={continueWatching}
            onSeeAll={() => navigate({ to: '/profile' })}
          />
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <ContentRow
            title="Movies"
            items={movies}
            onSeeAll={() => navigate({ to: '/movies' })}
          />
        )}

        {/* TV Shows */}
        {allSeries.length > 0 && (
          <ContentRow
            title="TV Shows"
            items={allSeries}
            onSeeAll={() => navigate({ to: '/tv-shows' })}
          />
        )}

        {/* Podcasts */}
        {podcasts.length > 0 && (
          <ContentRow
            title="Podcasts"
            items={podcasts}
            onSeeAll={() => navigate({ to: '/podcasts' })}
          />
        )}

        {/* Originals */}
        {originals.length > 0 && (
          <ContentRow
            title="F.A.I.T.H. Originals"
            items={originals}
            onSeeAll={() => navigate({ to: '/originals' })}
          />
        )}

        {/* Brand Rails */}
        {brandRailData.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-wide uppercase">
                Browse by Network
              </h2>
              <button
                onClick={() => navigate({ to: '/networks' })}
                className="text-xs font-semibold text-[oklch(0.55_0.24_25)] hover:text-[oklch(0.65_0.26_22)] uppercase tracking-widest transition-colors"
              >
                All Networks →
              </button>
            </div>
            <div className="space-y-10">
              {brandRailData.map(({ brand, films, series, clips }) => (
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
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-display text-xl lg:text-2xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <Clapperboard size={20} className="text-[oklch(0.55_0.24_25)]" />
              Clips &amp; Shorts
            </h2>
            <button
              onClick={() => navigate({ to: '/clips' })}
              className="text-xs font-semibold text-[oklch(0.55_0.24_25)] hover:text-[oklch(0.65_0.26_22)] uppercase tracking-widest transition-colors"
            >
              See All →
            </button>
          </div>
          <ClipsShortsFeed />
        </section>
      </div>
    </div>
  );
}
