# Specification

## Summary
**Goal:** Implement synchronized Live TV playback where all viewers watch the same channel at the exact same moment, with server-side time tracking controlling playback position.

**Planned changes:**
- Add server-side time tracking to calculate exact playback position for each Live TV channel based on current server time and channel schedule
- Implement automatic program looping logic when schedule ends, continuing sequentially when new programs are added
- Create backend API endpoint returning real-time synchronization data (current program, playback position, server time, loop status)
- Build new LiveTVSyncPlayer component that polls sync endpoint every 5-10 seconds and corrects playback drift
- Implement drift detection and correction, seeking video when position differs from server by 2-3+ seconds
- Update LivePage to use LiveTVSyncPlayer for Live TV channels while keeping existing VideoPlayer for VOD
- Handle automatic program transitions when server indicates program change
- Ensure viewers join at current live position (not program start) when selecting a channel
- Preserve existing Live TV features: ad insertion, seek restrictions, EPG grid, channel surfing

**User-visible outcome:** When multiple viewers watch the same Live TV channel, they all see the exact same moment of the program simultaneously. New viewers joining a channel start at the current live position, not from the beginning.
