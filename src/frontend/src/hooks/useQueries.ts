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
  SearchResult,
  LiveChannelState,
  RegisterInput,
  StripeConfiguration,
  StripeSessionStatus,
  ShoppingItem,
} from '../backend';

// ===== USER PROFILE & AUTH =====

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetCallerUserProfile] Fetching profile...');
      const loginStatus = await actor.getCallerLoginStatus();
      console.log('[useGetCallerUserProfile] Login status:', loginStatus);
      
      if (loginStatus.__kind__ === 'regularUser') {
        return loginStatus.regularUser;
      } else if (loginStatus.__kind__ === 'admin') {
        return loginStatus.admin;
      }
      return null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('[useGetCallerUserProfile] Query state:', { 
    isLoading: query.isLoading, 
    isFetched: query.isFetched, 
    data: !!query.data,
    actorFetching 
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useIsCallerAdmin] Checking admin status...');
      const result = await actor.isCallerAdmin();
      console.log('[useIsCallerAdmin] Admin status:', result);
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('[useIsCallerAdmin] Query state:', { 
    isLoading: query.isLoading, 
    data: query.data,
    actorFetching 
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      if (!actor) throw new Error('Actor not available');
      await actor.register(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
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
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// ===== VIDEOS =====

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

// ===== SERIES =====

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
    mutationFn: async (series: TVSeries) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addSeries(series);
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
      await actor.updateSeries(seriesId, series);
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

// ===== LIVE CHANNELS =====

export function useGetAllLiveChannels() {
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

export function useGetDynamicLiveChannelState(channelId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveChannelState>({
    queryKey: ['liveChannelState', channelId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetDynamicLiveChannelState] Fetching state for channel:', channelId);
      return actor.getDynamicLiveChannelState(channelId);
    },
    enabled: !!actor && !actorFetching && !!channelId,
    refetchInterval: 10000, // Refetch every 10 seconds
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

// ===== BRANDS =====

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
    queryKey: ['brandChannels', brandId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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

// ===== ADS =====

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

// ===== ANALYTICS =====

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

// ===== WATCH HISTORY =====

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

// ===== SEARCH =====

export function useSearch(query: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.search(query);
    },
    enabled: !!actor && !actorFetching && !!query.trim(),
  });
}

// ===== STRIPE =====

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
