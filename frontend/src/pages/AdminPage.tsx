import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  Film,
  Mic,
  Video,
  Scissors,
  Tv,
  Radio,
  Tag,
  BarChart2,
  CreditCard,
  Crown,
  Megaphone,
  Building2,
  Eye,
  TrendingUp,
  DollarSign,
  Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import MoviesManagement from '../components/admin/MoviesManagement';
import PodcastsManagement from '../components/admin/PodcastsManagement';
import VideoManagement from '../components/admin/VideoManagement';
import ClipsManagement from '../components/admin/ClipsManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import ChannelManagement from '../components/admin/ChannelManagement';
import LiveScheduleManagement from '../components/admin/LiveScheduleManagement';
import BrandManagement from '../components/admin/BrandManagement';
import ManualAdsManagement from '../components/admin/ManualAdsManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import StripeSetup from '../components/admin/StripeSetup';
import MasterAdminManagement from '../components/admin/MasterAdminManagement';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

function AdminDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: seriesList = [], isLoading: seriesLoading } = useQuery({
    queryKey: ['allSeries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSeries();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalytics();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['allBrands'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBrands();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: liveChannels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['liveChannels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveChannels();
    },
    enabled: !!actor && !actorFetching,
  });

  const totalContent = videos.length + seriesList.length;
  const totalViews = analytics ? Number(analytics.totalViews) : 0;
  const premiumUsers = analytics ? Number(analytics.premiumUserCount) : 0;
  const adImpressions = analytics ? Number(analytics.adImpressions) : 0;
  const revenue = analytics?.subscriptionRevenue ?? 0;

  const isLoading = videosLoading || seriesLoading || analyticsLoading || brandsLoading || channelsLoading;

  const statCards = [
    {
      title: 'Total Content',
      value: totalContent,
      icon: Film,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      tab: 'movies',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      tab: 'analytics',
    },
    {
      title: 'Premium Users',
      value: premiumUsers.toLocaleString(),
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      tab: 'masterAdmin',
    },
    {
      title: 'Ad Impressions',
      value: adImpressions.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      tab: 'ads',
    },
    {
      title: 'Revenue',
      value: `$${Number(revenue).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      tab: 'stripe',
    },
    {
      title: 'Live Channels',
      value: liveChannels.length,
      icon: Radio,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      tab: 'channels',
    },
    {
      title: 'Brands / Networks',
      value: brands.length,
      icon: Building2,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      tab: 'brands',
    },
    {
      title: 'Series',
      value: seriesList.length,
      icon: Tv,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      tab: 'series',
    },
  ];

  const quickLinks = [
    { label: 'Movies', icon: Film, tab: 'movies' },
    { label: 'Podcasts', icon: Mic, tab: 'podcasts' },
    { label: 'Videos', icon: Video, tab: 'videos' },
    { label: 'Clips', icon: Scissors, tab: 'clips' },
    { label: 'Series', icon: Tv, tab: 'series' },
    { label: 'Channels', icon: Radio, tab: 'channels' },
    { label: 'Live TV', icon: Radio, tab: 'liveTV' },
    { label: 'Brands', icon: Building2, tab: 'brands' },
    { label: 'Ads', icon: Megaphone, tab: 'ads' },
    { label: 'Analytics', icon: BarChart2, tab: 'analytics' },
    { label: 'Stripe', icon: CreditCard, tab: 'stripe' },
    { label: 'Users', icon: Users, tab: 'masterAdmin' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">Platform overview and quick access to all admin sections.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:border-primary/50 transition-colors bg-card/60 border-border/50"
              onClick={() => onNavigate(card.tab)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-16 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-foreground">{card.value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.label}
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => onNavigate(link.tab)}
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs">{link.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Platform Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Content Library</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Videos</span>
                  {isLoading ? <Skeleton className="h-4 w-8" /> : <span className="font-medium">{videos.filter(v => !v.isClip).length}</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clips</span>
                  {isLoading ? <Skeleton className="h-4 w-8" /> : <span className="font-medium">{videos.filter(v => v.isClip).length}</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Series</span>
                  {isLoading ? <Skeleton className="h-4 w-8" /> : <span className="font-medium">{seriesList.length}</span>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Engagement</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Views</span>
                  {isLoading ? <Skeleton className="h-4 w-12" /> : <span className="font-medium">{totalViews.toLocaleString()}</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ad Impressions</span>
                  {isLoading ? <Skeleton className="h-4 w-12" /> : <span className="font-medium">{adImpressions.toLocaleString()}</span>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Monetization</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Premium Users</span>
                  {isLoading ? <Skeleton className="h-4 w-8" /> : <span className="font-medium">{premiumUsers.toLocaleString()}</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  {isLoading ? <Skeleton className="h-4 w-16" /> : <span className="font-medium">${Number(revenue).toFixed(2)}</span>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { actor, isFetching: actorFetching } = useActor();

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: isMasterAdmin, isLoading: masterAdminLoading } = useQuery({
    queryKey: ['isCallerMasterAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerMasterAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: fullRole } = useQuery({
    queryKey: ['callerFullUserRole'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerFullUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  if (isInitializing || adminLoading || masterAdminLoading || actorFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
            <p className="text-muted-foreground">You must be logged in to access the admin panel.</p>
            <Button onClick={() => navigate({ to: '/login' })} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin && !isMasterAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel. Admin or Master Admin role required.</p>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMasterAdminUser = isMasterAdmin || fullRole === 'masterAdmin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">
              {isMasterAdminUser ? (
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  Master Admin Access
                </span>
              ) : (
                'Admin Access'
              )}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex w-max gap-1 bg-card/60 border border-border/50 p-1 h-auto flex-wrap">
              <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="movies" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Film className="w-3.5 h-3.5" />
                Movies
              </TabsTrigger>
              <TabsTrigger value="podcasts" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Mic className="w-3.5 h-3.5" />
                Podcasts
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Video className="w-3.5 h-3.5" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="clips" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Scissors className="w-3.5 h-3.5" />
                Clips
              </TabsTrigger>
              <TabsTrigger value="series" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Tv className="w-3.5 h-3.5" />
                Series
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Radio className="w-3.5 h-3.5" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="liveTV" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Radio className="w-3.5 h-3.5" />
                Live TV
              </TabsTrigger>
              <TabsTrigger value="brands" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Building2 className="w-3.5 h-3.5" />
                Brands
              </TabsTrigger>
              <TabsTrigger value="ads" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <Megaphone className="w-3.5 h-3.5" />
                Ads
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <BarChart2 className="w-3.5 h-3.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="stripe" className="flex items-center gap-1.5 text-xs px-3 py-2">
                <CreditCard className="w-3.5 h-3.5" />
                Stripe
              </TabsTrigger>
              {isMasterAdminUser && (
                <TabsTrigger
                  value="masterAdmin"
                  className="flex items-center gap-1.5 text-xs px-3 py-2 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400">Master Admin</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <AdminDashboard onNavigate={setActiveTab} />
          </TabsContent>

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

          <TabsContent value="liveTV">
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

          {isMasterAdminUser && (
            <TabsContent value="masterAdmin">
              <MasterAdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
