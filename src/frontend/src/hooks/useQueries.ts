import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import type {
  VideoContent,
  LiveChannel,
  UserProfile,
  TVSeries,
  Season,
  Episode,
  AdMedia,
  AdAssignment,
  Brand,
  Channel,
  StripeConfiguration,
  ShoppingItem,
  StripeSessionStatus,
  Analytics,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isAuthenticated, authStatus } = useAuth();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        // If user is not authorized (e.g., not logged in properly), return null
        console.error('Failed to fetch user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated && authStatus !== 'initializing',
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading || authStatus === 'initializing',
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated, authStatus } = useAuth();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && authStatus !== 'initializing',
  });
}

// Video Content Queries - Public, no auth required
export function useGetAllVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllVideos();
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useGetAllClips() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoContent[]>({
    queryKey: ['clips'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllClips();
      } catch (error) {
        console.error('Failed to fetch clips:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

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
    },
  });
}

// TV Series Queries - Public, no auth required
export function useGetAllSeries() {
  const { actor, isFetching } = useActor();

  return useQuery<TVSeries[]>({
    queryKey: ['series'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSeries();
      } catch (error) {
        console.error('Failed to fetch series:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useGetSeriesById() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (seriesId: string): Promise<TVSeries | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSeriesById(seriesId);
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

// Live Channel Queries - Public, no auth required
export function useGetAllLiveChannels() {
  const { actor, isFetching } = useActor();

  return useQuery<LiveChannel[]>({
    queryKey: ['liveChannels'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLiveChannels();
      } catch (error) {
        console.error('Failed to fetch live channels:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
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

// Brand Queries - Public, no auth required
export function useGetAllBrands() {
  const { actor, isFetching } = useActor();

  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBrands();
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useGetBrandById() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (brandId: string): Promise<Brand | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBrandById(brandId);
    },
  });
}

export function useGetChannelsByBrand() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (brandId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getChannelsByBrand(brandId);
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

// Ad Media Queries - Public, no auth required for viewing
export function useGetAllAdMedia() {
  const { actor, isFetching } = useActor();

  return useQuery<AdMedia[]>({
    queryKey: ['adMedia'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAdMedia();
      } catch (error) {
        console.error('Failed to fetch ad media:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

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

// Ad Assignment Queries - Public, no auth required for viewing
export function useGetAllAdAssignments() {
  const { actor, isFetching } = useActor();

  return useQuery<AdAssignment[]>({
    queryKey: ['adAssignments'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAdAssignments();
      } catch (error) {
        console.error('Failed to fetch ad assignments:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
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

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isStripeConfigured();
      } catch (error) {
        return false;
      }
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
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      return JSON.parse(result);
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

// Watch History - Requires authentication
export function useAddToWatchHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToWatchHistory(contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
    },
  });
}

export function useGetWatchHistory() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated, authStatus } = useAuth();

  return useQuery<string[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWatchHistory();
      } catch (error) {
        console.error('Failed to fetch watch history:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && authStatus !== 'initializing',
  });
}

// Analytics - Admin only
export function useGetAnalytics() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated, authStatus } = useAuth();

  return useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching && isAuthenticated && authStatus !== 'initializing',
  });
}

// Search - Public, no auth required
export function useSearch() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (searchQuery: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.search(searchQuery);
    },
  });
}
