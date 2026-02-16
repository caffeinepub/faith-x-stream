import { useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import type { TVSeries } from '../backend';

interface SeriesCardProps {
  series: TVSeries;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/series/$seriesId', params: { seriesId: series.id } });
  };

  const totalEpisodes = series.seasons.reduce((sum, season) => sum + season.episodes.length, 0);

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#1a0000] border-2 border-[#660000] hover:border-[#cc0000] transition-all duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3]">
        <img
          src={series.thumbnailUrl.getDirectURL()}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {series.isOriginal && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-secondary to-secondary/80 text-white p-1.5 rounded-full shadow-lg">
            <Star className="h-4 w-4 fill-white" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate mb-1">{series.title}</h3>
        <p className="text-xs text-white/60 line-clamp-2">{series.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
          <span>{series.seasons.length} Season{series.seasons.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{totalEpisodes} Episode{totalEpisodes !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
