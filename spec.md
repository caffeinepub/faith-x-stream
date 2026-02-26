# Specification

## Summary
**Goal:** Redesign the FAITH X-Stream frontend with a Tubi-inspired homepage, navigation, VOD browsing pages, Disney+-style brand rails, and a more vibrant dark red/black visual theme.

**Planned changes:**
- Replace the current HomePage hero/featured section with a full-width hero banner (Play + More Info CTAs), followed by 4–5 horizontal scrollable genre/category rows (Movies, TV Shows, Podcasts, Originals, Continue Watching); preserve the Shorts/Clips vertical feed within the new layout
- Add Disney+-style brand/network rails to the HomePage and NetworksPage: each rail shows the brand logo as a section header with a horizontally scrollable carousel of associated content linking to the BrandDetailPage
- Redesign the global Header to a Tubi-style top nav with VOD-first link order (Home, Movies, TV Shows, Podcasts, Originals, Live TV, Clips, Networks), a more prominent search bar, and a mobile hamburger/drawer menu
- Redesign MoviesPage, TVShowsPage, and PodcastsPage with genre/category filter chips at the top and a responsive content grid (2 columns mobile, 4–5 desktop); enforce availableAsVOD filtering and show empty states gracefully
- Update the color theme to use richer, more saturated reds (deeper crimson to vivid scarlet), improve text contrast, and apply dynamic card hover treatments (glowing red border/saturated overlay) consistently via Tailwind/OKLCH config

**User-visible outcome:** Users experience a polished, Tubi-style streaming interface with a vibrant dark red theme, easy VOD discovery through genre browsing and brand rails, a cleaner navigation, and fully preserved Live TV and Shorts functionality.
