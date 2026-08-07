## Context

rtos is a Laravel + Inertia + React 19 app using Tailwind CSS v4 with a CSS-first token system: `resources/css/app.css` defines OKLCH zinc-based semantic variables (`--bg`, `--fg`, `--primary`, `--sidebar`, `--chart-1..5`, etc.) surfaced as Tailwind theme colors via `@theme inline`. UI components are built on react-aria-components with `tailwind-variants` (`tv()`), and dark mode is class-based (`.dark`).

The styling source of truth is `midone-dashboard-theme/src/` (a Vue 3 + Tailwind v4 + @zag-js + CVA project). Its design language differs structurally from rtos's:

| Aspect | rtos (current) | midone (target) |
|---|---|---|
| Palette | zinc, OKLCH | slate, hex/oklch |
| Primary | indigo hue `oklch(0.44 0.18 265.67)` | `blue-900` (light), `#4874f6` (dark) |
| Semantic colors | primary/secondary/success/danger/warning/info | primary/secondary/success/danger/pending/warning |
| Badges | subtle pills (`bg-success-subtle`) | bold filled (`bg-success text-success-foreground`) |
| Buttons | flat, border-based | layered-gradient `before/after` sheen, outline/flat/text looks |
| Radius | `0.5rem` base | `0.625rem` |
| Font | Plus Jakarta Sans + JetBrains Mono | system-ui (NOT adopted) |

The `midone-dashboard/` subfolder inside `midone-dashboard-theme/` is a stock Vite Vue scaffold and is NOT a styling source.

## Goals / Non-Goals

**Goals:**
- Adopt midone's slate palette, semantic color set (adding `pending`, keeping `info`), radius, and dark-mode tokens in rtos.
- Re-skin rtos's ui kit to midone's component visual language without changing component APIs or page-level code.
- Restyle the dashboard shell to the Rubick side-menu theme (collapsed animations, group labels, scroll-area nav).
- Add a 5-primary-color scheme switcher persisted in localStorage, complementing light/dark/system.
- Keep every existing capability spec contract intact (token-driven styling, readable states in both color modes).

**Non-Goals:**
- Porting Vue components or @zag-js code to React (visual language only, transcribed into react-aria + tv()).
- Changing the POS layout shell (stays compact; inherits tokens and component styles automatically).
- Adopting midone's system-ui font stack.
- Introducing new npm dependencies.
- Restyling the landing/app (non-dashboard) pages beyond token inheritance.

## Decisions

### D1: Migrate the token layer wholesale, then re-skin components

Replace rtos's OKLCH zinc variables with midone's slate values in `app.css`, keeping rtos's variable *names* (`--bg`, `--fg`, `--sidebar`, `--chart-*`) so all existing `tv()` components and page classes keep working. Rationale: token-first migration means the whole app re-colors from one file; component re-skins then only refine shape/depth, not color plumbing.
- Alternative considered: full file copy of midone's `index.css` — rejected, it would break rtos's variable naming contract and drag in Vue-specific utilities.

### D2: Semantic color mapping

- Add `pending` (midone `orange-900` / `orange-400` dark) as a new token set (`--pending`, `--pending-fg`, `--pending-subtle`, `--pending-subtle-fg`).
- Keep `info` and map it to a blue token (midone has no `info`; `blue-900` primary is too strong, so `info` uses a distinct blue such as `blue-600`/`sky` range) so existing `info` usages (StatusBadge, alerts) remain valid.
- StatusBadge variants change from subtle pills to midone's bold filled style (`bg-<color> text-<color>-foreground`), which also aligns with the existing `pos-ui` spec scenario ("filled token background").

### D3: Component styles transcribed, not ported

