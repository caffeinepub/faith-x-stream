import Map "mo:core/Map";
import Text "mo:core/Text";

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
    videoUrl : Blob;
    trailerUrl : ?Blob;
    previewClipUrl : ?Blob;
    thumbnailUrl : Blob;
    roles : ?Text;
    genre : ?Text;
    releaseYear : ?Nat;
  };

  type OldActor = {
    videos : Map.Map<Text, OldVideoContent>;
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
    videoUrl : Blob;
    trailerUrl : ?Blob;
    previewClipUrl : ?Blob;
    thumbnailUrl : Blob;
    roles : ?Text;
    genre : ?Text;
    releaseYear : ?Nat;
    eligibleForLive : Bool;
  };

  type NewActor = {
    videos : Map.Map<Text, NewVideoContent>;
  };

  public func run(old : OldActor) : NewActor {
    let videos = old.videos.map<Text, OldVideoContent, NewVideoContent>(
      func(_, v) {
        {
          v with
          eligibleForLive = false;
        };
      }
    );
    { videos };
  };
};
