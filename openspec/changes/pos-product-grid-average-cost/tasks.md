# Tasks

## 1. Backend — average_cost in POS payload

- [x] 1.1 In `TransactionController::index`, add the correlated-subquery `DB::raw(...) AS average_cost` (weighted avg of `unit_price * qty_received` over `qty_received > 0`, ROUND, NULLIF, COALESCE 0) to the products select so it flows through `toArray()` into the POS payload

## 2. Frontend — Modal column in table view

- [x] 2.1 In `types/pos.ts`, add `average_cost: number;` to the `POSProduct` interface
- [x] 2.2 In `ProductGrid.tsx` table branch, add a "Modal" column header between Harga and Stok
- [x] 2.3 In `ProductGrid.tsx` table branch, render the Modal cell with `formatPrice(product.average_cost)` (0 renders "Rp 0"); grid view untouched

## 3. Verification

- [x] 3.1 Run `vp check` (lint + typecheck) — clean
- [x] 3.2 Browser check: table view shows Modal column with weighted-average cost for a product with received purchases and "Rp 0" for one without; grid view shows no cost
- [x] 3.3 Run Pest suite (`php artisan test --compact`) — 63 passed / 349 assertions baseline holds
