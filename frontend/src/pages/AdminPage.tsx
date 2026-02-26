import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import MoviesManagement from '../components/admin/MoviesManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import ChannelManagement from '../components/admin/ChannelManagement';
import VideoManagement from '../components/admin/VideoManagement';
import ClipsManagement from '../components/admin/ClipsManagement';
import LiveScheduleManagement from '../components/admin/LiveScheduleManagement';
import BrandManagement from '../components/admin/BrandManagement';
import ManualAdsManagement from '../components/admin/ManualAdsManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import StripeSetup from '../components/admin/StripeSetup';
import MasterAdminManagement from '../components/admin/MasterAdminManagement';
import PodcastsManagement from '../components/admin/PodcastsManagement';
import {
  LayoutDashboard,
  Film,
  Tv,
  Radio,
  Building2,
  Megaphone,
  BarChart3,
  CreditCard,
  Shield,
  Mic,
  Video,
  Scissors,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, isInitializing, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const isAdmin = role === 'admin' || role === 'masterAdmin';
  const isMasterAdmin = role === 'masterAdmin';

  // Show loading while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You must be logged in to access the admin panel.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel. Only administrators can access this area.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'podcasts', label: 'Podcasts', icon: Mic },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'clips', label: 'Clips', icon: Scissors },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'channels', label: 'Channels', icon: Building2 },
    { id: 'live', label: 'Live TV', icon: Radio },
    { id: 'brands', label: 'Brands', icon: Building2 },
    { id: 'ads', label: 'Ads', icon: Megaphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'stripe', label: 'Stripe', icon: CreditCard },
    ...(isMasterAdmin ? [{ id: 'masterAdmin', label: 'Master Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            {isMasterAdmin ? 'Master Admin — Full system access' : 'Admin — Content management access'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab List */}
          <div className="overflow-x-auto pb-2 mb-6">
            <TabsList className="inline-flex h-auto gap-1 bg-card border border-border p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Movies', icon: Film, tab: 'movies' },
                { label: 'Series', icon: Tv, tab: 'series' },
                { label: 'Live Channels', icon: Radio, tab: 'live' },
                { label: 'Brands', icon: Building2, tab: 'brands' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 hover:bg-card/80 transition-all group"
                  >
                    <Icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Manage {item.label.toLowerCase()}</p>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Ads', icon: Megaphone, tab: 'ads' },
                { label: 'Analytics', icon: BarChart3, tab: 'analytics' },
                { label: 'Stripe', icon: CreditCard, tab: 'stripe' },
                ...(isMasterAdmin ? [{ label: 'Master Admin', icon: Shield, tab: 'masterAdmin' }] : []),
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 hover:bg-card/80 transition-all group"
                  >
                    <Icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Manage {item.label.toLowerCase()}</p>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="movies"><MoviesManagement /></TabsContent>
          <TabsContent value="podcasts"><PodcastsManagement /></TabsContent>
          <TabsContent value="videos"><VideoManagement /></TabsContent>
          <TabsContent value="clips"><ClipsManagement /></TabsContent>
          <TabsContent value="series"><SeriesManagement /></TabsContent>
          <TabsContent value="channels"><ChannelManagement /></TabsContent>
          <TabsContent value="live"><LiveScheduleManagement /></TabsContent>
          <TabsContent value="brands"><BrandManagement /></TabsContent>
          <TabsContent value="ads"><ManualAdsManagement /></TabsContent>
          <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
          <TabsContent value="stripe"><StripeSetup /></TabsContent>
          {isMasterAdmin && (
            <TabsContent value="masterAdmin"><MasterAdminManagement /></TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
