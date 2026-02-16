import { useState } from 'react';
import { useGetAllLiveChannels, useUpdateLiveChannel, useGetAllVideos } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Radio, Loader2, Plus, Trash2, Star } from 'lucide-react';
import type { ScheduledContent } from '../../backend';

export default function LiveScheduleManagement() {
  const { data: channels } = useGetAllLiveChannels();
  const { data: videos } = useGetAllVideos();
  const updateChannel = useUpdateLiveChannel();

  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [programIsOriginal, setProgramIsOriginal] = useState(false);

  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);

  const handleAddProgram = async () => {
    if (!selectedChannel || !selectedVideoId) {
      toast.error('Please select a channel and video');
      return;
    }

    try {
      const now = Date.now();
      const newProgram: ScheduledContent = {
        contentId: selectedVideoId,
        startTime: BigInt(now),
        endTime: BigInt(now + 3600000), // 1 hour default
        adLocations: undefined,
        isOriginal: programIsOriginal,
      };

      const updatedChannel = {
        ...selectedChannel,
        schedule: [...selectedChannel.schedule, newProgram],
      };

      await updateChannel.mutateAsync({
        channelId: selectedChannel.id,
        channel: updatedChannel,
      });

      toast.success('Program added to schedule');
      setSelectedVideoId('');
      setProgramIsOriginal(false);
    } catch (error) {
      toast.error('Failed to add program');
      console.error(error);
    }
  };

  const handleRemoveProgram = async (index: number) => {
    if (!selectedChannel) return;

    try {
      const updatedSchedule = selectedChannel.schedule.filter((_, i) => i !== index);
      const updatedChannel = {
        ...selectedChannel,
        schedule: updatedSchedule,
      };

      await updateChannel.mutateAsync({
        channelId: selectedChannel.id,
        channel: updatedChannel,
      });

      toast.success('Program removed from schedule');
    } catch (error) {
      toast.error('Failed to remove program');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Live TV Schedule</CardTitle>
          <CardDescription>Add and manage scheduled programs for live channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Channel</Label>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {channels?.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChannel && (
            <>
              <div className="space-y-2">
                <Label>Add Program</Label>
                <div className="flex gap-2">
                  <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a video" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos?.map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddProgram}
                    disabled={!selectedVideoId || updateChannel.isPending}
                    className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
                  >
                    {updateChannel.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch id="programOriginal" checked={programIsOriginal} onCheckedChange={setProgramIsOriginal} />
                  <Label htmlFor="programOriginal" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Mark as Original Program
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Schedule ({selectedChannel.schedule.length} programs)</Label>
                {selectedChannel.schedule.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChannel.schedule.map((program, index) => {
                      const video = videos?.find((v) => v.id === program.contentId);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{video?.title || 'Unknown Video'}</p>
                              {program.isOriginal && (
                                <Star className="h-4 w-4 text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Start: {new Date(Number(program.startTime)).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProgram(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No programs scheduled
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
