import Migration "migration";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

// Apply migration on upgrade via "with ... " syntax
(with migration = Migration.run)
actor {
  public type ContentType = {
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

  public type VideoContent = {
    id : Text;
    title : Text;
    description : Text;
    contentType : ContentType;
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

  public type TVSeries = {
    id : Text;
    title : Text;
    description : Text;
    contentType : ContentType;
    thumbnailUrl : Storage.ExternalBlob;
    isOriginal : Bool;
    trailerUrl : ?Storage.ExternalBlob;
    previewClipUrl : ?Storage.ExternalBlob;
    seasons : [Season];
  };

  public type Season = {
    id : Text;
    seasonNumber : Nat;
    title : Text;
    isOriginal : Bool;
    episodes : [Episode];
  };

  public type Episode = {
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
    contentType : ContentType;
    previewClipUrl : ?Storage.ExternalBlob;
  };

  public type LiveChannel = {
    id : Text;
    name : Text;
    schedule : [ScheduledContent];
    logo : ?Storage.ExternalBlob;
    isOriginal : Bool;
  };

  public type ScheduledContent = {
    contentId : Text;
    startTime : Int;
    endTime : Int;
    adLocations : ?[AdLocation];
    isOriginal : Bool;
  };

  public type AdLocation = {
    position : Int;
    adUrls : [Storage.ExternalBlob];
  };

  public type Brand = {
    id : Text;
    name : Text;
    description : Text;
    logo : ?Storage.ExternalBlob;
    channels : [Channel];
    assignedFilms : [Text];
    assignedSeries : [Text];
    assignedEpisodes : [Text];
    assignedClips : [Text];
    assignedLiveChannels : [Text];
  };

  public type Channel = {
    id : Text;
    name : Text;
    description : ?Text;
    branding : Text;
  };

  public type AdMedia = {
    id : Text;
    mediaType : Text;
    adFile : Storage.ExternalBlob;
    duration : Int;
    tags : ?[Text];
    description : Text;
    language : ?Text;
    regions : ?[Text];
  };

  public type AdAssignment = {
    id : Text;
    scope : Text;
    targetId : ?Text;
    adIds : [Text];
    position : Int;
    showCount : Nat;
    skipAfterSeconds : ?Nat;
    showOnFreeOnly : Bool;
  };

  public type Analytics = {
    totalViews : Nat;
    premiumUserCount : Nat;
    adImpressions : Nat;
    trendingContent : [TrendingContent];
    subscriptionRevenue : ?Float;
    categoryStats : [CategoryStats];
  };

  public type TrendingContent = {
    id : Text;
    title : Text;
    category : Text;
    viewCount : Nat;
  };

  public type CategoryStats = {
    category : Text;
    viewCount : Nat;
    adImpressions : Nat;
    premiumViews : Nat;
  };

  public type StripeSessionStatus = Stripe.StripeSessionStatus;
  public type ContentAccessMetaData = {
    id : Text;
    title : Text;
    category : Text;
    isPremium : Bool;
    isEligibleForRewards : Bool;
  };

  public type SearchResult = {
    id : Text;
    title : Text;
    description : Text;
    resultType : Text;
    thumbnailUrl : ?Storage.ExternalBlob;
    isPremium : Bool;
    isOriginal : Bool;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    isPremium : Bool;
    hasPrioritySupport : Bool;
  };

  public type UserCredentials = {
    email : Text;
    password : Text;
  };

  public type RegisterInput = {
    name : Text;
    email : Text;
    password : Text;
  };

  let accessControlState = AccessControl.initState();

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let users = Map.empty<Principal, UserProfile>();
  let userCredentials = Map.empty<Text, UserCredentials>();
  let principalToEmail = Map.empty<Principal, Text>();
  let emailToPrincipal = Map.empty<Text, Principal>();
  let videos = Map.empty<Text, VideoContent>();
  let series = Map.empty<Text, TVSeries>();
  let liveChannels = Map.empty<Text, LiveChannel>();
  let brands = Map.empty<Text, Brand>();
  let channels = Map.empty<Text, Channel>();
  let adMedia = Map.empty<Text, AdMedia>();
  let adAssignments = Map.empty<Text, AdAssignment>();
  let watchHistory = Map.empty<Principal, [Text]>();
  let stripeSessionOwners = Map.empty<Text, Principal>();
  var totalViews = 0;
  var adImpressions = 0;

  include MixinStorage();

  // ===== ACCESS CONTROL FUNCTIONS =====

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // ===== USER AUTHENTICATION FUNCTIONS =====

  public shared ({ caller }) func register(input : RegisterInput) : async () {
    switch (userCredentials.get(input.email)) {
      case (null) {
        let credentials : UserCredentials = {
          email = input.email;
          password = input.password;
        };
        userCredentials.add(input.email, credentials);

        let profile : UserProfile = {
          name = input.name;
          email = input.email;
          isPremium = false;
          hasPrioritySupport = false;
        };
        users.add(caller, profile);

        principalToEmail.add(caller, input.email);
        emailToPrincipal.add(input.email, caller);

        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (?_) {
        Runtime.trap("Email already registered");
      };
    };
  };

  public shared ({ caller }) func login(email : Text, password : Text) : async Bool {
    switch (userCredentials.get(email)) {
      case (null) {
        Runtime.trap("Invalid email or password");
      };
      case (?credentials) {
        let passwordCorrect = credentials.password == password;
        if (passwordCorrect) {
          principalToEmail.add(caller, email);
          emailToPrincipal.add(email, caller);

          AccessControl.assignRole(accessControlState, caller, caller, #user);

          true;
        } else {
          Runtime.trap("Invalid email or password");
        };
      };
    };
  };

  // ===== USER PROFILE FUNCTIONS =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      switch (users.get(caller)) {
        case (null) {
          ?{
            name = "Admin";
            email = "admin@faithxstream.com";
            isPremium = true;
            hasPrioritySupport = true;
          };
        };
        case (?profile) {
          ?{
            name = profile.name;
            email = profile.email;
            isPremium = true;
            hasPrioritySupport = true;
          };
        };
      };
    } else {
      users.get(caller);
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    if (AccessControl.isAdmin(accessControlState, user)) {
      switch (users.get(user)) {
        case (null) {
          ?{
            name = "Admin";
            email = "admin@faithxstream.com";
            isPremium = true;
            hasPrioritySupport = true;
          };
        };
        case (?profile) {
          ?{
            name = profile.name;
            email = profile.email;
            isPremium = true;
            hasPrioritySupport = true;
          };
        };
      };
    } else {
      users.get(user);
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  // ===== CONTENT QUERY FUNCTIONS (PUBLIC) =====

  public query func getAllVideos() : async [VideoContent] {
    videos.values().toArray();
  };

  public query func getVideoById(videoId : Text) : async ?VideoContent {
    videos.get(videoId);
  };

  public query func getSeriesById(seriesId : Text) : async ?TVSeries {
    series.get(seriesId);
  };

  public query func getAllClips() : async [VideoContent] {
    let filtered = videos.filter(
      func(_id, video) {
        video.isClip;
      }
    );
    filtered.values().toArray();
  };

  public query func getLiveChannels() : async [LiveChannel] {
    liveChannels.values().toArray();
  };

  public query func getLiveChannelsByBrand(_brandId : Text) : async [LiveChannel] {
    liveChannels.values().toArray();
  };

  public query func getChannelsByBrand(brandId : Text) : async {
    channels: [Channel];
    films: [Text];
    series: [Text];
    episodes: [Text];
    clips: [Text];
    liveChannels: [Text];
  } {
    switch (brands.get(brandId)) {
      case (null) {
        Runtime.trap("Brand not found");
      };
      case (?brand) {
        let channelArray = brand.channels;
        let filmIds = brand.assignedFilms;
        let seriesIds = brand.assignedSeries;
        let episodeIds = brand.assignedEpisodes;
        let clipIds = brand.assignedClips;
        let liveChannelIds = brand.assignedLiveChannels;

        {
          channels = channelArray;
          films = filmIds;
          series = seriesIds;
          episodes = episodeIds;
          clips = clipIds;
          liveChannels = liveChannelIds;
        };
      };
    };
  };

  public query func getAllBrands() : async [Brand] {
    brands.values().toArray();
  };

  public query func getBrandById(brandId : Text) : async ?Brand {
    brands.get(brandId);
  };

  public query func getAllSeries() : async [TVSeries] {
    series.values().toArray();
  };

  // ===== STRIPE CONFIGURATION (ADMIN ONLY) =====

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured first") };
      case (?value) { value };
    };
  };

  // ===== STRIPE CHECKOUT (USER ONLY) =====

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin users have automatic premium access and do not require checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
    stripeSessionOwners.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeSessionOwners.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found or unauthorized");
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own sessions");
        };
        await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ===== CONTENT MANAGEMENT (ADMIN ONLY) =====

  public shared ({ caller }) func addVideo(video : VideoContent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    videos.add(video.id, video);
  };

  public shared ({ caller }) func updateVideo(videoId : Text, video : VideoContent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    videos.add(videoId, video);
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    videos.remove(videoId);
  };

  public shared ({ caller }) func addSeries(tvSeries : TVSeries) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    series.add(tvSeries.id, tvSeries);
  };

  public shared ({ caller }) func updateSeries(seriesId : Text, tvSeries : TVSeries) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    series.add(seriesId, tvSeries);
  };

  public shared ({ caller }) func deleteSeries(seriesId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    series.remove(seriesId);
  };

  public shared ({ caller }) func addLiveChannel(channel : LiveChannel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    liveChannels.add(channel.id, channel);
  };

  public shared ({ caller }) func updateLiveChannel(channelId : Text, channel : LiveChannel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    liveChannels.add(channelId, channel);
  };

  public shared ({ caller }) func deleteLiveChannel(channelId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    liveChannels.remove(channelId);
  };

  public shared ({ caller }) func addBrand(brand : Brand) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    brands.add(brand.id, brand);
  };

  public shared ({ caller }) func updateBrand(brandId : Text, brand : Brand) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    brands.add(brandId, brand);
  };

  public shared ({ caller }) func deleteBrand(brandId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    brands.remove(brandId);
  };

  public shared ({ caller }) func addChannel(channel : Channel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    channels.add(channel.id, channel);
  };

  public shared ({ caller }) func updateChannel(channelId : Text, channel : Channel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    channels.add(channelId, channel);
  };

  public shared ({ caller }) func deleteChannel(channelId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    channels.remove(channelId);
  };

  // ===== AD MANAGEMENT (ADMIN ONLY) =====

  public shared ({ caller }) func addAdMedia(ad : AdMedia) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adMedia.add(ad.id, ad);
  };

  public shared ({ caller }) func updateAdMedia(adId : Text, ad : AdMedia) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adMedia.add(adId, ad);
  };

  public shared ({ caller }) func deleteAdMedia(adId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adMedia.remove(adId);
  };

  public shared ({ caller }) func addAdAssignment(assignment : AdAssignment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adAssignments.add(assignment.id, assignment);
  };

  public shared ({ caller }) func updateAdAssignment(assignmentId : Text, assignment : AdAssignment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adAssignments.add(assignmentId, assignment);
  };

  public shared ({ caller }) func deleteAdAssignment(assignmentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    adAssignments.remove(assignmentId);
  };

  public query func getAdAssignments() : async [AdAssignment] {
    adAssignments.values().toArray();
  };

  public query func getAdMedia() : async [AdMedia] {
    adMedia.values().toArray();
  };

  // ===== WATCH HISTORY  (USER ONLY) =====

  public shared ({ caller }) func addToWatchHistory(contentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track watch history");
    };
    let history = switch (watchHistory.get(caller)) {
      case (null) { [] };
      case (?h) { h };
    };
    let newContent = [contentId];
    let newHistory = history.concat(newContent);
    watchHistory.add(caller, newHistory);
  };

  public query ({ caller }) func getWatchHistory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view watch history");
    };
    switch (watchHistory.get(caller)) {
      case (null) { [] };
      case (?h) { h };
    };
  };

  // ===== ANALYTICS (TRACKING REQUIRES USER AUTH, VIEWING ADMIN ONLY) =====

  public shared ({ caller }) func incrementViews() : async () {
    // Require at least user authentication to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track views");
    };
    totalViews += 1;
  };

  public shared ({ caller }) func incrementAdImpressions() : async () {
    // Require at least user authentication to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track ad impressions");
    };
    adImpressions += 1;
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    let premiumCount = users.filter(func(_p, u) { u.isPremium }).size();
    {
      totalViews = totalViews;
      premiumUserCount = premiumCount;
      adImpressions = adImpressions;
      trendingContent = [];
      subscriptionRevenue = null;
      categoryStats = [];
    };
  };

  // ===== SEARCH (PUBLIC) =====

  public query func search(searchQuery : Text) : async [SearchResult] {
    var results : [SearchResult] = [];

    for ((id, video) in videos.entries()) {
      if (video.title.contains(#text searchQuery) or video.description.contains(#text searchQuery)) {
        let result : SearchResult = {
          id = video.id;
          title = video.title;
          description = video.description;
          resultType = if (video.isClip) { "clip" } else { "video" };
          thumbnailUrl = ?video.thumbnailUrl;
          isPremium = video.isPremium;
          isOriginal = video.isOriginal;
        };
        results := results.concat([result]);
      };
    };

    for ((id, tvSeries) in series.entries()) {
      if (tvSeries.title.contains(#text searchQuery) or tvSeries.description.contains(#text searchQuery)) {
        let result : SearchResult = {
          id = tvSeries.id;
          title = tvSeries.title;
          description = tvSeries.description;
          resultType = "series";
          thumbnailUrl = ?tvSeries.thumbnailUrl;
          isPremium = false;
          isOriginal = tvSeries.isOriginal;
        };
        results := results.concat([result]);
      };
    };

    for ((id, brand) in brands.entries()) {
      if (brand.name.contains(#text searchQuery) or brand.description.contains(#text searchQuery)) {
        let result : SearchResult = {
          id = brand.id;
          title = brand.name;
          description = brand.description;
          resultType = "brand";
          thumbnailUrl = brand.logo;
          isPremium = false;
          isOriginal = false;
        };
        results := results.concat([result]);
      };
    };

    results;
  };
};
