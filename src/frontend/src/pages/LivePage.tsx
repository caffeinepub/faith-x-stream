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
import type { AdMedia, AdLocation } from '../backend';
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
  const [liveAdLocations, setLiveAdLocations] = useState<AdLocation[]>([]);
  const [mode, setMode] = useState<'watch' | 'guide'>((search as any)?.mode === 'guide' ? 'guide' : 'watch');
  const lastProgramIdRef = useRef<string | null>(null);

  const isPremiumUser = !!identity && !!userProfile?.isPremium;

  // Auto-select first channel on load if no saved channel
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel, setSelectedChannel]);

  // Poll for current program
  useEffect(() => {
    if (!selectedChannel || !channels || !videos) return;

    const updateCurrentProgram = () => {
      const channel = channels.find(c => c.id === selectedChannel);
      if (!channel) return;

      const programInfo = getCurrentProgramWithOffset(channel, videos);
      
      if (programInfo) {
        const { schedule, video, offsetSeconds } = programInfo;
        
        // Only update if the program ID has changed
        if (schedule.contentId !== lastProgramIdRef.current) {
          lastProgramIdRef.current = schedule.contentId;
          setCurrentProgram({ program: schedule, video });
          setInitialSeekSeconds(offsetSeconds);
          setLiveSeekToken(prev => prev + 1);
          setProgramKey(prev => prev + 1);
          
          // Set ad locations for this program
          if (schedule.adLocations && schedule.adLocations.length > 0) {
            setLiveAdLocations(schedule.adLocations);
          } else {
            setLiveAdLocations([]);
          }
        }
      } else {
        if (lastProgramIdRef.current !== null) {
          lastProgramIdRef.current = null;
          setCurrentProgram(null);
          setLiveAdLocations([]);
        }
      }
    };

    updateCurrentProgram();
    const interval = setInterval(updateCurrentProgram, 5000);

    return () => clearInterval(interval);
  }, [selectedChannel, channels, videos]);

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
              {currentProgram ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <VideoPlayer
                      key={programKey}
                      videoUrl={currentProgram.video.videoUrl.getDirectURL()}
                      title={currentProgram.video.title}
                      isPremiumUser={isPremiumUser}
                      isLiveTV={true}
                      liveSeekSeconds={initialSeekSeconds}
                      liveSeekToken={liveSeekToken}
                      liveAdLocations={!isPremiumUser ? liveAdLocations : []}
                    />
                  </div>

                  <div className="gradient-card border-2 border-primary/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{currentProgram.video.title}</h2>
                        <p className="text-muted-foreground">{currentProgram.video.description}</p>
                      </div>
                      <Badge variant="destructive" className="bg-red-600">
                        LIVE
                      </Badge>
                    </div>

                    {(() => {
                      const nextProgram = getNextProgram(selectedChannelData!, videos || []);
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
                    <p className="text-xl font-semibold">No Program Currently Airing</p>
                    <p className="text-muted-foreground mt-2">Check the TV Guide for upcoming shows</p>
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
