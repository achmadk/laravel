## Why

The `/dashboard/transactions` POS page is broken because it was migrated from an `/apps/*` route prefix to `/dashboard/*` without finishing the frontend, and the React page and controller disagree on the data contract. Cart items never render on load, adding/updating/removing items corrupts state, selecting a customer 404s, and checkout posts to a route that no longer exists — so a cashier cannot reliably complete a sale. The `pos-reference` project shows the intended Inertia-native contract, which this change aligns to.

## What Changes

- Align the React page to the controller's Inertia props: read `carts` (not `cart`) and hydrate customer/pricing from server props instead of ignoring them.
- Replace all leftover `/apps/*` calls with the correct `/dashboard/*` routes (or named `route()` helpers via Wayfinder) across `Index.tsx`, `PaymentPanel.tsx`, `Print.tsx`, and `History.tsx`.
- Convert cart mutations (add/update/remove/hold) from `axios` JSON expectations to Inertia `router` visits that consume the redirect-refreshed `carts` prop, matching how the controller already returns `redirect()->back()` / `redirect()->route('transactions.index')`.
- Point checkout submission at `transactions.store` (`POST /dashboard/transactions/store`) instead of the non-existent `POST /apps/transactions`.
- Remove the non-existent `select-customer` client call and drive customer selection through Inertia state / existing endpoints, eliminating the unhandled promise rejection.
- Drive the payment summary from the server-computed `initialPricingPreview` (promo, voucher, loyalty, shipping) instead of the naive client-side subtotal, so displayed totals match what `store` charges.
- **BREAKING** (client contract only): cart mutation endpoints are consumed as Inertia redirects, not JSON; any remaining JSON consumers must be updated.

## Capabilities

### New Capabilities

- `pos-transactions`: The point-of-sale transaction screen at `/dashboard/transactions` — how the server exposes cart/product/customer/pricing state via Inertia props, how the client mutates the cart and selects a customer, and how checkout is submitted and priced.

### Modified Capabilities

<!-- No existing OpenSpec specs for this area; captured as a new capability. -->

## Impact

- Frontend: `resources/js/pages/Dashboard/Transactions/Index.tsx`, `resources/js/components/pos/PaymentPanel.tsx`, `resources/js/pages/Dashboard/Transactions/Print.tsx`, `resources/js/pages/Dashboard/Transactions/History.tsx`, and possibly `CustomerSelect`/`HeldTransactions` components.
- Backend: `app/Http/Controllers/Apps/TransactionController.php` (`index` prop shape confirmation; ensure customer selection has a supported endpoint), `routes/web.php` (verify no `/apps/*` or `select-customer` routes are expected).
- Routing: all POS calls standardize on the `/dashboard` prefix / named routes; the `active_shift` middleware interplay on mutation routes is surfaced to the user.
- Tests: Pest feature tests for `transactions.index` prop shape, cart mutation redirect behavior, and checkout via `transactions.store`.
- Reference: `~/PROJECTS/NIGHTDAYSOFT/pos-reference` (Inertia-native `router`-based `Index.jsx` and redirect-returning controller).
