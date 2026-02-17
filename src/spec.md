# Specification

## Summary
**Goal:** Fix LivePage scheduled VOD playback so it no longer restarts every few seconds and correctly reflects the current position within the scheduled program.

**Planned changes:**
- Prevent LivePage polling/schedule updates from remounting or resetting the VideoPlayer while the currently airing scheduled program is unchanged.
- On LivePage entry and channel switches, compute the correct offset into the current scheduled VOD program and seek playback to that position (instead of always starting at 0).
- When the schedule rolls over to a new program, switch playback to the new program and start at the appropriate offset for the current time.

**User-visible outcome:** Scheduled VOD live channels play continuously without repeated restarts, start at the correct point in the currently airing program, and still switch correctly when changing channels or when the schedule advances to the next program.
