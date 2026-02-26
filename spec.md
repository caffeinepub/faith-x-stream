# Specification

## Summary
**Goal:** Update the footer tagline text and fix the Profile Setup modal flow for authenticated Internet Identity users.

**Planned changes:**
- Update the footer tagline paragraph to read: "Community streaming for the whole family, Watch Movies, TV Shows, Live TV, and Much More."
- Fix `ProfileSetupModal.tsx` so it appears correctly for authenticated Internet Identity users who have not completed their profile
- Ensure all form fields (including email) in the Profile Setup modal accept input and submit without errors
- After successful profile setup, the modal closes and does not reappear on subsequent page loads for the same user
- Ensure the modal does not appear if the user is not authenticated or already has a profile

**User-visible outcome:** The footer displays the updated tagline, and new authenticated users are properly prompted to complete their profile setup exactly once, with the modal working reliably end-to-end.
