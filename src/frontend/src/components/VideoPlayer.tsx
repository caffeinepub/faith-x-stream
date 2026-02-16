import { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import type { AdMedia } from '../backend';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  ads?: AdMedia[];
  isPremiumUser?: boolean;
  autoplay?: boolean;
  onAutoplayComplete?: () => void;
  isLiveTV?: boolean;
  isPremiumContent?: boolean;
  trailerUrl?: string;
  previewSeconds?: number;
}

export default function VideoPlayer({ 
  videoUrl, 
  title, 
  ads = [], 
  isPremiumUser = false,
  autoplay = false,
  onAutoplayComplete,
  isLiveTV = false,
  isPremiumContent = false,
  trailerUrl,
  previewSeconds = 45,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(autoplay);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasPlayedPreroll, setHasPlayedPreroll] = useState(false);
  const [hasAutoplayStarted, setHasAutoplayStarted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [playedMidrollMarkers, setPlayedMidrollMarkers] = useState<Set<number>>(new Set());
  const [quality, setQuality] = useState<'auto' | 'hd' | '4k'>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  // State for tracking main content time separately from ad time
  const [contentTimeBeforeAd, setContentTimeBeforeAd] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const availableQualities = isPremiumUser && isPremiumContent 
    ? ['auto', 'hd', '4k'] 
    : ['auto'];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.controls = false;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
  }, []);

  // Preview/autoplay logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoplay || hasAutoplayStarted) return;

    const attemptAutoplay = async () => {
      try {
        // Determine source: trailer if available, otherwise main video
        const sourceUrl = trailerUrl || videoUrl;
        const isPreview = !trailerUrl; // Preview mode if no trailer
        
        video.src = sourceUrl;
        video.muted = true;
        setIsMuted(true);
        setIsPreviewMode(isPreview);
        
        await video.play();
        setIsPlaying(true);
        setHasAutoplayStarted(true);
        
        // If preview mode (no trailer), set timer to stop after previewSeconds
        if (isPreview && previewSeconds > 0) {
          previewTimerRef.current = setTimeout(() => {
            if (video && !userInteracted) {
              video.pause();
              setIsPlaying(false);
              if (onAutoplayComplete) {
                onAutoplayComplete();
              }
            }
          }, previewSeconds * 1000);
        }
      } catch (error) {
        console.error('Autoplay failed:', error);
      }
    };

    const timer = setTimeout(attemptAutoplay, 100);
    return () => {
      clearTimeout(timer);
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [autoplay, hasAutoplayStarted, trailerUrl, videoUrl, previewSeconds, onAutoplayComplete, userInteracted]);

  // Unmute on user interaction
  useEffect(() => {
    if (!userInteracted) return;
    
    const video = videoRef.current;
    if (video && isMuted && autoplay) {
      video.muted = false;
      setIsMuted(false);
    }
    
    // Clear preview timer on interaction
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    
    // Switch to main content if in preview mode
    if (isPreviewMode && video) {
      video.src = videoUrl;
      video.currentTime = 0;
      setIsPreviewMode(false);
    }
  }, [userInteracted, isMuted, autoplay, isPreviewMode, videoUrl]);

  // Midroll ad scheduling - only for main content, not for Live TV
  useEffect(() => {
    if (isPlayingAd || isPremiumUser || ads.length === 0 || !duration || isLiveTV || isPreviewMode) return;

    const video = videoRef.current;
    if (!video) return;

    const midrollPosition = duration / 2;
    
    if (currentTime >= midrollPosition && !playedMidrollMarkers.has(midrollPosition)) {
      const midrollAds = ads.filter((_, index) => index > 0);
      if (midrollAds.length > 0) {
        setPlayedMidrollMarkers((prev) => new Set(prev).add(midrollPosition));
        playAd(1);
      }
    }
  }, [currentTime, duration, isPlayingAd, isPremiumUser, ads, playedMidrollMarkers, isLiveTV, isPreviewMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isPlayingAd) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const handleDurationChange = () => {
      if (!isPlayingAd) {
        setDuration(video.duration);
      }
    };
    
    const handleEnded = () => {
      if (isPlayingAd) {
        handleAdEnded();
      } else if (isPreviewMode && onAutoplayComplete) {
        setIsPlaying(false);
        onAutoplayComplete();
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isPlayingAd, isPreviewMode, onAutoplayComplete]);

  const playAd = async (adIndex: number) => {
    const video = videoRef.current;
    if (!video || !ads[adIndex] || isPremiumUser || isLiveTV) return;

    // Store current main content time before switching to ad
    setContentTimeBeforeAd(video.currentTime);
    
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      video.pause();
    }

    setIsPlayingAd(true);
    setCurrentAdIndex(adIndex);
    
    const adUrl = ads[adIndex].adFile.getDirectURL();
    video.src = adUrl;
    
    try {
      await video.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Ad playback failed:', error);
      handleAdEnded();
    }
  };

  const handleAdEnded = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlayingAd(false);
    
    // Restore main content and resume from saved time
    video.src = videoUrl;
    video.currentTime = contentTimeBeforeAd;
    
    try {
      await video.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume playback failed:', error);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);

    // Play preroll ad on first play (not for Live TV)
    if (!isPlaying && !hasPlayedPreroll && ads.length > 0 && !isPremiumUser && !isLiveTV) {
      setHasPlayedPreroll(true);
      await playAd(0);
      return;
    }

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Play failed:', error);
      }
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || isPlayingAd) return;
    setUserInteracted(true);
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || isPlayingAd) return;
    setUserInteracted(true);
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    setUserInteracted(true);

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    setUserInteracted(true);
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    setUserInteracted(true);
    video.volume = value[0];
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality as 'auto' | 'hd' | '4k');
    setShowQualityMenu(false);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const getQualityLabel = (q: string) => {
    switch (q) {
      case 'hd': return 'HD 1080p';
      case '4k': return '4K 2160p';
      default: return 'Auto';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#000000] group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
        webkit-playsinline="true"
      />

      {/* Logo Watermark - Top Left */}
      <div className="absolute top-6 left-6 z-10 opacity-80">
        <img
          src="/assets/4-removebg-preview.png"
          alt="X"
          className="h-16 w-auto"
        />
      </div>

      {/* Title - Top Center */}
      <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-10 transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <h1 className="text-white text-xl md:text-2xl font-bold text-center px-4">
          {title}
        </h1>
      </div>

      {/* Settings Icon - Top Right */}
      <div className={`absolute top-6 right-6 z-10 transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-12 w-12"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Ad Indicator */}
      {isPlayingAd && !isPremiumUser && (
        <div className="absolute top-6 right-24 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold z-10">
          AD {currentAdIndex + 1}/{ads.length}
        </div>
      )}

      {/* Premium Badge */}
      {isPremiumUser && isPremiumContent && (
        <div className="absolute top-24 left-6 bg-gradient-to-r from-[#cc0000] to-[#990000] text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
          <span>AD-FREE</span>
          {quality !== 'auto' && <span>• {quality.toUpperCase()}</span>}
        </div>
      )}

      {/* Muted Autoplay Indicator */}
      {autoplay && isMuted && isPlaying && !userInteracted && (
        <div className="absolute top-24 left-6 bg-black/70 backdrop-blur text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 z-10">
          <VolumeX className="h-4 w-4" />
          <span>Click to unmute</span>
        </div>
      )}

      {/* Center Play Controls */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-16">
          <button
            onClick={() => skip(-15)}
            disabled={isPlayingAd}
            className="w-24 h-24 rounded-full bg-black/50 backdrop-blur flex flex-col items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-12 w-12 text-white" />
            <span className="text-sm font-bold text-white mt-1">15</span>
          </button>
          <button
            onClick={togglePlay}
            className="w-32 h-32 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-16 w-16 text-white" />
            ) : (
              <Play className="h-16 w-16 text-white fill-white ml-2" />
            )}
          </button>
          <button
            onClick={() => skip(15)}
            disabled={isPlayingAd}
            className="w-24 h-24 rounded-full bg-black/50 backdrop-blur flex flex-col items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
          >
            <RotateCw className="h-12 w-12 text-white" />
            <span className="text-sm font-bold text-white mt-1">15</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-12">
          {/* Progress Bar - Red */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={isPlayingAd}
              className="cursor-pointer [&_[role=slider]]:bg-[#cc0000] [&_[role=slider]]:border-[#cc0000] [&_.bg-primary]:bg-[#cc0000]"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_.bg-primary]:bg-white"
                  />
                </div>
              </div>
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isPremiumUser && isPremiumContent && availableQualities.length > 1 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur rounded-lg p-2 min-w-[120px]">
                      <div className="text-xs text-white/70 px-2 py-1">Quality</div>
                      {availableQualities.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQualityChange(q)}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors ${
                            quality === q ? 'text-[#cc0000]' : 'text-white'
                          }`}
                        >
                          {getQualityLabel(q)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
