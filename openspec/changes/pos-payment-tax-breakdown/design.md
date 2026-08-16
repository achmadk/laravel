## Context

The POS payment flow computes pricing in two stages: `PricingService::previewCart` (promo stage, minimal summary) then `LoyaltyService::previewCheckout` (voucher/loyalty/manual discount/shipping/tax/grand_total). The checkout summary already contains `tax_rate` (from `TaxService::getDefaultRate()` → `Setting::get('tax_default_rate', '11.00')`) and `tax_total`, with `grand_total = base + tax` (exclusive-style: tax added on top). PaymentPanel currently maps only subtotal/discounts/shipping/grand_total into its `pricing` object and shows them in a collapsed "Detail potongan & biaya" section plus an always-visible Total. The receipts (`ThermalReceipt80mm.tsx` / `58mm`) already render `PPN {rate}%` unconditionally when `tax_total > 0`.

## Goals / Non-Goals

**Goals:**
- Show the PPN amount and rate in PaymentPanel before payment, always visible (not behind the collapsed details toggle).
- Expose the PPN rate in Store settings with validation and persistence.

**Non-Goals:**
- Changing tax math (inclusive vs exclusive, per-item `tax_type`, rate application order) — current exclusive flat-rate behavior stays.
- Tax on receipts (already correct), `TaxService`, database schema.
- Per-product tax configuration.

## Decisions

1. **Always-visible row, not collapsed.** Receipts show PPN unconditionally; the pre-payment panel hiding it is the inconsistency. The PPN row sits directly under Subtotal (before the "Detail potongan & biaya" toggle), formatted `PPN {rate}%` → `formatPrice(tax_total)`. Rendered only when `tax_total > 0` (rate 0 or no tax → absent, same as receipts).
2. **Data flows unchanged.** `PricingSummary` type gains `tax_rate: number` and `tax_total: number`; PaymentPanel reads them from `pricingPreview.summary` with `?? 0` fallback like sibling fields. No backend payload change.
3. **Settings reuses the existing Store settings form.** `SettingController::storeProfile()` adds `'tax_default_rate' => Setting::get('tax_default_rate', '11.00')`; `updateStoreProfile()` validates `numeric|between:0,100` and `Setting::set('tax_default_rate', ...)`. The value is a string in the `settings` table — store normalized as a plain number string; `TaxService` already casts to float.
4. **Input UX mirrors existing number inputs in Store.tsx** (store-wide pattern), labeled "Pajak PPN" with "%" suffix, step 0.01.

## Risks / Trade-offs

- **Rounding drift**: `tax_total` is `round(base * rate / 100)` server-side; client displays the server value verbatim, so display always reconciles with `grand_total`. No client-side recomputation → no drift.
- **Settings page concurrency**: `updateStoreProfile` writes multiple `store_*` keys + now `tax_default_rate` in one request — same pattern as today, no new risk.
- **Validation gap**: rate accepted up to 100% — a store could set an extreme rate, but that's a business decision, not a data-integrity risk.
- **Rate change applies going forward only** — previously stored transactions keep their `tax_rate`/`tax_total` snapshots (already persisted on the transaction row).
