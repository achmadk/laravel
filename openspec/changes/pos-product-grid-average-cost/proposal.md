# Proposal: Show average cost (Modal) in POS product table

## Why

Cashiers/owners need to see the weighted-average purchase cost ("Modal") per product while selling — the POS product table currently shows only Harga (sell price) and Stok, so margins can't be assessed at the point of sale. The cost data already exists in `purchase_order_items` (received quantities × unit prices) but is never surfaced.

## What Changes

- Add a `Modal` (average cost) column to the POS product **table view** (`ProductGrid` viewMode "table"), positioned between `Harga` and `Stok`.
- Backend: the POS product payload (`TransactionController::index`) gains an `average_cost` field per product, computed as the weighted average of `unit_price` over received quantities (`qty_received > 0`), rounded to a whole number.
- No purchase history for a product → `average_cost = 0` (renders as "Rp 0").
- Grid (card) view, product management pages, and the `buy_price` field are untouched.

## Capabilities

### New Capabilities
- `pos-product-average-cost`: POS product list exposes each product's weighted-average purchase cost; the table view renders it as a Modal column.

### Modified Capabilities
<!-- None: existing specs (pos-product-table-view, pos-transactions, pos-ui) have no requirement changes. -->

## Impact

- `app/Http/Controllers/Apps/TransactionController.php` — products select gains one correlated-subquery aggregate (`average_cost`); payload shape changes (additive, non-breaking).
- `resources/js/types/pos.ts` — `POSProduct` gains `average_cost: number`.
- `resources/js/components/pos/ProductGrid.tsx` — table branch adds a Modal column between Harga and Stok.
- No schema/migration changes, no new dependencies, no changes to receipts, reports, or products CRUD.
