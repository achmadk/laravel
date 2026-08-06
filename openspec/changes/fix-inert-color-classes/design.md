# Design: fix-inert-color-classes

## Context

The app's design system (`resources/css/app.css`) is **single-value token based** (Tailwind v4 CSS-first, no `tailwind.config`): `--color-primary`, `--color-primary-fg`, `--color-primary-subtle`, `--color-danger` (+`-fg`/`-subtle`), `--color-success` (+`-fg`/`-subtle`), `--color-warning` (+`-fg`/`-subtle`), `--color-secondary` (+`-fg`). There is **no numeric scale** (`--color-primary-500`, `--color-danger-500`, ...).

The POS pages were ported from a reference codebase that used Tailwind's default palette (`primary-500/600`, `danger-500`, `slate-*`). The port kept the numeric-scale classes, which **compile to nothing** in Tailwind v4 — proven: the built bundle contains 0 occurrences of `.from-primary-500`, `.bg-primary-500`, `.text-primary-600`, `.border-primary-500`. Any state relying on them renders transparent/white (e.g. the active category chips on `/dashboard/transactions`).

Enumerated: **357 instances across 35 `.tsx` files** (primary/danger/success/warning scales; `secondary-NNN`/`info-NNN` not present). Slate classes (`bg-slate-100`, ...) are core Tailwind palette and resolve — they are NOT broken and out of scope.

## Goals / Non-Goals

**Goals:**

- Every interactive/highlighted state in the POS UI renders visibly: active filters, selected rows, in-cart borders, checkmark badges, danger badges, success/warning status colors.
- All colors resolve through the existing design-system tokens, with correct light and dark mode behavior (inherited from `.dark` CSS variables).
- One mapping table as the single source of truth; mechanical, low-risk edits; a grep guard that fails if any numeric-scale class returns.

**Non-Goals:**

- No new theme tokens, no `tailwind.config` reintroduction.
- Slate classes are left untouched (they resolve; tokenizing them is a separate cleanup).
- No behavior/logic changes, no markup restructuring beyond removing inert classes.
- No changes to `resources/css/app.css`, backend, routes, or config.

## Decisions

### D1 — The mapping table (single source of truth)

Apply per usage role (background / text / border / ring / shadow). "Broken" = numeric-scale class; "Replacement" = token class.

| Usage                       | Broken (inert)                                                                                                         | Replacement                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Solid background            | `bg-primary-500`, `bg-primary-600`, `bg-primary-700`                                                                   | `bg-primary`                                                                                     |
| Solid background (gradient) | `bg-gradient-to-r from-primary-500 to-primary-600`                                                                     | `bg-primary` (drop the gradient wrapper)                                                         |
| Text on solid primary       | `text-white` paired with the above                                                                                     | `text-primary-fg`                                                                                |
| Text accent                 | `text-primary-500`, `text-primary-600`, `text-primary-700`, `text-primary-800`, `text-primary-900`, `text-primary-950` | `text-primary`                                                                                   |
| Text accent (light)         | `text-primary-300`, `text-primary-400`                                                                                 | `text-primary/70`                                                                                |
| Border                      | `border-primary-500`, `border-primary-600`                                                                             | `border-primary`                                                                                 |
| Border (light)              | `border-primary-300`                                                                                                   | `border-primary/40`                                                                              |
| Ring                        | `ring-primary-500`                                                                                                     | `ring-primary`                                                                                   |
| Tinted background           | `bg-primary-50`, `bg-primary-100`, `bg-primary-200`, `bg-primary-500/10`, `bg-primary-600/10`                          | `bg-primary-subtle` (or `bg-primary/10` when the intent is a _strong_ tint on a colored surface) |
| Colored shadow              | `shadow-primary-500/30`, `shadow-primary-500/20`                                                                       | `shadow-primary/30`, `shadow-primary/20`                                                         |
| Danger solid bg             | `bg-danger-500`, `bg-danger-600`, `bg-danger-700`                                                                      | `bg-danger` (+ `text-danger-fg` for paired text)                                                 |
| Danger text                 | `text-danger-500`, `text-danger-600`, `text-danger-700`, `text-danger-900`, `text-danger-950`                          | `text-danger`                                                                                    |
| Danger tinted bg            | `bg-danger-50`, `bg-danger-100`, `bg-danger-500/10`                                                                    | `bg-danger-subtle`                                                                               |
| Danger border               | `border-danger-500`, `border-danger-600`                                                                               | `border-danger`                                                                                  |
| Success solid bg            | `bg-success-500`, `bg-success-600`                                                                                     | `bg-success` (+ `text-success-fg`)                                                               |
| Success text                | `text-success-500`, `text-success-600`, `text-success-700`, `text-success-800`, `text-success-900`                     | `text-success`                                                                                   |
| Success tinted bg           | `bg-success-50`, `bg-success-100`, `bg-success-200`                                                                    | `bg-success-subtle`                                                                              |
| Warning solid bg            | `bg-warning-500`, `bg-warning-600`                                                                                     | `bg-warning` (+ `text-warning-fg`)                                                               |
| Warning text                | `text-warning-400`, `text-warning-500`, `text-warning-600`, `text-warning-700`                                         | `text-warning`                                                                                   |
| Warning tinted bg           | `bg-warning-100`, `bg-warning-200`                                                                                     | `bg-warning-subtle`                                                                              |

**Class-independent rule:** `text-white`/`text-black` appearing on a token-colored background MUST become the matching `-fg` token (`text-primary-fg`, `text-danger-fg`, ...) so contrast survives dark mode.

### D2 — Flatten gradients instead of approximating a scale

The broken gradients (`from-primary-500 to-primary-600`) exist because the reference theme had two shades. The token system has one. A `from-primary to-primary-subtle` gradient would read washed-out (subtle is 15% alpha), so **flat `bg-primary` is the token-correct replacement**. Buttons keep their full-size hit area; only the background fill changes.

### D3 — Auth pages stay in scope

`pages/auth/*` account for ~50 instances. They are included for a uniform, complete fix (same root cause, same table); if a smaller diff is ever preferred they can be split into a follow-up without affecting POS behavior.

### D4 — Verification is grep-enforceable

The acceptance check for the whole change is mechanical:

```bash
grep -rE "(primary|danger|success|warning|secondary|info)-[0-9]+" resources/js --include="*.tsx"
# must return 0 matches
```

Plus `vp check` (tsc + biome) and a manual visual pass (light + dark) on `/dashboard/transactions` and one member/CRM page.

## Risks / Trade-offs

- **`primary-subtle` has no `.dark` override** — it keeps its 15%-alpha indigo in dark mode. That still renders visibly on dark surfaces (acceptable; a dedicated dark `--primary-subtle` token is a possible follow-up, out of scope here).
- **Flat fills lose gradient polish** — visually negligible at 8px chip scale; acceptable per D2.
- **Context-dependent mapping** (`bg-primary-500` as tint vs solid) requires the editor to look at the surrounding classes — mitigated by the role-based table and the manual visual pass.
- **Dark-mode contrast for text-on-token** depends on pairing with `-fg` tokens (D1 rule); the grep guard cannot catch missing `-fg` — the visual pass covers it.
- **Overlap with in-flight ports** (`port-pos-reference-backend`, `port-frontend-remaining-pages`): files touched here are already committed, so no working-tree conflicts; remaining ported pages must use tokens from the start (covered by the same grep guard if run in CI later).
