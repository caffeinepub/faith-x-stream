import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllVideos, useGetAllAdMedia, useGetAllAdAssignments, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import VideoPlayer from '../components/VideoPlayer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Lock, Crown, Zap } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function VideoPlayerPage() {
  const { contentId } = useParams({ from: '/watch/$contentId' });
  const navigate = useNavigate();
  const { data: videos, isLoading } = useGetAllVideos();
  const { data: adMedia } = useGetAllAdMedia();
  const { data: adAssignments } = useGetAllAdAssignments();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const video = videos?.find((v) => v.id === contentId);
  const isAuthenticated = !!identity;
  const isPremiumUser = (!!userProfile?.isPremium) || (!!isAdmin);
  const shouldSeeAds = !isPremiumUser;

  // Get ads for this video (only for users who should see ads)
  const videoAds = shouldSeeAds ? adAssignments
    ?.filter((a) => a.scope === 'video' && a.targetId === contentId)
    .flatMap((a) => a.adIds.map((id) => adMedia?.find((ad) => ad.id === id)))
    .filter((ad) => ad !== undefined) || [] : [];

  const globalAds = shouldSeeAds ? adAssignments
    ?.filter((a) => a.scope === 'global')
    .flatMap((a) => a.adIds.map((id) => adMedia?.find((ad) => ad.id === id)))
    .filter((ad) => ad !== undefined) || [] : [];

  const adsToShow = videoAds.length > 0 ? videoAds : globalAds;

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-8">
        <Skeleton className="w-full aspect-video rounded-lg mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container px-4 md:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Video not found</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
      </div>
    );
  }

  const canWatch = !video.isPremium || isPremiumUser;

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {canWatch ? (
          <>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mb-6">
              <VideoPlayer
                videoUrl={video.videoUrl.getDirectURL()}
                title={video.title}
                ads={adsToShow}
                isPremiumUser={isPremiumUser}
                isPremiumContent={video.isPremium}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold">{video.title}</h1>
                <div className="flex gap-2">
                  {video.isPremium && (
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
                {video.releaseYear && <span>{video.releaseYear.toString()}</span>}
                {video.genre && <span>• {video.genre}</span>}
              </div>
              <p className="text-muted-foreground max-w-3xl">{video.description}</p>
              {video.roles && (
                <div>
                  <h3 className="font-semibold mb-2">Cast</h3>
                  <p className="text-sm text-muted-foreground">{video.roles}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[oklch(0.25_0.08_0)] to-[oklch(0.15_0.05_0)] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold">Premium Content</h2>
                <p className="text-muted-foreground">Subscribe to watch this content</p>
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
                This content is only available to premium subscribers. Upgrade now to enjoy unlimited access to all premium content, ad-free viewing, HD & 4K quality, and priority support.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
