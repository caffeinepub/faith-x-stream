import type { LiveChannel, VideoContent, ScheduledContent } from '../backend';

export interface TimeSlot {
  timestamp: number;
  label: string;
  time: string;
}

export interface ProgramBlock {
  schedule: ScheduledContent;
  video: VideoContent;
  leftPercent: number;
  widthPercent: number;
  startLabel: string;
  endLabel: string;
  isCurrent: boolean;
}

export interface CurrentProgramInfo {
  schedule: ScheduledContent;
  video: VideoContent;
  programStartTime: number;
  offsetSeconds: number;
}

/**
 * Generate time slots for the EPG grid header
 * @param hours Number of hours to display
 * @returns Array of time slots with labels
 */
export function getTimeSlots(hours: number = 3): TimeSlot[] {
  const now = new Date();
  const slots: TimeSlot[] = [];
  const intervalMinutes = 30;
  const totalSlots = (hours * 60) / intervalMinutes;

  for (let i = 0; i <= totalSlots; i++) {
    const slotTime = new Date(now.getTime() + i * intervalMinutes * 60 * 1000);
    const hours = slotTime.getHours();
    const minutes = slotTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    slots.push({
      timestamp: slotTime.getTime(),
      label: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
      time: ampm,
    });
  }

  return slots;
}

/**
 * Get program blocks for a channel within a time window
 * @param channel The live channel
 * @param videos All available videos
 * @param startTime Window start timestamp
 * @param endTime Window end timestamp
 * @param totalDuration Total duration of the window
 * @returns Array of program blocks with positioning
 */
export function getProgramBlocks(
  channel: LiveChannel,
  videos: VideoContent[],
  startTime: number,
  endTime: number,
  totalDuration: number
): ProgramBlock[] {
  if (channel.schedule.length === 0) return [];

  const blocks: ProgramBlock[] = [];
  const now = Date.now();

  // Calculate total schedule duration for looping
  const scheduleDuration = channel.schedule.reduce((total, s) => {
    return total + (Number(s.endTime) - Number(s.startTime));
  }, 0);

  if (scheduleDuration === 0) return [];

  const scheduleStart = Number(channel.schedule[0].startTime);

  // Find programs that overlap with our time window
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    const elapsedTime = currentTime - scheduleStart;
    const positionInLoop = elapsedTime % scheduleDuration;

    // Find the program at this position
    let accumulatedTime = 0;
    let foundProgram = false;
    
    for (const scheduleItem of channel.schedule) {
      const itemDuration = Number(scheduleItem.endTime) - Number(scheduleItem.startTime);
      
      if (positionInLoop >= accumulatedTime && positionInLoop < accumulatedTime + itemDuration) {
        const video = videos.find((v) => v.id === scheduleItem.contentId);
        if (video) {
          // Calculate when this program instance starts and ends
          const programStartInLoop = accumulatedTime;
          const programStart = scheduleStart + Math.floor(elapsedTime / scheduleDuration) * scheduleDuration + programStartInLoop;
          const programEnd = programStart + itemDuration;

          // Only add if it overlaps with our window and hasn't been added yet
          if (programEnd > startTime && programStart < endTime) {
            const visibleStart = Math.max(programStart, startTime);
            const visibleEnd = Math.min(programEnd, endTime);
            
            const leftPercent = ((visibleStart - startTime) / totalDuration) * 100;
            const widthPercent = ((visibleEnd - visibleStart) / totalDuration) * 100;

            const isCurrent = now >= programStart && now < programEnd;

            blocks.push({
              schedule: scheduleItem,
              video,
              leftPercent,
              widthPercent,
              startLabel: formatTime(new Date(programStart)),
              endLabel: formatTime(new Date(programEnd)),
              isCurrent,
            });
          }
          
          // Jump to the end of this program
          currentTime = Math.max(currentTime + 1, programStart + itemDuration);
          foundProgram = true;
        }
        break;
      }
      
      accumulatedTime += itemDuration;
    }
    
    // If no program found, advance time to avoid infinite loop
    if (!foundProgram) {
      currentTime += 60000; // Advance by 1 minute
    }
  }

  return blocks;
}

/**
 * Get the current position of "now" as a percentage
 * @param startTime Window start timestamp
 * @param totalDuration Total duration of the window
 * @returns Percentage position (0-100)
 */
