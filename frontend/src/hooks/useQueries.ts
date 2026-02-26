import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  VideoContent,
  TVSeries,
  LiveChannel,
  Brand,
  AdMedia,
  AdAssignment,
  UserProfile,
  Analytics,
  SearchResult,
  UserInfo,
  StripeConfiguration,
  ShoppingItem,
} from '../backend';

// ─── Public content queries ───────────────────────────────────────────────────

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoContent[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideoById(videoId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<VideoContent | null>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoById(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useGetAllClips() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoContent[]>({
    queryKey: ['clips'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSeries() {
  const { actor, isFetching } = useActor();
  return useQuery<TVSeries[]>({
    queryKey: ['series'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSeries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSeriesById(seriesId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TVSeries | null>({
    queryKey: ['series', seriesId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSeriesById(seriesId);
    },
    enabled: !!actor && !isFetching && !!seriesId,
  });
}

export function useGetLiveChannels() {
  const { actor, isFetching } = useActor();
  return useQuery<LiveChannel[]>({
    queryKey: ['liveChannels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiveChannels();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backward compatibility
export const useGetAllLiveChannels = useGetLiveChannels;

export function useGetAllBrands() {
  const { actor, isFetching } = useActor();
  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBrands();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBrandById(brandId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Brand | null>({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBrandById(brandId);
    },
    enabled: !!actor && !isFetching && !!brandId,
  });
}

export function useGetChannelsByBrand(brandId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    films: string[];
    episodes: string[];
    clips: string[];
    channels: any[];
    series: string[];
    liveChannels: string[];
  }>({
    queryKey: ['brandChannels', brandId],
    queryFn: async () => {
      if (!actor) return { films: [], episodes: [], clips: [], channels: [], series: [], liveChannels: [] };
      return actor.getChannelsByBrand(brandId);
    },
    enabled: !!actor && !isFetching && !!brandId,
  });
}

export function useGetAdMedia() {
  const { actor, isFetching } = useActor();
  return useQuery<AdMedia[]>({
    queryKey: ['adMedia'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdMedia();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdAssignments() {
  const { actor, isFetching } = useActor();
  return useQuery<AdAssignment[]>({
    queryKey: ['adAssignments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdAssignments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdAssignmentsForLive(liveChannelId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AdAssignment[]>({
    queryKey: ['adAssignmentsLive', liveChannelId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdAssignmentsForLive(liveChannelId);
    },
    enabled: !!actor && !isFetching && !!liveChannelId,
  });
}

export function useSearch(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.search(query);
    },
    enabled: !!actor && !isFetching && !!query.trim(),
  });
}

// ─── Auth-gated queries ───────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Alias for backward compatibility
export const useGetIsCallerAdmin = useIsCallerAdmin;

export function useIsCallerMasterAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isMasterAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerMasterAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetCallerFullUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['callerFullUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      try {
        return await actor.getCallerFullUserRole() as string;
      } catch {
        return 'guest';
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetWatchHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWatchHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics | null>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetEligibleVideosForLive() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoContent[]>({
    queryKey: ['eligibleVideosForLive'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEligibleVideosForLive();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['stripeSession', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

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
    },
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
    },
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
    },
  });
}

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
    },
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
    },
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
    },
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
    },
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

export function useIncrementViews() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.incrementViews();
    },
  });
}

export function useIncrementAdImpressions() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.incrementAdImpressions();
    },
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
    },
  });
}

// Accepts ShoppingItem[] directly and handles URL construction internally
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
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: any) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToAdmin(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useDemoteFromAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: any) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromAdmin(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function usePromoteToMasterAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: any) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToMasterAdmin(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useDemoteFromMasterAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: any) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromMasterAdmin(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
