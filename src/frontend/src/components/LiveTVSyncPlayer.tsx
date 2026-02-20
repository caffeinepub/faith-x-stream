import { useEffect, useRef, useState, useCallback } from 'react';
import { useGetDynamicLiveChannelState } from '../hooks/useQueries';
import { Loader2, Radio } from 'lucide-react';
import { useActor } from '../hooks/useActor';

interface LiveTVSyncPlayerProps {
  channelId: string;
  onProgramChange?: (programId: string | null) => void;
}

export default function LiveTVSyncPlayer({ channelId, onProgramChange }: LiveTVSyncPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { actor, isFetching: actorFetching } = useActor();

  console.log('[LiveTVSyncPlayer] Render state:', { channelId, actor: !!actor, actorFetching });

  // Only enable query when actor is ready
  const {
    data: channelState,
    isLoading: stateLoading,
    error: stateError,
    refetch
  } = useGetDynamicLiveChannelState(channelId);

  useEffect(() => {
    if (stateError) {
      console.error('[LiveTVSyncPlayer] State error:', stateError);
      setError('Failed to load channel state');
    }
  }, [stateError]);

  // Notify parent of program changes
  useEffect(() => {
    if (channelState?.currentProgramId && onProgramChange) {
      console.log('[LiveTVSyncPlayer] Program changed:', channelState.currentProgramId);
      onProgramChange(channelState.currentProgramId);
    }
  }, [channelState?.currentProgramId, onProgramChange]);

  // Sync playback position with server
  const syncPlayback = useCallback(async () => {
    if (!videoRef.current || !channelState || actorFetching || !actor) {
      console.log('[LiveTVSyncPlayer] Skipping sync - not ready');
      return;
    }

    const video = videoRef.current;
    const serverPosition = Number(channelState.playbackPosition || 0);
    const currentPosition = video.currentTime;
    const drift = Math.abs(serverPosition - currentPosition);

    console.log('[LiveTVSyncPlayer] Sync check:', { serverPosition, currentPosition, drift });

    // Only correct if drift exceeds 3 seconds
    if (drift > 3) {
      console.log('[LiveTVSyncPlayer] Correcting drift:', drift);
      video.currentTime = serverPosition;
      lastSyncTimeRef.current = Date.now();
    }
  }, [channelState, actorFetching, actor]);

  // Set up periodic sync (every 7 seconds)
  useEffect(() => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Only set up sync if actor is ready
    if (!actorFetching && actor && channelState) {
      console.log('[LiveTVSyncPlayer] Setting up sync interval');
      syncIntervalRef.current = setInterval(() => {
        syncPlayback();
      }, 7000);
    }

    return () => {
      if (syncIntervalRef.current) {
        console.log('[LiveTVSyncPlayer] Clearing sync interval');
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncPlayback, actorFetching, actor, channelState]);

  // Initial playback position setup
  useEffect(() => {
    if (!videoRef.current || !channelState || actorFetching || !actor) {
      console.log('[LiveTVSyncPlayer] Skipping initial position - not ready');
      return;
    }

    const video = videoRef.current;
    const serverPosition = Number(channelState.playbackPosition || 0);

    console.log('[LiveTVSyncPlayer] Setting initial position:', serverPosition);
    video.currentTime = serverPosition;
    lastSyncTimeRef.current = Date.now();
  }, [channelState?.currentProgramId, actorFetching, actor]);

  const handlePlay = () => {
    console.log('[LiveTVSyncPlayer] Play');
    setIsPlaying(true);
    videoRef.current?.play();
  };

  const handlePause = () => {
    console.log('[LiveTVSyncPlayer] Pause');
    setIsPlaying(false);
    videoRef.current?.pause();
  };

  // Show loading state while actor is initializing or state is loading
  if (actorFetching || stateLoading || !channelState) {
    console.log('[LiveTVSyncPlayer] Loading...', { actorFetching, stateLoading, channelState: !!channelState });
    return (
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          <p className="text-white">Loading live channel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const currentProgram = channelState.currentProgram;
  if (!currentProgram) {
    return (
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <p className="text-white">No program currently scheduled</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        onPlay={handlePlay}
        onPause={handlePause}
      >
        <source src={`/api/video/${currentProgram.contentId}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
        <Radio className="h-4 w-4 text-white animate-pulse" />
        <span className="text-white text-sm font-semibold">LIVE</span>
      </div>

      {/* Loop mode indicator */}
      {channelState.isLooping && (
        <div className="absolute top-4 right-4 bg-yellow-600 px-3 py-1 rounded-full">
          <span className="text-white text-sm font-semibold">LOOP MODE</span>
        </div>
      )}
    </div>
  );
}
