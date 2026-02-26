import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { VideoContent, TVSeries } from '../backend';

type HeroItem = VideoContent | TVSeries;

interface HeroSectionProps {
  items: HeroItem[];
}

function isVideoContent(item: HeroItem): item is VideoContent {
  return 'videoUrl' in item;
}

export default function HeroSection({ items }: HeroSectionProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const featured = items[currentIndex];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!featured) return null;

  const thumbnailUrl = featured.thumbnailUrl?.getDirectURL?.() || '';
  const previewUrl = isVideoContent(featured)
    ? featured.previewClipUrl?.getDirectURL?.() || featured.trailerUrl?.getDirectURL?.() || ''
    : featured.previewClipUrl?.getDirectURL?.() || featured.trailerUrl?.getDirectURL?.() || '';

  const handlePlay = () => {
    if (isVideoContent(featured)) {
      navigate({ to: '/watch/$contentId', params: { contentId: featured.id } });
    } else {
      navigate({ to: '/series/$seriesId', params: { seriesId: featured.id } });
    }
  };

  const handleMoreInfo = () => {
    if (isVideoContent(featured)) {
      navigate({ to: '/watch/$contentId', params: { contentId: featured.id } });
    } else {
      navigate({ to: '/series/$seriesId', params: { seriesId: featured.id } });
    }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden bg-[oklch(0.06_0.012_15)]">
      {/* Background */}
      <div className="absolute inset-0">
        {previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={featured.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[oklch(0.20_0.06_15)] to-[oklch(0.06_0.012_15)]" />
        )}
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 gradient-hero-bottom" />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.015_15)] via-transparent to-[oklch(0.06_0.012_15/0.3)]" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-16 px-6 lg:px-16">
        <div className="max-w-2xl animate-fade-in-up">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            {isVideoContent(featured) && featured.isOriginal && (
              <span className="text-xs font-bold uppercase tracking-widest text-[oklch(0.55_0.24_25)] border border-[oklch(0.55_0.24_25/0.5)] px-2 py-0.5 rounded">
                F.A.I.T.H. Original
              </span>
            )}
            {isVideoContent(featured) && featured.isPremium && (
              <span className="text-xs font-bold uppercase tracking-widest text-[oklch(0.75_0.18_60)] border border-[oklch(0.75_0.18_60/0.5)] px-2 py-0.5 rounded">
                Premium
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl lg:text-7xl font-bold text-white text-shadow-lg leading-none mb-3 tracking-wide">
            {featured.title}
          </h1>

          {/* Description */}
          <p className="text-sm lg:text-base text-[oklch(0.82_0.01_90)] leading-relaxed mb-6 line-clamp-3 max-w-xl">
            {featured.description}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-7 py-3 bg-[oklch(0.55_0.24_25)] hover:bg-[oklch(0.62_0.27_22)] text-white font-bold rounded-full transition-all text-sm uppercase tracking-wide"
            >
              <Play size={16} className="fill-white" />
              Play Now
            </button>
            <button
              onClick={handleMoreInfo}
              className="flex items-center gap-2 px-7 py-3 bg-[oklch(0.97_0.005_90/0.15)] hover:bg-[oklch(0.97_0.005_90/0.25)] text-white font-bold rounded-full border border-[oklch(0.97_0.005_90/0.3)] transition-all text-sm uppercase tracking-wide backdrop-blur-sm"
            >
              <Info size={16} />
              More Info
            </button>
            {previewUrl && (
              <button
                onClick={() => setMuted(!muted)}
                className="p-3 rounded-full bg-[oklch(0.97_0.005_90/0.1)] hover:bg-[oklch(0.97_0.005_90/0.2)] text-white border border-[oklch(0.97_0.005_90/0.2)] transition-all backdrop-blur-sm"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-8 flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all rounded-full ${
                i === currentIndex
                  ? 'w-6 h-2 bg-[oklch(0.55_0.24_25)]'
                  : 'w-2 h-2 bg-[oklch(0.97_0.005_90/0.3)] hover:bg-[oklch(0.97_0.005_90/0.6)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
