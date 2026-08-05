## 1. Investigation & Conventions

- [x] 1.1 Confirm the frontend routing-helper convention (Wayfinder `@/actions` + `@/routes`, or Ziggy `route()`); document which POS endpoints have generated helpers
- [x] 1.2 List every `/apps/*` and `select-customer` reference across POS files (`Index.tsx`, `PaymentPanel.tsx`, `Print.tsx`, `History.tsx`, `CustomerSelect`, `HeldTransactions`) as the fix checklist
- [x] 1.3 Compare `Index.tsx` props against `TransactionController@index` return keys and record the full prop contract (`carts`, `customers`, `products`, `categories`, `initialPricingPreview`, `carts_total`, `defaultPaymentGateway`, `paymentGateways`, `bankAccounts`, `shiftSummary`, `loyaltyTierOptions`, `heldCarts`)
- [x] 1.4 Review reference `pos-reference/.../Transactions/Index.jsx` `router`/`route()` usage for add/update/destroy/hold/store and mirror the interaction pattern

## 2. Fix Page Prop Hydration (Index.tsx)

- [x] 2.1 Rename the cart prop consumption from `cart` to `carts` and derive cart state from props (per Decision 2)
- [x] 2.2 Consume the `customer`/`customers` and `initialPricingPreview` props so customer selection and totals survive reload; remove reliance on the missing `customer` prop
- [x] 2.3 Remove the empty-cart-on-mount fetch path and ensure the empty state renders with no mutation request on mount
- [x] 2.4 Pass `paymentGateways`, `bankAccounts`, `defaultPaymentGateway`, and `shiftSummary` from props into child components

## 3. Convert Cart Mutations to Inertia Redirects

- [x] 3.1 Convert `handleAddToCart` to an Inertia `router.post(transactions.addToCart)` visit (`preserveScroll`), re-rendering from the refreshed `carts` prop
- [x] 3.2 Convert `handleUpdateQty` to `router.patch(transactions.updateCart, cartId)` and surface server validation errors (e.g. insufficient stock)
- [x] 3.3 Convert `handleRemove` to `router.delete(transactions.destroyCart, cartId)` and clear the removing state after the redirect
- [x] 3.4 Convert `handleHold` to `router.post(transactions.hold)` and rely on refreshed props to clear the cart
- [x] 3.5 Remove all `setCart(response.data.cart || response.data)` axios-body assumptions

## 4. Customer Selection Without select-customer

- [x] 4.1 Remove the three `/apps/transactions/select-customer` calls in `Index.tsx`
- [x] 4.2 Hold selected customer in client state and include `customer_id` in `pricing-preview` and `store` payloads (per Decision 5)
- [x] 4.3 Verify no unhandled promise rejection occurs on select/clear customer

## 5. Payment Summary From Server Pricing (PaymentPanel.tsx)

- [x] 5.1 Replace the naive `useMemo` subtotal with values from `initialPricingPreview` (subtotal, promo, voucher, loyalty, shipping, grand total)
- [x] 5.2 Refresh totals via `POST /dashboard/transactions/pricing-preview` (JSON, axios) when customer/discount/voucher/shipping/redeem inputs change
- [x] 5.3 Repoint checkout from `router.post("/apps/transactions")` to `transactions.store` (`POST /dashboard/transactions/store`) with the controller's expected payload fields
- [x] 5.4 Follow the redirect to `transactions.print` on success and surface flash errors

## 6. Category Filter & Product Search

- [x] 6.1 Resolve the category filter: either filter the already-loaded `products` prop client-side or point at a real JSON endpoint (per Open Question) — remove `/apps/products`
- [x] 6.2 Confirm `searchProduct` continues to use the JSON endpoint at the corrected `/dashboard/transactions/searchProduct` path

## 7. Fix Print & History Screens

- [x] 7.1 Repoint `Print.tsx` back-link and `confirm-payment` calls from `/apps/*` to `/dashboard/*` / named routes
- [x] 7.2 Repoint `History.tsx` history filter, back-link, print, and `confirm-payment` calls from `/apps/*` to `/dashboard/*` / named routes

## 8. Shift Handling

- [x] 8.1 Handle the `active_shift` middleware redirect/error on mutations and checkout, prompting the cashier to open a shift instead of failing silently

## 9. Verification

- [x] 9.1 Add/adjust Pest feature test asserting `transactions.index` renders with the `carts` prop populated for a cashier with active cart items
- [x] 9.2 Add Pest feature tests for add/update/destroy cart returning redirects and reflecting updated cart contents
- [x] 9.3 Add a Pest feature test for checkout via `transactions.store` redirecting to `transactions.print`
- [x] 9.4 Grep the codebase to confirm zero remaining `/apps/` and `select-customer` references in POS files
- [x] 9.5 Run the affected Pest suite, TypeScript typecheck, and `npm run build`; confirm all pass
