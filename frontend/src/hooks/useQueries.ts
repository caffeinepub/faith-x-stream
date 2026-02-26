import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type {
  VideoContent,
  TVSeries,
  LiveChannel,
  Brand,
  AdMedia,
  AdAssignment,
  Channel,
  StripeConfiguration,
  UserProfile,
  Analytics,
  ShoppingItem,
} from '../backend';
import { ContentType } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// ── Role Management ──────────────────────────────────────────────────────────

export function useGetCallerFullUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerFullUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerFullUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useIsCallerAdmin = useGetIsCallerAdmin;

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User promoted to admin');
    },
    onError: (error: Error) => {
      toast.error(`Failed to promote user: ${error.message}`);
    },
  });
}

export function usePromoteToMasterAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToMasterAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User promoted to Master Admin');
    },
    onError: (error: Error) => {
      toast.error(`Failed to promote user: ${error.message}`);
    },
  });
}

export function useDemoteFromAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User demoted from admin');
    },
    onError: (error: Error) => {
      toast.error(`Failed to demote user: ${error.message}`);
    },
  });
}

export function useDemoteFromMasterAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromMasterAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User demoted from Master Admin');
    },
    onError: (error: Error) => {
      toast.error(`Failed to demote user: ${error.message}`);
    },
  });
}

export function useGrantPremiumAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, isPremium }: { user: Principal; isPremium: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getUserProfile(user);
      if (!profile) throw new Error('User profile not found');
      const updatedProfile: UserProfile = { ...profile, isPremium };
      await actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Premium access updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update premium access: ${error.message}`);
    },
  });
}

// ── Videos ───────────────────────────────────────────────────────────────────

export function useGetAllVideos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetVideoById(videoId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoContent | null>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoById(videoId);
    },
    enabled: !!actor && !actorFetching && !!videoId,
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: VideoContent) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      toast.success('Video added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add video: ${error.message}`);
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, video }: { videoId: string; video: VideoContent }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVideo(videoId, video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      toast.success('Video updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update video: ${error.message}`);
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      toast.success('Video deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete video: ${error.message}`);
    },
  });
}

// ── Clips ────────────────────────────────────────────────────────────────────

export function useGetAllClips() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['clips'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClips();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGenerateAutoClips() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceVideoId: string) => {
      if (!actor) throw new Error('Actor not available');
      const sourceVideo = await actor.getVideoById(sourceVideoId);
      if (!sourceVideo) throw new Error('Source video not found');

      const captions = [
        `${sourceVideo.title} - Short`,
        `${sourceVideo.title} - Highlight`,
        `${sourceVideo.title} - Quick View`,
      ];

      const clips: VideoContent[] = captions.map((caption, index) => ({
        ...sourceVideo,
        id: `${sourceVideoId}-autoclip-${Date.now()}-${index}`,
        isClip: true,
        sourceVideoId: sourceVideoId,
        clipCaption: caption,
        title: caption,
        availableAsVOD: true,
        eligibleForLive: false,
      }));

      for (const clip of clips) {
        await actor.addVideo(clip);
      }

      return clips.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success(`Generated ${count} auto-clips successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate auto-clips: ${error.message}`);
    },
  });
}

// ── Series ───────────────────────────────────────────────────────────────────

export function useGetAllSeries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TVSeries[]>({
    queryKey: ['series'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSeries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetSeriesById(seriesId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TVSeries | null>({
    queryKey: ['series', seriesId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSeriesById(seriesId);
    },
    enabled: !!actor && !actorFetching && !!seriesId,
  });
}

export function useAddSeries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tvSeries: TVSeries) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addSeries(tvSeries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Series added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add series: ${error.message}`);
    },
  });
}

export function useUpdateSeries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seriesId, tvSeries }: { seriesId: string; tvSeries: TVSeries }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSeries(seriesId, tvSeries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Series updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update series: ${error.message}`);
    },
  });
}

export function useDeleteSeries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seriesId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteSeries(seriesId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Series deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete series: ${error.message}`);
    },
  });
}

// ── Live Channels ────────────────────────────────────────────────────────────

export function useGetLiveChannels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveChannel[]>({
    queryKey: ['liveChannels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveChannels();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useGetAllLiveChannels = useGetLiveChannels;

export function useAddLiveChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: LiveChannel) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addLiveChannel(channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveChannels'] });
      toast.success('Live channel added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add live channel: ${error.message}`);
    },
  });
}

