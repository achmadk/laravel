# Design: Show average cost (Modal) in POS product table

## Context

The POS product table (`ProductGrid`, viewMode "table") shows Nama | Barcode | Harga | Stok. Purchase cost data exists in `purchase_order_items` (`unit_price`, `qty_received` — populated by goods receiving) but is never surfaced at the point of sale. `Product.buy_price` is a static "harga modal" used for profit math elsewhere, but the user explicitly wants the true weighted-average cost from actual purchase history, falling back to 0 when a product has no received purchases.

## Goals / Non-Goals

**Goals:**
- Surface a weighted-average purchase cost per product in the POS table view.
- Compute it server-side from real received-purchase data.
- Minimal, additive change: no schema/migration, no new dependencies.

**Non-Goals:**
- Grid (card) view changes.
- Products CRUD / management pages.
- Changing `buy_price` semantics or profit math.
- Landed-cost adjustments (freight, taxes) — pure `unit_price` weighted average only.

## Decisions

1. **Weighted average via correlated subquery in the existing products select** (`TransactionController::index`):
   ```php
   DB::raw("(SELECT COALESCE(ROUND(SUM(poi.unit_price * poi.qty_received) / NULLIF(SUM(poi.qty_received), 0)), 0) FROM purchase_order_items poi WHERE poi.product_id = products.id AND poi.qty_received > 0) AS average_cost")
   ```
   - Alternative considered: Eloquent `withSum`/`withAvg` — can't express weighted average (SUM(a*b)/SUM(b)) directly; subquery is one line and flows through the existing `...$product->toArray()` map.
   - `ROUND(...)` in SQL → whole IDR, matching the integer `buy_price`/`sell_price` convention and avoiding float noise in `toArray()`.
   - `NULLIF(SUM(qty_received), 0)` guards division by zero; `COALESCE(..., 0)` implements the user-approved fallback (0, not dash, not buy_price).
   - `purchase_order_items.product_id` is a foreign key (indexed by Postgres) and `qty_received > 0` filters to actually-received stock — a cheap aggregate per row.

2. **Type + column additions only** (`types/pos.ts`, `ProductGrid.tsx`):
   - `POSProduct` gains `average_cost: number;`.
   - Table branch gains a `Modal` column between `Harga` and `Stok`, formatted with the existing local `formatPrice` (0 → "Rp 0"). Grid view untouched.

## Risks / Trade-offs

- **Subquery cost on large catalogs** → Mitigation: FK-indexed correlation, single aggregate per row, POS catalog is typically small (hundreds of rows); identical shape to existing per-row `pricing_badge` preview work.
- **Weighted average ≠ current cost** (old cheap receipts drag the average down) → Accepted: user explicitly chose weighted average from purchases over `buy_price`; label "Modal" matches harga-modal language.
- **Zero-history products show Rp 0** → Accepted per user decision; trivially changeable later if dash/placeholder desired.
- **Round-trip float semantics** → ROUND happens in SQL, so the payload is a clean integer; no client-side math.

## Migration Plan

Deploy as part of the normal flow (frontend + backend change in one commit/PR). Rollback: revert the subquery line and the column; payload is additive so older clients ignore `average_cost`.

## Open Questions

None — all decisions confirmed by the user during exploration.
