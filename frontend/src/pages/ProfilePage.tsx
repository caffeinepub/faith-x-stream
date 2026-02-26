import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetWatchHistory, useGetAllVideos, useGetAllSeries, useIsCallerAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { User, Mail, Crown, History, ArrowLeft, Play, Shield, Star } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: watchHistoryIds, isLoading: historyLoading } = useGetWatchHistory();
  const { data: videos } = useGetAllVideos();
  const { data: series } = useGetAllSeries();

  const isAuthenticated = !!identity;
  const isAdminWithPremium = !!isAdmin;

  useEffect(() => {
    if (!isAuthenticated && !profileLoading) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, profileLoading, navigate]);

  if (!isAuthenticated || profileLoading || adminLoading) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-6xl mx-auto">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const watchedContent = watchHistoryIds?.map((id) => {
    const video = videos?.find((v) => v.id === id);
    if (video) return { type: 'video', content: video };
    
    for (const s of series || []) {
      for (const season of s.seasons) {
        const episode = season.episodes.find((e) => e.id === id);
        if (episode) return { type: 'episode', content: episode, series: s };
      }
    }
    return null;
  }).filter(Boolean) || [];

  return (
    <div className="container px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 hover:bg-primary/20 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <div className="space-y-6 md:space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{userProfile.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-3">{userProfile.email}</p>
            <div className="flex flex-wrap gap-2">
              {isAdminWithPremium ? (
                <Badge className="bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Admin / Premium+
                </Badge>
              ) : userProfile.isPremium ? (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Member
                </Badge>
              ) : null}
              {userProfile.hasPrioritySupport && (
                <Badge className="bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Priority Support
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Card className="gradient-card border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-5 w-5 text-primary" />
                Account Details
              </CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{userProfile.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{userProfile.email}</p>
                </div>
              </div>
              {userProfile.hasPrioritySupport && (
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-muted-foreground">Support Level</p>
                    <p className="font-medium text-primary">Priority Support</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Crown className="h-5 w-5 text-primary" />
                Subscription Status
              </CardTitle>
              <CardDescription>Your membership level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
                  {isAdminWithPremium ? (
                    <div className="space-y-3">
                      <Badge className="bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground border-0 text-sm px-3 py-1">
                        <Star className="h-4 w-4 mr-1" />
                        Admin / Premium+
                      </Badge>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Full admin access & controls</p>
                        <p>✓ Unlimited premium content access</p>
                        <p>✓ Ad-free viewing experience</p>
                        <p>✓ HD and 4K streaming quality</p>
                        <p>✓ Exclusive originals & early releases</p>
                        <p>✓ Priority customer support</p>
                      </div>
                    </div>
                  ) : userProfile.isPremium ? (
                    <div className="space-y-3">
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 text-sm px-3 py-1">
                        <Crown className="h-4 w-4 mr-1" />
                        Premium
                      </Badge>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Unlimited premium content access</p>
                        <p>✓ Ad-free viewing experience</p>
                        <p>✓ HD and 4K streaming quality</p>
                        <p>✓ Exclusive originals & early releases</p>
                        <p>✓ Priority customer support</p>
                      </div>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-2 border-primary/40">
                      Free
                    </Badge>
                  )}
                </div>
                {!userProfile.isPremium && !isAdminWithPremium && (
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground transition-opacity duration-200"
                    onClick={() => navigate({ to: '/upgrade' })}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Watch History */}
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <History className="h-5 w-5 text-primary" />
              Watch History
            </CardTitle>
            <CardDescription>Recently watched content</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                ))}
              </div>
            ) : watchedContent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {watchedContent.slice(0, 10).map((item, index) => {
                  if (!item) return null;
                  
                  if (item.type === 'video') {
                    const video = item.content as any;
                    return (
                      <div
                        key={index}
                        onClick={() => navigate({ to: '/watch/$contentId', params: { contentId: video.id } })}
                        className="group relative cursor-pointer rounded-lg overflow-hidden gradient-card border-2 border-primary/30 hover:border-primary transition-all duration-200 aspect-[2/3]"
                      >
                        <img
                          src={video.thumbnailUrl.getDirectURL()}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Play className="h-6 w-6 text-primary-foreground fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <h3 className="font-semibold text-xs line-clamp-2">{video.title}</h3>
                        </div>
                      </div>
                    );
                  } else {
                    const episode = item.content as any;
                    const seriesData = item.series as any;
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          const season = seriesData.seasons.find((s: any) => 
                            s.episodes.some((e: any) => e.id === episode.id)
                          );
                          if (season) {
                            navigate({
                              to: '/watch-episode/$seriesId/$seasonId/$episodeId',
                              params: {
                                seriesId: seriesData.id,
                                seasonId: season.id,
                                episodeId: episode.id,
                              },
                            });
                          }
                        }}
                        className="group relative cursor-pointer rounded-lg overflow-hidden gradient-card border-2 border-primary/30 hover:border-primary transition-all duration-200 aspect-[2/3]"
                      >
                        <img
                          src={episode.thumbnailUrl.getDirectURL()}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Play className="h-6 w-6 text-primary-foreground fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <p className="text-xs text-muted-foreground mb-0.5">{seriesData.title}</p>
                          <h3 className="font-semibold text-xs line-clamp-1">{episode.title}</h3>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <History className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm md:text-base text-muted-foreground">No watch history yet</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">Start watching content to see your history here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
