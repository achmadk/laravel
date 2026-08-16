## 1. Backend — clear cart route

- [x] 1.1 `routes/web.php`: add `DELETE /transactions/cart` → `TransactionController::clearCart`, name `transactions.clearCart`, inside the dashboard transactions group (permission:transactions-access + active_shift), registered before the `{cart_id}` wildcard routes
- [x] 1.2 `app/Http/Controllers/Apps/TransactionController.php`: add `clearCart()` deleting `Cart::where('cashier_id', auth()->id())->active()` and returning `back()`
- [x] 1.3 Feature test `tests/Feature/Apps/ClearCartTest.php`: transactions-access user DELETE `/dashboard/transactions/cart` removes their active carts and preserves held carts

## 2. Frontend — clear-all button + confirm

- [x] 2.1 `resources/js/components/pos/CartPanel.tsx`: add `onClearAll?: () => void` prop; render trash icon button after the item-count badge when `items.length > 0`
- [x] 2.2 `resources/js/pages/Dashboard/Transactions/Index.tsx`: add `isClearOpen` state + `handleClearAll` (`router.delete(transactions.clearCart.url(), {preserveScroll, preserveState})`) + confirmation `Modal` (ModalHeader/ModalTitle/ModalBody/ModalFooter/ModalClose + `intent="danger"` Button)

## 3. Verification

- [x] 3.1 Regenerate Wayfinder; `tsc --noEmit` clean (via `~/.vite-plus/js_runtime/node/24.19.0/bin/node node_modules/.pnpm/typescript@7.0.2/node_modules/typescript/bin/tsc --noEmit`)
- [x] 3.2 `php artisan test --compact` green (baseline 59 + new tests)
- [x] 3.3 Browser check via Playwright on /dashboard/transactions: badge-gated icon, confirm dialog, active items cleared, held items remain