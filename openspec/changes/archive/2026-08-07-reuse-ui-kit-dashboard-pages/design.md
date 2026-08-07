# Design: Reuse ui-kit components in dashboard pages

## Context

The archived `adopt-midone-theme` change restyled the rtos ui-kit (button, card, modal, badge, input, etc.) around the midone token system. An audit of the dashboard pages (`Categories`, `Products`, `Customers`, `Suppliers`, `Transactions`, `SalesReturns`, `Receivables`, `StockOpnames`) shows they were ported from the midone reference template and already reuse the ui-kit for the page chrome (PageHeader, FilterBar, SearchField, Pagination, EmptyState, ui Modal). Two reuse gaps remain:

- **Gap 1**: 19 raw `<button>` elements bypass the ui `Button` component (row actions, form submits, print-page actions, a custom payment-method toggle).
- **Gap 2**: ~23 hand-rolled `rounded-2xl border border-border bg-bg` panels duplicate what `Card` already provides (grid cards, stat/filter boxes, detail panels, print artifacts).

The ui `Button` is a react-aria wrapper: `ButtonPrimitive` receives `{...props}` spread, so `type`, `disabled`, `onClick`, and `aria-*` all forward to the native `<button>`. Verified against `resources/js/components/ui/button.tsx` (props spread at line 128-141). Intent/size/isCircle are the only intercepted props.

## Goals / Non-Goals

**Goals:**
- Every interactive element in the named dashboard pages renders through the rtos ui-kit `Button` (or a ui-kit selection control) — zero raw `<button>` elements in the 8 page directories.
- Hand-rolled card surfaces adopt the ui `Card` look (bg-overlay, gradient wash, shadow-md, rounded-xl, border-border) where they represent page content.
- Render output remains visually consistent with the midone token language from `adopt-midone-theme`.
- No behavior change: same handlers, same disabled/loading semantics, same permission gates, same layout.

**Non-Goals:**
- No changes to ui-kit component APIs or styling (button.tsx, card.tsx, toggle-group.tsx are untouched).
- No new ui-kit components (no new Table, no new segmented control — existing `ToggleGroup` covers the payment selector).
- Hand-rolled `<table>` markup stays (no ui Table exists; documented convention).
- Print artifacts are excluded (see Decisions, Tier 3).
- POS layout (`layouts/pos-layout.tsx`, `components/pos/CartPanel.tsx`) is untouched.
- `Suppliers/Index.tsx` has zero raw buttons and zero hand-rolled cards — no change needed.
- Backend, routes, permissions, Wayfinder imports: untouched.

## Decisions

### D1: Map every raw `<button>` to a ui `Button` intent

| Location | Raw style / role | Mapping |
|---|---|---|
| Categories/Index.tsx:96, Products/Index.tsx:130 | grid-card delete overlay (`bg-bg p-2.5 text-danger shadow-lg`) | `intent="danger" size="sq-sm"`, `onPress` |
| StockOpnames/Create.tsx:53 | form submit (`bg-primary px-4 py-2.5 text-white`, `type="submit" disabled={processing}`) | `intent="primary" size="md" type="submit" disabled={processing}` — type/disabled forward via props spread |
| StockOpnames/Show.tsx:285 | finalize (`bg-success ... shadow-lg shadow-success/20`) | `intent="success" disabled={localItems.length === 0 \|\| summary.hasMissingReasons} onPress={finalize}` |
| StockOpnames/Show.tsx:317 | add product (`bg-primary px-4 py-2 IconPlus`) | `intent="primary" onPress={() => setShowProductModal(true)}` |
| StockOpnames/Show.tsx:401 | persist item icon (`rounded-xl border bg-muted p-2 text-muted-fg hover:border-primary hover:text-primary`) | `intent="outline" size="sq-md" disabled={savingItemId === item.id} onPress={() => persistItem(item)}` — outline provides border+border-border; bg/text tweaks via className if `cx` merge confirms |
| Transactions/History.tsx:270, 338 | row action for pending payment (opens confirm modal) | `intent="danger" size="sq-sm"` (or `plain` if the row already carries color — implementation checks sibling row actions) |
| Transactions/Print.tsx:200, 211, 222, 233, 261, 740, 747 + StockOpnames/Show.tsx:445, 504 | print-page/print-adjacent actions | one per function: `primary` for primary CTA, `success` for confirm/finalize, `plain size="sq-sm"` for icon-only — implementation verifies each handler/color |

