import { useIsCallerAdmin } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Lock } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import VideoManagement from '../components/admin/VideoManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import ChannelManagement from '../components/admin/ChannelManagement';
import ManualAdsManagement from '../components/admin/ManualAdsManagement';
import StripeSetup from '../components/admin/StripeSetup';
import BrandManagement from '../components/admin/BrandManagement';
import ClipsManagement from '../components/admin/ClipsManagement';
import LiveScheduleManagement from '../components/admin/LiveScheduleManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Alert className="gradient-card border-2 border-destructive shadow-xl">
          <Lock className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-glow-primary">Admin Panel</h1>

      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList className="grid w-full max-w-5xl grid-cols-9 h-auto gradient-card border-2 border-primary/30 p-1">
          <TabsTrigger value="videos" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Videos</TabsTrigger>
          <TabsTrigger value="clips" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Clips</TabsTrigger>
          <TabsTrigger value="series" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Series</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Channels</TabsTrigger>
          <TabsTrigger value="live" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Live TV</TabsTrigger>
          <TabsTrigger value="brands" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Brands</TabsTrigger>
          <TabsTrigger value="ads" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Ads</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Analytics</TabsTrigger>
          <TabsTrigger value="stripe" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl">Stripe</TabsTrigger>
        </TabsList>

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
  );
}
