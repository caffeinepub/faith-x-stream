import { useState, useEffect, useRef } from 'react';
import { useGetAllLiveChannels, useGetAllVideos } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Radio, Grid3x3, ChevronUp, ChevronDown } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAllAdMedia, useGetAllAdAssignments } from '../hooks/useQueries';
import type { AdMedia } from '../backend';
import LiveGuideGrid from '../components/live/LiveGuideGrid';
import { useSessionStorageState } from '../hooks/useSessionStorageState';
import { useSearch } from '@tanstack/react-router';
import { getCurrentProgram, getNextProgram, getCurrentProgramWithOffset } from '../utils/epg';

export default function LivePage() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const { data: adMedia } = useGetAllAdMedia();
  const { data: adAssignments } = useGetAllAdAssignments();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const search = useSearch({ from: '/live' });
  const [selectedChannel, setSelectedChannel] = useSessionStorageState<string | null>('live-selected-channel', null);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [programKey, setProgramKey] = useState(0);
  const [liveSeekToken, setLiveSeekToken] = useState(0);
  const [initialSeekSeconds, setInitialSeekSeconds] = useState(0);
  const [mode, setMode] = useState<'watch' | 'guide'>((search as any)?.mode === 'guide' ? 'guide' : 'watch');
  const lastProgramIdRef = useRef<string | null>(null);

  const isPremiumUser = !!identity && !!userProfile?.isPremium;

  // Auto-select first channel on load if no saved channel
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  // Validate saved channel still exists
  useEffect(() => {
    if (selectedChannel && channels && !channels.find(c => c.id === selectedChannel)) {
      setSelectedChannel(channels.length > 0 ? channels[0].id : null);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  // Update current program based on looping schedule
  useEffect(() => {
    if (!selectedChannel || !channels || !videos) return;

    const channel = channels.find((c) => c.id === selectedChannel);
    if (!channel || channel.schedule.length === 0) {
      setCurrentProgram(null);
      lastProgramIdRef.current = null;
      return;
    }

    const updateProgram = () => {
      const programInfo = getCurrentProgramWithOffset(channel, videos);
      
      if (!programInfo) {
        setCurrentProgram(null);
        lastProgramIdRef.current = null;
        return;
      }

      // Create a unique identifier for this program instance
      const programInstanceId = `${programInfo.video.id}-${programInfo.programStartTime}`;
      
      // Only update state if the program actually changed
      if (lastProgramIdRef.current !== programInstanceId) {
        setCurrentProgram({
          schedule: programInfo.schedule,
          video: programInfo.video,
        });
        setInitialSeekSeconds(programInfo.offsetSeconds);
        setLiveSeekToken((prev) => prev + 1);
        setProgramKey((prev) => prev + 1);
        lastProgramIdRef.current = programInstanceId;
      }
    };

    updateProgram();
    const interval = setInterval(updateProgram, 5000);

    return () => clearInterval(interval);
  }, [selectedChannel, channels, videos]);

  const handleChannelSwitch = (channelId: string) => {
    setSelectedChannel(channelId);
    lastProgramIdRef.current = null; // Force program update on channel switch
    setProgramKey((prev) => prev + 1);
  };

  const handleChannelUp = () => {
    if (!channels || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === selectedChannel);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : channels.length - 1;
    handleChannelSwitch(channels[prevIndex].id);
  };

  const handleChannelDown = () => {
    if (!channels || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === selectedChannel);
    const nextIndex = currentIndex < channels.length - 1 ? currentIndex + 1 : 0;
    handleChannelSwitch(channels[nextIndex].id);
  };

  // Get ads for current channel
  const getChannelAds = (): AdMedia[] => {
    if (isPremiumUser || !currentProgram || !adMedia || !adAssignments) return [];

    const channelAssignments = adAssignments.filter(
      (a) => a.scope === 'liveChannel' && a.targetId === selectedChannel && a.showOnFreeOnly
    );
    const globalAssignments = adAssignments.filter(
      (a) => a.scope === 'global' && a.showOnFreeOnly
    );

    const allAssignments = [...channelAssignments, ...globalAssignments];
    const adIds = allAssignments.flatMap((a) => a.adIds);
    return adMedia.filter((ad) => adIds.includes(ad.id));
  };

  const isLoading = channelsLoading || videosLoading;

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="w-full aspect-video mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const selectedChannelData = channels?.find((c) => c.id === selectedChannel);

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Live TV</h1>
        </div>
        
        {/* Mode Toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'watch' | 'guide')} className="w-auto">
          <TabsList className="bg-[#4d0000] border-2 border-primary/30">
            <TabsTrigger value="watch" className="data-[state=active]:bg-primary">
              <Radio className="h-4 w-4 mr-2" />
              Watch
            </TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-primary">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Guide
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {channels && channels.length > 0 ? (
        <Tabs value={mode} className="w-full">
          <TabsContent value="watch" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Live Player */}
              <div className="lg:col-span-2">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-primary/30">
                  {currentProgram ? (
                    <VideoPlayer
                      key={programKey}
                      videoUrl={currentProgram.video.videoUrl.getDirectURL()}
                      title={currentProgram.video.title}
                      isPremiumUser={isPremiumUser}
                      ads={getChannelAds()}
                      autoplay={true}
                      isLiveTV={true}
                      liveSeekSeconds={initialSeekSeconds}
                      liveSeekToken={liveSeekToken}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gradient-card">
                      <div className="text-center">
                        <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No program currently airing</p>
                      </div>
                    </div>
                  )}
                </div>
                {currentProgram && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{currentProgram.video.title}</h2>
                      {currentProgram.schedule.isOriginal && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md">Original</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{currentProgram.video.description}</p>
                  </div>
                )}
              </div>

              {/* Channel List with Now/Next */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Channels</h2>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleChannelUp}
                      className="bg-[#4d0000] border-primary/30 hover:bg-primary hover:border-primary"
                      title="Previous Channel"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleChannelDown}
                      className="bg-[#4d0000] border-primary/30 hover:bg-primary hover:border-primary"
                      title="Next Channel"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {channels.map((channel) => {
                    const nowProgram = getCurrentProgram(channel, videos || []);
                    const nextProgram = getNextProgram(channel, videos || []);
                    
                    return (
                      <div
                        key={channel.id}
                        onClick={() => handleChannelSwitch(channel.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedChannel === channel.id
                            ? 'bg-gradient-to-br from-primary/30 to-secondary/20 border-2 border-primary shadow-md'
                            : 'gradient-card border-2 border-primary/30 hover:border-primary/60 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {channel.logo ? (
                            <img
                              src={channel.logo.getDirectURL()}
                              alt={channel.name}
                              className="w-12 h-12 object-contain flex-shrink-0"
                            />
                          ) : (
                            <Radio className="h-12 w-12 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{channel.name}</h3>
                              {selectedChannel === channel.id && (
                                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs shadow-md flex-shrink-0">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                                  LIVE
                                </Badge>
                              )}
                              {channel.isOriginal && (
                                <Badge variant="outline" className="text-xs border-primary/60 text-primary flex-shrink-0">Original</Badge>
                              )}
                            </div>
                            {nowProgram && (
                              <div className="text-xs space-y-0.5">
                                <div className="text-primary font-semibold truncate">
                                  Now: {nowProgram.title}
                                </div>
                                {nextProgram && (
                                  <div className="text-muted-foreground truncate">
                                    Next: {nextProgram.title}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="mt-0">
            <LiveGuideGrid
              channels={channels}
              videos={videos || []}
              selectedChannel={selectedChannel}
              onChannelSelect={handleChannelSwitch}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No live channels available</p>
        </div>
      )}
    </div>
  );
}