**Payment-method selector (Receivables/Show.tsx:330, 342)** is NOT a button — it is a 2-option single-selection control (cash/transfer) with an explicit selected state (`border-2 border-primary bg-primary/10 text-primary`). ui `Button` has no selected variant, so this is replaced with the existing ui `ToggleGroup` (`selectionMode="single"`, `selectedKeys={new Set([data.method])}`, `onSelectionChange` writing back via `setData`), the same component the header `ThemeSwitcher` uses. Zero new components.

**Alternatives considered:** a bespoke `SegmentedControl` component — rejected (YAGNI; `ToggleGroup` already exists and is token-styled). Keeping the hand-rolled toggle — rejected (leaves a raw-button + hand-rolled styled surface in the change's scope).

### D2: Card adoption tiers

- **Tier 1 — grid cards** (Categories/Index.tsx:70, Products/Index.tsx:88, Customers/Index.tsx:76): replace the wrapper `div.group.overflow-hidden.rounded-2xl.border.border-border.bg-bg...` with `<Card className="group overflow-hidden hover:border-muted-fg/30 hover:shadow-lg">`, nulling the Card gutter so the image stays flush: `[--gutter:0]` + `p-0` on CardContent as needed. Inner image + body structure unchanged. `hover:shadow-lg` overrides the Card's `shadow-md` via className merge; the midone gradient/overlay surface comes free.
- **Tier 2 — stat/filter boxes and detail panels** (SalesReturns/Index.tsx:98, Receivables/Index.tsx:321 + Show.tsx:189/253, StockOpnames/Index.tsx:100 + Show.tsx:313/433/456): swap the wrapper `rounded-2xl border border-border bg-bg` div for `<Card className="p-4|p-5 ...">` keeping the existing padding, grid classes, and any `print:` variants on the className. Children move inside unchanged.
- **Tier 3 — excluded**: Transactions/Print.tsx A4 sheets (310, 524, 578, 634), Receivables/Show.tsx:425 print-area, StockOpnames/Show.tsx:476 custom fixed-overlay dialog. These are print artifacts or an intentionally custom overlay; converting them risks breaking print layout (shadow/radius/border stripping) for zero on-screen benefit.

### D3: className merge is load-bearing

`cx` (from `@/lib/primitive`) merges tv base + caller className for `Button` and `Card`. The design assumes tailwind-merge semantics (later className wins over base). This is already exercised by the dashboard shell (custom classNames on ui Buttons). Implementation task 0 verifies `cx` behavior on one override (`bg-bg` over a plain Button) before mass conversion; if `cx` is a plain join, overrides that conflict with base classes move into `className` only where the base does not set the conflicting property.

### D4: Verification toolchain

Shell `node` is v12 (broken for biome). Use the bundled node:
- Build: `vp build`
- Typecheck: `PATH=/Users/achmadk/.vite-plus/bin:$PATH ./node_modules/.bin/tsc --noEmit`
- Lint changed files: `PATH=/Users/achmadk/.vite-plus/bin:$PATH ./node_modules/.bin/biome lint <changed files>`
- Grep gates: `<button[ >]` returns 0 in the 8 dirs (multiline-safe pattern `rg "<button\\n"`), `rounded-2xl border border-border bg-bg` returns 0 outside print artifacts.

## Risks / Trade-offs

- **Form submit regression (StockOpnames/Create)** → `type="submit"` forwards through the props spread (verified in button.tsx); task pins an explicit assertion that the submit still fires and `processing` still disables.
- **Visual drift on grid cards (Tier 1)** → Card's rounded-xl vs the old rounded-2xl is an accepted, deliberate midone-alignment change (Card is the source of truth post-adopt-midone-theme). Hover border/shadow preserved via className.
- **Print regression** → mitigated by excluding print surfaces (Tier 3) entirely.
- **`cx` non-merge behavior** → D3 task-0 verification gates the conversion; fallback is explicit classNames that don't conflict with base classes.
- **Icon size/alignment shift** → ui Button auto-sizes child svgs (`*:[svg]:size-*`); explicit `size={18}` props on icons may be dropped; visual check per page in the same task.

## Migration Plan

1. Task 0: verify `cx` merge + confirm `type="submit"` forward on a scratch page (revert after).
2. Convert per-page in dependency-free parallel batches (one task per file), each closing with `vp build` + targeted lint.
3. Final gates: full `vp build`, `tsc --noEmit`, biome on all changed files, grep gates, `git diff` review per page.
4. Rollback: per-file revert (`git checkout -- <file>`); change touches only ~10 page files, no shared modules.
