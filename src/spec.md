# Specification

## Summary
**Goal:** Improve Live TV playback controls and scheduling so Live streams cannot be fast-forwarded, scheduled ad breaks play unskippably for non-premium viewers, and admins can manage Live-eligibility and ad break configuration via the UI.

**Planned changes:**
- Update Live TV playback behavior so when the player is in Live TV mode, users cannot seek or skip forward beyond the current live position, while keeping existing seeking behavior for VOD.
- Add scheduled, auto-inserted Live TV ad breaks for non-premium viewers that trigger at configured timestamps and are unskippable; return to the correct Live program position after ads finish.
- Add an admin-controlled “Live-eligible vs VOD-only” flag to video upload/edit, persist it in backend video content, and enforce it in Live scheduling so only eligible videos can be scheduled (or ineligible items are blocked/clearly labeled).
- Add admin UI in Live scheduling to configure ad break timestamps (and select associated ad media) per scheduled program, saving into existing schedule entry fields used by playback.

**User-visible outcome:** Viewers watching Live TV cannot fast-forward and will see unskippable scheduled ad breaks (free/non-premium only), while admins can mark videos as Live-eligible and configure per-program ad break timestamps and ad media directly in the Live scheduling UI.
