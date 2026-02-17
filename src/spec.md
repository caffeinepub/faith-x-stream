# Specification

## Summary
**Goal:** Restore reliable login/registration for email/password while keeping Internet Identity admin login working, eliminating traps, stuck loading states, and redirect loops.

**Planned changes:**
- Fix backend register/login and access control initialization so anonymous callers can authenticate without trapping and can subsequently call user-only methods (e.g., getCallerUserProfile).
- Standardize backend error responses for common auth failures (invalid credentials, email already registered) so the frontend can display clear messages.
- Fix frontend auth/session state handling so actor initialization and session restoration do not block email/password login or leave the UI stuck in an initializing/loading state.
- Fix /login redirect/navigation behavior to avoid navigation during render and prevent redirect loops/blank screens, while maintaining correct behavior for authenticated vs unauthenticated users.
- Ensure “Login with Internet Identity” still completes end-to-end and establishes the correct authenticated/admin state, with logout fully clearing the II session.

**User-visible outcome:** Users can sign up and log in with email/password from /login and get redirected to / on success, see clear error messages on failures, reliably stay logged in across reloads when a session exists, and admins can still log in via Internet Identity and log out cleanly.
