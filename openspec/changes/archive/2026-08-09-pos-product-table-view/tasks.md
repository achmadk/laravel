## 1. ProductGrid state & toggle

- [x] 1.1 Add `viewMode` state in `ProductGrid.tsx` seeded lazily from `localStorage.getItem("pos:product-view") === "table"` with try/catch guard
- [x] 1.2 Add right-aligned toggle button in the header row (card/table icons) that flips `viewMode` and writes `localStorage.setItem("pos:product-view", ...)`

## 2. Table view

- [x] 2.1 Render `<table>` (token classes per pos-ui spec) with columns Nama, Barcode, Harga, Stok when `viewMode === "table"`; keep existing grid JSX untouched for grid mode
- [x] 2.2 Table row: same `onProductClick(product)` handler as cards, in-cart highlight from `cartProductIds`, `disabled` + dimmed when `stock <= 0`, truncation for long cells

## 3. Verification

- [x] 3.1 `tsc --noEmit` clean (invoke via `~/.vite-plus/js_runtime/node/24.19.0/bin/node node_modules/.pnpm/typescript@7.0.2/node_modules/typescript/bin/tsc --noEmit`)
- [x] 3.2 Browser check on `/dashboard/transactions`: toggle switches modes, refresh persists table view, row click adds to cart, HABIS row disabled
- [x] 3.3 `php artisan test --compact` still green (assert no regression; no new PHP tests expected — pure frontend change)