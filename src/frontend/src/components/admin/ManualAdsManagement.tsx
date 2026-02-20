import { useState } from 'react';
import { useGetAdMedia, useAddAdMedia, useDeleteAdMedia, useGetAdAssignments, useAddAdAssignment, useDeleteAdAssignment } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { ExternalBlob, type AdMedia, type AdAssignment } from '../../backend';

export default function ManualAdsManagement() {
  const { data: adMedia = [], isLoading: mediaLoading } = useGetAdMedia();
  const { data: adAssignments = [], isLoading: assignmentsLoading } = useGetAdAssignments();
  const addAdMedia = useAddAdMedia();
  const deleteAdMedia = useDeleteAdMedia();
  const addAdAssignment = useAddAdAssignment();
  const deleteAdAssignment = useDeleteAdAssignment();

  // Ad Media Upload State
  const [mediaType, setMediaType] = useState('video');
  const [adFile, setAdFile] = useState<File | null>(null);
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('');
  const [regions, setRegions] = useState('');

  // Ad Assignment State
  const [assignmentScope, setAssignmentScope] = useState('global');
  const [targetId, setTargetId] = useState('');
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [position, setPosition] = useState('0');
  const [showCount, setShowCount] = useState('1');
  const [skipAfterSeconds, setSkipAfterSeconds] = useState('');
  const [showOnFreeOnly, setShowOnFreeOnly] = useState(true);

  const handleUploadAdMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adFile || !duration || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const fileBytes = new Uint8Array(await adFile.arrayBuffer());
      const adBlob = ExternalBlob.fromBytes(fileBytes);

      const newAd: AdMedia = {
        id: `ad-${Date.now()}`,
        mediaType,
        adFile: adBlob,
        duration: BigInt(parseInt(duration)),
        description,
        tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
        language: language || undefined,
        regions: regions ? regions.split(',').map((r) => r.trim()) : undefined,
      };

      await addAdMedia.mutateAsync(newAd);
      toast.success('Ad media uploaded successfully!');

      // Reset form
      setAdFile(null);
      setDuration('');
      setDescription('');
      setTags('');
      setLanguage('');
      setRegions('');
    } catch (error) {
      toast.error('Failed to upload ad media');
      console.error(error);
    }
  };

  const handleDeleteAdMedia = async (adId: string) => {
    try {
      await deleteAdMedia.mutateAsync(adId);
      toast.success('Ad media deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete ad media');
      console.error(error);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAdIds.length === 0) {
      toast.error('Please select at least one ad');
      return;
    }

    try {
      const newAssignment: AdAssignment = {
        id: `assignment-${Date.now()}`,
        scope: assignmentScope,
        targetId: targetId || undefined,
        adIds: selectedAdIds,
        position: BigInt(parseInt(position)),
        showCount: BigInt(parseInt(showCount)),
        skipAfterSeconds: skipAfterSeconds ? BigInt(parseInt(skipAfterSeconds)) : undefined,
        showOnFreeOnly,
      };

      await addAdAssignment.mutateAsync(newAssignment);
      toast.success('Ad assignment created successfully!');

      // Reset form
      setTargetId('');
      setSelectedAdIds([]);
      setPosition('0');
      setShowCount('1');
      setSkipAfterSeconds('');
    } catch (error) {
      toast.error('Failed to create ad assignment');
      console.error(error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteAdAssignment.mutateAsync(assignmentId);
      toast.success('Ad assignment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete ad assignment');
      console.error(error);
    }
  };

  const getPositionLabel = (pos: number) => {
    if (pos === 0) return 'Pre-roll';
    if (pos === -1) return 'Post-roll';
    return `Mid-roll (${pos}s)`;
  };

  if (mediaLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="upload" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload Ad Media</TabsTrigger>
        <TabsTrigger value="assign">Assign Ads</TabsTrigger>
        <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
      </TabsList>

      {/* Upload Ad Media Tab */}
      <TabsContent value="upload" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Ad Media</CardTitle>
            <CardDescription>Upload video or image ads to your library</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadAdMedia} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type *</Label>
                <Select value={mediaType} onValueChange={setMediaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adFile">Ad File *</Label>
                <Input
                  id="adFile"
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => setAdFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ad description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="faith, inspiration, family"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regions">Regions (comma-separated)</Label>
                <Input
                  id="regions"
                  value={regions}
                  onChange={(e) => setRegions(e.target.value)}
                  placeholder="US, CA, GB"
                />
              </div>

              <Button type="submit" disabled={addAdMedia.isPending}>
                {addAdMedia.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Ad
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ad Media Library */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Media Library</CardTitle>
            <CardDescription>{adMedia.length} ads in library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adMedia.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ad.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {ad.mediaType} • {Number(ad.duration)}s
                      {ad.tags && ` • ${ad.tags.join(', ')}`}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAdMedia(ad.id)}
                    disabled={deleteAdMedia.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {adMedia.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No ads uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Assign Ads Tab */}
      <TabsContent value="assign" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Ad Assignment</CardTitle>
            <CardDescription>Assign ads to content or globally</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select value={assignmentScope} onValueChange={setAssignmentScope}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (All Content)</SelectItem>
                    <SelectItem value="video">Specific Video</SelectItem>
                    <SelectItem value="series">Specific Series</SelectItem>
                    <SelectItem value="live">Live TV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {assignmentScope !== 'global' && (
                <div className="space-y-2">
                  <Label htmlFor="targetId">Target ID</Label>
                  <Input
                    id="targetId"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Enter content ID"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Select Ads *</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {adMedia.map((ad) => (
                    <label key={ad.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAdIds.includes(ad.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdIds([...selectedAdIds, ad.id]);
                          } else {
                            setSelectedAdIds(selectedAdIds.filter((id) => id !== ad.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{ad.description}</span>
                    </label>
                  ))}
                  {adMedia.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No ads available. Upload ads first.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pre-roll (Before content)</SelectItem>
                    <SelectItem value="300">Mid-roll (5 minutes)</SelectItem>
                    <SelectItem value="600">Mid-roll (10 minutes)</SelectItem>
                    <SelectItem value="900">Mid-roll (15 minutes)</SelectItem>
                    <SelectItem value="-1">Post-roll (After content)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="showCount">Show Count *</Label>
                <Input
                  id="showCount"
                  type="number"
                  value={showCount}
                  onChange={(e) => setShowCount(e.target.value)}
                  placeholder="1"
                  min="1"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of ads to show at this position
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skipAfterSeconds">Skip After (seconds)</Label>
                <Input
                  id="skipAfterSeconds"
                  type="number"
                  value={skipAfterSeconds}
                  onChange={(e) => setSkipAfterSeconds(e.target.value)}
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for non-skippable ads
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showOnFreeOnly"
                  checked={showOnFreeOnly}
                  onChange={(e) => setShowOnFreeOnly(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showOnFreeOnly" className="cursor-pointer">
                  Show only to free users (hide from premium)
                </Label>
              </div>

              <Button type="submit" disabled={addAdAssignment.isPending}>
                {addAdAssignment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Manage Assignments Tab */}
      <TabsContent value="manage" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Assignments</CardTitle>
            <CardDescription>{adAssignments.length} active assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {assignment.scope.charAt(0).toUpperCase() + assignment.scope.slice(1)}
                      {assignment.targetId && ` - ${assignment.targetId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getPositionLabel(Number(assignment.position))} • {assignment.adIds.length} ad(s) • Show {Number(assignment.showCount)}x
                      {assignment.skipAfterSeconds && ` • Skip after ${Number(assignment.skipAfterSeconds)}s`}
                      {assignment.showOnFreeOnly && ' • Free users only'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    disabled={deleteAdAssignment.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {adAssignments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No ad assignments created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
