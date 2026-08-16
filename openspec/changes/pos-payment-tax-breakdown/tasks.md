# Tasks

## 1. Tax breakdown in PaymentPanel

- [x] 1.1 In `resources/js/types/pos.ts`, add `tax_rate: number;` and `tax_total: number;` to the `PricingSummary` interface
- [x] 1.2 In `resources/js/components/pos/PaymentPanel.tsx`, map `tax: { rate: summary?.tax_rate ?? 0, total: summary?.tax_total ?? 0 }` into the `pricing` object
- [x] 1.3 In `PaymentPanel.tsx`, render an always-visible `PPN {rate}%` row (IDR-formatted `tax_total`) between the Subtotal row and the "Detail potongan & biaya" toggle, shown only when `tax.total > 0`

## 2. Tax rate setting UI

- [x] 2.1 In `app/Http/Controllers/Apps/SettingController.php`, `storeProfile()` returns `'tax_default_rate' => Setting::get('tax_default_rate', '11.00')`
- [x] 2.2 In `updateStoreProfile()`, add `tax_default_rate` to validation (`required|numeric|between:0,100`) and persist via `Setting::set('tax_default_rate', ...)`
- [x] 2.3 In `resources/js/pages/Dashboard/Settings/Store.tsx`, add a "Pajak PPN" percent input (numeric, step 0.01, "%" suffix) pre-filled from props, submitted with the existing form

## 3. Verification

- [x] 3.1 Run `vp check` (lint + typecheck) — clean
- [x] 3.2 Manual browser check: with a product in the cart, PaymentPanel shows `PPN 11%` with the correct amount and the grand total is unchanged (tax already included); set the rate to e.g. 5 in Store settings, refresh preview → PPN row reflects 5% and the total changes accordingly
- [x] 3.3 Run Pest suite (`php artisan test --compact`) — baseline 63 passed / 349 assertions holds
