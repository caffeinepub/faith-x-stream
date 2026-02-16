import { useState, useEffect } from 'react';
import { useGetAllLiveChannels, useGetAllVideos } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Radio } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAllAdMedia, useGetAllAdAssignments } from '../hooks/useQueries';
import type { AdMedia } from '../backend';

export default function LivePage() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: videos, isLoading: videosLoading } = useGetAllVideos();
  const { data: adMedia } = useGetAllAdMedia();
  const { data: adAssignments } = useGetAllAdAssignments();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [programKey, setProgramKey] = useState(0);

  const isPremiumUser = !!identity && !!userProfile?.isPremium;

  // Auto-select first channel on load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  // Update current program based on looping schedule
  useEffect(() => {
    if (!selectedChannel || !channels || !videos) return;

    const channel = channels.find((c) => c.id === selectedChannel);
    if (!channel || channel.schedule.length === 0) {
      setCurrentProgram(null);
      return;
    }

    const updateProgram = () => {
      const now = Date.now();
      
      // Calculate total schedule duration
      const scheduleDuration = channel.schedule.reduce((total, s) => {
        return total + (Number(s.endTime) - Number(s.startTime));
      }, 0);

      if (scheduleDuration === 0) {
        setCurrentProgram(null);
        return;
      }

      // Find position in looping schedule
      const scheduleStart = Number(channel.schedule[0].startTime);
      const elapsedTime = now - scheduleStart;
      const positionInLoop = elapsedTime % scheduleDuration;

      // Find current program in the loop
      let accumulatedTime = 0;
      for (const scheduleItem of channel.schedule) {
        const itemDuration = Number(scheduleItem.endTime) - Number(scheduleItem.startTime);
        if (positionInLoop >= accumulatedTime && positionInLoop < accumulatedTime + itemDuration) {
          const video = videos.find((v) => v.id === scheduleItem.contentId);
          if (video) {
            setCurrentProgram({ schedule: scheduleItem, video });
            setProgramKey((prev) => prev + 1);
          }
          return;
        }
        accumulatedTime += itemDuration;
      }
    };

    updateProgram();
    const interval = setInterval(updateProgram, 5000);

    return () => clearInterval(interval);
  }, [selectedChannel, channels, videos]);

  const handleChannelSwitch = (channelId: string) => {
    setSelectedChannel(channelId);
    setProgramKey((prev) => prev + 1);
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
      <div className="flex items-center gap-3 mb-8">
        <Radio className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Live TV</h1>
      </div>

      {channels && channels.length > 0 ? (
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

          {/* Channel List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Channels</h2>
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelSwitch(channel.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedChannel === channel.id
                      ? 'bg-gradient-to-br from-primary/30 to-secondary/20 border-2 border-primary shadow-md'
                      : 'gradient-card border-2 border-primary/30 hover:border-primary/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img
                        src={channel.logo.getDirectURL()}
                        alt={channel.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <Radio className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{channel.name}</h3>
                        {selectedChannel === channel.id && (
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs shadow-md">
                            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                            LIVE
                          </Badge>
                        )}
                        {channel.isOriginal && (
                          <Badge variant="outline" className="text-xs border-primary/60 text-primary">Original</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {channel.schedule.length} programs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No live channels available</p>
        </div>
      )}
    </div>
  );
}
