import { useParams } from '@tanstack/react-router';
import { useGetBrandById, useGetChannelsByBrand, useGetAllVideos, useGetAllSeries } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import { Building2, Film, Tv, Video } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Brand, VideoContent, TVSeries } from '../backend';

export default function BrandDetailPage() {
  const { brandId } = useParams({ from: '/networks/$brandId' });
  const navigate = useNavigate();
  const getBrandById = useGetBrandById();
  const getChannelsByBrand = useGetChannelsByBrand();
  const { data: allVideos } = useGetAllVideos();
  const { data: allSeries } = useGetAllSeries();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandContent, setBrandContent] = useState<{
    films: VideoContent[];
    series: TVSeries[];
    clips: VideoContent[];
  }>({ films: [], series: [], clips: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setIsLoading(true);
        const brandData = await getBrandById.mutateAsync(brandId);
        setBrand(brandData);

        if (brandData && allVideos && allSeries) {
          const channelsData = await getChannelsByBrand.mutateAsync(brandId);
          
          const films = allVideos.filter(v => 
            !v.isClip && channelsData.films.includes(v.id)
          );
          const clips = allVideos.filter(v => 
            v.isClip && channelsData.clips.includes(v.id)
          );
          const seriesData = allSeries.filter(s => 
            channelsData.series.includes(s.id)
          );

          setBrandContent({ films, series: seriesData, clips });
        }
      } catch (error) {
        console.error('Failed to fetch brand:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId, allVideos, allSeries]);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="w-full h-64 mb-8 bg-[#1a0000]" />
        <Skeleton className="h-8 w-64 mb-4 bg-[#1a0000]" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-[#1a0000]" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <Button onClick={() => navigate({ to: '/networks' })}>
            Back to Networks
          </Button>
        </div>
      </div>
    );
  }

  const hasContent = brandContent.films.length > 0 || brandContent.series.length > 0 || brandContent.clips.length > 0;

  return (
    <div className="min-h-screen">
      {/* Brand Header */}
      <div className="relative bg-gradient-to-b from-[#330000] to-[#1a0000] py-16">
        <div className="container px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#660000] to-[#330000] flex items-center justify-center p-6 border-2 border-[#cc0000]">
              {brand.logo ? (
                <img
                  src={brand.logo.getDirectURL()}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="h-24 w-24 text-[#cc0000]" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{brand.name}</h1>
              <p className="text-lg text-white/80 max-w-3xl">{brand.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container px-4 md:px-8 py-12 space-y-12">
        {!hasContent && (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-[#660000] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Content Available</h2>
            <p className="text-white/70">This brand doesn't have any content yet</p>
          </div>
        )}

        {brandContent.films.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Film className="h-8 w-8 text-[#cc0000]" />
              Films
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {brandContent.films.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {brandContent.series.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Tv className="h-8 w-8 text-[#cc0000]" />
              Series
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {brandContent.series.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </section>
        )}

        {brandContent.clips.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Video className="h-8 w-8 text-[#cc0000]" />
              Clips
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {brandContent.clips.map((clip) => (
                <VideoCard key={clip.id} video={clip} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
