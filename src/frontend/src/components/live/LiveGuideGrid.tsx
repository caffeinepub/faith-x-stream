import { useMemo, useRef, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Radio, Clock } from 'lucide-react';
import type { LiveChannel, VideoContent } from '../../backend';
import { getTimeSlots, getProgramBlocks, getCurrentTimePosition } from '../../utils/epg';

interface LiveGuideGridProps {
  channels: LiveChannel[];
  videos: VideoContent[];
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

export default function LiveGuideGrid({ channels, videos, selectedChannel, onChannelSelect }: LiveGuideGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowIndicatorRef = useRef<HTMLDivElement>(null);

  // Generate time slots for the next 3 hours
  const timeSlots = useMemo(() => getTimeSlots(3), []);
  const startTime = timeSlots[0].timestamp;
  const endTime = timeSlots[timeSlots.length - 1].timestamp;
  const totalDuration = endTime - startTime;

  // Scroll to current time on mount
  useEffect(() => {
    if (nowIndicatorRef.current && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const nowPosition = getCurrentTimePosition(startTime, totalDuration);
        const scrollPosition = (nowPosition / 100) * scrollContainer.scrollWidth - scrollContainer.clientWidth / 2;
        scrollContainer.scrollLeft = Math.max(0, scrollPosition);
      }
    }
  }, [startTime, totalDuration]);

  const nowPosition = getCurrentTimePosition(startTime, totalDuration);

  return (
    <div className="space-y-4">
      {/* Time Header */}
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Program Guide</h2>
        <Badge variant="outline" className="border-primary/60 text-primary">
          Next 3 Hours
        </Badge>
      </div>

      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-gradient-card">
        {/* Fixed Channel Column */}
        <div className="flex">
          <div className="w-48 flex-shrink-0 border-r-2 border-primary/30 bg-[#1a0000]">
            {/* Time header spacer */}
            <div className="h-16 border-b-2 border-primary/30 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">Channels</span>
            </div>
            {/* Channel names */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`h-24 border-b border-primary/20 flex items-center gap-3 px-3 cursor-pointer transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-primary/20'
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  {channel.logo ? (
                    <img
                      src={channel.logo.getDirectURL()}
                      alt={channel.name}
                      className="w-10 h-10 object-contain flex-shrink-0"
                    />
                  ) : (
                    <Radio className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{channel.name}</div>
                    {channel.isOriginal && (
                      <Badge variant="outline" className="text-xs border-primary/60 text-primary mt-1">
                        Original
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Grid Area */}
          <div className="flex-1 relative">
            {/* Time Slots Header */}
            <ScrollArea className="w-full" ref={scrollRef}>
              <div className="relative">
                {/* Time header */}
                <div className="h-16 border-b-2 border-primary/30 flex bg-[#1a0000] sticky top-0 z-10">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 border-r border-primary/20 px-3 py-2 text-center"
                      style={{ width: '200px' }}
                    >
                      <div className="text-sm font-bold text-primary">{slot.label}</div>
                      <div className="text-xs text-muted-foreground">{slot.time}</div>
                    </div>
                  ))}
                </div>

                {/* Program Grid */}
                <div className="relative" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                  {channels.map((channel) => {
                    const programBlocks = getProgramBlocks(channel, videos, startTime, endTime, totalDuration);
                    
                    return (
                      <div
                        key={channel.id}
                        className={`h-24 border-b border-primary/20 relative ${
                          selectedChannel === channel.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        {programBlocks.map((block, index) => (
                          <div
                            key={index}
                            onClick={() => onChannelSelect(channel.id)}
                            className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all hover:z-10 hover:scale-[1.02] ${
                              block.isCurrent
                                ? 'bg-gradient-to-r from-primary/40 to-secondary/30 border-2 border-primary shadow-lg'
                                : 'bg-gradient-to-r from-[#4d0000] to-[#330000] border border-primary/30 hover:border-primary/60'
                            }`}
                            style={{
                              left: `${block.leftPercent}%`,
                              width: `${block.widthPercent}%`,
                            }}
                            title={`${block.video.title}\n${block.startLabel} - ${block.endLabel}`}
                          >
                            <div className="p-2 h-full flex flex-col justify-center overflow-hidden">
                              <div className="text-xs font-semibold truncate text-white">
                                {block.video.title}
                              </div>
                              <div className="text-xs text-white/70 truncate">
                                {block.startLabel} - {block.endLabel}
                              </div>
                              {block.schedule.isOriginal && (
                                <Badge variant="outline" className="text-xs border-primary/60 text-primary mt-1 w-fit">
                                  Original
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Now Indicator Line */}
                <div
                  ref={nowIndicatorRef}
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: `${nowPosition}%` }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                    NOW
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
