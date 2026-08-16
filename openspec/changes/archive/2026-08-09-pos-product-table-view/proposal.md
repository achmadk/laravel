## Why

The POS product picker on `/dashboard/transactions` only renders products as an image card grid. In this codebase the transactions screen is a working-cashier surface where lots of rows need scanning at once (barcode, price, stock visible at a glance, no images slowing it down); some users prefer a dense table. There is no existing way to switch views. A table mode inside `ProductGrid` with the same click semantics covers this with zero backend work.

## What Changes

- `resources/js/components/pos/ProductGrid.tsx`:
  - Add a view-mode toggle button in the grid header row that switches between the existing card grid and a new **table** view.
  - Persist the chosen view in `localStorage` (e.g. key `pos:product-view`) so the preference survives navigation/refresh.
  - Table view columns: **name + barcode + price + stock** (no image column).
  - Row click behavior identical to card click: same `onProductClick(product)` call, same in-cart highlight, same `stock <= 0` disabled state, same HABIS treatment.
  - Keep existing card-grid behavior byte-for-byte when table mode is off.
- No backend, route, type (POSProduct already carries barcode), or dependency changes.

## Capabilities

### New Capabilities
- `pos-product-table-view`: toggle between card-grid and table presentation of the POS product picker, persisted per user, with identical add-to-cart semantics in both modes.

### Modified Capabilities
<!-- None: existing pos-transactions/pos-ui specs do not specify the picker's internal layout; this is purely additive. -->

## Impact

- `resources/js/components/pos/ProductGrid.tsx` — the only file changed.
- Consumers of `ProductGrid` (transactions page) receive the new interactive element automatically; props/API unchanged.
- No API, database, or permission impact.