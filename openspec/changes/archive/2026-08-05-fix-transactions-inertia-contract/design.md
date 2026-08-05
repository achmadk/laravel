## Context

The `/dashboard/transactions` POS page is broken by a half-finished route migration (`/apps/*` → `/dashboard/*`) plus a client/server data-contract mismatch. Concretely, in the current tree:

- `TransactionController@index` returns Inertia prop `carts`, but `Index.tsx` destructures `cart` → cart never hydrates (`Index.tsx:36,48`).
- `index` never sends a `customer` prop; the selected customer is lost on reload (`Index.tsx:37`).
- `index` sends `initialPricingPreview`, `carts_total`, `defaultPaymentGateway`, `shiftSummary`, `loyaltyTierOptions` — all ignored; `PaymentPanel` recomputes a naive subtotal with `discount: 0, tax: 0` (`PaymentPanel.tsx:60-72`).
- Checkout posts to `/apps/transactions` which does not exist (`PaymentPanel.tsx:125`); the real route is `POST /dashboard/transactions/store`.
- Customer select/remove calls `/apps/transactions/select-customer` — no such route, and the calls are not wrapped in try/catch → unhandled promise rejection (`Index.tsx:260,264,297`).
- Category filter calls `axios.get("/apps/products")` (`Index.tsx:203`) which 404s; even fixed, `/dashboard/products` is an Inertia page route, not a JSON API.
- `addToCart`/`updateCart`/`destroyCart` controllers return `redirect()` (`controller:248,264,309`) but the client calls them via `axios` and does `setCart(response.data.cart || response.data)` (`Index.tsx:139,151,161`), shoving the Inertia page payload into cart state.
- `Print.tsx` and `History.tsx` still use `/apps/transactions...` for back links, print, confirm-payment, and history filters.

The `~/PROJECTS/NIGHTDAYSOFT/pos-reference` project is the origin this app was ported from. Its `TransactionController@index` returns the identical `carts` prop shape, its mutation methods return `redirect()`, and its `Index.jsx` consumes them with Inertia `router` + named `route()` helpers (`router.post(route("transactions.addToCart"), ...)`, `router.delete(route("transactions.destroyCart", cartId))`, `router.post(route("transactions.store"), ...)`). This is the canonical Approach A pattern this change adopts.

## Goals / Non-Goals

**Goals:**

- Make `/dashboard/transactions` fully functional: load cart, add/update/remove/hold items, select customer, and check out.
- Adopt the Inertia-native contract (Approach A): controllers return redirects; the client uses `router` visits and re-renders from refreshed props.
- Standardize all POS client calls on `/dashboard/*` named routes via Wayfinder/`route()`.
- Drive the payment summary from server-computed pricing so displayed totals equal charged totals.
- Cover the behavior with Pest feature tests.

**Non-Goals:**

- Rewriting controller methods to return JSON (that is the rejected Approach B).
- Porting reference-only features absent here (warehouse/unit-conversion/composite products, discount approvals) — only align the contract, not add scope.
- Redesigning the POS UI/UX or changing the pricing/loyalty business logic.
- Changing the `active_shift` middleware policy (only surface its effect to the user).

## Decisions

### Decision 1: Approach A (Inertia-native) over Approach B (JSON API)

Cart mutations follow the controller's existing `redirect()->back()` / `redirect()->route('transactions.index')` responses. The client issues Inertia `router` visits (`preserveScroll`, `preserveState` where appropriate) and reads the refreshed `carts` prop via `usePage`/props rather than local `setCart` from an axios body.

- **Why**: The codebase is Inertia-first; `store` and `PaymentPanel` already use `router`. The reference implementation does exactly this. Approach B would require rewriting several controller methods that currently redirect, expanding blast radius for no product benefit.
- **Alternative considered**: Approach B (controllers return `response()->json(['cart' => ...])`, keep axios). Rejected: more backend churn, diverges from the reference and the rest of the app.

### Decision 2: Rename client prop `cart` → `carts` and hydrate from props

`Index.tsx` reads `carts` and derives cart state directly from props instead of a `useState(initialCart)` seeded from the wrong key. Following the reference, cart is treated as a prop-derived value refreshed by Inertia visits, not long-lived local state.

