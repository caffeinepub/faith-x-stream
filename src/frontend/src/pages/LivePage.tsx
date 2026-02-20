import { useState, useEffect } from 'react';
import { useGetAllLiveChannels, useGetAllVideos } from '../hooks/useQueries';
import LiveTVSyncPlayer from '../components/LiveTVSyncPlayer';
import LiveGuideGrid from '../components/live/LiveGuideGrid';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActor } from '../hooks/useActor';

export default function LivePage() {
  const { authStatus } = useAuth();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);

  console.log('[LivePage] Render state:', { authStatus, actorFetching, actor: !!actor, channelsLoading, videosLoading });

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      console.log('[LivePage] Auto-selecting first channel:', channels[0].id);
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const handleProgramChange = (programId: string | null) => {
    console.log('[LivePage] Program changed:', programId);
    setCurrentProgramId(programId);
  };

  // Show loading while auth is initializing or actor is not ready
  if (authStatus === 'initializing' || actorFetching || !actor) {
    console.log('[LivePage] Waiting for initialization...');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            <p className="text-white">Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (channelsLoading || videosLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            <p className="text-white">Loading channels...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Live TV</h1>
        <p className="text-gray-400">No live channels available at this time.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Live TV</h1>

      {/* Channel Selection */}
      <div className="mb-6 flex flex-wrap gap-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={selectedChannelId === channel.id ? 'default' : 'outline'}
            onClick={() => {
              console.log('[LivePage] Channel selected:', channel.id);
              setSelectedChannelId(channel.id);
            }}
            className={
              selectedChannelId === channel.id
                ? 'bg-red-600 hover:bg-red-700'
                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
            }
          >
            {channel.name}
          </Button>
        ))}
      </div>

      {/* Live TV Player - only render when actor is ready */}
      {selectedChannelId && actor && !actorFetching && (
        <div className="mb-8">
          <LiveTVSyncPlayer
            channelId={selectedChannelId}
            onProgramChange={handleProgramChange}
          />
        </div>
      )}

      {/* EPG Grid */}
      {selectedChannelId && videos && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">TV Guide</h2>
          <LiveGuideGrid
            channels={channels}
            videos={videos}
            selectedChannel={selectedChannelId}
            onChannelSelect={(channelId) => {
              console.log('[LivePage] EPG channel selected:', channelId);
              setSelectedChannelId(channelId);
            }}
          />
        </div>
      )}
    </div>
  );
}
