# Tasks

## 1. Prerequisites (verify before converting)

- [x] 1.1 Verify ui Button forwards `type`/`disabled`/`onClick` — confirm StockOpnames/Create submit keeps `type="submit"` + `disabled={processing}` via props spread
- [x] 1.2 Verify `cx` (from @/lib/primitive) merges className overrides with tailwind-merge semantics on a scratch Card (`p-0` overriding `py-(--gutter)`) — record fallback if it does not merge

## 2. Gap 1 — Buttons to ui Button

- [x] 2.1 Categories/Index.tsx:96 — delete overlay → `Button intent="danger" size="sq-sm"` with onPress, then vp build + biome lint on file
- [x] 2.2 Products/Index.tsx:130 — delete overlay → `Button intent="danger" size="sq-sm"` with onPress, then vp build + biome lint on file
- [x] 2.3 StockOpnames/Create.tsx:53 — submit → `Button intent="primary" type="submit" disabled={processing}`, then vp build + biome lint on file
- [x] 2.4 StockOpnames/Show.tsx:285 — finalize → `Button intent="success" disabled={localItems.length === 0 || summary.hasMissingReasons}` onPress, then vp build + biome lint on file
- [x] 2.5 StockOpnames/Show.tsx:317 — add product → `Button intent="primary"` onPress, then vp build + biome lint on file
- [x] 2.6 StockOpnames/Show.tsx:401 — persist icon → `Button intent="outline" size="sq-md"` disabled={savingItemId === item.id} onPress, then vp build + biome lint on file
- [x] 2.7 StockOpnames/Show.tsx:445+504 — remaining raw buttons → ui Button per function (verify each context first), then vp build + biome lint on file
- [x] 2.8 Transactions/History.tsx:270+338 — row action (pending + canConfirmPayment) → `Button intent="danger" size="sq-sm"` (check sibling styling first), then vp build + biome lint on file
- [x] 2.9 Transactions/Print.tsx:200,211,222,233,261,740,747 — print actions → ui Button per function (verify each context first), then vp build + biome lint on file
- [x] 2.10 Receivables/Show.tsx:330+342 — payment method selector → ui ToggleGroup selectionMode="single" selectedKeys={new Set([data.method])} onSelectionChange writing setData, then vp build + biome lint on file

## 3. Gap 2 — Hand-rolled cards to ui Card

- [x] 3.1 Categories/Index.tsx:70 — grid card → `<Card className="group overflow-hidden hover:border-muted-fg/30 hover:shadow-lg">` with flush image ([--gutter:0] or p-0), then vp build + biome lint on file
- [x] 3.2 Products/Index.tsx:88 — grid card → Card (same pattern as 3.1), then vp build + biome lint on file
- [x] 3.3 Customers/Index.tsx:76 — grid card → Card (same pattern as 3.1), then vp build + biome lint on file
- [x] 3.4 SalesReturns/Index.tsx:98 — stat cards → `<Card className="p-5">` keeping grid, then vp build + biome lint on file
- [x] 3.5 Receivables/Index.tsx:321 — filter box → `<Card className="p-4">` keeping grid + items-end, then vp build + biome lint on file
- [x] 3.6 Receivables/Show.tsx:189+253 — detail panels → Card keeping p-4 + print: variants, then vp build + biome lint on file
- [x] 3.7 StockOpnames/Index.tsx:100 — filter/stats box → `<Card className="p-4">` keeping grid, then vp build + biome lint on file
- [x] 3.8 StockOpnames/Show.tsx:313+433+456 — detail/form panels → Card keeping p-5 + form semantics, then vp build + biome lint on file

## 4. Final verification

- [x] 4.1 Grep gates: no raw `<button` (incl. multiline `<button$`) in the 8 page dirs; `rounded-2xl border border-border bg-bg` only in excluded print artifacts
- [x] 4.2 Full `vp build` passes
- [x] 4.3 `tsc --noEmit` (vite-plus node) reports 0 errors
- [x] 4.4 biome lint on all changed files reports 0 errors / 0 warnings
- [x] 4.5 Diff review: only ~10 page files under pages/Dashboard/ changed; resources/js/components/ui/ and POS layout untouched
