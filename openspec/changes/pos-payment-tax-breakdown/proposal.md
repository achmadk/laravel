## Why

The POS payment panel displays a grand total that already includes 11% PPN, but never shows the tax breakdown. A cashier sees "Total Rp 55.500" with no indication that Rp 5.500 of it is tax — while the printed receipt (both 58mm and 80mm) shows "PPN 11%" unconditionally. For Indonesian retail, disclosing PPN before payment is the norm, so the pre-payment panel hiding it is the inconsistency. The server already sends `tax_rate`/`tax_total` in every pricing preview; the client type and panel simply drop them.

Separately, the tax rate itself (`tax_default_rate` setting, read by `TaxService` with default 11.00) has no UI anywhere — changing it requires a raw database insert. Store settings should expose it.

## What Changes

- `PricingSummary` type (`resources/js/types/pos.ts`) declares `tax_rate` and `tax_total`.
- `PaymentPanel` maps the tax fields from the pricing preview and renders an **always-visible** "PPN {rate}%" line between the discounts and the Total (next to Subtotal), matching the receipt's unconditional tax display.
- Store settings page (`Settings/Store.tsx`) gains a "Pajak PPN" rate input (percent); `SettingController::storeProfile`/`updateStoreProfile` read/write the `tax_default_rate` key with validation (0–100, decimal).
- No backend pricing math changes; receipts and `TaxService` untouched.

## Capabilities

### New Capabilities
- `pos-tax-display`: pre-payment tax breakdown in the POS panel + configurable PPN rate in store settings

### Modified Capabilities
<!-- None — existing specs have no requirement changes; this adds a new capability -->

## Impact

- `resources/js/types/pos.ts` — `PricingSummary` gains two fields (data already present in payloads).
- `resources/js/components/pos/PaymentPanel.tsx` — pricing mapping + one always-visible row.
- `resources/js/pages/Dashboard/Settings/Store.tsx` — tax rate input in the store profile form.
- `app/Http/Controllers/Apps/SettingController.php` — `storeProfile()` passes the rate; `updateStoreProfile()` validates + persists it.
- No DB migration (key-value `settings` table already supports arbitrary keys), no route/permission changes, no receipt changes.
