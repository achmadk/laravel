## Why

Dashboard pages (Categories, Products, Customers, Suppliers, Transactions, SalesReturns, Receivables, StockOpnames) were ported from the midone reference template and mostly reuse the rtos ui-kit — but ~19 raw `<button>` elements and ~23 hand-rolled `rounded-2xl border border-border bg-bg` panels remain. They visually diverge from the midone-token look (bg-overlay + gradient + shadow) that `adopt-midone-theme` established, so theme-wide changes don't apply consistently across the dashboard.

## What Changes

- **Gap 1 — raw buttons → ui Button** (19 occurrences across 8 files):
  - 12 mechanical swaps: grid-card delete overlays (Categories/Index, Products/Index), form submit (StockOpnames/Create), finalize/add/persist actions (StockOpnames/Show ×3), table row actions (Transactions/History ×2), print-page actions (Transactions/Print ×7, StockOpnames/Show ×2 — same mechanical pattern).
  - 2 payment-method toggles (Receivables/Show): custom border-2 selected-state — NOT a ui Button fit; replaced with a small shared segmented-toggle pattern.
  - No API changes to ui Button; `type="submit"` and `disabled` must keep working (verify ui Button forwards them).
- **Gap 2 — hand-rolled "cards" → ui Card** (~12 conversions, 3 tiers):
  - Tier 1 (grid cards, 3): Categories/Index, Products/Index, Customers/Index — `group overflow-hidden rounded-2xl ... hover:shadow-lg` → `Card>CardContent p-0` with hover state preserved.
  - Tier 2 (stat/filter boxes + detail panels, 9): SalesReturns/Index, Receivables/Index+Show, StockOpnames/Index+Show — non-print boxes become Card; print-adjacent panels keep their print: variants.
  - Tier 3 **excluded**: print artifacts (Transactions/Print A4 sheet, Receivables/Show print-area) and the custom fixed-overlay dialog (StockOpnames/Show:476) — they are not cards and need raw layout control.
- No component API/prop/export changes; no behavior changes (forms, confirm flows, permissions, print output identical); ui-kit files untouched.

## Capabilities

### New Capabilities
- `dashboard-ui-kit-usage`: Dashboard pages render through the rtos ui-kit components (Button, Card, Modal, PageHeader, FilterBar) instead of hand-rolled equivalents, so token-level theme changes apply consistently.

### Modified Capabilities
<!-- None: component behavior is unchanged; this is a consumer-side usage change. -->

## Impact

- **Code**: ~10 page files under `resources/js/pages/Dashboard/` (Categories, Products, Customers, Transactions, Receivables, StockOpnames, SalesReturns). Exact list in design.md.
- **Components**: none modified — consumers only.
- **APIs/dependencies**: none.
- **Backend**: none — TS/TSX only.
- **Regression risk**: low; mechanical swaps, verified by build + typecheck + lint (vp build, `tsc --noEmit`, biome via `~/.vite-plus/bin` node — see design.md).
