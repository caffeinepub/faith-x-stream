import { useState } from 'react';
import { useGetAllLiveChannels, useUpdateLiveChannel, useGetEligibleVideosForLive } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, Plus, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { LiveChannel, ScheduledContent } from '../../backend';

export default function LiveScheduleManagement() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: eligibleVideos, isLoading: videosLoading } = useGetEligibleVideosForLive();
  const updateChannel = useUpdateLiveChannel();

  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);

  const openScheduleDialog = (channel: LiveChannel) => {
    setSelectedChannel(channel);
    setSelectedVideoId('');
    setStartTime('');
    setEndTime('');
    setIsOriginal(false);
    setScheduleDialogOpen(true);
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) return;

    if (!selectedVideoId) {
      toast.error('Please select a video');
      return;
    }

    const selectedVideo = eligibleVideos?.find(v => v.id === selectedVideoId);
    if (!selectedVideo) {
      toast.error('Selected video is not eligible for Live TV scheduling');
      return;
    }

    try {
      const startTimestamp = new Date(startTime).getTime();
      const endTimestamp = new Date(endTime).getTime();

      if (endTimestamp <= startTimestamp) {
        toast.error('End time must be after start time');
        return;
      }

      const newProgram: ScheduledContent = {
        contentId: selectedVideoId,
        startTime: BigInt(startTimestamp),
        endTime: BigInt(endTimestamp),
        isOriginal,
      };

      const updatedChannel: LiveChannel = {
        ...selectedChannel,
        schedule: [...selectedChannel.schedule, newProgram],
      };

      await updateChannel.mutateAsync({ channelId: selectedChannel.id, channel: updatedChannel });
      toast.success('Program added to schedule!');
      
      setScheduleDialogOpen(false);
      setSelectedVideoId('');
      setStartTime('');
      setEndTime('');
      setIsOriginal(false);
    } catch (error) {
      toast.error('Failed to add program');
      console.error(error);
    }
  };

  const handleRemoveProgram = async (channel: LiveChannel, programIndex: number) => {
    if (!confirm('Are you sure you want to remove this program?')) return;

    try {
      const updatedSchedule = channel.schedule.filter((_, index) => index !== programIndex);
      const updatedChannel: LiveChannel = {
        ...channel,
        schedule: updatedSchedule,
      };

      await updateChannel.mutateAsync({ channelId: channel.id, channel: updatedChannel });
      toast.success('Program removed from schedule');
    } catch (error) {
      toast.error('Failed to remove program');
      console.error(error);
    }
  };

  const getVideoTitle = (videoId: string): string => {
    const video = eligibleVideos?.find(v => v.id === videoId);
    return video?.title || 'Unknown Video';
  };

  if (channelsLoading || videosLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Live TV Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {channels?.map((channel) => (
              <div key={channel.id} className="p-4 rounded-lg bg-black/60 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {channel.logo && (
                      <img
                        src={channel.logo.getDirectURL()}
                        alt={channel.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {channel.name}
                        {channel.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {channel.schedule.length} program(s) scheduled
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openScheduleDialog(channel)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Program
                  </Button>
                </div>

                {channel.schedule.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {channel.schedule.map((program, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded bg-black/40 border border-primary/10"
                      >
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {getVideoTitle(program.contentId)}
                            {program.isOriginal && <Star className="h-3 w-3 text-secondary fill-secondary" />}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Number(program.startTime)).toLocaleString()} - {new Date(Number(program.endTime)).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveProgram(channel, index)}
                          disabled={updateChannel.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!channels || channels.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No channels available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Program Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Program to {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProgram} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video">Select Video (Live TV Eligible Only)</Label>
              <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a video..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleVideos && eligibleVideos.length > 0 ? (
                    eligibleVideos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No eligible videos available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {(!eligibleVideos || eligibleVideos.length === 0) && (
                <p className="text-xs text-muted-foreground">
                  No videos are marked as eligible for Live TV. Please enable "Eligible for Live TV scheduling" when uploading content.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isOriginal"
                checked={isOriginal}
                onCheckedChange={(checked) => setIsOriginal(checked as boolean)}
              />
              <Label htmlFor="isOriginal" className="cursor-pointer flex items-center gap-1">
                <Star className="h-4 w-4 text-secondary" />
                Mark as Original
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateChannel.isPending || !eligibleVideos || eligibleVideos.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Add Program
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
