# Specification

## Summary
**Goal:** Fix VideoPlayer autoplay/ad playback freezing, stabilize key pages, and improve admin content management with Movie/Podcast support and reliable video editing.

**Planned changes:**
- Fix VideoPlayer autoplay behavior (including muted autoplay), ad-to-content switching (restore correct pre-ad timestamp), and ensure midroll scheduling uses main-content time/duration; prevent preroll/midroll ad behavior from breaking Live TV playback.
- Add preview autoplay behavior: use trailerUrl when available; otherwise play the first 30–60 seconds of the main videoUrl and trigger onAutoplayComplete, ensuring state resets for later full playback.
- Expand ContentType to include Movie and Podcast (keeping Film), update frontend selectors to support Movie/Film/Podcast, and ensure existing stored items remain valid (including any needed migration handling).
- Restructure Admin Panel into separate upload/management sections for Movies, TV Shows, Podcasts, Clips, and Live TV (while keeping Brands/Channels/Ads/Analytics/Stripe), with Movies/Podcasts as new panels that reuse existing upload/edit flows and filter lists by category.
- Repair video update/edit flow: correctly populate edit form state, send backend-conformant update payloads (including optional fields), show actionable error details in toasts, and refresh relevant React Query caches so lists update immediately.
- Stabilize Live, Originals, Profile/MyProfile, and Admin Dashboard rendering during auth/actor initialization with clear loading/empty/error states and without incorrect “Access Denied” states or redirect loops.

**User-visible outcome:** Autoplay and ad playback start reliably (including on Live TV), previews behave correctly with trailers or time-limited main-video previews, admin users can manage Movies and Podcasts in dedicated sections, video edits save reliably with clearer errors when they fail, and Live/Originals/Profile/Admin pages render consistently with proper loading and access states.
