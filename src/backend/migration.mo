import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    videos : Map.Map<Text, OldVideoContent>;
    series : Map.Map<Text, OldTVSeries>;
    liveChannels : Map.Map<Text, OldLiveChannel>;
    brands : Map.Map<Text, OldBrand>;
  };

  type OldVideoContent = {
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

  type OldTVSeries = {
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

  type OldSeason = {
    id : Text;
    seasonNumber : Nat;
    title : Text;
    isOriginal : Bool;
    episodes : [OldEpisode];
  };

  type OldEpisode = {
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

  type OldLiveChannel = {
    id : Text;
    name : Text;
    schedule : [OldScheduledContent];
    logo : ?Storage.ExternalBlob;
    isOriginal : Bool;
  };

  type OldScheduledContent = {
    contentId : Text;
    startTime : Int;
    endTime : Int;
    adLocations : ?[OldAdLocation];
    isOriginal : Bool;
  };

  type OldAdLocation = {
    position : Int;
    adUrls : [Storage.ExternalBlob];
  };

  type OldBrand = {
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

  type OldChannel = {
    id : Text;
    name : Text;
    description : ?Text;
    branding : Text;
  };

  type OldContentType = {
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

  // New types from main.mo (add here before applying migration)
  type NewActor = {
    videos : Map.Map<Text, OldVideoContent>;
    series : Map.Map<Text, OldTVSeries>;
    liveChannels : Map.Map<Text, OldLiveChannel>;
    brands : Map.Map<Text, OldBrand>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