Midone's `*.styles.ts` (CVA + @zag-js CSS selectors) cannot be imported into React. For each rtos ui component, transcribe the midone *visual recipe* (e.g., button filled look: `before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-white/[.05]` + `after:inset-[2px] after:to-white/[.08]`) into the existing `tv()` variants, mapping @zag data-attributes to react-aria equivalents (`data-selected` → `data-selected`, `data-[state=open]` → react-aria `data-open`, etc.).
- Alternative considered: rewriting the ui kit on CVA + zag — rejected, react-aria + tv() is the established, working foundation.

### D4: Rubick side-menu shell, rebuilt in React

Port the structure and behaviors of `midone-dashboard-theme/src/themes/Rubick/SideMenu/SideMenu.vue` + `src/assets/css/themes/rubick/side-menu.css` into rtos's `dashboard-layout.tsx` / `sidebar.tsx`: sticky header, collapsed sidebar (110px) with hover-expand, group labels collapsing to `...`, scroll-area nav, logo/brand area. Keep rtos's menu data model (`lib/menu.ts`, `menuNavigation`) and permission checks — only presentation changes.
- Alternative considered: top-menu layout — rejected by user decision; side-menu matches current rtos shell.

### D5: Color-scheme theming via `data-theme` attribute

Port midone's mechanism exactly: `[data-theme='default'|'1'..'5']` attribute on `<html>` overriding `--color-primary` (and dark variants), backed by a localStorage-persisted store. Extend rtos's existing `use-theme` hook (currently light/dark/system) with a color-scheme dimension; extend `ThemeSwitcher`/Appearance settings UI with a scheme picker. The 6 schemes: default (blue-900), 1 (blue-950), 2 (sky-800), 3 (cyan-800), 4 (indigo-900), 5 (gray-900 / gray-300 dark).

### D6: Keep fonts and POS layout

Typography and POS shell are unchanged by user decision; they inherit tokens/component styles automatically.

## Risks / Trade-offs

- [Full re-skin churns ~30 ui-kit files and every page's appearance] → Migrate in phases (tokens → components → shell → theming); each phase is independently reviewable; visual QA after each phase.
- [Semantic color mismatch: `info` has no midone equivalent] → Assign a deliberate blue token and document the mapping; keep `info` usages compiling.
- [Dark-mode contrast regressions from slate/blue swap] → Rely on the existing `pos-ui` spec scenarios ("readable in light and dark mode") as acceptance checks; review every state token in both modes.
- [CVA→tv() transcription drift (gradients, pseudo-elements)] → Compare rendered output against midone's built `dist/assets/*.css` as reference; keep `before/after` overlay technique identical.
- [Shell rebuild risks breaking navigation/permissions] → Reuse `menuNavigation` + `checkPermission` unchanged; behavior specs stay green.
- [`data-theme` attribute conflicts with existing dark-mode class logic] → Keep `.dark` and `data-theme` orthogonal (theme = hue, dark = luminance); test all 6 schemes × light/dark.

## Migration Plan

Phased, each independently shippable:
1. **Tokens** — rewrite `app.css` variables (slate palette, pending/info mapping, radius, dark `#4874f6`). Verify all pages in light+dark.
2. **Components** — re-skin ui kit files to midone looks (button, badge/StatusBadge, input/field, card, dialog, table, toast, checkbox, menu, etc.). Verify component docs pages and POS/dashboard.
3. **Shell** — rebuild dashboard layout + sidebar as Rubick side-menu. Verify collapse/hover/nav behaviors.
4. **Theming** — add color-scheme store + `data-theme` CSS + settings UI. Verify 6 schemes × 2 modes.

Rollback: each phase is a self-contained diff; revert per-phase via git.

## Open Questions

- Exact slate token values to adopt for `--chart-1..5` (midone has no chart tokens) — propose a slate/blue ramp mapping.
- Whether `info` maps to `sky` or `blue-600` — visual QA call.
- Which midone component styles apply to rtos components midone doesn't have (e.g., react-aria `Menu`, `Sheet`) — derive from the closest midone analog (menu → menu.styles.ts, sheet → dialog.styles.ts).
