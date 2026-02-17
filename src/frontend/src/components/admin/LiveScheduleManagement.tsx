import { useState } from 'react';
import { useGetAllLiveChannels, useUpdateLiveChannel, useGetEligibleVideosForLive, useGetAllAdMedia } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Radio, Loader2, Plus, Trash2, Star, Clock } from 'lucide-react';
import type { ScheduledContent, AdLocation } from '../../backend';
import { ExternalBlob } from '../../backend';

export default function LiveScheduleManagement() {
  const { data: channels, isLoading: channelsLoading } = useGetAllLiveChannels();
  const { data: eligibleVideos, isLoading: videosLoading } = useGetEligibleVideosForLive();
  const { data: adMedia } = useGetAllAdMedia();
  const updateChannel = useUpdateLiveChannel();

  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [newProgramVideoId, setNewProgramVideoId] = useState<string>('');
  const [newProgramStartTime, setNewProgramStartTime] = useState<string>('');
  const [newProgramEndTime, setNewProgramEndTime] = useState<string>('');
  const [newProgramIsOriginal, setNewProgramIsOriginal] = useState(false);

  // Ad break state
  const [editingProgramIndex, setEditingProgramIndex] = useState<number | null>(null);
  const [adBreaks, setAdBreaks] = useState<AdLocation[]>([]);

  const selectedChannel = channels?.find(c => c.id === selectedChannelId);

  const handleAddProgram = async () => {
    if (!selectedChannel || !newProgramVideoId || !newProgramStartTime || !newProgramEndTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const startTime = new Date(newProgramStartTime).getTime();
    const endTime = new Date(newProgramEndTime).getTime();

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const newProgram: ScheduledContent = {
      contentId: newProgramVideoId,
      startTime: BigInt(startTime),
      endTime: BigInt(endTime),
      isOriginal: newProgramIsOriginal,
      adLocations: undefined,
    };

    const updatedSchedule = [...selectedChannel.schedule, newProgram].sort(
      (a, b) => Number(a.startTime) - Number(b.startTime)
    );

    try {
      await updateChannel.mutateAsync({
        channelId: selectedChannel.id,
        channel: {
          ...selectedChannel,
          schedule: updatedSchedule,
        },
      });
      toast.success('Program added successfully');
      setNewProgramVideoId('');
      setNewProgramStartTime('');
      setNewProgramEndTime('');
      setNewProgramIsOriginal(false);
    } catch (error) {
      toast.error('Failed to add program');
      console.error(error);
    }
  };

  const handleRemoveProgram = async (index: number) => {
    if (!selectedChannel) return;

    const updatedSchedule = selectedChannel.schedule.filter((_, i) => i !== index);

    try {
      await updateChannel.mutateAsync({
        channelId: selectedChannel.id,
        channel: {
          ...selectedChannel,
          schedule: updatedSchedule,
        },
      });
      toast.success('Program removed successfully');
    } catch (error) {
      toast.error('Failed to remove program');
      console.error(error);
    }
  };

  const handleEditAdBreaks = (index: number) => {
    if (!selectedChannel) return;
    const program = selectedChannel.schedule[index];
    setEditingProgramIndex(index);
    setAdBreaks(program.adLocations || []);
  };

  const handleAddAdBreak = () => {
    setAdBreaks([...adBreaks, { position: BigInt(0), adUrls: [] }]);
  };

  const handleRemoveAdBreak = (adIndex: number) => {
    setAdBreaks(adBreaks.filter((_, i) => i !== adIndex));
  };

  const handleUpdateAdBreakPosition = (adIndex: number, position: string) => {
    const updated = [...adBreaks];
    updated[adIndex] = { ...updated[adIndex], position: BigInt(Math.floor(Number(position))) };
    setAdBreaks(updated);
  };

  const handleUpdateAdBreakMedia = (adIndex: number, adMediaId: string) => {
    const ad = adMedia?.find(a => a.id === adMediaId);
    if (!ad) return;
    
    const updated = [...adBreaks];
    updated[adIndex] = { ...updated[adIndex], adUrls: [ad.adFile] };
    setAdBreaks(updated);
  };

  const handleSaveAdBreaks = async () => {
    if (!selectedChannel || editingProgramIndex === null) return;

    const updatedSchedule = [...selectedChannel.schedule];
    updatedSchedule[editingProgramIndex] = {
      ...updatedSchedule[editingProgramIndex],
      adLocations: adBreaks.length > 0 ? adBreaks : undefined,
    };

    try {
      await updateChannel.mutateAsync({
        channelId: selectedChannel.id,
        channel: {
          ...selectedChannel,
          schedule: updatedSchedule,
        },
      });
      toast.success('Ad breaks saved successfully');
      setEditingProgramIndex(null);
      setAdBreaks([]);
    } catch (error) {
      toast.error('Failed to save ad breaks');
      console.error(error);
    }
  };

  if (channelsLoading || videosLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No live channels available. Create a channel first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Manage Live TV Schedule
          </CardTitle>
          <CardDescription>
            Add programs to your live TV channels and configure ad breaks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="channel">Select Channel</Label>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger className="bg-black/60 border-primary/40">
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChannel && (
            <>
              <div className="border-t border-primary/20 pt-6">
                <h3 className="text-lg font-semibold mb-4">Add New Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Choose a video (Live-eligible only)</Label>
                    <Select value={newProgramVideoId} onValueChange={setNewProgramVideoId}>
                      <SelectTrigger className="bg-black/60 border-primary/40">
                        <SelectValue placeholder="Select video" />
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
                            No Live-eligible videos available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newProgramStartTime}
                      onChange={(e) => setNewProgramStartTime(e.target.value)}
                      className="bg-black/60 border-primary/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newProgramEndTime}
                      onChange={(e) => setNewProgramEndTime(e.target.value)}
                      className="bg-black/60 border-primary/40"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isOriginal"
                      checked={newProgramIsOriginal}
                      onCheckedChange={setNewProgramIsOriginal}
                    />
                    <Label htmlFor="isOriginal" className="cursor-pointer flex items-center gap-1">
                      <Star className="h-4 w-4 text-secondary" />
                      Mark as Original
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleAddProgram}
                  disabled={updateChannel.isPending || !eligibleVideos || eligibleVideos.length === 0}
                  className="mt-4 bg-gradient-to-r from-primary to-secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>

              <div className="border-t border-primary/20 pt-6">
                <h3 className="text-lg font-semibold mb-4">Current Schedule</h3>
                <div className="space-y-3">
                  {selectedChannel.schedule.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No programs scheduled</p>
                  ) : (
                    selectedChannel.schedule.map((program, index) => {
                      const video = eligibleVideos?.find(v => v.id === program.contentId);
                      const startDate = new Date(Number(program.startTime));
                      const endDate = new Date(Number(program.endTime));
                      const adCount = program.adLocations?.length || 0;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-primary/20"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{video?.title || 'Unknown Video'}</h4>
                              {program.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {startDate.toLocaleString()} - {endDate.toLocaleString()}
                            </p>
                            {adCount > 0 && (
                              <p className="text-xs text-primary mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {adCount} ad break{adCount > 1 ? 's' : ''} configured
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAdBreaks(index)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Ad Breaks
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveProgram(index)}
                              disabled={updateChannel.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ad Breaks Editor Dialog */}
      {editingProgramIndex !== null && selectedChannel && (
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configure Ad Breaks
            </CardTitle>
            <CardDescription>
              {eligibleVideos?.find(v => v.id === selectedChannel.schedule[editingProgramIndex].contentId)?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adBreaks.map((adBreak, adIndex) => (
              <div key={adIndex} className="flex items-end gap-4 p-4 rounded-lg bg-black/40 border border-primary/20">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`position-${adIndex}`}>Position (seconds into program)</Label>
                  <Input
                    id={`position-${adIndex}`}
                    type="number"
                    value={Number(adBreak.position)}
                    onChange={(e) => handleUpdateAdBreakPosition(adIndex, e.target.value)}
                    placeholder="e.g., 300 for 5 minutes"
                    className="bg-black/60 border-primary/40"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`ad-${adIndex}`}>Ad Media</Label>
                  <Select
                    value={adBreak.adUrls.length > 0 ? adMedia?.find(a => a.adFile.getDirectURL() === adBreak.adUrls[0].getDirectURL())?.id : ''}
                    onValueChange={(value) => handleUpdateAdBreakMedia(adIndex, value)}
                  >
                    <SelectTrigger className="bg-black/60 border-primary/40">
                      <SelectValue placeholder="Select ad" />
                    </SelectTrigger>
                    <SelectContent>
                      {adMedia && adMedia.length > 0 ? (
                        adMedia.map((ad) => (
                          <SelectItem key={ad.id} value={ad.id}>
                            {ad.description}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No ad media available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveAdBreak(adIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddAdBreak}
                disabled={!adMedia || adMedia.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ad Break
              </Button>
              <Button
                onClick={handleSaveAdBreaks}
                disabled={updateChannel.isPending}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Save Ad Breaks
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingProgramIndex(null);
                  setAdBreaks([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
