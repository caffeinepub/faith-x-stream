import { useState } from 'react';
import { useGetAllClips, useAddVideo, useUpdateVideo, useDeleteVideo } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Trash2, Upload, Star, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, ContentType } from '../../backend';
import type { VideoContent } from '../../backend';

export default function ClipsManagement() {
  const { data: clips, isLoading } = useGetAllClips();
  const addClip = useAddVideo();
  const updateClip = useUpdateVideo();
  const deleteClip = useDeleteVideo();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.faithBased);
  const [isPremium, setIsPremium] = useState(false);
  const [isOriginal, setIsOriginal] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit state
  const [editingClip, setEditingClip] = useState<VideoContent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile) {
      toast.error('Please select both video and thumbnail files');
      return;
    }

    try {
      const videoBytes = new Uint8Array(await videoFile.arrayBuffer());
      const thumbnailBytes = new Uint8Array(await thumbnailFile.arrayBuffer());

      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);

      const clip: VideoContent = {
        id: `clip-${Date.now()}`,
        title,
        description,
        contentType,
        isPremium,
        isOriginal,
        isClip: true,
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
      };

      await addClip.mutateAsync(clip);
      toast.success('Clip uploaded successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setContentType(ContentType.faithBased);
      setIsPremium(false);
      setIsOriginal(false);
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to upload clip');
      console.error(error);
    }
  };

  const openEditDialog = (clip: VideoContent) => {
    setTitle(clip.title);
    setDescription(clip.description);
    setContentType(clip.contentType);
    setIsPremium(clip.isPremium);
    setIsOriginal(clip.isOriginal);
    setVideoFile(null);
    setThumbnailFile(null);
    setEditingClip(clip);
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClip) return;

    try {
      let videoBlob = editingClip.videoUrl;
      let thumbnailBlob = editingClip.thumbnailUrl;

      if (videoFile) {
        const videoBytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      if (thumbnailFile) {
        const thumbnailBytes = new Uint8Array(await thumbnailFile.arrayBuffer());
        thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);
      }

      const updatedClip: VideoContent = {
        ...editingClip,
        title,
        description,
        contentType,
        isPremium,
        isOriginal,
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
      };

      await updateClip.mutateAsync({ videoId: editingClip.id, video: updatedClip });
      toast.success('Clip updated successfully!');
      
      setEditDialogOpen(false);
      setEditingClip(null);
      setTitle('');
      setDescription('');
      setContentType(ContentType.faithBased);
      setIsPremium(false);
      setIsOriginal(false);
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to update clip');
      console.error(error);
    }
  };

  const handleDelete = async (clipId: string) => {
    if (!confirm('Are you sure you want to delete this clip?')) return;
    
    try {
      await deleteClip.mutateAsync(clipId);
      toast.success('Clip deleted successfully');
    } catch (error) {
      toast.error('Failed to delete clip');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading clips...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Clip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
                  <SelectTrigger className="bg-black/60 border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                    <SelectItem value={ContentType.faithBased}>Faith-Based</SelectItem>
                    <SelectItem value={ContentType.music}>Music</SelectItem>
                    <SelectItem value={ContentType.educational}>Educational</SelectItem>
                    <SelectItem value={ContentType.news}>News</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video">Video File</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  required
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  required
                  className="bg-black/60 border-primary/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isPremium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
                <Label htmlFor="isPremium" className="cursor-pointer">Premium Content</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isOriginal"
                  checked={isOriginal}
                  onCheckedChange={setIsOriginal}
                />
                <Label htmlFor="isOriginal" className="cursor-pointer flex items-center gap-1">
                  <Star className="h-4 w-4 text-secondary" />
                  Mark as Original
                </Label>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={addClip.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
            >
              {addClip.isPending ? 'Uploading...' : 'Upload Clip'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Manage Clips ({clips?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clips?.map((clip) => (
              <div
                key={clip.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={clip.thumbnailUrl.getDirectURL()}
                    alt={clip.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {clip.title}
                      {clip.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{clip.description}</p>
                    <div className="flex gap-2 mt-1">
                      {clip.isPremium && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Premium</span>
                      )}
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {clip.contentType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(clip)}
                    disabled={updateClip.isPending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(clip.id)}
                    disabled={deleteClip.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!clips || clips.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No clips uploaded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Clip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contentType">Content Type</Label>
                <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                    <SelectItem value={ContentType.faithBased}>Faith-Based</SelectItem>
                    <SelectItem value={ContentType.music}>Music</SelectItem>
                    <SelectItem value={ContentType.educational}>Educational</SelectItem>
                    <SelectItem value={ContentType.news}>News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-video">Video File (leave empty to keep current)</Label>
                <Input
                  id="edit-video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">Thumbnail (leave empty to keep current)</Label>
                <Input
                  id="edit-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-isPremium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
                <Label htmlFor="edit-isPremium">Premium Content</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-isOriginal"
                  checked={isOriginal}
                  onCheckedChange={setIsOriginal}
                />
                <Label htmlFor="edit-isOriginal" className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-secondary" />
                  Mark as Original
                </Label>
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateClip.isPending}
              >
                {updateClip.isPending ? 'Updating...' : 'Update Clip'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
