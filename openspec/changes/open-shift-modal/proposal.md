## Why

The "Buka Shift" button in the POS layout header links to `/apps/cashier-shifts/create`, which doesn't exist. This causes a 404 error when users without an active shift try to open one from the POS transactions page. A modal-based flow provides better UX—users can enter the opening cash amount directly without leaving the POS page.

## What Changes

- Replace the broken `<Link href="/apps/cashier-shifts/create">` with a modal-trigger button in `POSLayout`
- Create an "Open Shift" modal that:
    - Uses the existing `NumpadModal` component for entering the opening cash amount
    - Includes an optional notes field
    - POSTs to `/dashboard/cashier-shifts` via Inertia's `router.post()`
    - Shows success toast and reloads the page on success
    - Shows error toast on failure
- Add local state to `POSLayout` for managing the modal visibility and form values
- On successful shift open, the header badge updates to show "Shift Aktif"

## Capabilities

### New Capabilities

- `open-shift-modal`: Modal-based shift opening flow from POS layout, allowing cashiers to open a shift without leaving the transactions page

## Impact

- **Files Modified**:
    - `resources/js/layouts/pos-layout.tsx` - Add modal state, open shift logic
    - `resources/js/components/pos/NumpadModal.tsx` - Already exists, reused here
- **Routes Used**:
    - `POST /dashboard/cashier-shifts` (existing, used by CashierShifts/Index)
- **Dependencies**: None new—uses existing NumpadModal component and cashier shift endpoint