export function useUpdateLiveChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, channel }: { channelId: string; channel: LiveChannel }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateLiveChannel(channelId, channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveChannels'] });
      toast.success('Live channel updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update live channel: ${error.message}`);
    },
  });
}

export function useDeleteLiveChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteLiveChannel(channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveChannels'] });
      toast.success('Live channel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete live channel: ${error.message}`);
    },
  });
}

export function useGetEligibleVideosForLive() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['eligibleVideosForLive'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEligibleVideosForLive();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Brands ───────────────────────────────────────────────────────────────────

export function useGetAllBrands() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBrands();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBrandById(brandId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Brand | null>({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBrandById(brandId);
    },
    enabled: !!actor && !actorFetching && !!brandId,
  });
}

export function useGetChannelsByBrand(brandId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['channelsByBrand', brandId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChannelsByBrand(brandId);
    },
    enabled: !!actor && !actorFetching && !!brandId,
  });
}

export function useAddBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brand: Brand) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addBrand(brand);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add brand: ${error.message}`);
    },
  });
}

export function useUpdateBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ brandId, brand }: { brandId: string; brand: Brand }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateBrand(brandId, brand);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand'] });
      queryClient.invalidateQueries({ queryKey: ['channelsByBrand'] });
      toast.success('Brand updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update brand: ${error.message}`);
    },
  });
}

export function useDeleteBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteBrand(brandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete brand: ${error.message}`);
    },
  });
}

// ── Channels ─────────────────────────────────────────────────────────────────

export function useGetChannels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: Channel) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addChannel(channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Channel added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add channel: ${error.message}`);
    },
  });
}

export function useUpdateChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, channel }: { channelId: string; channel: Channel }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateChannel(channelId, channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Channel updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update channel: ${error.message}`);
    },
  });
}

export function useDeleteChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteChannel(channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Channel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete channel: ${error.message}`);
    },
  });
}

// ── Ad Media ─────────────────────────────────────────────────────────────────

export function useGetAdMedia() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdMedia[]>({
    queryKey: ['adMedia'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdMedia();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAdMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: AdMedia) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdMedia(ad);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adMedia'] });
      toast.success('Ad media added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add ad media: ${error.message}`);
    },
  });
}

export function useUpdateAdMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adId, ad }: { adId: string; ad: AdMedia }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateAdMedia(adId, ad);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adMedia'] });
      toast.success('Ad media updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ad media: ${error.message}`);
    },
  });
}

export function useDeleteAdMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAdMedia(adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adMedia'] });
      toast.success('Ad media deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete ad media: ${error.message}`);
    },
  });
}

// ── Ad Assignments ───────────────────────────────────────────────────────────

export function useGetAdAssignments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdAssignment[]>({
    queryKey: ['adAssignments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdAssignments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAdAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: AdAssignment) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdAssignment(assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adAssignments'] });
      toast.success('Ad assignment added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add ad assignment: ${error.message}`);
    },
  });
}

export function useUpdateAdAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, assignment }: { assignmentId: string; assignment: AdAssignment }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateAdAssignment(assignmentId, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adAssignments'] });
      toast.success('Ad assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ad assignment: ${error.message}`);
    },
  });
}

export function useDeleteAdAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAdAssignment(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adAssignments'] });
      toast.success('Ad assignment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete ad assignment: ${error.message}`);
    },
  });
}

// ── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configuration saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save Stripe configuration: ${error.message}`);
    },
  });
}

export function useCreateCheckout() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]) => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
    onError: (error: Error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['stripeSession', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    retry: false,
  });
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function useGetAnalytics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalytics();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Search ───────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!actor) return [];
      return actor.search(query);
    },
    enabled: !!actor && !actorFetching && query.length > 0,
  });
}

// ── Watch History ────────────────────────────────────────────────────────────

export function useGetWatchHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddToWatchHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addToWatchHistory(contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
    },
  });
}

// ── Content Type re-export ───────────────────────────────────────────────────

export { ContentType };
