import { useGetAllVideos } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import { Film } from 'lucide-react';
import { ContentType } from '../backend';

export default function MoviesPage() {
  const { data: videos, isLoading } = useGetAllVideos();

  const movies = videos?.filter(v => 
    !v.isClip && 
    (v.contentType === ContentType.movie || v.contentType === ContentType.film) &&
    v.availableAsVOD
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Movies</h1>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No movies available</p>
          </div>
        )}
      </div>
    </div>
  );
}
