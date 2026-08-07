# Proposal: fix-inert-color-classes

## Why

On `/dashboard/transactions`, active category filter buttons render with a white background instead of the primary color. The root cause is systemic:

- The POS components were ported from a reference codebase that used Tailwind's numeric color scale (`primary-500/600`, `danger-500`, `success-600`, ...).
- This app's design system (`resources/css/app.css`, Tailwind v4 CSS-first) defines **single-value tokens only**: `--color-primary`, `--color-primary-fg`, `--color-primary-subtle`, `--color-danger`, etc. — there is **no numeric scale** (`--color-primary-500`, `--color-danger-500`, ...).
- Tailwind v4 emits **no CSS** for unknown utility classes. Verified against the built bundle: `.from-primary-500`, `.to-primary-600`, `.bg-primary-500`, `.text-primary-600`, `.border-primary-500` appear **0 times** in `public/build/assets/app-*.css`.

Consequence: any state styled with a numeric-scale class is inert — the active chip's `bg-gradient-to-r from-primary-500 to-primary-600` has no color stops, so the background falls through to the white page and the `text-white` label is invisible. Inactive states use `bg-slate-100` (core Tailwind palette, resolves fine), which is why only _active_ buttons look broken.

**357 instances across 35 files** use these inert classes (full scales of primary/danger/success/warning). All are committed; the ported POS components are the densest offenders (`PaymentPanel` 40, `AddCustomerModal` 31, `Members/Show` 24, `CustomerHistoryPanel` 19, `pos-layout` 17, `ProductGrid` 16, ...).

## What Changes

Replace every numeric-scale color class in `resources/js` with the equivalent design-system token, using a single mapping table defined in `design.md`:

| Broken (inert)                                                                                              | Replacement                                                                      |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `bg-primary-500/600`, `from-primary-500 to-primary-600`, `bg-gradient-to-r from-primary-500 to-primary-600` | `bg-primary` (flat; `text-primary-fg` where text sits on it)                     |
| `border-primary-500`, `ring-primary-500`                                                                    | `border-primary`, `ring-primary`                                                 |
| `text-primary-600/700/800/900` (on light bg)                                                                | `text-primary`                                                                   |
| `bg-primary-50/100`, `bg-primary-500/10`                                                                    | `bg-primary-subtle`, `bg-primary/10`                                             |
| `bg-danger-500/600`, `text-danger-500/600`                                                                  | `bg-danger` + `text-danger-fg`, `text-danger`                                    |
| `bg-danger-50/100`                                                                                          | `bg-danger-subtle`                                                               |
| `success-*`, `warning-*`                                                                                    | `success`/`success-fg`/`success-subtle`, `warning`/`warning-fg`/`warning-subtle` |

The exact class-to-token mapping (including opacity modifiers and colored shadows) lives in `design.md` and is the single source of truth for every file edit.

- **Files**: the 35 `.tsx` files under `resources/js` with numeric-scale classes — `components/pos/*`, `layouts/pos-layout.tsx`, `pages/dashboard.tsx`, `pages/auth/*`, `pages/Dashboard/{Settings,CustomerVouchers,Members,CrmCampaigns,CustomerSegments,PricingRules,CrmReminders,Reports}/*`.
- **No backend, schema, route, or config changes.**
- **No new theme tokens** — the mapping only uses tokens that already exist.

## Capabilities

### New Capabilities

- `pos-ui`: The POS-facing interface (transaction screen, product grid, cart, payment, customer management, settings) renders interactive states — active filters, selected rows, badges, alerts — using the design-system tokens, so every state is visible in both light and dark mode.

### Modified Capabilities

<!-- None — no existing capability spec changes behaviorally. -->

## Impact

- **Code**: 35 `resources/js/**/*.tsx` files, mechanical class swaps guided by the mapping table in `design.md`.
- **Behavioral effect**: previously-invisible active/highlighted states (white-on-white chips, invisible checkmarks, transparent badges, default-colored prices) become visible in the primary/danger/success/warning colors. Dark mode correctness is inherited automatically (tokens flip via `.dark` CSS variables).
- **No changes** to `resources/css/app.css`, routes, controllers, models, migrations, or dependencies.
- **Risk**: low — class-only edits; verified by a grep guard (0 numeric-scale classes remaining), `vp check` (tsc + biome), and a manual visual pass on `/dashboard/transactions`.
- **Related work**: overlaps the in-flight ports (`port-pos-reference-backend`, `port-frontend-remaining-pages`) — remaining ported pages must use tokens from the start.
