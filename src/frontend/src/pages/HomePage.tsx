import { useGetAllVideos, useGetAllSeries, useGetAllBrands, useGetAllAdMedia } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import SeriesCard from '../components/SeriesCard';
import ClipsShortsFeed from '../components/ClipsShortsFeed';
import { Skeleton } from '../components/ui/skeleton';
import { Building2, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { Badge } from '../components/ui/badge';
import type { VideoContent, TVSeries, AdMedia } from '../backend';

type FeaturedItem = {
  type: 'video' | 'series' | 'ad';
  data: VideoContent | TVSeries | AdMedia;
  label: string;
};

export default function HomePage() {
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const { data: series, isLoading: seriesLoading } = useGetAllSeries();
  const { data: brands, isLoading: brandsLoading } = useGetAllBrands();
  const { data: adMedia, isLoading: adsLoading } = useGetAllAdMedia();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const isLoading = videosLoading || seriesLoading || brandsLoading || adsLoading;

  // Featured slideshow content: new/upcoming videos, series, and ad spots
  const featuredContent: FeaturedItem[] = [];
  
  if (videos && videos.length > 0) {
    const newVideos = videos.filter(v => !v.isClip).slice(0, 3);
    newVideos.forEach(video => {
      featuredContent.push({ type: 'video', data: video, label: 'NEW' });
    });
  }

  if (series && series.length > 0) {
    const newSeries = series.slice(0, 2);
    newSeries.forEach(s => {
      featuredContent.push({ type: 'series', data: s, label: 'UPCOMING' });
    });
  }

  if (adMedia && adMedia.length > 0) {
    const featuredAds = adMedia.slice(0, 2);
    featuredAds.forEach(ad => {
      featuredContent.push({ type: 'ad', data: ad, label: 'SPONSORED' });
    });
  }

  // Get preview URL and determine if it's a video or image
  const getPreviewInfo = (item: FeaturedItem): { url: string | null; isVideo: boolean } => {
    if (item.type === 'video') {
      const video = item.data as VideoContent;
      // Priority: trailer > previewClip > main video (first 30-60 seconds simulated)
      if (video.trailerUrl) {
        return { url: video.trailerUrl.getDirectURL(), isVideo: true };
      } else if (video.previewClipUrl) {
        return { url: video.previewClipUrl.getDirectURL(), isVideo: true };
      } else {
        // Use main video as fallback (in production, this would be a 30-60 second clip)
        return { url: video.videoUrl.getDirectURL(), isVideo: true };
      }
    } else if (item.type === 'series') {
      const seriesData = item.data as TVSeries;
      // Priority: trailer > previewClip
      if (seriesData.trailerUrl) {
        return { url: seriesData.trailerUrl.getDirectURL(), isVideo: true };
      } else if (seriesData.previewClipUrl) {
        return { url: seriesData.previewClipUrl.getDirectURL(), isVideo: true };
      }
      return { url: null, isVideo: false };
    } else if (item.type === 'ad') {
      const ad = item.data as AdMedia;
      const isVideoAd = ad.mediaType.toLowerCase().includes('video');
      return { 
        url: ad.adFile.getDirectURL(), 
        isVideo: isVideoAd 
      };
    }
    return { url: null, isVideo: false };
  };

  // Auto-cycle slideshow every 8 seconds
  useEffect(() => {
    if (featuredContent.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredContent.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredContent.length]);

  // Handle video preview playback for visible slide only
  useEffect(() => {
    if (!videoRef.current) return;

    const currentItem = featuredContent[currentSlide];
    if (!currentItem) return;

    const previewInfo = getPreviewInfo(currentItem);

    if (previewInfo.url && previewInfo.isVideo && videoRef.current) {
      videoRef.current.src = previewInfo.url;
      videoRef.current.load();
      
      // Attempt autoplay (muted by default for browser compatibility)
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(() => {
            // Autoplay failed, likely due to browser policy
            setIsVideoPlaying(false);
          });
      }
    } else {
      setIsVideoPlaying(false);
    }

    // Cleanup: pause video when navigating away from slide
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    };
  }, [currentSlide, featuredContent]);

  const recommendedVideos = videos?.filter(v => !v.isClip).slice(3, 13) || [];
  const recommendedSeries = series?.slice(2, 12) || [];
  const featuredBrands = brands?.slice(0, 6) || [];

  const handleSlideClick = (item: FeaturedItem) => {
    if (item.type === 'video') {
      navigate({ to: '/watch/$contentId', params: { contentId: item.data.id } });
    } else if (item.type === 'series') {
      navigate({ to: '/series/$seriesId', params: { seriesId: item.data.id } });
    }
  };

  const handleVideoInteraction = () => {
    // Unmute on user interaction
    if (videoRef.current && isVideoPlaying) {
      videoRef.current.muted = false;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full h-[70vh] bg-[#1a0000]" />
        <div className="container px-4 md:px-8">
          <Skeleton className="h-8 w-48 mb-4 bg-[#1a0000]" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-[#1a0000]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Featured Slideshow with Enhanced Autoplay */}
      {featuredContent.length > 0 && (
        <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
          {featuredContent.map((item, index) => {
            const previewInfo = getPreviewInfo(item);
            const thumbnailUrl = item.type === 'video'
              ? (item.data as VideoContent).thumbnailUrl.getDirectURL()
              : item.type === 'series'
              ? (item.data as TVSeries).thumbnailUrl.getDirectURL()
              : (item.data as AdMedia).adFile.getDirectURL();

            const isCurrentSlide = currentSlide === index;

            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  isCurrentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="absolute inset-0">
                  {isCurrentSlide && previewInfo.url && previewInfo.isVideo ? (
                    // Video content (ads, trailers, or preview clips) - autoplay
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      poster={thumbnailUrl}
                      onClick={handleVideoInteraction}
                      onMouseEnter={handleVideoInteraction}
                    />
                  ) : (
                    // Image content (image ads or content without video preview) - static display
                    <img
                      src={thumbnailUrl}
                      alt={item.type === 'ad' ? (item.data as AdMedia).description : (item.data as VideoContent | TVSeries).title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Full Logo Overlay - Top Left */}
                <div className="absolute top-8 left-8 z-10">
                  <img
                    src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
                    alt="FAITH X-Stream"
                    className="h-16 md:h-20 w-auto opacity-90"
                  />
                </div>

                {/* Content Label */}
                <div className="absolute top-8 right-8 z-10">
                  <Badge className="bg-[#cc0000] text-white text-lg px-4 py-2 font-bold shadow-xl">
                    {item.label}
                  </Badge>
                </div>

                <div className="relative container px-4 md:px-8 h-full flex flex-col justify-end pb-16 md:pb-24">
                  <div className="max-w-2xl space-y-4 md:space-y-6">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
                      {item.type === 'ad' ? (item.data as AdMedia).description : (item.data as VideoContent | TVSeries).title}
                    </h1>
                    {item.type !== 'ad' && (
                      <p className="text-base md:text-lg lg:text-xl text-white/90 line-clamp-3">
                        {(item.data as VideoContent | TVSeries).description}
                      </p>
                    )}
                    {item.type !== 'ad' && (
                      <button
                        onClick={() => handleSlideClick(item)}
                        className="bg-white hover:bg-white/90 text-black font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl"
                      >
                        {item.type === 'video' ? 'Watch Now' : 'View Series'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slideshow Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-[#cc0000] w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Manual Navigation Arrows */}
          {featuredContent.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredContent.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Clips/Shorts Section */}
      <section className="relative">
        <div className="container px-4 md:px-8 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Film className="h-8 w-8 text-[#cc0000]" />
              SHORTS
            </h2>
            <Link
              to="/clips"
              className="text-[#cc0000] hover:text-[#ff0000] font-semibold transition-colors duration-300 flex items-center gap-2"
            >
              View All
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <ClipsShortsFeed />
      </section>

      <div className="container px-4 md:px-8 space-y-12">
        {recommendedVideos.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              RECOMMENDED
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {recommendedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {recommendedSeries.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              POPULAR SERIES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {recommendedSeries.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          </section>
        )}

        {featuredBrands.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3">
              <Building2 className="h-8 w-8 text-[#cc0000]" />
              NETWORKS & BRANDS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {featuredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => navigate({ to: '/networks/$brandId', params: { brandId: brand.id } })}
                  className="group cursor-pointer rounded-lg overflow-hidden bg-[#1a0000] border-2 border-[#660000] hover:border-[#cc0000] transition-all duration-300"
                >
                  <div className="aspect-square relative bg-gradient-to-br from-[#330000] to-[#1a0000] flex items-center justify-center p-4">
                    {brand.logo ? (
                      <img
                        src={brand.logo.getDirectURL()}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-16 w-16 text-[#660000]" />
                    )}
                  </div>
                  <div className="p-3 bg-[#1a0000]">
                    <h3 className="font-semibold text-sm text-white text-center truncate">{brand.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
