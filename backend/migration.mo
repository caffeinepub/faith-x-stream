import Map "mo:core/Map";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Bool "mo:core/Bool";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";

module {
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
    eligibleForLive : Bool;
    availableAsVOD : Bool;
    sourceVideoId : ?Text;
    clipCaption : ?Text;
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

  public type UserRole = {
    #masterAdmin;
    #admin;
    #user;
    #guest;
  };

  public type UserProfile = {
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
    isProfileComplete : Bool;
  };

  public type RegisterInput = {
    name : Text;
    email : Text;
    password : Text;
  };

  public type LoginStatus = {
    #anonymous;
    #regularUser : UserProfile;
    #admin : UserProfile;
  };

  public type RegularUserStatus = {
    #failed : { error : Text };
    #accessGranted : { password : Text; userProfile : UserProfile };
  };

  public type UserInfo = {
    principal : Principal;
    email : Text;
    displayName : Text;
    role : UserRole;
  };

  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    stripeConfig : ?Stripe.StripeConfiguration;
    users : Map.Map<Principal, UserProfile>;
    userCredentials : Map.Map<Text, OldUserCredentials>;
    principalToEmail : Map.Map<Principal, Text>;
    emailToPrincipal : Map.Map<Text, Principal>;
    videos : Map.Map<Text, VideoContent>;
    series : Map.Map<Text, TVSeries>;
    liveChannels : Map.Map<Text, LiveChannel>;
    brands : Map.Map<Text, Brand>;
    channels : Map.Map<Text, Channel>;
    adMedia : Map.Map<Text, AdMedia>;
    adAssignments : Map.Map<Text, AdAssignment>;
    watchHistory : Map.Map<Principal, [Text]>;
    stripeSessionOwners : Map.Map<Text, Principal>;
    masterAdmins : Map.Map<Principal, Bool>;
    totalViews : Nat;
    adImpressions : Nat;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    stripeConfig : ?Stripe.StripeConfiguration;
    users : Map.Map<Principal, UserProfile>;
    userCredentials : Map.Map<Text, NewUserCredentials>;
    principalToEmail : Map.Map<Principal, Text>;
    emailToPrincipal : Map.Map<Text, Principal>;
    profileComplete : Map.Map<Principal, Bool>;
    videos : Map.Map<Text, VideoContent>;
    series : Map.Map<Text, TVSeries>;
    liveChannels : Map.Map<Text, LiveChannel>;
    brands : Map.Map<Text, Brand>;
    channels : Map.Map<Text, Channel>;
    adMedia : Map.Map<Text, AdMedia>;
    adAssignments : Map.Map<Text, AdAssignment>;
    watchHistory : Map.Map<Principal, [Text]>;
    stripeSessionOwners : Map.Map<Text, Principal>;
    masterAdmins : Map.Map<Principal, Bool>;
    totalViews : Nat;
    adImpressions : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let profileComplete = Map.empty<Principal, Bool>();
    for ((principal, profile) in old.users.entries()) {
      if (profile.name != "") {
        profileComplete.add(principal, true);
      };
    };

    let newUserCredentials = Map.empty<Text, NewUserCredentials>();
    for ((email, credentials) in old.userCredentials.entries()) {
      let newCredentials : NewUserCredentials = {
        credentials with
        isProfileComplete = false;
      };
      newUserCredentials.add(email, newCredentials);
    };

    {
      old with
      profileComplete = profileComplete;
      userCredentials = newUserCredentials;
    };
  };
};
