import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";

module {
  public type OldContentType = {
    #documentary;
    #faithBased;
    #music;
    #educational;
    #news;
    #tvSeries;
    #film;
    #series;
  };

  public type NewContentType = {
    #documentary;
    #faithBased;
    #music;
    #educational;
    #news;
    #tvSeries;
    #film;
    #movie;
    #series;
    #podcast;
  };

  public type OldVideoContent = {
    id : Text;
    title : Text;
    description : Text;
    contentType : OldContentType;
    isPremium : Bool;
    isOriginal : Bool;
    isClip : Bool;
    videoUrl : Storage.ExternalBlob;
    trailerUrl : ?Storage.ExternalBlob;
    previewClipUrl : ?Storage.ExternalBlob;
    thumbnailUrl : Storage.ExternalBlob;
    roles : ?Text;
    genre : ?Text;
    releaseYear : ?Nat;
  };

  public type NewVideoContent = {
    id : Text;
    title : Text;
    description : Text;
    contentType : NewContentType;
    isPremium : Bool;
    isOriginal : Bool;
    isClip : Bool;
    videoUrl : Storage.ExternalBlob;
    trailerUrl : ?Storage.ExternalBlob;
    previewClipUrl : ?Storage.ExternalBlob;
    thumbnailUrl : Storage.ExternalBlob;
    roles : ?Text;
    genre : ?Text;
    releaseYear : ?Nat;
  };

  public type OldTVSeries = {
    id : Text;
    title : Text;
    description : Text;
    contentType : OldContentType;
    thumbnailUrl : Storage.ExternalBlob;
    isOriginal : Bool;
    trailerUrl : ?Storage.ExternalBlob;
    previewClipUrl : ?Storage.ExternalBlob;
    seasons : [OldSeason];
  };

  public type NewTVSeries = {
    id : Text;
    title : Text;
    description : Text;
    contentType : NewContentType;
    thumbnailUrl : Storage.ExternalBlob;
    isOriginal : Bool;
    trailerUrl : ?Storage.ExternalBlob;
    previewClipUrl : ?Storage.ExternalBlob;
    seasons : [NewSeason];
  };

  public type OldSeason = {
    id : Text;
    seasonNumber : Nat;
    title : Text;
    isOriginal : Bool;
    episodes : [OldEpisode];
  };

  public type NewSeason = {
    id : Text;
    seasonNumber : Nat;
    title : Text;
    isOriginal : Bool;
    episodes : [NewEpisode];
  };

  public type OldEpisode = {
    id : Text;
    seasonId : Text;
    episodeNumber : Nat;
    title : Text;
    description : Text;
    runtimeMinutes : Nat;
    videoUrl : Storage.ExternalBlob;
    thumbnailUrl : Storage.ExternalBlob;
    isPremium : Bool;
    isFirstEpisode : Bool;
    isOriginal : Bool;
    contentType : OldContentType;
    previewClipUrl : ?Storage.ExternalBlob;
  };

  public type NewEpisode = {
    id : Text;
    seasonId : Text;
    episodeNumber : Nat;
    title : Text;
    description : Text;
    runtimeMinutes : Nat;
    videoUrl : Storage.ExternalBlob;
    thumbnailUrl : Storage.ExternalBlob;
    isPremium : Bool;
    isFirstEpisode : Bool;
    isOriginal : Bool;
    contentType : NewContentType;
    previewClipUrl : ?Storage.ExternalBlob;
  };

  public type OldLiveChannel = {
    id : Text;
    name : Text;
    schedule : [OldScheduledContent];
    logo : ?Storage.ExternalBlob;
    isOriginal : Bool;
  };

  public type NewLiveChannel = {
    id : Text;
    name : Text;
    schedule : [NewScheduledContent];
    logo : ?Storage.ExternalBlob;
    isOriginal : Bool;
  };

  public type OldScheduledContent = {
    contentId : Text;
    startTime : Int;
    endTime : Int;
    adLocations : ?[OldAdLocation];
    isOriginal : Bool;
  };

  public type NewScheduledContent = {
    contentId : Text;
    startTime : Int;
    endTime : Int;
    adLocations : ?[NewAdLocation];
    isOriginal : Bool;
  };

  public type OldAdLocation = {
    position : Int;
    adUrls : [Storage.ExternalBlob];
  };

  public type NewAdLocation = {
    position : Int;
    adUrls : [Storage.ExternalBlob];
  };

  public type OldBrand = {
    id : Text;
    name : Text;
    description : Text;
    logo : ?Storage.ExternalBlob;
    channels : [OldChannel];
    assignedFilms : [Text];
    assignedSeries : [Text];
    assignedEpisodes : [Text];
    assignedClips : [Text];
    assignedLiveChannels : [Text];
  };

  public type NewBrand = {
    id : Text;
    name : Text;
    description : Text;
    logo : ?Storage.ExternalBlob;
    channels : [NewChannel];
    assignedFilms : [Text];
    assignedSeries : [Text];
    assignedEpisodes : [Text];
    assignedClips : [Text];
    assignedLiveChannels : [Text];
  };

  public type OldChannel = {
    id : Text;
    name : Text;
    description : ?Text;
    branding : Text;
  };

  public type NewChannel = {
    id : Text;
    name : Text;
    description : ?Text;
    branding : Text;
  };

  public type OldAdMedia = {
    id : Text;
    mediaType : Text;
    adFile : Storage.ExternalBlob;
    duration : Int;
    tags : ?[Text];
    description : Text;
    language : ?Text;
    regions : ?[Text];
  };

  public type NewAdMedia = {
    id : Text;
    mediaType : Text;
    adFile : Storage.ExternalBlob;
    duration : Int;
    tags : ?[Text];
    description : Text;
    language : ?Text;
    regions : ?[Text];
  };

  public type OldAdAssignment = {
    id : Text;
    scope : Text;
    targetId : ?Text;
    adIds : [Text];
    position : Int;
    showCount : Nat;
    skipAfterSeconds : ?Nat;
    showOnFreeOnly : Bool;
  };

  public type NewAdAssignment = {
    id : Text;
    scope : Text;
    targetId : ?Text;
    adIds : [Text];
    position : Int;
    showCount : Nat;
    skipAfterSeconds : ?Nat;
    showOnFreeOnly : Bool;
  };

  public type OldAnalytics = {
    totalViews : Nat;
    premiumUserCount : Nat;
    adImpressions : Nat;
    trendingContent : [OldTrendingContent];
    subscriptionRevenue : ?Float;
    categoryStats : [OldCategoryStats];
  };

  public type NewAnalytics = {
    totalViews : Nat;
    premiumUserCount : Nat;
    adImpressions : Nat;
    trendingContent : [NewTrendingContent];
    subscriptionRevenue : ?Float;
    categoryStats : [NewCategoryStats];
  };

  public type OldTrendingContent = {
    id : Text;
    title : Text;
    category : Text;
    viewCount : Nat;
  };

  public type NewTrendingContent = {
    id : Text;
    title : Text;
    category : Text;
    viewCount : Nat;
  };

  public type OldCategoryStats = {
    category : Text;
    viewCount : Nat;
    adImpressions : Nat;
    premiumViews : Nat;
  };

  public type NewCategoryStats = {
    category : Text;
    viewCount : Nat;
    adImpressions : Nat;
    premiumViews : Nat;
  };

  public type OldStripeSessionStatus = {
    #failed : { error : Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  public type NewStripeSessionStatus = {
    #failed : { error : Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  public type OldContentAccessMetaData = {
    id : Text;
    title : Text;
    category : Text;
    isPremium : Bool;
    isEligibleForRewards : Bool;
  };

  public type NewContentAccessMetaData = {
    id : Text;
    title : Text;
    category : Text;
    isPremium : Bool;
    isEligibleForRewards : Bool;
  };

  public type OldSearchResult = {
    id : Text;
    title : Text;
    description : Text;
    resultType : Text;
    thumbnailUrl : ?Storage.ExternalBlob;
    isPremium : Bool;
    isOriginal : Bool;
  };

  public type NewSearchResult = {
    id : Text;
    title : Text;
    description : Text;
    resultType : Text;
    thumbnailUrl : ?Storage.ExternalBlob;
    isPremium : Bool;
    isOriginal : Bool;
  };

  public type OldUserProfile = {
    name : Text;
    email : Text;
    isPremium : Bool;
    hasPrioritySupport : Bool;
  };

  public type NewUserProfile = {
    name : Text;
    email : Text;
    isPremium : Bool;
    hasPrioritySupport : Bool;
  };

  public type OldUserCredentials = {
    email : Text;
    password : Text;
  };

  public type NewUserCredentials = {
    email : Text;
    password : Text;
  };

  public type OldRegisterInput = {
    name : Text;
    email : Text;
    password : Text;
  };

  public type NewRegisterInput = {
    name : Text;
    email : Text;
    password : Text;
  };

  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    stripeConfig : ?Stripe.StripeConfiguration;
    users : Map.Map<Principal, OldUserProfile>;
    userCredentials : Map.Map<Text, OldUserCredentials>;
    principalToEmail : Map.Map<Principal, Text>;
    emailToPrincipal : Map.Map<Text, Principal>;
    videos : Map.Map<Text, OldVideoContent>;
    series : Map.Map<Text, OldTVSeries>;
    liveChannels : Map.Map<Text, OldLiveChannel>;
    brands : Map.Map<Text, OldBrand>;
    channels : Map.Map<Text, OldChannel>;
    adMedia : Map.Map<Text, OldAdMedia>;
    adAssignments : Map.Map<Text, OldAdAssignment>;
    watchHistory : Map.Map<Principal, [Text]>;
    stripeSessionOwners : Map.Map<Text, Principal>;
    totalViews : Nat;
    adImpressions : Nat;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    stripeConfig : ?Stripe.StripeConfiguration;
    users : Map.Map<Principal, NewUserProfile>;
    userCredentials : Map.Map<Text, NewUserCredentials>;
    principalToEmail : Map.Map<Principal, Text>;
    emailToPrincipal : Map.Map<Text, Principal>;
    videos : Map.Map<Text, NewVideoContent>;
    series : Map.Map<Text, NewTVSeries>;
    liveChannels : Map.Map<Text, NewLiveChannel>;
    brands : Map.Map<Text, NewBrand>;
    channels : Map.Map<Text, NewChannel>;
    adMedia : Map.Map<Text, NewAdMedia>;
    adAssignments : Map.Map<Text, NewAdAssignment>;
    watchHistory : Map.Map<Principal, [Text]>;
    stripeSessionOwners : Map.Map<Text, Principal>;
    totalViews : Nat;
    adImpressions : Nat;
  };

  // Convert OldContentType to NewContentType
  func convertContentType(old : OldContentType) : NewContentType {
    switch (old) {
      case (#documentary) { #documentary };
      case (#faithBased) { #faithBased };
      case (#music) { #music };
      case (#educational) { #educational };
      case (#news) { #news };
      case (#tvSeries) { #tvSeries };
      case (#film) { #film };
      case (#series) { #series };
    };
  };

  // Convert OldEpisode to NewEpisode
  func convertEpisode(old : OldEpisode) : NewEpisode {
    {
      old with
      contentType = convertContentType(old.contentType);
    };
  };

  // Convert OldSeason to NewSeason
  func convertSeason(old : OldSeason) : NewSeason {
    {
      old with
      episodes = old.episodes.map(convertEpisode);
    };
  };

  // Convert OldTVSeries to NewTVSeries
  func convertTVSeries(old : OldTVSeries) : NewTVSeries {
    {
      old with
      contentType = convertContentType(old.contentType);
      seasons = old.seasons.map(convertSeason);
    };
  };

  // Convert OldVideoContent to NewVideoContent
  func convertVideoContent(old : OldVideoContent) : NewVideoContent {
    {
      old with
      contentType = convertContentType(old.contentType);
    };
  };

  // Convert OldChannel to NewChannel
  func convertChannel(old : OldChannel) : NewChannel {
    old;
  };

  // Convert OldBrand to NewBrand
  func convertBrand(old : OldBrand) : NewBrand {
    {
      old with
      channels = old.channels.map(convertChannel);
    };
  };

  // Convert OldScheduledContent to NewScheduledContent
  func convertScheduledContent(old : OldScheduledContent) : NewScheduledContent {
    old;
  };

  // Convert OldLiveChannel to NewLiveChannel
  func convertLiveChannel(old : OldLiveChannel) : NewLiveChannel {
    {
      old with
      schedule = old.schedule.map(convertScheduledContent);
    };
  };

  // Convert OldAdMedia to NewAdMedia
  func convertAdMedia(old : OldAdMedia) : NewAdMedia {
    old;
  };

  // Convert OldAdAssignment to NewAdAssignment
  func convertAdAssignment(old : OldAdAssignment) : NewAdAssignment {
    old;
  };

  // Convert OldUserCredentials to NewUserCredentials
  func convertUserCredentials(old : OldUserCredentials) : NewUserCredentials {
    old;
  };

  // Convert OldUserProfile to NewUserProfile
  func convertUserProfile(old : OldUserProfile) : NewUserProfile {
    old;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    {
      old with
      videos = old.videos.map<Text, OldVideoContent, NewVideoContent>(func(_id, oldVideo) { convertVideoContent(oldVideo) });
      series = old.series.map<Text, OldTVSeries, NewTVSeries>(func(_id, oldSeries) { convertTVSeries(oldSeries) });
      channels = old.channels.map<Text, OldChannel, NewChannel>(func(_id, oldChannel) { convertChannel(oldChannel) });
      brands = old.brands.map<Text, OldBrand, NewBrand>(func(_id, oldBrand) { convertBrand(oldBrand) });
      liveChannels = old.liveChannels.map<Text, OldLiveChannel, NewLiveChannel>(func(_id, oldLiveChannel) { convertLiveChannel(oldLiveChannel) });
      adMedia = old.adMedia.map<Text, OldAdMedia, NewAdMedia>(func(_id, oldAdMedia) { convertAdMedia(oldAdMedia) });
      userCredentials = old.userCredentials.map<Text, OldUserCredentials, NewUserCredentials>(func(_id, oldUserCredentials) { convertUserCredentials(oldUserCredentials) });
      users = old.users.map<Principal, OldUserProfile, NewUserProfile>(func(_id, oldUserProfile) { convertUserProfile(oldUserProfile) });
      adAssignments = old.adAssignments.map<Text, OldAdAssignment, NewAdAssignment>(func(_id, oldAdAssignment) { convertAdAssignment(oldAdAssignment) });
    };
  };
};
