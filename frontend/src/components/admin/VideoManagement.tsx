import React, { useState } from 'react';
import { useAddVideo, useUpdateVideo, useDeleteVideo, useGetAllVideos } from '../../hooks/useQueries';
import { ExternalBlob, ContentType, VideoContent } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Video } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoFormData {
  title: string;
  description: string;
  genre: string;
  releaseYear: string;
  roles: string;
  contentType: ContentType;
  isPremium: boolean;
  isOriginal: boolean;
  eligibleForLive: boolean;
  availableAsVOD: boolean;
  videoFile: File | null;
  thumbnailFile: File | null;
  trailerFile: File | null;
}

const defaultForm: VideoFormData = {
  title: '',
  description: '',
  genre: '',
  releaseYear: '',
  roles: '',
  contentType: ContentType.tvSeries,
  isPremium: false,
  isOriginal: false,
  eligibleForLive: true,
  availableAsVOD: true,
  videoFile: null,
  thumbnailFile: null,
  trailerFile: null,
};

export default function VideoManagement() {
  const { data: videos = [], isLoading } = useGetAllVideos();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoFormData>(defaultForm);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Videos that are not movies, films, podcasts, or clips
  const standaloneVideos = videos.filter(v =>
    !v.isClip &&
    v.contentType !== ContentType.movie &&
    v.contentType !== ContentType.film &&
    v.contentType !== ContentType.podcast
  );

  const handleOpen = (video?: VideoContent) => {
    if (video) {
      setEditingId(video.id);
      setForm({
        title: video.title,
        description: video.description,
        genre: video.genre || '',
        releaseYear: video.releaseYear ? String(video.releaseYear) : '',
        roles: video.roles || '',
        contentType: video.contentType,
        isPremium: video.isPremium,
        isOriginal: video.isOriginal,
        eligibleForLive: video.eligibleForLive,
        availableAsVOD: video.availableAsVOD,
        videoFile: null,
        thumbnailFile: null,
        trailerFile: null,
      });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setUploadProgress({});
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    try {
      let videoUrl: ExternalBlob;
      let thumbnailUrl: ExternalBlob;

      if (editingId) {
        const existing = standaloneVideos.find(v => v.id === editingId);
        if (!existing) return;

        videoUrl = form.videoFile
          ? ExternalBlob.fromBytes(new Uint8Array(await form.videoFile.arrayBuffer())).withUploadProgress(p =>
              setUploadProgress(prev => ({ ...prev, video: p }))
            )
          : existing.videoUrl;

        thumbnailUrl = form.thumbnailFile
          ? ExternalBlob.fromBytes(new Uint8Array(await form.thumbnailFile.arrayBuffer())).withUploadProgress(p =>
              setUploadProgress(prev => ({ ...prev, thumbnail: p }))
            )
          : existing.thumbnailUrl;

        let trailerUrl: ExternalBlob | undefined = existing.trailerUrl;
        if (form.trailerFile) {
          trailerUrl = ExternalBlob.fromBytes(new Uint8Array(await form.trailerFile.arrayBuffer())).withUploadProgress(p =>
            setUploadProgress(prev => ({ ...prev, trailer: p }))
          );
        }

        await updateVideo.mutateAsync({
          videoId: editingId,
          video: {
            ...existing,
            title: form.title,
            description: form.description,
            genre: form.genre || undefined,
            releaseYear: form.releaseYear ? BigInt(form.releaseYear) : undefined,
            roles: form.roles || undefined,
            contentType: form.contentType,
            isPremium: form.isPremium,
            isOriginal: form.isOriginal,
            eligibleForLive: form.eligibleForLive,
            availableAsVOD: form.availableAsVOD,
            videoUrl,
            thumbnailUrl,
            trailerUrl,
          },
        });
      } else {
        if (!form.videoFile || !form.thumbnailFile) return;

        videoUrl = ExternalBlob.fromBytes(new Uint8Array(await form.videoFile.arrayBuffer())).withUploadProgress(p =>
          setUploadProgress(prev => ({ ...prev, video: p }))
        );
        thumbnailUrl = ExternalBlob.fromBytes(new Uint8Array(await form.thumbnailFile.arrayBuffer())).withUploadProgress(p =>
          setUploadProgress(prev => ({ ...prev, thumbnail: p }))
        );

        let trailerUrl: ExternalBlob | undefined;
        if (form.trailerFile) {
          trailerUrl = ExternalBlob.fromBytes(new Uint8Array(await form.trailerFile.arrayBuffer())).withUploadProgress(p =>
            setUploadProgress(prev => ({ ...prev, trailer: p }))
          );
        }

        await addVideo.mutateAsync({
          id: `video-${Date.now()}`,
          title: form.title,
          description: form.description,
          genre: form.genre || undefined,
          releaseYear: form.releaseYear ? BigInt(form.releaseYear) : undefined,
          roles: form.roles || undefined,
          contentType: form.contentType,
          isPremium: form.isPremium,
          isOriginal: form.isOriginal,
          isClip: false,
          eligibleForLive: form.eligibleForLive,
          availableAsVOD: form.availableAsVOD,
          videoUrl,
          thumbnailUrl,
          trailerUrl,
          sourceVideoId: undefined,
          clipCaption: undefined,
          previewClipUrl: undefined,
        });
      }

      handleClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const isPending = addVideo.isPending || updateVideo.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Videos Management
        </h2>
        <Button onClick={() => handleOpen()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : standaloneVideos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No videos yet. Add your first video!
        </div>
      ) : (
        <div className="grid gap-3">
          {standaloneVideos.map(video => (
            <div key={video.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={video.thumbnailUrl.getDirectURL()}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{video.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{video.contentType} {video.genre ? `• ${video.genre}` : ''}</p>
                  <div className="flex gap-1 mt-1">
                    {video.isPremium && <Badge variant="default" className="text-xs">Premium</Badge>}
                    {video.isOriginal && <Badge variant="secondary" className="text-xs">Original</Badge>}
                    {video.eligibleForLive && <Badge variant="outline" className="text-xs">Live Eligible</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpen(video)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{video.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVideo.mutate(video.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Video' : 'Add New Video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Video description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Genre</Label>
                <Input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="e.g. Drama, Comedy" />
              </div>
              <div className="space-y-1">
                <Label>Release Year</Label>
                <Input type="number" value={form.releaseYear} onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))} placeholder="2024" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Cast / Roles</Label>
              <Input value={form.roles} onChange={e => setForm(f => ({ ...f, roles: e.target.value }))} placeholder="Actor 1, Actor 2..." />
            </div>
            <div className="space-y-1">
              <Label>Content Type</Label>
              <Select value={form.contentType} onValueChange={v => setForm(f => ({ ...f, contentType: v as ContentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.tvSeries}>TV Series</SelectItem>
                  <SelectItem value={ContentType.series}>Series</SelectItem>
                  <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                  <SelectItem value={ContentType.faithBased}>Faith-Based</SelectItem>
                  <SelectItem value={ContentType.educational}>Educational</SelectItem>
                  <SelectItem value={ContentType.music}>Music</SelectItem>
                  <SelectItem value={ContentType.news}>News</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Video File {!editingId && '*'}</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="video/*" onChange={e => setForm(f => ({ ...f, videoFile: e.target.files?.[0] || null }))} />
                {uploadProgress.video !== undefined && <Progress value={uploadProgress.video} className="w-24" />}
              </div>
              {editingId && <p className="text-xs text-muted-foreground">Leave empty to keep existing video</p>}
            </div>

            <div className="space-y-1">
              <Label>Thumbnail Image {!editingId && '*'}</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, thumbnailFile: e.target.files?.[0] || null }))} />
                {uploadProgress.thumbnail !== undefined && <Progress value={uploadProgress.thumbnail} className="w-24" />}
              </div>
              {editingId && <p className="text-xs text-muted-foreground">Leave empty to keep existing thumbnail</p>}
            </div>

            <div className="space-y-1">
              <Label>Trailer (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="video/*" onChange={e => setForm(f => ({ ...f, trailerFile: e.target.files?.[0] || null }))} />
                {uploadProgress.trailer !== undefined && <Progress value={uploadProgress.trailer} className="w-24" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Premium Content</Label>
                <Switch checked={form.isPremium} onCheckedChange={v => setForm(f => ({ ...f, isPremium: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Mark as Original</Label>
                <Switch checked={form.isOriginal} onCheckedChange={v => setForm(f => ({ ...f, isOriginal: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Eligible for Live TV</Label>
                <Switch checked={form.eligibleForLive} onCheckedChange={v => setForm(f => ({ ...f, eligibleForLive: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Available as VOD</Label>
                <Switch checked={form.availableAsVOD} onCheckedChange={v => setForm(f => ({ ...f, availableAsVOD: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.title.trim() || (!editingId && (!form.videoFile || !form.thumbnailFile))}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : editingId ? 'Update Video' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
