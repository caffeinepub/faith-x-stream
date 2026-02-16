import { useGetAllClips } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Film, Play } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function ClipsPage() {
  const { data: clips, isLoading } = useGetAllClips();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Film className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">Clips & Shorts</h1>
      </div>

      {clips && clips.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              onClick={() => navigate({ to: '/watch/$contentId', params: { contentId: clip.id } })}
              className="group relative cursor-pointer rounded-lg overflow-hidden gradient-card border-2 border-primary/30 transition-all duration-200 aspect-[9/16] hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <img
                src={clip.thumbnailUrl.getDirectURL()}
                alt={clip.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Play className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground fill-current ml-1" />
                  </div>
                </div>

                {/* Info panel */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent">
                  <h3 className="font-semibold text-sm line-clamp-2">{clip.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No clips available</p>
        </div>
      )}
    </div>
  );
}

