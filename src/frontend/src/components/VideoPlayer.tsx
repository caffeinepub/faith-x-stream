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
  liveSeekSeconds?: number;
  liveSeekToken?: number;
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
  liveSeekSeconds = 0,
  liveSeekToken = 0,
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
  const lastSeekTokenRef = useRef<number>(-1);
  const hasPerformedInitialSeekRef = useRef(false);
  
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

  // Live TV schedule-aligned seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLiveTV) return;
    
    // Only seek if we have a new seek token and metadata is loaded
    if (liveSeekToken !== lastSeekTokenRef.current && video.readyState >= 1) {
      const performSeek = () => {
        if (video.duration && liveSeekSeconds > 0) {
          // Clamp seek position to video duration
          const seekPosition = Math.min(liveSeekSeconds, video.duration - 0.5);
          video.currentTime = seekPosition;
          hasPerformedInitialSeekRef.current = true;
        }
        lastSeekTokenRef.current = liveSeekToken;
      };

      if (video.readyState >= 1) {
        performSeek();
      } else {
        const handleLoadedMetadata = () => {
          performSeek();
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  }, [isLiveTV, liveSeekSeconds, liveSeekToken]);

  // Reset seek tracking when video source changes
  useEffect(() => {
    hasPerformedInitialSeekRef.current = false;
  }, [videoUrl]);

  const prerollAds = ads.filter(ad => {
    const adAssignment = ad as any;
    return !adAssignment.position || adAssignment.position === 0;
  });

  const midrollAds = ads.filter(ad => {
    const adAssignment = ad as any;
    return adAssignment.position && adAssignment.position > 0 && adAssignment.position < 100;
  });

  const postrollAds = ads.filter(ad => {
    const adAssignment = ad as any;
    return adAssignment.position === 100;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isPlayingAd) {
        setCurrentTime(video.currentTime);
        
        // Check for midroll ads (disabled for Live TV)
        if (!isLiveTV && midrollAds.length > 0 && !isPremiumUser) {
          midrollAds.forEach((ad: any) => {
            const triggerTime = (ad.position / 100) * video.duration;
            const marker = Math.floor(triggerTime);
            
            if (
              video.currentTime >= triggerTime &&
              video.currentTime < triggerTime + 1 &&
              !playedMidrollMarkers.has(marker)
            ) {
              setContentTimeBeforeAd(video.currentTime);
              setPlayedMidrollMarkers(prev => new Set(prev).add(marker));
              playAd(ad);
            }
          });
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      if (isPlayingAd) {
        handleAdEnded();
      } else {
        // Play postroll ads
        if (postrollAds.length > 0 && !isPremiumUser) {
          setContentTimeBeforeAd(video.currentTime);
          playAd(postrollAds[0]);
        } else {
          setIsPlaying(false);
          if (onAutoplayComplete) {
            onAutoplayComplete();
          }
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isPlayingAd, ads, isPremiumUser, playedMidrollMarkers, onAutoplayComplete, isLiveTV, midrollAds, postrollAds]);

  // Play preroll ads
  useEffect(() => {
    if (!hasPlayedPreroll && prerollAds.length > 0 && !isPremiumUser && !autoplay) {
      const video = videoRef.current;
      if (video && video.readyState >= 1) {
        setContentTimeBeforeAd(0);
        playAd(prerollAds[0]);
        setHasPlayedPreroll(true);
      }
    }
  }, [hasPlayedPreroll, prerollAds, isPremiumUser, autoplay]);

  const playAd = (ad: AdMedia) => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlayingAd(true);
    setCurrentAdIndex(0);
    video.src = ad.adFile.getDirectURL();
    video.play();
  };

  const handleAdEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlayingAd(false);
    video.src = videoUrl;
    video.currentTime = contentTimeBeforeAd;
    video.play();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || isPlayingAd) return;

    setUserInteracted(true);
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);

    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || isPlayingAd) return;

    setUserInteracted(true);
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        onClick={togglePlay}
      />

      {isPlayingAd && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
          Ad Playing
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {!isPlayingAd && (
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="mb-4"
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {!isPlayingAd && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
              </>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />

            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {availableQualities.length > 1 && (
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[100px]">
                    {availableQualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuality(q as any);
                          setShowQualityMenu(false);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded text-sm ${
                          quality === q ? 'bg-primary text-white' : 'text-white hover:bg-white/20'
                        }`}
                      >
                        {q.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
