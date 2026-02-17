import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TVSeries {
    id: string;
    title: string;
    previewClipUrl?: ExternalBlob;
    thumbnailUrl: ExternalBlob;
    contentType: ContentType;
    seasons: Array<Season>;
    isOriginal: boolean;
    description: string;
    trailerUrl?: ExternalBlob;
}
export interface VideoContent {
    id: string;
    title: string;
    previewClipUrl?: ExternalBlob;
    thumbnailUrl: ExternalBlob;
    contentType: ContentType;
    isPremium: boolean;
    isOriginal: boolean;
    description: string;
    isClip: boolean;
    trailerUrl?: ExternalBlob;
    genre?: string;
    videoUrl: ExternalBlob;
    roles?: string;
    releaseYear?: bigint;
}
export interface SearchResult {
    id: string;
    title: string;
    thumbnailUrl?: ExternalBlob;
    isPremium: boolean;
    isOriginal: boolean;
    description: string;
    resultType: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface AdMedia {
    id: string;
    duration: bigint;
    tags?: Array<string>;
    description: string;
    language?: string;
    regions?: Array<string>;
    adFile: ExternalBlob;
    mediaType: string;
}
export interface Brand {
    id: string;
    assignedFilms: Array<string>;
    logo?: ExternalBlob;
    name: string;
    description: string;
    channels: Array<Channel>;
    assignedClips: Array<string>;
    assignedEpisodes: Array<string>;
    assignedLiveChannels: Array<string>;
    assignedSeries: Array<string>;
}
export interface Episode {
    id: string;
    title: string;
    previewClipUrl?: ExternalBlob;
    isFirstEpisode: boolean;
    thumbnailUrl: ExternalBlob;
    contentType: ContentType;
    isPremium: boolean;
    isOriginal: boolean;
    description: string;
    seasonId: string;
    episodeNumber: bigint;
    runtimeMinutes: bigint;
    videoUrl: ExternalBlob;
}
export interface Season {
    id: string;
    title: string;
    episodes: Array<Episode>;
    isOriginal: boolean;
    seasonNumber: bigint;
}
export interface TrendingContent {
    id: string;
    title: string;
    viewCount: bigint;
    category: string;
}
export interface ScheduledContent {
    startTime: bigint;
    contentId: string;
    endTime: bigint;
    adLocations?: Array<AdLocation>;
    isOriginal: boolean;
}
export interface Analytics {
    subscriptionRevenue?: number;
    totalViews: bigint;
    premiumUserCount: bigint;
    adImpressions: bigint;
    trendingContent: Array<TrendingContent>;
    categoryStats: Array<CategoryStats>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface RegisterInput {
    password: string;
    name: string;
    email: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface LiveChannel {
    id: string;
    logo?: ExternalBlob;
    name: string;
    isOriginal: boolean;
    schedule: Array<ScheduledContent>;
}
export interface CategoryStats {
    adImpressions: bigint;
    viewCount: bigint;
    premiumViews: bigint;
    category: string;
}
export interface AdLocation {
    adUrls: Array<ExternalBlob>;
    position: bigint;
}
export interface Channel {
    id: string;
    name: string;
    description?: string;
    branding: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type LoginStatus = {
    __kind__: "admin";
    admin: UserProfile;
} | {
    __kind__: "regularUser";
    regularUser: UserProfile;
} | {
    __kind__: "anonymous";
    anonymous: null;
};
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type RegularUserStatus = {
    __kind__: "accessGranted";
    accessGranted: {
        password: string;
        userProfile: UserProfile;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface AdAssignment {
    id: string;
    showOnFreeOnly: boolean;
    adIds: Array<string>;
    skipAfterSeconds?: bigint;
    showCount: bigint;
    scope: string;
    position: bigint;
    targetId?: string;
}
export interface UserProfile {
    isPremium: boolean;
    name: string;
    email: string;
    hasPrioritySupport: boolean;
}
export enum ContentType {
    movie = "movie",
    music = "music",
    documentary = "documentary",
    film = "film",
    news = "news",
    educational = "educational",
    podcast = "podcast",
    series = "series",
    faithBased = "faithBased",
    tvSeries = "tvSeries"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdAssignment(assignment: AdAssignment): Promise<void>;
    addAdMedia(ad: AdMedia): Promise<void>;
    addBrand(brand: Brand): Promise<void>;
    addChannel(channel: Channel): Promise<void>;
    addLiveChannel(channel: LiveChannel): Promise<void>;
    addSeries(tvSeries: TVSeries): Promise<void>;
    addToWatchHistory(contentId: string): Promise<void>;
    addVideo(video: VideoContent): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteAdAssignment(assignmentId: string): Promise<void>;
    deleteAdMedia(adId: string): Promise<void>;
    deleteBrand(brandId: string): Promise<void>;
    deleteChannel(channelId: string): Promise<void>;
    deleteLiveChannel(channelId: string): Promise<void>;
    deleteSeries(seriesId: string): Promise<void>;
    deleteVideo(videoId: string): Promise<void>;
    getAdAssignments(): Promise<Array<AdAssignment>>;
    getAdMedia(): Promise<Array<AdMedia>>;
    getAllBrands(): Promise<Array<Brand>>;
    getAllClips(): Promise<Array<VideoContent>>;
    getAllSeries(): Promise<Array<TVSeries>>;
    getAllVideos(): Promise<Array<VideoContent>>;
    getAnalytics(): Promise<Analytics>;
    getBrandById(brandId: string): Promise<Brand | null>;
    getCallerLoginStatus(): Promise<LoginStatus>;
    getCallerRegularUserStatus(): Promise<RegularUserStatus>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelsByBrand(brandId: string): Promise<{
        films: Array<string>;
        episodes: Array<string>;
        clips: Array<string>;
        channels: Array<Channel>;
        series: Array<string>;
        liveChannels: Array<string>;
    }>;
    getLiveChannels(): Promise<Array<LiveChannel>>;
    getLiveChannelsByBrand(_brandId: string): Promise<Array<LiveChannel>>;
    getSeriesById(seriesId: string): Promise<TVSeries | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoById(videoId: string): Promise<VideoContent | null>;
    getWatchHistory(): Promise<Array<string>>;
    incrementAdImpressions(): Promise<void>;
    incrementViews(): Promise<void>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    login(email: string, password: string): Promise<boolean>;
    register(input: RegisterInput): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    search(searchQuery: string): Promise<Array<SearchResult>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdAssignment(assignmentId: string, assignment: AdAssignment): Promise<void>;
    updateAdMedia(adId: string, ad: AdMedia): Promise<void>;
    updateBrand(brandId: string, brand: Brand): Promise<void>;
    updateChannel(channelId: string, channel: Channel): Promise<void>;
    updateLiveChannel(channelId: string, channel: LiveChannel): Promise<void>;
    updateSeries(seriesId: string, tvSeries: TVSeries): Promise<void>;
    updateVideo(videoId: string, video: VideoContent): Promise<void>;
}
