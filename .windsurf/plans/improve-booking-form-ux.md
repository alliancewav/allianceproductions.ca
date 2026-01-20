# Improve Booking Form UX - Make 1-Hour Auto-Rental Switch Obvious

When users drag the session slider to 1 hour, the system silently forces rental mode (disables engineer). Users don't notice this and accidentally book rentals instead of recording sessions.

## Root Cause
In `BookingModal.tsx` lines 561-566, a `useEffect` auto-disables engineer when `sessionHours === 1` (recording requires min 2 hours). This happens silently with no user notification.

## Proposed Changes

### 1. Show Confirmation Modal When Auto-Switching to Rental
When user drags slider to 1 hour:
- Display a modal explaining: "Recording sessions require minimum 2 hours. 1-hour bookings are Studio Rentals only (no engineer)."
- Offer two clear options: "Continue with Rental" or "Book 2+ Hours for Recording"
- Only proceed to rental mode if user explicitly confirms

### 2. Visual Feedback on Slider
- Add label under the 1-hour mark: "Rental Only"
- Add label under 2+ hour marks: "Recording Available"
- Visually distinguish the 1-hour option (amber/orange color)

### 3. Enhance Rental Mode Banner
Make the existing rental notice (lines 1666-1674) more prominent:
- Larger size, animated entrance
- Position at TOP of the session services section
- Add quick action: "Need an engineer? Book 2+ hours"

### 4. Add Session Type Badge to Step Header
Show a persistent badge next to the step title indicating current mode:
- 🎙️ "Recording Session" (green badge) when engineer enabled
- 🏢 "Studio Rental" (amber badge) when rental mode

## Files to Modify
- `src/components/BookingModal.tsx`

## Implementation Order
1. Add confirmation modal for 1-hour auto-switch
2. Enhance slider with "Rental Only" / "Recording Available" labels
3. Move and enlarge rental mode banner
4. Add session type badge to header
