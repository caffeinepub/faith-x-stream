import { useState } from 'react';
import { useAddBrand, useGetAllBrands, useDeleteBrand, useUpdateBrand, useGetAllVideos, useGetAllSeries, useGetAllLiveChannels } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { Building2, Loader2, Trash2, Plus, X } from 'lucide-react';

export default function BrandManagement() {
  const { data: brands } = useGetAllBrands();
  const { data: videos } = useGetAllVideos();
  const { data: series } = useGetAllSeries();
  const { data: channels } = useGetAllLiveChannels();
  const addBrand = useAddBrand();
  const deleteBrand = useDeleteBrand();
  const updateBrand = useUpdateBrand();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Content assignment state
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('film');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let logoBlob: ExternalBlob | undefined;
      if (logoFile) {
        const logoBytes = new Uint8Array(await logoFile.arrayBuffer());
        logoBlob = ExternalBlob.fromBytes(logoBytes);
      }

      const brand = {
        id: `brand-${Date.now()}`,
        name,
        description,
        logo: logoBlob,
        channels: [],
        assignedFilms: [],
        assignedSeries: [],
        assignedEpisodes: [],
        assignedClips: [],
        assignedLiveChannels: [],
      };

      await addBrand.mutateAsync(brand);

      toast.success('Brand created successfully!');
      setName('');
      setDescription('');
      setLogoFile(null);
    } catch (error) {
      toast.error('Failed to create brand');
      console.error(error);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await deleteBrand.mutateAsync(brandId);
      toast.success('Brand deleted successfully');
    } catch (error) {
      toast.error('Failed to delete brand');
      console.error(error);
    }
  };

  const handleAssignContent = async () => {
    if (!selectedBrand || selectedContentIds.length === 0) {
      toast.error('Please select a brand and content');
      return;
    }

    try {
      const brand = brands?.find((b) => b.id === selectedBrand);
      if (!brand) throw new Error('Brand not found');

      let updatedBrand = { ...brand };

      switch (selectedContentType) {
        case 'film':
          updatedBrand.assignedFilms = [...brand.assignedFilms, ...selectedContentIds];
          break;
        case 'series':
          updatedBrand.assignedSeries = [...brand.assignedSeries, ...selectedContentIds];
          break;
        case 'clip':
          updatedBrand.assignedClips = [...brand.assignedClips, ...selectedContentIds];
          break;
        case 'liveChannel':
          updatedBrand.assignedLiveChannels = [...brand.assignedLiveChannels, ...selectedContentIds];
          break;
      }

      await updateBrand.mutateAsync({ brandId: selectedBrand, brand: updatedBrand });
      toast.success('Content assigned successfully');
      setSelectedContentIds([]);
    } catch (error) {
      toast.error('Failed to assign content');
      console.error(error);
    }
  };

  const handleRemoveContent = async (brandId: string, contentType: string, contentId: string) => {
    try {
      const brand = brands?.find((b) => b.id === brandId);
      if (!brand) throw new Error('Brand not found');

      let updatedBrand = { ...brand };

      switch (contentType) {
        case 'film':
          updatedBrand.assignedFilms = brand.assignedFilms.filter((id) => id !== contentId);
          break;
        case 'series':
          updatedBrand.assignedSeries = brand.assignedSeries.filter((id) => id !== contentId);
          break;
        case 'clip':
          updatedBrand.assignedClips = brand.assignedClips.filter((id) => id !== contentId);
          break;
        case 'liveChannel':
          updatedBrand.assignedLiveChannels = brand.assignedLiveChannels.filter((id) => id !== contentId);
          break;
      }

      await updateBrand.mutateAsync({ brandId, brand: updatedBrand });
      toast.success('Content removed successfully');
    } catch (error) {
      toast.error('Failed to remove content');
      console.error(error);
    }
  };

  const getAvailableContent = () => {
    switch (selectedContentType) {
      case 'film':
        return videos?.filter((v) => !v.isClip) || [];
      case 'clip':
        return videos?.filter((v) => v.isClip) || [];
      case 'series':
        return series || [];
      case 'liveChannel':
        return channels || [];
      default:
        return [];
    }
  };

  const toggleContentSelection = (contentId: string) => {
    setSelectedContentIds((prev) =>
      prev.includes(contentId) ? prev.filter((id) => id !== contentId) : [...prev, contentId]
    );
  };

  const selectedBrandData = brands?.find((b) => b.id === selectedBrand);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Brand</TabsTrigger>
          <TabsTrigger value="assign">Assign Content</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Brand/Network</CardTitle>
              <CardDescription>Add a new content brand or network</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter brand description"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Brand Logo (Optional)</Label>
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

                <Button
                  type="submit"
                  disabled={addBrand.isPending}
                  className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
                >
                  {addBrand.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Brand
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Assign Content to Brand</CardTitle>
              <CardDescription>Link films, series, clips, and live channels to brands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Films & Videos</SelectItem>
                      <SelectItem value="series">Series</SelectItem>
                      <SelectItem value="clip">Clips</SelectItem>
                      <SelectItem value="liveChannel">Live Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedBrand && (
                <>
                  <div className="space-y-2">
                    <Label>Select Content</Label>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                      {getAvailableContent().map((content: any) => (
                        <div
                          key={content.id}
                          onClick={() => toggleContentSelection(content.id)}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedContentIds.includes(content.id)
                              ? 'bg-[oklch(0.35_0.15_0)] border-2 border-[oklch(0.45_0.2_0)]'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <p className="font-medium">{content.title || content.name}</p>
                        </div>
                      ))}
                      {getAvailableContent().length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No content available</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleAssignContent}
                    disabled={updateBrand.isPending || selectedContentIds.length === 0}
                    className="w-full bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
                  >
                    {updateBrand.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Selected Content ({selectedContentIds.length})
                      </>
                    )}
                  </Button>

                  {/* Show currently assigned content */}
                  {selectedBrandData && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Currently Assigned Content</h3>
                      
                      {selectedBrandData.assignedFilms.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Films ({selectedBrandData.assignedFilms.length})</p>
                          <div className="space-y-1">
                            {selectedBrandData.assignedFilms.map((filmId) => {
                              const film = videos?.find((v) => v.id === filmId);
                              return film ? (
                                <div key={filmId} className="flex items-center justify-between p-2 bg-secondary rounded">
                                  <span className="text-sm">{film.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveContent(selectedBrand, 'film', filmId)}
                                    className="h-6 w-6"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {selectedBrandData.assignedSeries.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Series ({selectedBrandData.assignedSeries.length})</p>
                          <div className="space-y-1">
                            {selectedBrandData.assignedSeries.map((seriesId) => {
                              const s = series?.find((s) => s.id === seriesId);
                              return s ? (
                                <div key={seriesId} className="flex items-center justify-between p-2 bg-secondary rounded">
                                  <span className="text-sm">{s.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveContent(selectedBrand, 'series', seriesId)}
                                    className="h-6 w-6"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {selectedBrandData.assignedClips.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Clips ({selectedBrandData.assignedClips.length})</p>
                          <div className="space-y-1">
                            {selectedBrandData.assignedClips.map((clipId) => {
                              const clip = videos?.find((v) => v.id === clipId);
                              return clip ? (
                                <div key={clipId} className="flex items-center justify-between p-2 bg-secondary rounded">
                                  <span className="text-sm">{clip.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveContent(selectedBrand, 'clip', clipId)}
                                    className="h-6 w-6"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {selectedBrandData.assignedLiveChannels.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Live Channels ({selectedBrandData.assignedLiveChannels.length})</p>
                          <div className="space-y-1">
                            {selectedBrandData.assignedLiveChannels.map((channelId) => {
                              const channel = channels?.find((c) => c.id === channelId);
                              return channel ? (
                                <div key={channelId} className="flex items-center justify-between p-2 bg-secondary rounded">
                                  <span className="text-sm">{channel.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveContent(selectedBrand, 'liveChannel', channelId)}
                                    className="h-6 w-6"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Brands & Networks</CardTitle>
          <CardDescription>Total: {brands?.length || 0} brands</CardDescription>
        </CardHeader>
        <CardContent>
          {brands && brands.length > 0 ? (
            <div className="space-y-2">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo.getDirectURL()}
                        alt={brand.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {brand.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {brand.assignedFilms.length} films, {brand.assignedSeries.length} series, {brand.assignedClips.length} clips, {brand.assignedLiveChannels.length} channels
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(brand.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No brands created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
