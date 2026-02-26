# Specification

## Summary
**Goal:** Restore the full Admin system in AdminPage.tsx with all tabs, sub-components, access restrictions, and supporting backend methods.

**Planned changes:**
- Restore the Admin Dashboard tab as the default tab, showing key stat cards (total users, total content, active subscriptions, ad impressions, revenue) and quick-access shortcuts to each admin sub-section
- Restore the User Management tab rendering MasterAdminManagement, allowing role promotion/demotion (guest, user, admin, master admin), suspension, and removal of users
- Restore Content & Settings Control tabs: Movies, Podcasts, Videos, Clips, Series, Channels, and Stripe Setup, each rendering their existing management components with full CRUD access
- Restore the Manual User-Targeted Ads Management tab rendering ManualAdsManagement, supporting ad media upload and user-targeted ad assignment with scope, position, and skip settings
- Restore the Analytics tab rendering AnalyticsDashboard, displaying total views, premium users, ad impressions, revenue, and a trending content list
- Restore the Network/Brand Management tab rendering BrandManagement, supporting brand/network CRUD, logo upload, and content assignment
- Restore the Live TV Programming tab rendering LiveScheduleManagement, with auto-schedule logic that derives slot duration from video file length; only movie/film/television content types are eligible — clips are explicitly excluded
- Enforce access restrictions: unauthenticated users are redirected to login, non-admin users see an access-denied message or are redirected, admin and master admin roles have full access
- Expose all necessary backend methods: user role management, analytics retrieval, brand CRUD, user-targeted ad assignment, and live schedule management with content-duration-based slot assignment

**User-visible outcome:** Admins and master admins can access a fully restored admin panel with a dashboard overview, user management, content management, ads management, analytics, brand/network management, and live TV programming — all protected from non-admin access.
