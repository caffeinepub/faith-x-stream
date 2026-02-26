import { useNavigate } from '@tanstack/react-router';
import { User, Mail, Star, Shield, Clock, Crown, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin, useGetWatchHistory, useGetAllVideos } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isInitializing } = useAuth();
  const { identity } = useInternetIdentity();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const { data: isAdmin } = useIsCallerAdmin();
  const { data: watchHistory = [] } = useGetWatchHistory();
  const { data: allVideos = [] } = useGetAllVideos();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  // Show loading while auth is initializing or profile is loading
  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated && !identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Sign in to view your profile</h2>
          <p className="text-foreground/60">You need to be signed in to access your profile.</p>
          <Button onClick={() => navigate({ to: '/login' })}>Sign In</Button>
        </div>
      </div>
    );
  }

  // Profile not found after fetching (only show after fetch completes)
  if (profileFetched && !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Profile Setup Required</h2>
          <p className="text-foreground/60 max-w-sm">
            Your profile hasn't been set up yet. Please complete your profile to get started.
          </p>
          <Button onClick={() => navigate({ to: '/login' })}>Complete Setup</Button>
        </div>
      </div>
    );
  }

  const watchedVideos = allVideos.filter((v) => watchHistory.includes(v.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-foreground/60 mt-1">Manage your account and preferences</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{userProfile?.name || 'User'}</h2>
                {isAdmin && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin / Premium+
                  </Badge>
                )}
                {!isAdmin && userProfile?.isPremium && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-foreground/60 text-sm">{userProfile?.email || ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-foreground/50">Email</p>
                <p className="text-sm font-medium text-foreground">{userProfile?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-foreground/50">Account Type</p>
                <p className="text-sm font-medium text-foreground">
                  {isAdmin ? 'Administrator' : userProfile?.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
            </div>
            {userProfile?.hasPrioritySupport && (
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-xs text-foreground/50">Support</p>
                  <p className="text-sm font-medium text-foreground">Priority Support</p>
                </div>
              </div>
            )}
          </div>

          {!userProfile?.isPremium && !isAdmin && (
            <div className="pt-2">
              <Button
                onClick={() => navigate({ to: '/upgrade' })}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              >
                <Star className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>

        {/* Watch History */}
        <div className="bg-card border border-border/40 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            Watch History
          </h3>
          {watchedVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {watchedVideos.slice(0, 9).map((video) => (
                <div
                  key={video.id}
                  className="cursor-pointer group"
                  onClick={() => navigate({ to: '/watch/$contentId', params: { contentId: video.id } })}
                >
                  <div className="aspect-video bg-background/50 rounded-lg overflow-hidden">
                    <img
                      src={video.thumbnailUrl.getDirectURL()}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-foreground/70 mt-1 truncate">{video.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/40 text-sm">No watch history yet. Start watching to see your history here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
