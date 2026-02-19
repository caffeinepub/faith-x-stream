# Specification

## Summary
**Goal:** Fix Header component to immediately display authenticated state (profile dropdown and admin link) after Internet Identity login completes.

**Planned changes:**
- Update Header component to re-render immediately when Internet Identity authentication completes
- Fix useAuth context to synchronously propagate authentication state changes to all consuming components
- Invalidate and refetch user profile queries immediately after Internet Identity login to ensure role data is available
- Ensure actor initialization completes before Header and authenticated components attempt to render

**User-visible outcome:** After logging in with Internet Identity, users immediately see their profile dropdown and admin link (if applicable) in the Header without needing to refresh the page or navigate away.
