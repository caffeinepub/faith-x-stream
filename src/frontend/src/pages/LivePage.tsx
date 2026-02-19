import { useState, useEffect } from 'react';
import { useGetAllLiveChannels, useGetAllVideos } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Radio, Grid3x3 } from 'lucide-react';
import LiveTVSyncPlayer from '../components/LiveTVSyncPlayer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import LiveGuideGrid from '../components/live/LiveGuideGrid';
import { useSessionStorageState } from '../hooks/useSessionStorageState';
import { useSearch } from '@tanstack/react-router';
import { getNextProgram } from '../utils/epg';

export default function LivePage() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const search = useSearch({ from: '/live' });
  const [selectedChannel, setSelectedChannel] = useSessionStorageState<string | null>('live-selected-channel', null);
  const [mode, setMode] = useState<'watch' | 'guide'>((search as any)?.mode === 'guide' ? 'guide' : 'watch');

  const isPremiumUser = !!identity && !!userProfile?.isPremium;

  // Auto-select first channel on load if no saved channel
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  const selectedChannelData = channels?.find(c => c.id === selectedChannel);

  if (channelsLoading || videosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black p-8">
        <div className="text-center py-16">
          <Radio className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">No Live Channels Available</h2>
          <p className="text-muted-foreground">Check back later for live programming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Radio className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Live TV</h1>
          </div>
          
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'watch' | 'guide')} className="w-auto">
            <TabsList>
              <TabsTrigger value="watch" className="gap-2">
                <Radio className="h-4 w-4" />
                Watch
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                TV Guide
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {mode === 'watch' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Channel List */}
            <div className="lg:col-span-1">
              <div className="gradient-card border-2 border-primary/30 rounded-lg p-4 space-y-2 max-h-[600px] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Channels</h2>
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedChannel === channel.id
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-black/40 hover:bg-black/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {channel.logo && (
                        <img
                          src={channel.logo.getDirectURL()}
                          alt={channel.name}
                          className="w-8 h-8 object-contain rounded"
                        />
                      )}
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player */}
            <div className="lg:col-span-3">
              {selectedChannel ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <LiveTVSyncPlayer key={selectedChannel} channelId={selectedChannel} />
                  </div>

                  <div className="gradient-card border-2 border-primary/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedChannelData?.name}</h2>
                        <p className="text-muted-foreground">Synchronized Live TV</p>
                      </div>
                      <Badge variant="destructive" className="bg-red-600">
                        LIVE
                      </Badge>
                    </div>

                    {(() => {
                      const nextProgram = selectedChannelData ? getNextProgram(selectedChannelData, videos || []) : null;
                      return nextProgram ? (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <p className="text-sm text-muted-foreground mb-2">Up Next:</p>
                          <p className="font-semibold">{nextProgram.title}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Radio className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                    <p className="text-xl font-semibold">Select a Channel</p>
                    <p className="text-muted-foreground mt-2">Choose a channel from the list to start watching</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <LiveGuideGrid
            channels={channels}
            videos={videos || []}
            selectedChannel={selectedChannel}
            onChannelSelect={(channelId) => {
              setSelectedChannel(channelId);
              setMode('watch');
            }}
          />
        )}
      </div>
    </div>
  );
}
