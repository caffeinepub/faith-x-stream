# Specification

## Summary
**Goal:** Add dual availability toggles (live TV eligibility and VOD availability) to all video content and implement auto-generation of clips from uploaded videos.

**Planned changes:**
- Add `availableAsVOD` boolean field to backend Video type alongside existing `eligibleForLive` field
- Add `sourceVideoId` optional field to Video type for linking auto-generated clips to source videos
- Update MoviesManagement, PodcastsManagement, and SeriesManagement forms to include two independent checkboxes: "Eligible for Live TV scheduling" and "Available as standalone VOD" (both default to true)
- Filter MoviesPage, TVShowsPage, and SeriesDetailPage to only show content where `availableAsVOD=true`
- Filter LiveScheduleManagement to only allow scheduling videos where `eligibleForLive=true`
- Auto-generate clip records when videos are uploaded, reusing the same video URL and title but with different captions
- Update ClipsManagement to display both manual and auto-generated clips with source video title and editable captions
- Ensure Podcasts section remains a separate dedicated tab in AdminPage with its own management interface

**User-visible outcome:** Admins can independently control whether content appears in live TV schedules, standalone VOD sections, or both. When videos are uploaded, clips are automatically created and appear in the clips section. The Podcasts section has its own dedicated management interface separate from Movies.
