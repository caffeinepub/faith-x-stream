import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllSeries, useGetAdMedia, useGetAdAssignments, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import VideoPlayer from '../components/VideoPlayer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Lock, Crown, Zap } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function EpisodePlayerPage() {
  const { seriesId, seasonId, episodeId } = useParams({
    from: '/watch-episode/$seriesId/$seasonId/$episodeId',
  });
  const navigate = useNavigate();
  const { data: allSeries, isLoading } = useGetAllSeries();
  const { data: adMedia } = useGetAdMedia();
  const { data: adAssignments } = useGetAdAssignments();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const series = allSeries?.find((s) => s.id === seriesId);
  const season = series?.seasons.find((s) => s.id === seasonId);
  const episode = season?.episodes.find((e) => e.id === episodeId);

  const isAuthenticated = !!identity;
  const isPremiumUser = (!!userProfile?.isPremium) || (!!isAdmin);
  const shouldSeeAds = !isPremiumUser;
  const canWatch = episode && (!episode.isPremium || episode.isFirstEpisode || isPremiumUser);

  // Get ads for this episode (only for users who should see ads)
  const episodeAds = shouldSeeAds ? adAssignments
    ?.filter((a) => a.scope === 'video' && a.targetId === episodeId)
    .flatMap((a) => a.adIds.map((id) => adMedia?.find((ad) => ad.id === id)))
    .filter((ad) => ad !== undefined) || [] : [];

  const globalAds = shouldSeeAds ? adAssignments
    ?.filter((a) => a.scope === 'global')
    .flatMap((a) => a.adIds.map((id) => adMedia?.find((ad) => ad.id === id)))
    .filter((ad) => ad !== undefined) || [] : [];

  const adsToShow = episodeAds.length > 0 ? episodeAds : globalAds;

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-8">
        <Skeleton className="w-full aspect-video rounded-lg mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
    );
  }

  if (!series || !season || !episode) {
    return (
      <div className="container px-4 md:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Episode not found</h1>
        <Button onClick={() => navigate({ to: '/tv-shows' })}>Go to TV Shows</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/series/$seriesId', params: { seriesId } })}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {series.title}
        </Button>

        {canWatch ? (
          <>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mb-6">
              <VideoPlayer
                videoUrl={episode.videoUrl.getDirectURL()}
                title={`${series.title} - ${season.title} - ${episode.title}`}
                ads={adsToShow}
                isPremiumUser={isPremiumUser}
                isPremiumContent={episode.isPremium}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{episode.title}</h1>
                  <p className="text-muted-foreground">
                    {series.title} • {season.title} • Episode {Number(episode.episodeNumber)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {episode.isPremium && (
                    <Badge className="bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {isPremiumUser && (
                    <Badge className="bg-gradient-to-r from-[oklch(0.50_0.18_200)] to-[oklch(0.40_0.15_220)] text-white border-0">
                      <Zap className="h-3 w-3 mr-1" />
                      Ad-Free
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{Number(episode.runtimeMinutes)} minutes</span>
                {episode.isFirstEpisode && (
                  <span className="text-[oklch(0.45_0.2_0)]">• Free Preview Episode</span>
                )}
              </div>
              <p className="text-muted-foreground max-w-3xl">{episode.description}</p>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[oklch(0.25_0.08_0)] to-[oklch(0.15_0.05_0)] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold">Premium Content</h2>
                <p className="text-muted-foreground">Subscribe to watch this episode</p>
                <Button
                  onClick={() => navigate({ to: '/upgrade' })}
                  className="bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] hover:from-[oklch(0.60_0.22_40)] hover:to-[oklch(0.50_0.22_0)] text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
            <Alert className="border-[oklch(0.45_0.2_0)]">
              <Lock className="h-4 w-4" />
              <AlertTitle>Premium Subscription Required</AlertTitle>
              <AlertDescription>
                This episode is only available to premium subscribers. Upgrade now to enjoy unlimited access to all premium content, ad-free viewing, HD & 4K quality, and priority support.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
