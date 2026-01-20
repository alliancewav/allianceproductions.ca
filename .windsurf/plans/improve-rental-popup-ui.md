# Improve Rental Popup UI & Fix Issues

Fix the rental confirmation popup to match the futuristic angular design of the main form, resolve the double-click bug, and improve session mode indicators.

## Issues to Fix

### 1. Popup Buttons Don't Match Main Form Style
- **Current**: Buttons use `rounded-lg` with custom inline styles
- **Fix**: Apply `btn-primary` and `btn-secondary` classes with `clip-path` angular design
- **Also**: Remove icons from buttons as requested

### 2. Double-Click Bug on "Keep Recording"
- **Root Cause**: The `handleCancelRental` is called twice - once from the backdrop `onClick` and once from the button
- **Fix**: Add `e.stopPropagation()` to prevent backdrop click from firing when button is clicked

### 3. Recording Badge Hidden on Mobile
- **Current**: Header badge uses `hidden sm:flex` - invisible on mobile
- **Fix**: Move badge below the step header (after progress dots) so it's visible on all screen sizes
- **Also**: Remove icons from badge, show text only

### 4. "Rental Only" Slider Label is Confusing
- **Current**: Amber badge sits under the "1" hour button, unclear purpose
- **Fix**: Remove the label entirely - the confirmation modal already explains 1-hour = rental

### 5. Changes Not Visible on Production Domain
- **Note**: This is a deployment/cache issue outside of code changes
- **Action**: After code changes, rebuild and user may need to clear CDN/browser cache

## Implementation

### File: `src/components/BookingModal.tsx`

1. **Popup buttons** (~line 2957-2972):
   - Remove `<Mic2>` and `<Building2>` icons from buttons
   - Replace inline button classes with `btn-secondary` and `btn-primary`
   - Add smaller sizing: `text-sm px-5 py-2.5`

2. **Fix double-click** (~line 2959):
   - Add `e.stopPropagation()` to button onClick handlers

3. **Session mode badge** (~line 1018-1045):
   - Remove `hidden sm:flex` class to show on mobile
   - Remove icons, keep text only ("Recording" / "Rental")
   - Simplify styling

4. **Remove slider label** (~line 1583-1592):
   - Delete the "Rental Only" badge and associated flex container
   - Keep only the "Recording Sessions (2+ hrs)" center text

