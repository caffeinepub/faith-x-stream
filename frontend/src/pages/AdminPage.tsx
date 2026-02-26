import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Video, Scissors, Tv, Radio, Building2, DollarSign, BarChart3, CreditCard, Podcast, Film } from 'lucide-react';
import VideoManagement from '../components/admin/VideoManagement';
import MoviesManagement from '../components/admin/MoviesManagement';
import PodcastsManagement from '../components/admin/PodcastsManagement';
import ClipsManagement from '../components/admin/ClipsManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import ChannelManagement from '../components/admin/ChannelManagement';
import LiveScheduleManagement from '../components/admin/LiveScheduleManagement';
import BrandManagement from '../components/admin/BrandManagement';
import ManualAdsManagement from '../components/admin/ManualAdsManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import StripeSetup from '../components/admin/StripeSetup';

export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const [activeTab, setActiveTab] = useState('movies');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your streaming platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-11 gap-2 h-auto p-2 bg-gradient-to-r from-black/80 to-primary/10">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Movies</span>
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="flex items-center gap-2">
              <Podcast className="h-4 w-4" />
              <span className="hidden sm:inline">Podcasts</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="clips" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Clips</span>
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Series</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Channels</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Live TV</span>
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Brands</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <MoviesManagement />
          </TabsContent>

          <TabsContent value="podcasts">
            <PodcastsManagement />
          </TabsContent>

          <TabsContent value="videos">
            <VideoManagement />
          </TabsContent>

          <TabsContent value="clips">
            <ClipsManagement />
          </TabsContent>

          <TabsContent value="series">
            <SeriesManagement />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelManagement />
          </TabsContent>

          <TabsContent value="live">
            <LiveScheduleManagement />
          </TabsContent>

          <TabsContent value="brands">
            <BrandManagement />
          </TabsContent>

          <TabsContent value="ads">
            <ManualAdsManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeSetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