- **Why**: Eliminates the silent empty-cart bug and keeps a single source of truth (server) for cart contents.
- **Alternative considered**: Keep local `useState` but sync via `useEffect` on the corrected `carts` prop. Workable, but the reference derives from props directly; fewer sync bugs.

### Decision 3: Named routes via Wayfinder / `route()` instead of hardcoded paths

Replace hardcoded `/apps/*` and `/dashboard/*` strings with generated route helpers where the project already uses Wayfinder (`@/actions`, `@/routes`), or Ziggy-style `route()` if that is the established convention. Confirm the existing convention before implementing (see Open Questions).

- **Why**: Hardcoded prefixes are exactly what broke this page; named routes make future prefix moves safe.
- **Alternative considered**: Hardcode corrected `/dashboard/*` strings. Faster but reintroduces the same fragility.

### Decision 4: Payment summary sourced from `initialPricingPreview` + `pricing-preview`

`PaymentPanel` renders totals from the server `initialPricingPreview` on load and refreshes via the existing `POST /dashboard/transactions/pricing-preview` JSON endpoint (which legitimately returns JSON) when customer/discount/voucher/shipping/redeem inputs change — mirroring the reference `Index.jsx` `pricing-preview` axios call.

- **Why**: Guarantees the displayed grand total equals what `store` computes (promo, voucher, loyalty, shipping), removing the naive `subtotal`-only calculation.
- **Note**: `searchProduct`, `previewPricing`, `pricing-preview`, and `getHeldCarts` genuinely return JSON, so axios stays appropriate for those; only the redirect-returning mutations move to `router`.

### Decision 5: Customer selection without a `select-customer` endpoint

Remove the three `/apps/transactions/select-customer` calls. Customer selection is held in client state and passed to `pricing-preview` and `store` payloads (as the reference does with `selectedCustomer`), so no dedicated persistence endpoint is needed.

- **Why**: The endpoint never existed here; the reference does not persist customer server-side between requests either.

### Decision 6: Surface `active_shift` middleware outcomes

Mutation/checkout routes are guarded by `active_shift`. The client handles the redirect/error from that middleware and prompts the cashier to open a shift (the reference shows an open-shift affordance), instead of failing silently.

## Risks / Trade-offs

- **Prop-derived cart may flicker on rapid clicks** → Use `preserveScroll`/`preserveState` and disable the control while a visit is in flight; debounce quantity edits as the reference does.
- **Wayfinder route names may not exist for every endpoint** → Verify generated actions/routes exist; fall back to `route()` or a corrected literal only where a helper is unavailable, and note it.
- **`pricing-preview` and page `carts` could momentarily disagree** → Refresh `pricing-preview` after each successful mutation visit (or read totals from the reloaded `initialPricingPreview`), keeping one authoritative total at checkout.
- **Print/History share the same `/apps` bug** → In scope to fix; without them, back-links and confirm-payment stay broken even after Index is fixed.
- **Behavioral parity with reference is partial** (no warehouse/unit logic here) → Only align the contract; do not import reference-only fields into payloads.

## Migration Plan

1. Confirm the routing-helper convention (Wayfinder actions vs `route()`).
2. Fix `index` prop consumption (`carts`, customer, pricing) in `Index.tsx`.
3. Convert cart mutations to `router` visits; remove axios-JSON cart assumptions.
4. Repoint checkout to `transactions.store`; wire `PaymentPanel` totals to server pricing.
5. Remove `select-customer` calls; drive customer via client state + payloads.
6. Fix `Print.tsx` / `History.tsx` route references.
7. Add Pest feature tests; run the affected suite and `npm run build` / typecheck.

Rollback: revert the frontend commits; controller behavior is unchanged, so no data migration or backend rollback is needed.

## Open Questions

- Is the established frontend routing convention Wayfinder (`@/actions`, `@/routes`) or a Ziggy `route()` global? (Determines Decision 3 implementation.)
- Should the category filter use a dedicated JSON products endpoint, or filter the already-loaded `products` prop client-side? (No JSON `/dashboard/products` API exists today.)
- Is there a supported barcode-`searchProduct` shift requirement (`active_shift`) that should gate the search UI when no shift is open?
