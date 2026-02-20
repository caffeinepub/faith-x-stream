# Specification

## Summary
**Goal:** Fix authentication state propagation so login works immediately, and revert unintended UI changes to restore original navigation appearance.

**Planned changes:**
- Fix authentication state synchronization in useAuth context to update isAuthenticated and user state immediately after successful login (both Internet Identity and email/password)
- Ensure actor initialization completes before authenticated UI components render or execute queries
- Invalidate and refetch user profile queries immediately after login to load role information (admin/premium status)
- Remove or refactor LiveTVSyncPlayer initialization logic that interferes with authentication flow
- Fix LoginPage navigation to redirect users to home page after login without causing loops or stuck loading states
- Revert unintended visual changes to Header navigation component to restore original appearance
- Review and revert any unintended UI changes across all pages while preserving functional improvements
- Add comprehensive error logging throughout authentication flow for debugging

**User-visible outcome:** After logging in (via Internet Identity or email/password), users immediately see their profile dropdown and admin link in the Header (if admin), can access their profile and admin pages without delays, and the navigation appearance matches the original design before recent updates.
