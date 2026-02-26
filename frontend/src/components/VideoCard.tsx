import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, Lock, Star } from 'lucide-react';
import { VideoContent } from '../backend';

interface VideoCardProps {
  video: VideoContent;
  size?: 'sm' | 'md' | 'lg';
}

export default function VideoCard({ video, size = 'md' }: VideoCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/watch/$contentId', params: { contentId: video.id } });
  };

  const thumbnailUrl = video.thumbnailUrl?.getDirectURL?.() || '';

  const widthClass = size === 'sm' ? 'w-36' : size === 'lg' ? 'w-56' : 'w-44';

  return (
    <div
      onClick={handleClick}
      className={`${widthClass} flex-shrink-0 cursor-pointer group relative`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[oklch(0.14_0.02_15)] border border-[oklch(0.20_0.025_15)] transition-all duration-250 group-hover:shadow-red-glow group-hover:-translate-y-1 group-hover:scale-[1.03]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[oklch(0.14_0.02_15)]">
            <Play size={28} className="text-[oklch(0.35_0.05_15)]" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[oklch(0.06_0.012_15/0)] group-hover:bg-[oklch(0.06_0.012_15/0.35)] transition-all duration-250 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.24_25/0.9)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-250 scale-75 group-hover:scale-100 shadow-red-glow">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[oklch(0.06_0.012_15/0.9)] to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {video.isPremium && (
            <span className="flex items-center gap-0.5 bg-[oklch(0.75_0.18_60/0.9)] text-[oklch(0.10_0.01_60)] text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
              <Lock size={8} /> Premium
            </span>
          )}
          {video.isOriginal && (
            <span className="flex items-center gap-0.5 bg-[oklch(0.55_0.24_25/0.9)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
              <Star size={8} className="fill-white" /> Original
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-[oklch(0.90_0.01_90)] truncate group-hover:text-white transition-colors leading-tight">
          {video.title}
        </p>
        {video.genre && (
          <p className="text-xs text-[oklch(0.52_0.01_90)] mt-0.5 truncate">{video.genre}</p>
        )}
      </div>
    </div>
  );
}
