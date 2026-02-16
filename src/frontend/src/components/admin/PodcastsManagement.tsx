import { useState } from 'react';
import { useGetAllVideos, useAddVideo, useUpdateVideo, useDeleteVideo } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Trash2, Upload, Star, Edit, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, ContentType } from '../../backend';
import type { VideoContent } from '../../backend';
import { isPodcast } from '../../utils/contentType';

export default function PodcastsManagement() {
  const { data: allVideos, isLoading } = useGetAllVideos();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  // Filter only podcasts
  const podcasts = allVideos?.filter((v) => !v.isClip && isPodcast(v.contentType)) || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isOriginal, setIsOriginal] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [editingPodcast, setEditingPodcast] = useState<VideoContent | null>(null);
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

      const podcast: VideoContent = {
        id: `podcast-${Date.now()}`,
        title,
        description,
        contentType: ContentType.podcast,
        isPremium,
        isOriginal,
        isClip: false,
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
      };

      await addVideo.mutateAsync(podcast);
      toast.success('Podcast uploaded successfully!');
      
      resetForm();
    } catch (error) {
      toast.error('Failed to upload podcast');
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsPremium(false);
    setIsOriginal(false);
    setVideoFile(null);
    setThumbnailFile(null);
    setUploadProgress(0);
  };

  const openEditDialog = (podcast: VideoContent) => {
    setTitle(podcast.title);
    setDescription(podcast.description);
    setIsPremium(podcast.isPremium);
    setIsOriginal(podcast.isOriginal);
    setVideoFile(null);
    setThumbnailFile(null);
    setEditingPodcast(podcast);
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPodcast) return;

    try {
      let videoBlob = editingPodcast.videoUrl;
      let thumbnailBlob = editingPodcast.thumbnailUrl;

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

      const updatedPodcast: VideoContent = {
        id: editingPodcast.id,
        title,
        description,
        contentType: ContentType.podcast,
        isPremium,
        isOriginal,
        isClip: false,
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
      };

      await updateVideo.mutateAsync({ videoId: editingPodcast.id, video: updatedPodcast });
      toast.success('Podcast updated successfully!');
      
      setEditDialogOpen(false);
      setEditingPodcast(null);
      resetForm();
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Failed to update podcast';
      toast.error(errorMessage);
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (podcastId: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return;
    
    try {
      await deleteVideo.mutateAsync(podcastId);
      toast.success('Podcast deleted successfully');
    } catch (error) {
      toast.error('Failed to delete podcast');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading podcasts...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Upload New Podcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="video">Audio/Video File</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*,audio/*"
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
              disabled={addVideo.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
            >
              {addVideo.isPending ? 'Uploading...' : 'Upload Podcast'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Manage Podcasts ({podcasts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={podcast.thumbnailUrl.getDirectURL()}
                    alt={podcast.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {podcast.title}
                      {podcast.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{podcast.description}</p>
                    <div className="flex gap-2 mt-1">
                      {podcast.isPremium && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Premium</span>
                      )}
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Podcast
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(podcast)}
                    disabled={updateVideo.isPending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(podcast.id)}
                    disabled={deleteVideo.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {podcasts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No podcasts uploaded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Podcast</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
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
                <Label htmlFor="edit-video">Audio/Video File (leave empty to keep current)</Label>
                <Input
                  id="edit-video"
                  type="file"
                  accept="video/*,audio/*"
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
                disabled={updateVideo.isPending}
              >
                {updateVideo.isPending ? 'Updating...' : 'Update Podcast'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
