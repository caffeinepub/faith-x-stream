import { useNavigate } from '@tanstack/react-router';
import { Play, Crown, Star } from 'lucide-react';
import type { VideoContent, ContentType } from '../backend';

interface VideoCardProps {
  video: VideoContent;
}

export default function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/watch/$contentId', params: { contentId: video.id } });
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case 'documentary':
        return 'Documentary';
      case 'faithBased':
        return 'Faith-Based';
      case 'music':
        return 'Music';
      case 'educational':
        return 'Educational';
      case 'news':
        return 'News';
      case 'tvSeries':
        return 'TV Series';
      case 'film':
        return 'Film';
      case 'series':
        return 'Series';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#1a0000] border-2 border-[#660000] hover:border-[#cc0000] transition-all duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3]">
        <img
          src={video.thumbnailUrl.getDirectURL()}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-[#cc0000] flex items-center justify-center shadow-2xl">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
        {video.isPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-secondary to-secondary/80 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Crown className="h-3 w-3" />
            PREMIUM
          </div>
        )}
        {video.isOriginal && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-secondary to-secondary/80 text-white p-1.5 rounded-full shadow-lg">
            <Star className="h-4 w-4 fill-white" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate mb-1">{video.title}</h3>
        <p className="text-xs text-white/60 line-clamp-2">{video.description}</p>
        <div className="mt-2">
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            {getContentTypeLabel(video.contentType)}
          </span>
        </div>
      </div>
    </div>
  );
}
