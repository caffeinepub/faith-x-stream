import { useState } from 'react';
import { useGetAllVideos, useAddVideo, useUpdateVideo, useDeleteVideo } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Trash2, Upload, Star, Film, Edit, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, ContentType } from '../../backend';
import type { VideoContent } from '../../backend';

export default function VideoManagement() {
  const { data: videos, isLoading } = useGetAllVideos();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.faithBased);
  const [isPremium, setIsPremium] = useState(false);
  const [isOriginal, setIsOriginal] = useState(false);
  const [eligibleForLive, setEligibleForLive] = useState(false);
  const [availableAsVOD, setAvailableAsVOD] = useState(true);
  const [roles, setRoles] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit state
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const nonClipVideos = videos?.filter(v => !v.isClip) || [];

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

      let trailerBlob: ExternalBlob | undefined = undefined;
      if (trailerFile) {
        const trailerBytes = new Uint8Array(await trailerFile.arrayBuffer());
        trailerBlob = ExternalBlob.fromBytes(trailerBytes);
      }

      const video: VideoContent = {
        id: `video-${Date.now()}`,
        title,
        description,
        contentType,
        isPremium,
        isOriginal,
        isClip: false,
        videoUrl: videoBlob,
        trailerUrl: trailerBlob,
        thumbnailUrl: thumbnailBlob,
        roles: roles || undefined,
        genre: genre || undefined,
        releaseYear: releaseYear ? BigInt(releaseYear) : undefined,
        eligibleForLive,
        availableAsVOD,
      };

      await addVideo.mutateAsync(video);
      toast.success('Video uploaded successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setContentType(ContentType.faithBased);
      setIsPremium(false);
      setIsOriginal(false);
      setEligibleForLive(false);
      setAvailableAsVOD(true);
      setRoles('');
      setGenre('');
      setReleaseYear('');
      setVideoFile(null);
      setTrailerFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to upload video');
      console.error(error);
    }
  };

  const openEditDialog = (video: VideoContent) => {
    setTitle(video.title);
    setDescription(video.description);
    setContentType(video.contentType);
    setIsPremium(video.isPremium);
    setIsOriginal(video.isOriginal);
    setEligibleForLive(video.eligibleForLive);
    setAvailableAsVOD(video.availableAsVOD);
    setRoles(video.roles || '');
    setGenre(video.genre || '');
    setReleaseYear(video.releaseYear ? String(video.releaseYear) : '');
    setVideoFile(null);
    setTrailerFile(null);
    setThumbnailFile(null);
    setEditingVideo(video);
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      let videoBlob = editingVideo.videoUrl;
      let thumbnailBlob = editingVideo.thumbnailUrl;
      let trailerBlob = editingVideo.trailerUrl;

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

      if (trailerFile) {
        const trailerBytes = new Uint8Array(await trailerFile.arrayBuffer());
        trailerBlob = ExternalBlob.fromBytes(trailerBytes);
      }

      const updatedVideo: VideoContent = {
        ...editingVideo,
        title,
        description,
        contentType,
        isPremium,
        isOriginal,
        eligibleForLive,
        availableAsVOD,
        videoUrl: videoBlob,
        trailerUrl: trailerBlob,
        thumbnailUrl: thumbnailBlob,
        roles: roles || undefined,
        genre: genre || undefined,
        releaseYear: releaseYear ? BigInt(releaseYear) : undefined,
      };

      await updateVideo.mutateAsync({ videoId: editingVideo.id, video: updatedVideo });
      toast.success('Video updated successfully!');
      
      setEditDialogOpen(false);
      setEditingVideo(null);
      setTitle('');
      setDescription('');
      setContentType(ContentType.faithBased);
      setIsPremium(false);
      setIsOriginal(false);
      setEligibleForLive(false);
      setAvailableAsVOD(true);
      setRoles('');
      setGenre('');
      setReleaseYear('');
      setVideoFile(null);
      setTrailerFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to update video');
      console.error(error);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await deleteVideo.mutateAsync(videoId);
      toast.success('Video deleted successfully');
    } catch (error) {
      toast.error('Failed to delete video');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Video
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roles">Cast/Roles (Optional)</Label>
                <Input
                  id="roles"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="e.g., John Doe, Jane Smith"
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre (Optional)</Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Drama, Action"
                  className="bg-black/60 border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseYear">Release Year (Optional)</Label>
                <Input
                  id="releaseYear"
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="e.g., 2024"
                  className="bg-black/60 border-primary/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video">Video File *</Label>
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
                <Label htmlFor="thumbnail">Thumbnail Image *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="trailer" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Trailer Video (Optional)
              </Label>
              <Input
                id="trailer"
                type="file"
                accept="video/*"
                onChange={(e) => setTrailerFile(e.target.files?.[0] || null)}
                className="bg-black/60 border-primary/40"
              />
            </div>

            <div className="flex items-center gap-6 flex-wrap">
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

              <div className="flex items-center gap-2">
                <Switch
                  id="eligibleForLive"
                  checked={eligibleForLive}
                  onCheckedChange={setEligibleForLive}
                />
                <Label htmlFor="eligibleForLive" className="cursor-pointer flex items-center gap-1">
                  <Radio className="h-4 w-4 text-primary" />
                  Eligible for Live TV
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="availableAsVOD"
                  checked={availableAsVOD}
                  onCheckedChange={setAvailableAsVOD}
                />
                <Label htmlFor="availableAsVOD" className="cursor-pointer">Available as VOD</Label>
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
              {addVideo.isPending ? 'Uploading...' : 'Upload Video'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Manage Videos ({nonClipVideos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nonClipVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={video.thumbnailUrl.getDirectURL()}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {video.title}
                      {video.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                      {video.trailerUrl && (
                        <span title="Has trailer">
                          <Film className="h-4 w-4 text-primary" />
                        </span>
                      )}
                      {video.eligibleForLive && (
                        <span title="Eligible for Live TV">
                          <Radio className="h-4 w-4 text-primary" />
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                    <div className="flex gap-2 mt-1">
                      {video.isPremium && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Premium</span>
                      )}
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {video.contentType}
                      </span>
                      {video.eligibleForLive && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Live TV</span>
                      )}
                      {video.availableAsVOD && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">VOD</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(video)}
                    disabled={updateVideo.isPending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(video.id)}
                    disabled={deleteVideo.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {nonClipVideos.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No videos uploaded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-roles">Cast/Roles</Label>
                <Input
                  id="edit-roles"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-genre">Genre</Label>
                <Input
                  id="edit-genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-releaseYear">Release Year</Label>
                <Input
                  id="edit-releaseYear"
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-video">Replace Video (Optional)</Label>
                <Input
                  id="edit-video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">Replace Thumbnail (Optional)</Label>
                <Input
                  id="edit-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-trailer">Replace Trailer (Optional)</Label>
              <Input
                id="edit-trailer"
                type="file"
                accept="video/*"
                onChange={(e) => setTrailerFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-isPremium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
                <Label htmlFor="edit-isPremium" className="cursor-pointer">Premium Content</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-isOriginal"
                  checked={isOriginal}
                  onCheckedChange={setIsOriginal}
                />
                <Label htmlFor="edit-isOriginal" className="cursor-pointer flex items-center gap-1">
                  <Star className="h-4 w-4 text-secondary" />
                  Mark as Original
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-eligibleForLive"
                  checked={eligibleForLive}
                  onCheckedChange={setEligibleForLive}
                />
                <Label htmlFor="edit-eligibleForLive" className="cursor-pointer flex items-center gap-1">
                  <Radio className="h-4 w-4 text-primary" />
                  Eligible for Live TV
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="edit-availableAsVOD"
                  checked={availableAsVOD}
                  onCheckedChange={setAvailableAsVOD}
                />
                <Label htmlFor="edit-availableAsVOD" className="cursor-pointer">Available as VOD</Label>
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateVideo.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                {updateVideo.isPending ? 'Updating...' : 'Update Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
