import { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from '@tanstack/react-router';
import VideoPlayer from './VideoPlayer';
import type { VideoContent } from '../backend';

interface HeroSectionProps {
  video: VideoContent;
}

export default function HeroSection({ video }: HeroSectionProps) {
  const navigate = useNavigate();
  const [showPlayer, setShowPlayer] = useState(false);

  const handleAutoplayComplete = () => {
    // Preview completed, can transition or loop
    setShowPlayer(false);
  };

  const trailerUrl = video.trailerUrl?.getDirectURL();

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      {showPlayer ? (
        <VideoPlayer
          videoUrl={video.videoUrl.getDirectURL()}
          title={video.title}
          autoplay={true}
          onAutoplayComplete={handleAutoplayComplete}
          trailerUrl={trailerUrl}
          previewSeconds={45}
        />
      ) : (
        <>
          <div className="absolute inset-0">
            <img
              src={video.thumbnailUrl.getDirectURL()}
              alt={video.title}
              className="w-full h-full object-cover"
              onLoad={() => setShowPlayer(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
          </div>

          <div className="absolute top-8 left-8 z-10">
            <img
              src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
              alt="FAITH X-Stream"
              className="h-24 md:h-32 w-auto"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                {video.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 line-clamp-3 drop-shadow-md">
                {video.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-xl"
                  onClick={() => navigate({ to: '/watch/$contentId', params: { contentId: video.id } })}
                >
                  <Play className="h-5 w-5 mr-2 fill-black" />
                  Play Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 text-white border-white/40 hover:bg-white/30 backdrop-blur transition-all duration-300 shadow-xl"
                  onClick={() => navigate({ to: '/watch/$contentId', params: { contentId: video.id } })}
                >
                  <Info className="h-5 w-5 mr-2" />
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
