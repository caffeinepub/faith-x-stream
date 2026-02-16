import { useState } from 'react';
import {
  useAddSeries,
  useGetAllSeries,
  useDeleteSeries,
  useUpdateSeries,
} from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { ExternalBlob, ContentType } from '../../backend';
import type { TVSeries, Season, Episode } from '../../backend';
import { Upload, Loader2, Plus, Trash2, Star, Film } from 'lucide-react';

export default function SeriesManagement() {
  const { data: allSeries } = useGetAllSeries();
  const addSeries = useAddSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  // Series form state
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesIsOriginal, setSeriesIsOriginal] = useState(false);
  const [seriesThumbnail, setSeriesThumbnail] = useState<File | null>(null);
  const [seriesTrailer, setSeriesTrailer] = useState<File | null>(null);

  // Season form state
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [seasonIsOriginal, setSeasonIsOriginal] = useState(false);

  // Episode form state
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [episodeRuntime, setEpisodeRuntime] = useState('');
  const [episodeIsPremium, setEpisodeIsPremium] = useState(false);
  const [episodeIsFirst, setEpisodeIsFirst] = useState(false);
  const [episodeIsOriginal, setEpisodeIsOriginal] = useState(false);
  const [episodeVideo, setEpisodeVideo] = useState<File | null>(null);
  const [episodeThumbnail, setEpisodeThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seriesTitle || !seriesDescription || !seriesThumbnail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const thumbnailBytes = new Uint8Array(await seriesThumbnail.arrayBuffer());
      const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);

      let trailerBlob: ExternalBlob | undefined = undefined;
      if (seriesTrailer) {
        const trailerBytes = new Uint8Array(await seriesTrailer.arrayBuffer());
        trailerBlob = ExternalBlob.fromBytes(trailerBytes);
      }

      const newSeries: TVSeries = {
        id: `series-${Date.now()}`,
        title: seriesTitle,
        description: seriesDescription,
        contentType: ContentType.tvSeries,
        thumbnailUrl: thumbnailBlob,
        isOriginal: seriesIsOriginal,
        trailerUrl: trailerBlob,
        seasons: [],
      };

      await addSeries.mutateAsync(newSeries);

      toast.success('Series created successfully!');
      setSeriesTitle('');
      setSeriesDescription('');
      setSeriesIsOriginal(false);
      setSeriesThumbnail(null);
      setSeriesTrailer(null);
    } catch (error) {
      toast.error('Failed to create series');
      console.error(error);
    }
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSeriesId || !seasonNumber || !seasonTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const targetSeries = allSeries?.find((s) => s.id === selectedSeriesId);
      if (!targetSeries) throw new Error('Series not found');

      const newSeason: Season = {
        id: `season-${Date.now()}`,
        seasonNumber: BigInt(seasonNumber),
        title: seasonTitle,
        isOriginal: seasonIsOriginal,
        episodes: [],
      };

      const updatedSeries = {
        ...targetSeries,
        seasons: [...targetSeries.seasons, newSeason],
      };

      await updateSeries.mutateAsync({ seriesId: selectedSeriesId, series: updatedSeries });

      toast.success('Season added successfully!');
      setSeasonNumber('');
      setSeasonTitle('');
      setSeasonIsOriginal(false);
    } catch (error) {
      toast.error('Failed to add season');
      console.error(error);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedSeriesId ||
      !selectedSeasonId ||
      !episodeNumber ||
      !episodeTitle ||
      !episodeDescription ||
      !episodeRuntime ||
      !episodeVideo ||
      !episodeThumbnail
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const targetSeries = allSeries?.find((s) => s.id === selectedSeriesId);
      if (!targetSeries) throw new Error('Series not found');

      const videoBytes = new Uint8Array(await episodeVideo.arrayBuffer());
      const thumbnailBytes = new Uint8Array(await episodeThumbnail.arrayBuffer());

      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes);

      const newEpisode: Episode = {
        id: `episode-${Date.now()}`,
        seasonId: selectedSeasonId,
        episodeNumber: BigInt(episodeNumber),
        title: episodeTitle,
        description: episodeDescription,
        runtimeMinutes: BigInt(episodeRuntime),
        videoUrl: videoBlob,
        thumbnailUrl: thumbnailBlob,
        isPremium: episodeIsPremium,
        isFirstEpisode: episodeIsFirst,
        isOriginal: episodeIsOriginal,
        contentType: ContentType.tvSeries,
      };

      const updatedSeasons = targetSeries.seasons.map((season) => {
        if (season.id === selectedSeasonId) {
          return {
            ...season,
            episodes: [...season.episodes, newEpisode],
          };
        }
        return season;
      });

      const updatedSeries = {
        ...targetSeries,
        seasons: updatedSeasons,
      };

      await updateSeries.mutateAsync({ seriesId: selectedSeriesId, series: updatedSeries });

      toast.success('Episode added successfully!');
      setEpisodeNumber('');
      setEpisodeTitle('');
      setEpisodeDescription('');
      setEpisodeRuntime('');
      setEpisodeIsPremium(false);
      setEpisodeIsFirst(false);
      setEpisodeIsOriginal(false);
      setEpisodeVideo(null);
      setEpisodeThumbnail(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to add episode');
      console.error(error);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure you want to delete this series? This will delete all seasons and episodes.')) return;

    try {
      await deleteSeries.mutateAsync(seriesId);
      toast.success('Series deleted successfully');
    } catch (error) {
      toast.error('Failed to delete series');
      console.error(error);
    }
  };

  const toggleSeriesOriginal = async (series: TVSeries) => {
    try {
      await updateSeries.mutateAsync({
        seriesId: series.id,
        series: { ...series, isOriginal: !series.isOriginal },
      });
      toast.success(`Series ${!series.isOriginal ? 'marked' : 'unmarked'} as Original`);
    } catch (error) {
      toast.error('Failed to update series');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Series</CardTitle>
          <CardDescription>Add a new TV series to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSeries} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seriesTitle">Series Title *</Label>
              <Input
                id="seriesTitle"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                placeholder="Enter series title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seriesDescription">Description *</Label>
              <Textarea
                id="seriesDescription"
                value={seriesDescription}
                onChange={(e) => setSeriesDescription(e.target.value)}
                placeholder="Enter series description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seriesThumbnail">Series Thumbnail *</Label>
              <Input
                id="seriesThumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setSeriesThumbnail(e.target.files?.[0] || null)}
                className="cursor-pointer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seriesTrailer" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Series Trailer (Optional - for preview in featured slideshow)
              </Label>
              <Input
                id="seriesTrailer"
                type="file"
                accept="video/*"
                onChange={(e) => setSeriesTrailer(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload a short trailer that will play automatically in the featured slideshow
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="seriesOriginal" checked={seriesIsOriginal} onCheckedChange={setSeriesIsOriginal} />
              <Label htmlFor="seriesOriginal" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Mark as Original Series
              </Label>
            </div>

            <Button
              type="submit"
              disabled={addSeries.isPending}
              className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
            >
              {addSeries.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Series
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Series</CardTitle>
          <CardDescription>Total: {allSeries?.length || 0} series</CardDescription>
        </CardHeader>
        <CardContent>
          {allSeries && allSeries.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-2">
              {allSeries.map((series) => (
                <AccordionItem key={series.id} value={series.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{series.title}</p>
                          {series.isOriginal && (
                            <Star className="h-4 w-4 text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]" />
                          )}
                          {series.trailerUrl && (
                            <span title="Has trailer">
                              <Film className="h-4 w-4 text-primary" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {series.seasons.length} season(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSeriesOriginal(series);
                          }}
                          title={series.isOriginal ? 'Unmark as Original' : 'Mark as Original'}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              series.isOriginal
                                ? 'text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSeries(series.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSeriesId(series.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Season
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Season to {series.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSeason} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="seasonNumber">Season Number *</Label>
                            <Input
                              id="seasonNumber"
                              type="number"
                              value={seasonNumber}
                              onChange={(e) => setSeasonNumber(e.target.value)}
                              placeholder="e.g., 1"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="seasonTitle">Season Title *</Label>
                            <Input
                              id="seasonTitle"
                              value={seasonTitle}
                              onChange={(e) => setSeasonTitle(e.target.value)}
                              placeholder="e.g., Season 1"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="seasonOriginal" checked={seasonIsOriginal} onCheckedChange={setSeasonIsOriginal} />
                            <Label htmlFor="seasonOriginal" className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Mark as Original Season
                            </Label>
                          </div>
                          <Button type="submit" disabled={updateSeries.isPending}>
                            {updateSeries.isPending ? 'Adding...' : 'Add Season'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {series.seasons.length > 0 && (
                      <div className="space-y-2">
                        {series.seasons.map((season) => (
                          <div key={season.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {season.title} ({season.episodes.length} episodes)
                                </p>
                                {season.isOriginal && (
                                  <Star className="h-4 w-4 text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]" />
                                )}
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSeriesId(series.id);
                                      setSelectedSeasonId(season.id);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Episode
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Add Episode to {series.title} - {season.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleAddEpisode} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="episodeNumber">Episode Number *</Label>
                                        <Input
                                          id="episodeNumber"
                                          type="number"
                                          value={episodeNumber}
                                          onChange={(e) => setEpisodeNumber(e.target.value)}
                                          placeholder="e.g., 1"
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="episodeRuntime">Runtime (minutes) *</Label>
                                        <Input
                                          id="episodeRuntime"
                                          type="number"
                                          value={episodeRuntime}
                                          onChange={(e) => setEpisodeRuntime(e.target.value)}
                                          placeholder="e.g., 45"
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="episodeTitle">Episode Title *</Label>
                                      <Input
                                        id="episodeTitle"
                                        value={episodeTitle}
                                        onChange={(e) => setEpisodeTitle(e.target.value)}
                                        placeholder="Enter episode title"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="episodeDescription">Description *</Label>
                                      <Textarea
                                        id="episodeDescription"
                                        value={episodeDescription}
                                        onChange={(e) => setEpisodeDescription(e.target.value)}
                                        placeholder="Enter episode description"
                                        rows={3}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="episodeVideo">Video File *</Label>
                                      <Input
                                        id="episodeVideo"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setEpisodeVideo(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="episodeThumbnail">Thumbnail *</Label>
                                      <Input
                                        id="episodeThumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEpisodeThumbnail(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                        required
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="episodePremium"
                                        checked={episodeIsPremium}
                                        onCheckedChange={setEpisodeIsPremium}
                                      />
                                      <Label htmlFor="episodePremium">Premium Episode</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="episodeFirst"
                                        checked={episodeIsFirst}
                                        onCheckedChange={setEpisodeIsFirst}
                                      />
                                      <Label htmlFor="episodeFirst">First Episode (Free Preview)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="episodeOriginal"
                                        checked={episodeIsOriginal}
                                        onCheckedChange={setEpisodeIsOriginal}
                                      />
                                      <Label htmlFor="episodeOriginal" className="flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        Mark as Original Episode
                                      </Label>
                                    </div>
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span>Uploading...</span>
                                          <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                          <div
                                            className="bg-[oklch(0.45_0.2_0)] h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <Button type="submit" disabled={updateSeries.isPending}>
                                      {updateSeries.isPending ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Adding...
                                        </>
                                      ) : (
                                        'Add Episode'
                                      )}
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {season.episodes.length > 0 && (
                              <div className="space-y-1 pl-4">
                                {season.episodes.map((episode) => (
                                  <div
                                    key={episode.id}
                                    className="text-sm text-muted-foreground flex items-center justify-between"
                                  >
                                    <span className="flex items-center gap-2">
                                      E{Number(episode.episodeNumber)}: {episode.title}
                                      {episode.isOriginal && (
                                        <Star className="h-3 w-3 text-[oklch(0.45_0.2_0)] fill-[oklch(0.45_0.2_0)]" />
                                      )}
                                    </span>
                                    <span className="text-xs">
                                      {episode.isPremium ? '🔒 Premium' : '🆓 Free'}
                                      {episode.isFirstEpisode && ' • First Episode'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-8">No series created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
