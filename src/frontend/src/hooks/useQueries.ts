import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  VideoContent,
  TVSeries,
  LiveChannel,
  Brand,
  AdMedia,
  AdAssignment,
  Analytics,
  UserProfile,
  RegisterInput,
  StripeConfiguration,
  ShoppingItem,
  StripeSessionStatus,
  LiveChannelState,
} from '../backend';

// ===== VIDEO QUERIES =====

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

export function useGetVideoById(videoId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<VideoContent | null>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor || !videoId) return null;
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

export function useGetEligibleVideosForLive() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['eligibleVideosForLive'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEligibleVideosForLive();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== SERIES QUERIES =====

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

export function useGetSeriesById(seriesId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<TVSeries | null>({
    queryKey: ['series', seriesId],
    queryFn: async () => {
      if (!actor || !seriesId) return null;
      return actor.getSeriesById(seriesId);
    },
    enabled: !!actor && !isFetching && !!seriesId,
  });
}

// ===== LIVE TV QUERIES =====

export function useGetAllLiveChannels() {
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

export function useGetDynamicLiveChannelState(channelId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveChannelState | null>({
    queryKey: ['liveChannelState', channelId],
    queryFn: async () => {
      if (!actor || !channelId) return null;
      return actor.getDynamicLiveChannelState(channelId);
    },
    enabled: !!actor && !isFetching && !!channelId,
    refetchInterval: 7000, // Refetch every 7 seconds for sync
  });
}

export function useGetAdAssignmentsForLive(channelId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<AdAssignment[]>({
    queryKey: ['adAssignments', 'live', channelId],
    queryFn: async () => {
      if (!actor || !channelId) return [];
      return actor.getAdAssignmentsForLive(channelId);
    },
    enabled: !!actor && !isFetching && !!channelId,
  });
}

// ===== BRAND QUERIES =====

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

export function useGetBrandById(brandId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Brand | null>({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      if (!actor || !brandId) return null;
      return actor.getBrandById(brandId);
    },
    enabled: !!actor && !isFetching && !!brandId,
  });
}

export function useGetChannelsByBrand(brandId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['brandChannels', brandId],
    queryFn: async () => {
      if (!actor || !brandId) return null;
      return actor.getChannelsByBrand(brandId);
    },
    enabled: !!actor && !isFetching && !!brandId,
  });
}

// ===== AD QUERIES =====

export function useGetAllAdMedia() {
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

export function useGetAllAdAssignments() {
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

// ===== USER PROFILE QUERIES =====

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const status = await actor.getCallerLoginStatus();
      if (status.__kind__ === 'admin') {
        return status.admin;
      } else if (status.__kind__ === 'regularUser') {
        return status.regularUser;
      }
      return null;
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
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== AUTHENTICATION MUTATIONS =====

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.register(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.login(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Note: Backend doesn't have saveCallerUserProfile, so this is a placeholder
// The profile is managed through register/login flows
export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      // This is a client-side only mutation since backend doesn't support profile updates
      // In a real implementation, you would call actor.updateCallerUserProfile(profile)
      throw new Error('Profile updates not supported by backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ===== CONTENT MUTATIONS (ADMIN) =====

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: VideoContent) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVideo(video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['eligibleVideosForLive'] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, video }: { videoId: string; video: VideoContent }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVideo(videoId, video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['eligibleVideosForLive'] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      queryClient.invalidateQueries({ queryKey: ['eligibleVideosForLive'] });
    },
  });
}

export function useAddSeries() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (series: TVSeries) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSeries(series);
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
    mutationFn: async ({ seriesId, series }: { seriesId: string; series: TVSeries }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSeries(seriesId, series);
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
      return actor.deleteSeries(seriesId);
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
      return actor.addLiveChannel(channel);
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
      return actor.updateLiveChannel(channelId, channel);
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
      return actor.deleteLiveChannel(channelId);
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
      return actor.addBrand(brand);
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
      return actor.updateBrand(brandId, brand);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useDeleteBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBrand(brandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

// ===== AD MUTATIONS (ADMIN) =====

export function useAddAdMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: AdMedia) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAdMedia(ad);
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
      return actor.updateAdMedia(adId, ad);
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
      return actor.deleteAdMedia(adId);
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
      return actor.addAdAssignment(assignment);
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
      return actor.updateAdAssignment(assignmentId, assignment);
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
      return actor.deleteAdAssignment(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adAssignments'] });
    },
  });
}

// ===== ANALYTICS =====

export function useGetAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncrementViews() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementViews();
    },
  });
}

export function useIncrementAdImpressions() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementAdImpressions();
    },
  });
}

// ===== WATCH HISTORY =====

export function useAddToWatchHistory() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToWatchHistory(contentId);
    },
  });
}

export function useGetWatchHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== STRIPE =====

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

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<StripeSessionStatus> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

// ===== SEARCH =====

export function useSearch(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!actor || !query) return [];
      return actor.search(query);
    },
    enabled: !!actor && !isFetching && !!query,
  });
}
