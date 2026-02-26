import { useState, useEffect } from 'react';
import { useGetAllLiveChannels, useGetAllVideos } from '../hooks/useQueries';
import VideoPlayer from '../components/VideoPlayer';
import LiveGuideGrid from '../components/live/LiveGuideGrid';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { getCurrentProgramWithOffset } from '../utils/epg';

export default function LivePage() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

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

  const selectedChannel = channels.find(ch => ch.id === selectedChannelId);
  const currentProgramInfo = selectedChannel ? getCurrentProgramWithOffset(selectedChannel, videos || []) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Live TV</h1>

      {/* Channel Selection */}
      <div className="mb-6 flex flex-wrap gap-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={selectedChannelId === channel.id ? 'default' : 'outline'}
            onClick={() => setSelectedChannelId(channel.id)}
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

      {/* Live TV Player */}
      {selectedChannelId && currentProgramInfo && currentProgramInfo.video && (
        <div className="mb-8">
          <VideoPlayer
            videoUrl={currentProgramInfo.video.videoUrl.getDirectURL()}
            title={currentProgramInfo.video.title}
            isLiveTV={true}
            liveSeekSeconds={currentProgramInfo.offsetSeconds}
            liveSeekToken={Date.now()}
            liveAdLocations={currentProgramInfo.schedule?.adLocations || []}
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
            onChannelSelect={(channelId) => setSelectedChannelId(channelId)}
          />
        </div>
      )}
    </div>
  );
}
