import { useState } from 'react';
import { useAddLiveChannel, useGetAllLiveChannels, useUpdateLiveChannel, useDeleteLiveChannel } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { Radio, Loader2, Star, Trash2, Edit } from 'lucide-react';
import type { LiveChannel } from '../../backend';

export default function ChannelManagement() {
  const { data: channels } = useGetAllLiveChannels();
  const addChannel = useAddLiveChannel();
  const updateChannel = useUpdateLiveChannel();
  const deleteChannel = useDeleteLiveChannel();

  const [name, setName] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Edit state
  const [editingChannel, setEditingChannel] = useState<LiveChannel | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Please enter a channel name');
      return;
    }

    try {
      let logoBlob: ExternalBlob | undefined;
      if (logoFile) {
        const logoBytes = new Uint8Array(await logoFile.arrayBuffer());
        logoBlob = ExternalBlob.fromBytes(logoBytes);
      }

      const channel = {
        id: `channel-${Date.now()}`,
        name,
        schedule: [],
        logo: logoBlob,
        isOriginal,
      };

      await addChannel.mutateAsync(channel);

      toast.success('Channel created successfully!');
      setName('');
      setIsOriginal(false);
      setLogoFile(null);
    } catch (error) {
      toast.error('Failed to create channel');
      console.error(error);
    }
  };

  const openEditDialog = (channel: LiveChannel) => {
    setName(channel.name);
    setIsOriginal(channel.isOriginal);
    setLogoFile(null);
    setEditingChannel(channel);
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    try {
      let logoBlob = editingChannel.logo;

      if (logoFile) {
        const logoBytes = new Uint8Array(await logoFile.arrayBuffer());
        logoBlob = ExternalBlob.fromBytes(logoBytes);
      }

      const updatedChannel: LiveChannel = {
        ...editingChannel,
        name,
        isOriginal,
        logo: logoBlob,
      };

      await updateChannel.mutateAsync({ channelId: editingChannel.id, channel: updatedChannel });
      toast.success('Channel updated successfully!');
      
      setEditDialogOpen(false);
      setEditingChannel(null);
      setName('');
      setIsOriginal(false);
      setLogoFile(null);
    } catch (error) {
      toast.error('Failed to update channel');
      console.error(error);
    }
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to delete "${channelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteChannel.mutateAsync(channelId);
      toast.success('Channel deleted successfully');
    } catch (error) {
      toast.error('Failed to delete channel');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Live Channel</CardTitle>
          <CardDescription>Add a new live TV channel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelName">Channel Name *</Label>
              <Input
                id="channelName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter channel name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Channel Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                {logoFile && (
                  <span className="text-sm text-muted-foreground">{logoFile.name}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="channelOriginal" checked={isOriginal} onCheckedChange={setIsOriginal} />
              <Label htmlFor="channelOriginal" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Mark as Original Channel
              </Label>
            </div>

            <Button
              type="submit"
              disabled={addChannel.isPending}
              className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
            >
              {addChannel.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4 mr-2" />
                  Create Channel
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Channels</CardTitle>
          <CardDescription>Total: {channels?.length || 0} channels</CardDescription>
        </CardHeader>
        <CardContent>
          {channels && channels.length > 0 ? (
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img
                        src={channel.logo.getDirectURL()}
                        alt={channel.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <Radio className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{channel.name}</p>
                        {channel.isOriginal && (
                          <Star className="h-4 w-4 text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {channel.schedule.length} programs
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(channel)}
                      disabled={updateChannel.isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteChannel(channel.id, channel.name)}
                      disabled={deleteChannel.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {deleteChannel.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No channels created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-channelName">Channel Name *</Label>
              <Input
                id="edit-channelName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter channel name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-logo">Channel Logo (leave empty to keep current)</Label>
              <Input
                id="edit-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="edit-channelOriginal" checked={isOriginal} onCheckedChange={setIsOriginal} />
              <Label htmlFor="edit-channelOriginal" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Mark as Original Channel
              </Label>
            </div>

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
                disabled={updateChannel.isPending}
              >
                {updateChannel.isPending ? 'Updating...' : 'Update Channel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
