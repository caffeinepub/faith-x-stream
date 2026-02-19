import { useState } from 'react';
import { useGetAllSeries, useAddSeries, useUpdateSeries, useDeleteSeries } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Trash2, Upload, Star, Film, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, ContentType } from '../../backend';
import type { TVSeries, Season, Episode } from '../../backend';

export default function SeriesManagement() {
  const { data: allSeries, isLoading } = useGetAllSeries();
  const addSeries = useAddSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  // Series form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.series);
  const [isOriginal, setIsOriginal] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Season/Episode management
  const [selectedSeries, setSelectedSeries] = useState<TVSeries | null>(null);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [editEpisodeDialogOpen, setEditEpisodeDialogOpen] = useState(false);
  
  const [seasonNumber, setSeasonNumber] = useState('');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [seasonIsOriginal, setSeasonIsOriginal] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [episodeRuntime, setEpisodeRuntime] = useState('');
  const [episodeIsPremium, setEpisodeIsPremium] = useState(false);
  const [episodeIsFirstEpisode, setEpisodeIsFirstEpisode] = useState(false);
  const [episodeIsOriginal, setEpisodeIsOriginal] = useState(false);
  const [episodeVideoFile, setEpisodeVideoFile] = useState<File | null>(null);
  const [episodeThumbnailFile, setEpisodeThumbnailFile] = useState<File | null>(null);
  const [episodeContentType, setEpisodeContentType] = useState<ContentType>(ContentType.tvSeries);

  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    try {
      const thumbnailBytes = new Uint8Array(await thumbnailFile.arrayBuffer());
      const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);

      let trailerBlob: ExternalBlob | undefined = undefined;
      if (trailerFile) {
        const trailerBytes = new Uint8Array(await trailerFile.arrayBuffer());
        trailerBlob = ExternalBlob.fromBytes(trailerBytes);
      }

      const series: TVSeries = {
        id: `series-${Date.now()}`,
        title,
        description,
        contentType,
        thumbnailUrl: thumbnailBlob,
        isOriginal,
        trailerUrl: trailerBlob,
        seasons: [],
      };

      await addSeries.mutateAsync(series);
      toast.success('Series created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setContentType(ContentType.series);
      setIsOriginal(false);
      setThumbnailFile(null);
      setTrailerFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to create series');
      console.error(error);
    }
  };

  const openSeasonDialog = (series: TVSeries) => {
    setSelectedSeries(series);
    setSeasonNumber('');
    setSeasonTitle('');
    setSeasonIsOriginal(false);
    setSeasonDialogOpen(true);
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;

    try {
      const newSeason: Season = {
        id: `season-${Date.now()}`,
        seasonNumber: BigInt(seasonNumber),
        title: seasonTitle,
        isOriginal: seasonIsOriginal,
        episodes: [],
      };

      const updatedSeries: TVSeries = {
        ...selectedSeries,
        seasons: [...selectedSeries.seasons, newSeason],
      };

      await updateSeries.mutateAsync({ seriesId: selectedSeries.id, series: updatedSeries });
      toast.success('Season added successfully!');
      
      setSeasonDialogOpen(false);
      setSeasonNumber('');
      setSeasonTitle('');
      setSeasonIsOriginal(false);
    } catch (error) {
      toast.error('Failed to add season');
      console.error(error);
    }
  };

  const openEpisodeDialog = (series: TVSeries, season: Season) => {
    setSelectedSeries(series);
    setSelectedSeason(season);
    setEpisodeNumber('');
    setEpisodeTitle('');
    setEpisodeDescription('');
    setEpisodeRuntime('');
    setEpisodeIsPremium(false);
    setEpisodeIsFirstEpisode(false);
    setEpisodeIsOriginal(false);
    setEpisodeVideoFile(null);
    setEpisodeThumbnailFile(null);
    setEpisodeContentType(ContentType.tvSeries);
    setEpisodeDialogOpen(true);
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries || !selectedSeason || !episodeVideoFile || !episodeThumbnailFile) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const videoBytes = new Uint8Array(await episodeVideoFile.arrayBuffer());
      const thumbnailBytes = new Uint8Array(await episodeThumbnailFile.arrayBuffer());

      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);

      const newEpisode: Episode = {
        id: `episode-${Date.now()}`,
        seasonId: selectedSeason.id,
        episodeNumber: BigInt(episodeNumber),
        title: episodeTitle,
        description: episodeDescription,
        runtimeMinutes: BigInt(episodeRuntime),
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
        isPremium: episodeIsPremium,
        isFirstEpisode: episodeIsFirstEpisode,
        isOriginal: episodeIsOriginal,
        contentType: episodeContentType,
      };

      const updatedSeasons = selectedSeries.seasons.map(s => 
        s.id === selectedSeason.id 
          ? { ...s, episodes: [...s.episodes, newEpisode] }
          : s
      );

      const updatedSeries: TVSeries = {
        ...selectedSeries,
        seasons: updatedSeasons,
      };

      await updateSeries.mutateAsync({ seriesId: selectedSeries.id, series: updatedSeries });
      toast.success('Episode added successfully!');
      
      setEpisodeDialogOpen(false);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to add episode');
      console.error(error);
    }
  };

  const openEditEpisodeDialog = (series: TVSeries, season: Season, episode: Episode) => {
    setSelectedSeries(series);
    setSelectedSeason(season);
    setEditingEpisode(episode);
    setEpisodeNumber(String(episode.episodeNumber));
    setEpisodeTitle(episode.title);
    setEpisodeDescription(episode.description);
    setEpisodeRuntime(String(episode.runtimeMinutes));
    setEpisodeIsPremium(episode.isPremium);
    setEpisodeIsFirstEpisode(episode.isFirstEpisode);
    setEpisodeIsOriginal(episode.isOriginal);
    setEpisodeContentType(episode.contentType);
    setEpisodeVideoFile(null);
    setEpisodeThumbnailFile(null);
    setEditEpisodeDialogOpen(true);
  };

  const handleUpdateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries || !selectedSeason || !editingEpisode) return;

    try {
      let videoBlob = editingEpisode.videoUrl;
      let thumbnailBlob = editingEpisode.thumbnailUrl;

      if (episodeVideoFile) {
        const videoBytes = new Uint8Array(await episodeVideoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      if (episodeThumbnailFile) {
        const thumbnailBytes = new Uint8Array(await episodeThumbnailFile.arrayBuffer());
        thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);
      }

      const updatedEpisode: Episode = {
        ...editingEpisode,
        episodeNumber: BigInt(episodeNumber),
        title: episodeTitle,
        description: episodeDescription,
        runtimeMinutes: BigInt(episodeRuntime),
        isPremium: episodeIsPremium,
        isFirstEpisode: episodeIsFirstEpisode,
        isOriginal: episodeIsOriginal,
        contentType: episodeContentType,
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
      };

      const updatedSeasons = selectedSeries.seasons.map(s => 
        s.id === selectedSeason.id 
          ? { ...s, episodes: s.episodes.map(ep => ep.id === editingEpisode.id ? updatedEpisode : ep) }
          : s
      );

      const updatedSeries: TVSeries = {
        ...selectedSeries,
        seasons: updatedSeasons,
      };

      await updateSeries.mutateAsync({ seriesId: selectedSeries.id, series: updatedSeries });
      toast.success('Episode updated successfully!');
      
      setEditEpisodeDialogOpen(false);
      setEditingEpisode(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to update episode');
      console.error(error);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure you want to delete this series?')) return;
    
    try {
      await deleteSeries.mutateAsync(seriesId);
      toast.success('Series deleted successfully');
    } catch (error) {
      toast.error('Failed to delete series');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading series...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Create New Series
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Series Title</Label>
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
                    <SelectItem value={ContentType.series}>Series</SelectItem>
                    <SelectItem value={ContentType.tvSeries}>TV Series</SelectItem>
                    <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                    <SelectItem value={ContentType.educational}>Educational</SelectItem>
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
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isOriginal"
                checked={isOriginal}
                onCheckedChange={(checked) => setIsOriginal(checked as boolean)}
              />
              <Label htmlFor="isOriginal" className="cursor-pointer flex items-center gap-1">
                <Star className="h-4 w-4 text-secondary" />
                Mark as Original
              </Label>
            </div>

            <Button
              type="submit"
              disabled={addSeries.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
            >
              {addSeries.isPending ? 'Creating...' : 'Create Series'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gradient-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Manage Series ({allSeries?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allSeries?.map((series) => (
              <div key={series.id} className="p-4 rounded-lg bg-black/60 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={series.thumbnailUrl.getDirectURL()}
                      alt={series.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {series.title}
                        {series.isOriginal && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                        {series.trailerUrl && (
                          <span title="Has trailer">
                            <Film className="h-4 w-4 text-primary" />
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{series.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {series.seasons.length} season(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSeasonDialog(series)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Season
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSeries(series.id)}
                      disabled={deleteSeries.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {series.seasons.length > 0 && (
                  <div className="space-y-3 mt-4 pl-4 border-l-2 border-primary/30">
                    {series.seasons.map((season) => (
                      <div key={season.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            Season {String(season.seasonNumber)}: {season.title}
                            {season.isOriginal && <Star className="h-3 w-3 text-secondary fill-secondary" />}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEpisodeDialog(series, season)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Episode
                          </Button>
                        </div>
                        {season.episodes.length > 0 && (
                          <div className="space-y-1 pl-4">
                            {season.episodes.map((episode) => (
                              <div key={episode.id} className="flex items-center justify-between text-sm p-2 rounded bg-black/40">
                                <span className="flex items-center gap-2">
                                  Ep {String(episode.episodeNumber)}: {episode.title}
                                  {episode.isOriginal && <Star className="h-3 w-3 text-secondary fill-secondary" />}
                                  {episode.isPremium && (
                                    <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">Premium</span>
                                  )}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditEpisodeDialog(series, season, episode)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!allSeries || allSeries.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No series created yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Season Dialog */}
      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Season to {selectedSeries?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSeason} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seasonNumber">Season Number</Label>
              <Input
                id="seasonNumber"
                type="number"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonTitle">Season Title</Label>
              <Input
                id="seasonTitle"
                value={seasonTitle}
                onChange={(e) => setSeasonTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="seasonIsOriginal"
                checked={seasonIsOriginal}
                onCheckedChange={(checked) => setSeasonIsOriginal(checked as boolean)}
              />
              <Label htmlFor="seasonIsOriginal" className="cursor-pointer flex items-center gap-1">
                <Star className="h-4 w-4 text-secondary" />
                Mark as Original
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSeasonDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSeries.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Add Season
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Episode Dialog */}
      <Dialog open={episodeDialogOpen} onOpenChange={setEpisodeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Episode to Season {selectedSeason ? String(selectedSeason.seasonNumber) : ''}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEpisode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="episodeNumber">Episode Number</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeRuntime">Runtime (minutes)</Label>
                <Input
                  id="episodeRuntime"
                  type="number"
                  value={episodeRuntime}
                  onChange={(e) => setEpisodeRuntime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="episodeTitle">Episode Title</Label>
              <Input
                id="episodeTitle"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="episodeDescription">Description</Label>
              <Textarea
                id="episodeDescription"
                value={episodeDescription}
                onChange={(e) => setEpisodeDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="episodeContentType">Content Type</Label>
              <Select value={episodeContentType} onValueChange={(value) => setEpisodeContentType(value as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.tvSeries}>TV Series</SelectItem>
                  <SelectItem value={ContentType.series}>Series</SelectItem>
                  <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                  <SelectItem value={ContentType.educational}>Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="episodeVideo">Video File *</Label>
                <Input
                  id="episodeVideo"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEpisodeVideoFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeThumbnail">Thumbnail *</Label>
                <Input
                  id="episodeThumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEpisodeThumbnailFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="episodeIsPremium"
                  checked={episodeIsPremium}
                  onCheckedChange={(checked) => setEpisodeIsPremium(checked as boolean)}
                />
                <Label htmlFor="episodeIsPremium" className="cursor-pointer">Premium Content</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="episodeIsFirstEpisode"
                  checked={episodeIsFirstEpisode}
                  onCheckedChange={(checked) => setEpisodeIsFirstEpisode(checked as boolean)}
                />
                <Label htmlFor="episodeIsFirstEpisode" className="cursor-pointer">First Episode (Free Preview)</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="episodeIsOriginal"
                  checked={episodeIsOriginal}
                  onCheckedChange={(checked) => setEpisodeIsOriginal(checked as boolean)}
                />
                <Label htmlFor="episodeIsOriginal" className="cursor-pointer flex items-center gap-1">
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEpisodeDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSeries.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Add Episode
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Episode Dialog */}
      <Dialog open={editEpisodeDialogOpen} onOpenChange={setEditEpisodeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Episode</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEpisode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-episodeNumber">Episode Number</Label>
                <Input
                  id="edit-episodeNumber"
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-episodeRuntime">Runtime (minutes)</Label>
                <Input
                  id="edit-episodeRuntime"
                  type="number"
                  value={episodeRuntime}
                  onChange={(e) => setEpisodeRuntime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-episodeTitle">Episode Title</Label>
              <Input
                id="edit-episodeTitle"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-episodeDescription">Description</Label>
              <Textarea
                id="edit-episodeDescription"
                value={episodeDescription}
                onChange={(e) => setEpisodeDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-episodeContentType">Content Type</Label>
              <Select value={episodeContentType} onValueChange={(value) => setEpisodeContentType(value as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.tvSeries}>TV Series</SelectItem>
                  <SelectItem value={ContentType.series}>Series</SelectItem>
                  <SelectItem value={ContentType.documentary}>Documentary</SelectItem>
                  <SelectItem value={ContentType.educational}>Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-episodeVideo">Replace Video (Optional)</Label>
                <Input
                  id="edit-episodeVideo"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEpisodeVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-episodeThumbnail">Replace Thumbnail (Optional)</Label>
                <Input
                  id="edit-episodeThumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEpisodeThumbnailFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-episodeIsPremium"
                  checked={episodeIsPremium}
                  onCheckedChange={(checked) => setEpisodeIsPremium(checked as boolean)}
                />
                <Label htmlFor="edit-episodeIsPremium" className="cursor-pointer">Premium Content</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-episodeIsFirstEpisode"
                  checked={episodeIsFirstEpisode}
                  onCheckedChange={(checked) => setEpisodeIsFirstEpisode(checked as boolean)}
                />
                <Label htmlFor="edit-episodeIsFirstEpisode" className="cursor-pointer">First Episode (Free Preview)</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-episodeIsOriginal"
                  checked={episodeIsOriginal}
                  onCheckedChange={(checked) => setEpisodeIsOriginal(checked as boolean)}
                />
                <Label htmlFor="edit-episodeIsOriginal" className="cursor-pointer flex items-center gap-1">
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditEpisodeDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSeries.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Update Episode
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
