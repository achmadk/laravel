## Context

`ProductGrid.tsx` (172 lines) renders a category chip bar + `grid grid-cols-2/3/4` of product buttons. It already receives everything the table needs: `products`, `categories`, `selectedCategory`, `onProductClick`, `isLoading`, `cartProductIds`, `searchQuery`. `POSProduct` includes `barcode`, `sell_price`, `stock` — no new data fetch required. The component is used by the `/dashboard/transactions` page (and is a shared POS component, so the toggle is reusable wherever `ProductGrid` is mounted).

## Goals / Non-Goals

**Goals:**
- Card-grid stays the default; table is opt-in via a visible toggle in the grid header row.
- Preference persisted in `localStorage` so a refresh (common during shift work) keeps the chosen view.
- Identical semantics across modes: same `onProductClick`, same disabled/HABIS state, same in-cart highlight.
- Column set per user decision: name + barcode + price + stock.

**Non-Goals:**
- No column sorting, resizing, or multi-select.
- No backend/pagination changes for the table (grid data is already loaded in full).
- No change to search/category filtering behavior.
- No mobile-responsive redesign of the card grid.

## Decisions

**1. Toggle lives inside `ProductGrid`'s header row (per user decision).**
The chip bar row gains a right-aligned icon button (`IconLayoutGrid` / `IconTable` or equivalent tabler icons — already used across the app) that flips `viewMode`. Why not the POS page header? The grid is a self-contained component; the toggle belongs with the grid so it works for any future `ProductGrid` mount.

**2. Persistence via `localStorage` key `pos:product-view`.**
Simple, synchronous, per-device — right fit for a cashier preference. Values: `"grid" | "table"`. Read once in a lazy `useState` initializer (`() => localStorage.getItem("pos:product-view") === "table"`), write on toggle. No `useEffect` needed for the write; no SSR concern because access happens client-side in state init (component mounts client-only in this SPA). `pos:product-view` prefix namespaces it like the app's existing keys.

**3. Table rendered as a token-styled `<table>` (per `pos-ui` spec).**
Rows use the design tokens already mandated by `openspec/specs/pos-ui/spec.md`: `border-border`, `bg-bg`, hover `bg-muted`, text `text-foreground`/`text-muted-fg`; in-cart row gets `border-primary`-style accent; stock `<= 0` row is `opacity-50` + disabled. HABIS label reuse the existing overlay styling. Columns: Nama / Barcode / Harga (via `formatPrice`) / Stok.

**4. No duplicated click logic.**
Table row `<tr>` wraps a button (or the row uses `onClick` + keyboard-accessible button) calling the exact same `onProductClick(product)` handler the cards use; `disabled` from the same `stock <= 0` rule; in-cart detection from the same `cartProductIds` membership.

**5. Cards stay untouched when table mode is off.**
The existing grid JSX is only conditionally rendered (`viewMode === "grid"`); when table mode is active the grid block is replaced by the table block, chips/search/empty states stay shared.

## Risks / Trade-offs

- **Row click target sizing** → Use a full-width button inside the `<tr>` (or make the row clickable with proper `role`) so touch targets match the card buttons; a11y basics kept.
- **Long barcodes/titles overflow** → `truncate`/`max-w` + `title` attribute on cells; sticky first column not needed at this column count.
- **localStorage disabled/private mode** → Guard `localStorage` access in try/catch so the feature degrades to grid default without throwing.
- **SSR/hydration mismatch** → View is read in state initializer; both server and client render run the same code path since the value only affects client-side rendering after mount — verify no hydration warning in the browser.