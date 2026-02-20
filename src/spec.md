# Specification

## Summary
**Goal:** Restore Internet Identity login functionality alongside existing email/password authentication, ensuring the full authentication flow updates UI components properly.

**Planned changes:**
- Add Internet Identity login button back to LoginPage UI alongside email/password form
- Wire II button to trigger useInternetIdentity authentication flow
- Ensure successful II login immediately updates authentication state in useAuth context
- Initialize backend actor immediately after successful II login before profile queries
- Invalidate and refetch user profile queries after II login to load role information
- Implement proper navigation to home page after successful II login without redirect loops

**User-visible outcome:** Users can log in using either Internet Identity or email/password. After successful II login, the Header immediately displays the profile dropdown and admin link, and users are redirected to the home page ready to use authenticated features.
