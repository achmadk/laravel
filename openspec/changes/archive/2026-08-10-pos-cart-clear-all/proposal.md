# Proposal: pos-cart-clear-all

## Why

The cart panel on `/dashboard/transactions` only allows removing items one at a time (per-item trash button on each row). When a shift accumulates many items, clearing the cart requires N individual clicks. There is no bulk "clear all" action anywhere — no button in `CartPanel`, and no backend endpoint to wipe a cashier's active cart items.

## What

Add a "clear all cart items" action scoped to **active (non-held) items only**:

- **Backend**: new `DELETE /transactions/cart` route (`transactions.clearCart`) → `TransactionController::clearCart()` which deletes all `Cart` rows for the current cashier where the cart is active (not held).
- **Frontend**: new `onClearAll` prop on `CartPanel`; a simple trash icon button rendered **after the "{n} item" badge** in the cart header (visible only when `items.length > 0`); a small confirmation dialog before clearing; wired in `Transactions/Index.tsx` to `router.delete(transactions.clearCart.url(), {preserveScroll, preserveState})`.

## Impact

- `app/Http/Controllers/Apps/TransactionController.php` — one new `clearCart()` method.
- `routes/web.php` — one new route in the existing dashboard transactions group (permission:transactions-access + active_shift).
- `resources/js/components/pos/CartPanel.tsx` — new `onClearAll` prop + trash icon button in header.
- `resources/js/pages/Dashboard/Transactions/Index.tsx` — clear handler + confirmation modal state.
- No DB changes, no new dependencies.

## Non-goals

- Held cart items are NOT cleared (out of scope per user decision).
- No undo feature.
- No changes to per-item remove/qty behavior.
