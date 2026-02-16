import { useState } from 'react';
import { useGetAllAdMedia, useAddAdMedia, useDeleteAdMedia, useGetAllAdAssignments, useAddAdAssignment, useDeleteAdAssignment } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import type { AdMedia, AdAssignment } from '../../backend';

export default function ManualAdsManagement() {
  const { data: adMedia, isLoading: mediaLoading } = useGetAllAdMedia();
  const { data: adAssignments, isLoading: assignmentsLoading } = useGetAllAdAssignments();
  const addMedia = useAddAdMedia();
  const deleteMedia = useDeleteAdMedia();
  const addAssignment = useAddAdAssignment();
  const deleteAssignment = useDeleteAdAssignment();

  // Ad Media Upload State
  const [mediaType, setMediaType] = useState('video');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [adFile, setAdFile] = useState<File | null>(null);

  // Ad Assignment State
  const [scope, setScope] = useState('global');
  const [targetId, setTargetId] = useState('');
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [position, setPosition] = useState<number>(0);
  const [showCount, setShowCount] = useState('1');
  const [skipAfterSeconds, setSkipAfterSeconds] = useState('');

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFile) {
      toast.error('Please select an ad file');
      return;
    }

    try {
      const fileBytes = new Uint8Array(await adFile.arrayBuffer());
      const adBlob = ExternalBlob.fromBytes(fileBytes);

      const media: AdMedia = {
        id: `ad-${Date.now()}`,
        mediaType,
        adFile: adBlob,
        duration: BigInt(duration || 0),
        description,
        tags: undefined,
        language: undefined,
        regions: undefined,
      };

      await addMedia.mutateAsync(media);
      toast.success('Ad media uploaded successfully!');
      
      setMediaType('video');
      setDescription('');
      setDuration('');
      setAdFile(null);
    } catch (error) {
      toast.error('Failed to upload ad media');
      console.error(error);
    }
  };

  const handleAssignmentCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAdIds.length === 0) {
      toast.error('Please select at least one ad');
      return;
    }

    try {
      const assignment: AdAssignment = {
        id: `assignment-${Date.now()}`,
        scope,
        targetId: targetId || undefined,
        adIds: selectedAdIds,
        position: BigInt(position),
        showCount: BigInt(showCount || 1),
        skipAfterSeconds: skipAfterSeconds ? BigInt(skipAfterSeconds) : undefined,
        showOnFreeOnly: true,
      };

      await addAssignment.mutateAsync(assignment);
      toast.success('Ad assignment created successfully!');
      
      setScope('global');
      setTargetId('');
      setSelectedAdIds([]);
      setPosition(0);
      setShowCount('1');
      setSkipAfterSeconds('');
    } catch (error) {
      toast.error('Failed to create ad assignment');
      console.error(error);
    }
  };

  const handleDeleteMedia = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad media?')) return;
    
    try {
      await deleteMedia.mutateAsync(adId);
      toast.success('Ad media deleted successfully');
    } catch (error) {
      toast.error('Failed to delete ad media');
      console.error(error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this ad assignment?')) return;
    
    try {
      await deleteAssignment.mutateAsync(assignmentId);
      toast.success('Ad assignment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete ad assignment');
      console.error(error);
    }
  };

  const getPositionLabel = (pos: number) => {
    switch (pos) {
      case 0: return 'Pre-roll';
      case 1: return 'Mid-roll';
      case 2: return 'Post-roll';
      default: return `Position ${pos}`;
    }
  };

  const getPositionDisplay = (assignment: AdAssignment) => {
    const pos = Number(assignment.position);
    const total = adAssignments?.filter(a => a.scope === assignment.scope && a.targetId === assignment.targetId).length || 1;
    return `${pos + 1}/${total} - ${getPositionLabel(pos)}`;
  };

  if (mediaLoading || assignmentsLoading) {
    return <div className="text-center py-8">Loading ads...</div>;
  }

  return (
    <Tabs defaultValue="upload" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3 gradient-card border-2 border-primary/30">
        <TabsTrigger value="upload">Upload Ads</TabsTrigger>
        <TabsTrigger value="assign">Assign Ads</TabsTrigger>
        <TabsTrigger value="manage">Manage</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Ad Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMediaUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select value={mediaType} onValueChange={setMediaType}>
                    <SelectTrigger className="bg-black/60 border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    className="bg-black/60 border-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adFile">Ad File</Label>
                <Input
                  id="adFile"
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => setAdFile(e.target.files?.[0] || null)}
                  required
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <Button
                type="submit"
                disabled={addMedia.isPending}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {addMedia.isPending ? 'Uploading...' : 'Upload Ad Media'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assign">
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle>Assign Ads to Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignmentCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger className="bg-black/60 border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (All Content)</SelectItem>
                      <SelectItem value="video">Specific Video</SelectItem>
                      <SelectItem value="series">Specific Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scope !== 'global' && (
                  <div className="space-y-2">
                    <Label htmlFor="targetId">Target ID</Label>
                    <Input
                      id="targetId"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder="Enter content ID"
                      required
                      className="bg-black/60 border-primary/40"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select value={position.toString()} onValueChange={(v) => setPosition(Number(v))}>
                    <SelectTrigger className="bg-black/60 border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pre-roll (Before content)</SelectItem>
                      <SelectItem value="1">Mid-roll (During content)</SelectItem>
                      <SelectItem value="2">Post-roll (After content)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="showCount">Show Count</Label>
                  <Input
                    id="showCount"
                    type="number"
                    value={showCount}
                    onChange={(e) => setShowCount(e.target.value)}
                    min="1"
                    required
                    className="bg-black/60 border-primary/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skipAfterSeconds">Skip After (seconds, optional)</Label>
                  <Input
                    id="skipAfterSeconds"
                    type="number"
                    value={skipAfterSeconds}
                    onChange={(e) => setSkipAfterSeconds(e.target.value)}
                    placeholder="Leave empty for non-skippable"
                    className="bg-black/60 border-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Ads</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-black/60 rounded border border-primary/40">
                  {adMedia?.map((ad) => (
                    <label
                      key={ad.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAdIds.includes(ad.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdIds([...selectedAdIds, ad.id]);
                          } else {
                            setSelectedAdIds(selectedAdIds.filter(id => id !== ad.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{ad.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={addAssignment.isPending}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {addAssignment.isPending ? 'Creating...' : 'Create Assignment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage">
        <div className="space-y-6">
          <Card className="gradient-card border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Ad Media Library ({adMedia?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adMedia?.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
                  >
                    <div>
                      <h3 className="font-semibold">{ad.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ad.mediaType} • {Number(ad.duration)}s
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMedia(ad.id)}
                      disabled={deleteMedia.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!adMedia || adMedia.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No ad media uploaded yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Ad Assignments ({adAssignments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adAssignments?.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
                  >
                    <div>
                      <h3 className="font-semibold capitalize">{assignment.scope}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getPositionDisplay(assignment)} • {assignment.adIds.length} ad(s) • Show {Number(assignment.showCount)}x
                        {assignment.skipAfterSeconds && ` • Skip after ${Number(assignment.skipAfterSeconds)}s`}
                      </p>
                      {assignment.targetId && (
                        <p className="text-xs text-muted-foreground mt-1">Target: {assignment.targetId}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      disabled={deleteAssignment.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!adAssignments || adAssignments.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No ad assignments created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
