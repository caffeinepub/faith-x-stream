import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { useActor } from '../hooks/useActor';
import type { LiveChannelState, AdLocation } from '../backend';
import { ExternalBlob } from '../backend';

interface LiveTVSyncPlayerProps {
  channelId: string;
}

export default function LiveTVSyncPlayer({ channelId }: LiveTVSyncPlayerProps) {
  const { actor } = useActor();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousProgramIdRef = useRef<string | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const lastSeekTimeRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [syncData, setSyncData] = useState<LiveChannelState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [contentTimeBeforeAd, setContentTimeBeforeAd] = useState(0);
  const [playedAdMarkers, setPlayedAdMarkers] = useState<Set<number>>(new Set());
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch sync data from backend
  const fetchSyncData = async (): Promise<LiveChannelState | null> => {
    if (!actor) return null;
    try {
      const state = await actor.getDynamicLiveChannelState(channelId);
      return state;
    } catch (err) {
      console.error('Failed to fetch sync data:', err);
      return null;
    }
  };

  // Initialize player on channel load
  useEffect(() => {
    const initialize = async () => {
      if (!actor) return;

      setIsInitializing(true);
      setError(null);

      try {
        // Fetch initial sync data
        const state = await fetchSyncData();
        if (!state) {
          setError('Failed to load channel state');
          setIsInitializing(false);
          return;
        }

        setSyncData(state);
        lastSyncTimeRef.current = Date.now();

        // Load video if program is available
        if (state.currentProgramId && state.currentProgram) {
          const video = videoRef.current;
          if (!video) return;

          // Fetch video content
          const videoContent = await actor.getVideoById(state.currentProgramId);
          if (!videoContent) {
            setError('Video content not found');
            setIsInitializing(false);
            return;
          }

          previousProgramIdRef.current = state.currentProgramId;

          // Set video source
          video.src = videoContent.videoUrl.getDirectURL();

          // Wait for metadata to load
          await new Promise<void>((resolve) => {
            const handleLoadedMetadata = () => {
              video.removeEventListener('loadedmetadata', handleLoadedMetadata);
              resolve();
            };
            if (video.readyState >= 1) {
              resolve();
            } else {
              video.addEventListener('loadedmetadata', handleLoadedMetadata);
            }
          });

          // Seek to current position
          const playbackPosition = Number(state.playbackPosition || 0);
          video.currentTime = Math.min(playbackPosition, video.duration - 0.5);

          // Start playback
          try {
            await video.play();
            setIsPlaying(true);
          } catch (playErr) {
            console.error('Autoplay failed:', playErr);
          }
        }

        setIsInitializing(false);

        // Start polling for sync updates
        startSyncPolling();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize player');
        setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      stopSyncPolling();
    };
  }, [channelId, actor]);

  // Start sync polling
  const startSyncPolling = () => {
    stopSyncPolling();
    syncIntervalRef.current = setInterval(async () => {
      await performSync();
    }, 7000); // Poll every 7 seconds
  };

  // Stop sync polling
  const stopSyncPolling = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  // Perform sync check and drift correction
  const performSync = async () => {
    if (!actor || isTransitioningRef.current || isPlayingAd) return;

    const state = await fetchSyncData();
    if (!state) return;

    const now = Date.now();
    const timeSinceLastSync = (now - lastSyncTimeRef.current) / 1000;
    lastSyncTimeRef.current = now;

    setSyncData(state);

    // Check for program transition
    if (state.currentProgramId && state.currentProgramId !== previousProgramIdRef.current) {
      await handleProgramTransition(state);
      return;
    }

    // Drift correction
    const video = videoRef.current;
    if (!video || !state.playbackPosition || video.readyState < 3) return;

    const serverPosition = Number(state.playbackPosition);
    const expectedPosition = serverPosition + timeSinceLastSync;
    const drift = Math.abs(video.currentTime - expectedPosition);

    // Only correct if drift exceeds threshold and not recently seeked
    const DRIFT_THRESHOLD = 3; // 3 seconds
    const MIN_SEEK_INTERVAL = 5000; // 5 seconds between seeks
    const timeSinceLastSeek = now - lastSeekTimeRef.current;

    if (drift > DRIFT_THRESHOLD && timeSinceLastSeek > MIN_SEEK_INTERVAL) {
      const seekPosition = Math.min(expectedPosition, video.duration - 0.5);
      video.currentTime = seekPosition;
      lastSeekTimeRef.current = now;
    }
  };

  // Handle program transition
  const handleProgramTransition = async (state: LiveChannelState) => {
    if (!actor || !state.currentProgramId) return;

    isTransitioningRef.current = true;
    setIsInitializing(true);

    try {
      const videoContent = await actor.getVideoById(state.currentProgramId);
      if (!videoContent) {
        setError('New program not found');
        isTransitioningRef.current = false;
        setIsInitializing(false);
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      previousProgramIdRef.current = state.currentProgramId;
      playedAdMarkers.clear();

      // Change video source
      video.src = videoContent.videoUrl.getDirectURL();

      // Wait for metadata
      await new Promise<void>((resolve) => {
        const handleLoadedMetadata = () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          resolve();
        };
        if (video.readyState >= 1) {
          resolve();
        } else {
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
        }
      });

      // Seek to position
      const playbackPosition = Number(state.playbackPosition || 0);
      video.currentTime = Math.min(playbackPosition, video.duration - 0.5);

      // Resume playback if was playing
      if (isPlaying) {
        await video.play();
      }

      setIsInitializing(false);
      isTransitioningRef.current = false;
    } catch (err) {
      console.error('Program transition error:', err);
      setError('Failed to transition to new program');
      isTransitioningRef.current = false;
      setIsInitializing(false);
    }
  };

  // Handle ad playback for Live TV
  const playLiveAd = async (adUrls: ExternalBlob[]) => {
    const video = videoRef.current;
    if (!video || adUrls.length === 0) return;

    setIsPlayingAd(true);
    setCurrentAdIndex(0);
    video.pause();

    const playAdSequence = async (index: number) => {
      if (index >= adUrls.length) {
        // Restore main content
        setIsPlayingAd(false);
        const state = await fetchSyncData();
        if (state && state.currentProgramId) {
          const videoContent = await actor?.getVideoById(state.currentProgramId);
          if (videoContent) {
            video.src = videoContent.videoUrl.getDirectURL();
            await new Promise<void>((resolve) => {
              const handleLoadedMetadata = () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                resolve();
              };
              if (video.readyState >= 1) {
                resolve();
              } else {
                video.addEventListener('loadedmetadata', handleLoadedMetadata);
              }
            });
            const playbackPosition = Number(state.playbackPosition || 0);
            video.currentTime = Math.min(playbackPosition, video.duration - 0.5);
            await video.play();
          }
        }
        return;
      }

      const adUrl = adUrls[index].getDirectURL();
      video.src = adUrl;
      setCurrentAdIndex(index);

      await new Promise<void>((resolve) => {
        const handleEnded = () => {
          video.removeEventListener('ended', handleEnded);
          resolve();
        };
        video.addEventListener('ended', handleEnded);
        video.play();
      });

      await playAdSequence(index + 1);
    };

    await playAdSequence(0);
  };

  // Monitor for scheduled ad breaks
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlayingAd || !syncData?.currentProgram?.adLocations) return;

    const handleTimeUpdate = () => {
      const adLocations = syncData.currentProgram?.adLocations || [];
      adLocations.forEach((adLoc: AdLocation) => {
        const triggerTime = Number(adLoc.position);
        const marker = Math.floor(triggerTime);

        if (
          video.currentTime >= triggerTime &&
          video.currentTime < triggerTime + 1 &&
          !playedAdMarkers.has(marker) &&
          adLoc.adUrls.length > 0
        ) {
          setPlayedAdMarkers((prev) => new Set(prev).add(marker));
          playLiveAd(adLoc.adUrls);
        }
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [syncData, isPlayingAd, playedAdMarkers]);

  // Control handlers
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
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

  if (error) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        webkit-playsinline="true"
      />

      {/* Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">Loading Live TV...</p>
          </div>
        </div>
      )}

      {/* Loop Mode Indicator */}
      {syncData?.isLooping && (
        <Badge
          variant="secondary"
          className="absolute top-4 right-4 bg-black/60 text-white border border-primary/30"
        >
          Loop Mode
        </Badge>
      )}

      {/* Ad Overlay */}
      {isPlayingAd && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded font-semibold text-sm">
          Ad {currentAdIndex + 1}
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
            disabled={isPlayingAd}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="w-24"
            />
          </div>

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
  );
}
