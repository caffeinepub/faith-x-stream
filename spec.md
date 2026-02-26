# Specification

## Summary
**Goal:** Fix all broken admin dashboard CRUD operations across every content section, add manual and auto clip creation, and ensure Master Admin has automatic premium access with the ability to grant premium to other admins.

**Planned changes:**
- Fix Movies management: create, edit, and delete movies with metadata and file blob uploads
- Fix Podcasts management: create, edit, and delete podcasts with video and thumbnail uploads
- Fix Videos management: create, edit, and delete videos with all metadata fields and file uploads
- Fix Clips management: create clips manually (caption, source video, optional thumbnail), edit captions, and delete clips
- Add auto-clip generation in Clips management: admin selects an existing movie/video and triggers backend extraction of 4–5 second clip segments, which are saved as auto-generated clip records distinguishable from manual clips
- Fix Series management: create, edit, and delete series with seasons, episodes, thumbnail, and trailer uploads
- Fix Channels management: create, edit, and delete channels with name, logo, and original-content flag
- Fix Live TV management: create, edit, and delete live TV entries with HLS stream URLs and schedule configuration
- Fix Brands management: create, edit, and delete brands; assign existing content to brands
- Fix Ads management: upload ad media and create/edit/delete ad assignments with position/skip/display settings
- Fix Stripe configuration: save Stripe secret key and allowed countries, display current configuration status
- Ensure Master Admin automatically has full premium content access without a subscription
- Allow Master Admin to grant premium access to other admin users from the MasterAdminManagement panel
- Audit and fix all backend Motoko create/update/delete functions for every content type to match correct argument types, return typed Result variants, and persist state correctly
- Audit and fix all React Query mutation hooks in useQueries.ts for every admin section to call correct backend methods, handle errors with user-facing messages, and invalidate query cache on success
- Ensure AdminPage.tsx includes tabs for all sections (Movies, Podcasts, Videos, Clips, Series, Channels, Live TV, Brands, Ads, Stripe, Analytics, Master Admin Management) and each renders its component correctly

**User-visible outcome:** Admins can successfully create, edit, and delete all content types (movies, podcasts, videos, clips, series, channels, live TV, brands, ads) from the dashboard without errors; admins can manually create clips or auto-generate 4–5 second clips from existing content; the Master Admin has full premium access and can grant premium access to other admins.
