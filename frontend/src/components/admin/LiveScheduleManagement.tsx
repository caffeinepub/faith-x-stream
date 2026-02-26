import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Radio, Plus, Trash2, Clock, Tv, Star, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { LiveChannel, VideoContent, ScheduledContent, ContentType } from '../../backend';

// Content types eligible for live scheduling (no clips, no podcasts)
const LIVE_ELIGIBLE_CONTENT_TYPES: string[] = [
  ContentType.movie,
  ContentType.film,
  ContentType.tvSeries,
  ContentType.series,
  ContentType.documentary,
  ContentType.faithBased,
  ContentType.educational,
  ContentType.news,
  ContentType.music,
];

function isEligibleForLiveSchedule(video: VideoContent): boolean {
  if (video.isClip) return false;
  if (video.contentType === ContentType.podcast) return false;
  const ct = video.contentType as string;
  return LIVE_ELIGIBLE_CONTENT_TYPES.includes(ct);
}

function formatTime(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getContentTypeLabel(ct: string): string {
  const labels: Record<string, string> = {
    movie: 'Movie',
    film: 'Film',
    tvSeries: 'TV Series',
    series: 'Series',
    documentary: 'Documentary',
    faithBased: 'Faith-Based',
    educational: 'Educational',
    news: 'News',
    music: 'Music',
  };
  return labels[ct] || ct;
}

export default function LiveScheduleManagement() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [startTimeInput, setStartTimeInput] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [isOriginal, setIsOriginal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingSlot, setRemovingSlot] = useState<string | null>(null);

  const { data: channels = [], isLoading: channelsLoading } = useQuery<LiveChannel[]>({
    queryKey: ['liveChannels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveChannels();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: allVideos = [], isLoading: videosLoading } = useQuery<VideoContent[]>({
    queryKey: ['allVideos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !actorFetching,
  });

  // Filter to only live-eligible content (no clips, no podcasts)
  const eligibleVideos = allVideos.filter(isEligibleForLiveSchedule);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  const updateLiveChannel = useMutation({
    mutationFn: async (channel: LiveChannel) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateLiveChannel(channel.id, channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveChannels'] });
    },
  });

  const handleAddProgram = async () => {
    if (!selectedChannel || !selectedVideoId) {
      setAddError('Please select a channel and a video.');
      return;
    }
    if (!startTimeInput) {
      setAddError('Please enter a start time.');
      return;
    }

    setAddError(null);

    const selectedVideo = eligibleVideos.find((v) => v.id === selectedVideoId);
    if (!selectedVideo) {
      setAddError('Selected video not found.');
      return;
    }

    // Parse start time
    const startDate = new Date(startTimeInput);
    const startTimeNs = BigInt(startDate.getTime()) * BigInt(1_000_000);

    // Duration: use durationMinutes input (admin-specified or derived)
    const durationMs = durationMinutes * 60 * 1000;
    const endTimeNs = startTimeNs + BigInt(durationMs) * BigInt(1_000_000);

    const newSlot: ScheduledContent = {
      contentId: selectedVideoId,
      startTime: startTimeNs,
      endTime: endTimeNs,
      adLocations: [],
      isOriginal,
    };

    const updatedChannel: LiveChannel = {
      ...selectedChannel,
      schedule: [...selectedChannel.schedule, newSlot],
    };

    try {
      await updateLiveChannel.mutateAsync(updatedChannel);
      setShowAddProgram(false);
      setSelectedVideoId('');
      setStartTimeInput('');
      setDurationMinutes(60);
      setIsOriginal(false);
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add program.');
    }
  };

  const handleRemoveProgram = async (slotIndex: number) => {
    if (!selectedChannel) return;
    const key = `${selectedChannelId}-${slotIndex}`;
    setRemovingSlot(key);
    try {
      const updatedSchedule = selectedChannel.schedule.filter((_, i) => i !== slotIndex);
      const updatedChannel: LiveChannel = {
        ...selectedChannel,
        schedule: updatedSchedule,
      };
      await updateLiveChannel.mutateAsync(updatedChannel);
    } finally {
      setRemovingSlot(null);
    }
  };

  // When a video is selected, auto-fill duration if possible
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    // Default to 90 minutes for movies/films, 45 for series episodes, 30 for others
    const video = eligibleVideos.find((v) => v.id === videoId);
    if (video) {
      const ct = video.contentType as string;
      if (ct === 'movie' || ct === 'film') setDurationMinutes(120);
      else if (ct === 'tvSeries' || ct === 'series') setDurationMinutes(45);
      else setDurationMinutes(60);
    }
  };

  const sortedSchedule = selectedChannel
    ? [...selectedChannel.schedule].sort((a, b) => Number(a.startTime) - Number(b.startTime))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Live TV Programming</h2>
            <p className="text-sm text-muted-foreground">
              Schedule programs for live channels. Only movies, films, TV series, and similar content are eligible — clips and podcasts are excluded.
            </p>
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <Label className="text-sm text-muted-foreground mb-2 block">Select Channel</Label>
              {channelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose a live channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No channels available
                      </SelectItem>
                    ) : (
                      channels.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          <div className="flex items-center gap-2">
                            {ch.isOriginal && <Star className="w-3 h-3 text-yellow-400" />}
                            {ch.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedChannelId && (
              <Button
                onClick={() => setShowAddProgram(true)}
                className="mt-6"
                disabled={videosLoading || eligibleVideos.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligible Content Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-300">
          <strong>Scheduling Rules:</strong> Only movies, films, TV series, documentaries, educational, news, faith-based, and music content can be scheduled for live TV.
          Clips and podcasts are excluded from live scheduling.
          {eligibleVideos.length > 0 && (
            <span className="ml-1">({eligibleVideos.length} eligible videos available)</span>
          )}
        </div>
      </div>

      {/* Schedule Display */}
      {selectedChannel ? (
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              {selectedChannel.name} — Schedule
              {selectedChannel.isOriginal && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 text-xs">
                  <Star className="w-3 h-3" />
                  Original
                </Badge>
              )}
              <Badge variant="outline" className="ml-auto text-xs">
                {sortedSchedule.length} program{sortedSchedule.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSchedule.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Tv className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No programs scheduled yet.</p>
                <p className="text-xs mt-1">Click "Add Program" to schedule content for this channel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedSchedule.map((slot, index) => {
                  const video = allVideos.find((v) => v.id === slot.contentId);
                  const startMs = Number(slot.startTime) / 1_000_000;
                  const endMs = Number(slot.endTime) / 1_000_000;
                  const durationMins = Math.round((endMs - startMs) / 60000);
                  const slotKey = `${selectedChannelId}-${index}`;
                  const isRemoving = removingSlot === slotKey;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-background/40 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
                    >
                      <div className="w-16 text-center shrink-0">
                        <p className="text-xs font-mono text-primary">{formatTime(slot.startTime)}</p>
                        <p className="text-xs text-muted-foreground">—</p>
                        <p className="text-xs font-mono text-muted-foreground">{formatTime(slot.endTime)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {video?.title || slot.contentId}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {video && (
                            <Badge variant="outline" className="text-xs">
                              {getContentTypeLabel(video.contentType as string)}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(durationMins)}
                          </span>
                          {slot.isOriginal && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs gap-1">
                              <Star className="w-3 h-3" />
                              Original
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        disabled={isRemoving}
                        onClick={() => handleRemoveProgram(index)}
                      >
                        {isRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Radio className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Select a channel to view and manage its schedule.</p>
        </div>
      )}

      {/* Add Program Dialog */}
      <Dialog open={showAddProgram} onOpenChange={setShowAddProgram}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Program to Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {addError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {addError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Content</Label>
              {videosLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedVideoId} onValueChange={handleVideoSelect}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose eligible content..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {eligibleVideos.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No eligible content available
                      </SelectItem>
                    ) : (
                      eligibleVideos.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              [{getContentTypeLabel(v.contentType as string)}]
                            </span>
                            {v.title}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Only movies, films, TV series, documentaries, and similar content are shown. Clips and podcasts are excluded.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <Input
                type="datetime-local"
                value={startTimeInput}
                onChange={(e) => setStartTimeInput(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="bg-background/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled based on content type. Adjust as needed.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isOriginal"
                checked={isOriginal}
                onCheckedChange={setIsOriginal}
              />
              <Label htmlFor="isOriginal" className="cursor-pointer">
                Mark as Original Content
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProgram(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProgram}
              disabled={updateLiveChannel.isPending || !selectedVideoId || !startTimeInput}
            >
              {updateLiveChannel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