export function getCurrentTimePosition(startTime: number, totalDuration: number): number {
  const now = Date.now();
  if (now < startTime) return 0;
  if (now > startTime + totalDuration) return 100;
  return ((now - startTime) / totalDuration) * 100;
}

/**
 * Format time as HH:MM AM/PM
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Get the currently airing program for a channel with schedule-aligned offset
 * @param channel The live channel
 * @param videos All available videos
 * @returns Current program info with offset, or null if none
 */
export function getCurrentProgramWithOffset(
  channel: LiveChannel,
  videos: VideoContent[]
): CurrentProgramInfo | null {
  if (channel.schedule.length === 0) return null;

  const now = Date.now();
  const scheduleDuration = channel.schedule.reduce((total, s) => {
    return total + (Number(s.endTime) - Number(s.startTime));
  }, 0);

  if (scheduleDuration === 0) return null;

  const scheduleStart = Number(channel.schedule[0].startTime);
  const elapsedTime = now - scheduleStart;
  const positionInLoop = elapsedTime % scheduleDuration;

  let accumulatedTime = 0;
  for (const scheduleItem of channel.schedule) {
    const itemDuration = Number(scheduleItem.endTime) - Number(scheduleItem.startTime);
    if (positionInLoop >= accumulatedTime && positionInLoop < accumulatedTime + itemDuration) {
      const video = videos.find((v) => v.id === scheduleItem.contentId);
      if (video) {
        // Calculate the actual start time of this program instance
        const programStartInLoop = accumulatedTime;
        const loopNumber = Math.floor(elapsedTime / scheduleDuration);
        const programStartTime = scheduleStart + loopNumber * scheduleDuration + programStartInLoop;
        
        // Calculate offset into the current program (in milliseconds)
        const offsetMs = now - programStartTime;
        const offsetSeconds = Math.max(0, offsetMs / 1000);
        
        return {
          schedule: scheduleItem,
          video,
          programStartTime,
          offsetSeconds,
        };
      }
    }
    accumulatedTime += itemDuration;
  }

  return null;
}

/**
 * Get the currently airing program for a channel
 */
export function getCurrentProgram(channel: LiveChannel, videos: VideoContent[]): VideoContent | null {
  if (channel.schedule.length === 0) return null;

  const now = Date.now();
  const scheduleDuration = channel.schedule.reduce((total, s) => {
    return total + (Number(s.endTime) - Number(s.startTime));
  }, 0);

  if (scheduleDuration === 0) return null;

  const scheduleStart = Number(channel.schedule[0].startTime);
  const elapsedTime = now - scheduleStart;
  const positionInLoop = elapsedTime % scheduleDuration;

  let accumulatedTime = 0;
  for (const scheduleItem of channel.schedule) {
    const itemDuration = Number(scheduleItem.endTime) - Number(scheduleItem.startTime);
    if (positionInLoop >= accumulatedTime && positionInLoop < accumulatedTime + itemDuration) {
      return videos.find((v) => v.id === scheduleItem.contentId) || null;
    }
    accumulatedTime += itemDuration;
  }

  return null;
}

/**
 * Get the next program for a channel
 */
export function getNextProgram(channel: LiveChannel, videos: VideoContent[]): VideoContent | null {
  if (channel.schedule.length === 0) return null;

  const now = Date.now();
  const scheduleDuration = channel.schedule.reduce((total, s) => {
    return total + (Number(s.endTime) - Number(s.startTime));
  }, 0);

  if (scheduleDuration === 0) return null;

  const scheduleStart = Number(channel.schedule[0].startTime);
  const elapsedTime = now - scheduleStart;
  const positionInLoop = elapsedTime % scheduleDuration;

  let accumulatedTime = 0;
  for (let i = 0; i < channel.schedule.length; i++) {
    const scheduleItem = channel.schedule[i];
    const itemDuration = Number(scheduleItem.endTime) - Number(scheduleItem.startTime);
    
    if (positionInLoop >= accumulatedTime && positionInLoop < accumulatedTime + itemDuration) {
      // Found current program, return next one
      const nextIndex = (i + 1) % channel.schedule.length;
      const nextItem = channel.schedule[nextIndex];
      return videos.find((v) => v.id === nextItem.contentId) || null;
    }
    
    accumulatedTime += itemDuration;
  }

  return null;
}
