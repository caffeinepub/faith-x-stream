import React, { useState } from 'react';
import {
  useGetAllClips,
  useGetAllVideos,
  useAddVideo,
  useUpdateVideo,
  useDeleteVideo,
  useGenerateAutoClips,
} from '../../hooks/useQueries';
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
import { Loader2, Plus, Pencil, Trash2, Scissors, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ClipFormData {
  title: string;
  description: string;
  clipCaption: string;
  isPremium: boolean;
  isOriginal: boolean;
  sourceVideoId: string;
  videoFile: File | null;
  thumbnailFile: File | null;
}

const defaultForm: ClipFormData = {
  title: '',
  description: '',
  clipCaption: '',
  isPremium: false,
  isOriginal: false,
  sourceVideoId: '',
  videoFile: null,
  thumbnailFile: null,
};

export default function ClipsManagement() {
  const { data: clips = [], isLoading } = useGetAllClips();
  const { data: allVideos = [] } = useGetAllVideos();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const generateAutoClips = useGenerateAutoClips();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClipFormData>(defaultForm);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [autoClipSourceId, setAutoClipSourceId] = useState('');

  const sourceVideos = allVideos.filter(v => !v.isClip);

  const handleOpen = (clip?: VideoContent) => {
    if (clip) {
      setEditingId(clip.id);
      setForm({
        title: clip.title,
        description: clip.description,
        clipCaption: clip.clipCaption || '',
        isPremium: clip.isPremium,
        isOriginal: clip.isOriginal,
        sourceVideoId: clip.sourceVideoId || '',
        videoFile: null,
        thumbnailFile: null,
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
        const existing = clips.find(c => c.id === editingId);
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

        await updateVideo.mutateAsync({
          videoId: editingId,
          video: {
            ...existing,
            title: form.title,
            description: form.description,
            clipCaption: form.clipCaption || undefined,
            isPremium: form.isPremium,
            isOriginal: form.isOriginal,
            sourceVideoId: form.sourceVideoId || undefined,
            videoUrl,
            thumbnailUrl,
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

        await addVideo.mutateAsync({
          id: `clip-${Date.now()}`,
          title: form.title,
          description: form.description,
          clipCaption: form.clipCaption || undefined,
          contentType: ContentType.tvSeries,
          isPremium: form.isPremium,
          isOriginal: form.isOriginal,
          isClip: true,
          eligibleForLive: false,
          availableAsVOD: true,
          videoUrl,
          thumbnailUrl,
          sourceVideoId: form.sourceVideoId || undefined,
          trailerUrl: undefined,
          previewClipUrl: undefined,
          genre: undefined,
          releaseYear: undefined,
          roles: undefined,
        });
      }

      handleClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleGenerateAutoClips = async () => {
    if (!autoClipSourceId) return;
    await generateAutoClips.mutateAsync(autoClipSourceId);
    setAutoClipSourceId('');
  };

  const isPending = addVideo.isPending || updateVideo.isPending;

  const manualClips = clips.filter(c => !c.clipCaption?.includes(' - Short') && !c.clipCaption?.includes(' - Highlight') && !c.clipCaption?.includes(' - Quick View'));
  const autoClips = clips.filter(c => c.clipCaption?.includes(' - Short') || c.clipCaption?.includes(' - Highlight') || c.clipCaption?.includes(' - Quick View'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Clips Management
        </h2>
        <Button onClick={() => handleOpen()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Clip Manually
        </Button>
      </div>

      {/* Auto-Clip Generation */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Auto-Generate Clips</h3>
          <Badge variant="outline" className="text-xs">4-5 sec clips</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a movie or video to automatically generate short highlight clips from it.
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={autoClipSourceId} onValueChange={setAutoClipSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source content..." />
              </SelectTrigger>
              <SelectContent>
                {sourceVideos.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title} ({v.contentType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerateAutoClips}
            disabled={!autoClipSourceId || generateAutoClips.isPending}
            className="gap-2"
          >
            {generateAutoClips.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            ) : (
              <><Zap className="w-4 h-4" />Generate Clips</>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : clips.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No clips yet. Add a clip manually or generate auto-clips from existing content.
        </div>
      ) : (
        <div className="space-y-4">
          {manualClips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Manual Clips ({manualClips.length})</h3>
              <div className="grid gap-3">
                {manualClips.map(clip => (
                  <ClipRow key={clip.id} clip={clip} isAuto={false} onEdit={() => handleOpen(clip)} onDelete={() => deleteVideo.mutate(clip.id)} isDeleting={deleteVideo.isPending} />
                ))}
              </div>
            </div>
          )}
          {autoClips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Auto-Generated Clips ({autoClips.length})</h3>
              <div className="grid gap-3">
                {autoClips.map(clip => (
                  <ClipRow key={clip.id} clip={clip} isAuto={true} onEdit={() => handleOpen(clip)} onDelete={() => deleteVideo.mutate(clip.id)} isDeleting={deleteVideo.isPending} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Clip' : 'Add New Clip'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Clip title" />
            </div>
            <div className="space-y-1">
              <Label>Caption / Short Description</Label>
              <Input value={form.clipCaption} onChange={e => setForm(f => ({ ...f, clipCaption: e.target.value }))} placeholder="Caption shown on clip" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Clip description" rows={2} />
            </div>
            <div className="space-y-1">
              <Label>Source Content (Optional)</Label>
              <Select value={form.sourceVideoId} onValueChange={v => setForm(f => ({ ...f, sourceVideoId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source video..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {sourceVideos.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Clip Video File {!editingId && '*'}</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Premium Content</Label>
                <Switch checked={form.isPremium} onCheckedChange={v => setForm(f => ({ ...f, isPremium: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label>Mark as Original</Label>
                <Switch checked={form.isOriginal} onCheckedChange={v => setForm(f => ({ ...f, isOriginal: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.title.trim() || (!editingId && (!form.videoFile || !form.thumbnailFile))}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : editingId ? 'Update Clip' : 'Add Clip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClipRow({ clip, isAuto, onEdit, onDelete, isDeleting }: {
  clip: VideoContent;
  isAuto: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-3">
        <div className="w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
          <img
            src={clip.thumbnailUrl.getDirectURL()}
            alt={clip.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div>
          <p className="font-medium text-foreground">{clip.title}</p>
          {clip.clipCaption && <p className="text-sm text-muted-foreground">{clip.clipCaption}</p>}
          <div className="flex gap-1 mt-1">
            {isAuto && <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Auto-Generated</Badge>}
            {clip.isPremium && <Badge variant="default" className="text-xs">Premium</Badge>}
            {clip.isOriginal && <Badge variant="secondary" className="text-xs">Original</Badge>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
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
              <AlertDialogTitle>Delete Clip</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{clip.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
