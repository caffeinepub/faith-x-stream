import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
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
    eligibleForLive : Bool;
  };

  type OldActor = {
    videos : Map.Map<Text, OldVideoContent>;
    // other fields unchanged for this migration
  };

  type NewContentType = {
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

  type NewVideoContent = {
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
    eligibleForLive : Bool;
    availableAsVOD : Bool;
    sourceVideoId : ?Text;
    clipCaption : ?Text;
  };

  type NewActor = {
    videos : Map.Map<Text, NewVideoContent>;
    // other fields unchanged for this migration
  };

  public func run(old : OldActor) : NewActor {
    let newVideos = old.videos.map<Text, OldVideoContent, NewVideoContent>(
      func(_id, oldVideo) {
        {
          oldVideo with
          availableAsVOD = true; // default to true for existing videos
          sourceVideoId = null;
          clipCaption = null;
        };
      }
    );
    { videos = newVideos };
  };
};
