## Why

The rtos app (Laravel + Inertia + React 19) uses a hand-rolled zinc/OKLCH design language, while the `midone-dashboard-theme` project in this workspace contains a polished, production-grade Tailwind v4 styling system (slate palette, semantic colors, layered-gradient component styles, and a Rubick dashboard shell). Adopting midone's styling gives rtos a cohesive, more refined visual identity without inventing new design work.

## What Changes

- **Design tokens** (`resources/css/app.css`): swap the zinc/OKLCH semantic variables for midone's slate-based palette with `blue-900` primary; add `pending` (orange) semantic color while **keeping** `info`; adopt midone radius (`0.625rem`) and dark-mode primary (`#4874f6`). Typography stays on Plus Jakarta Sans / JetBrains Mono.
- **Component styles** (ui kit, ~30 files): re-skin Button, Input/Field, Card, Dialog, Table, Toast, Checkbox, StatusBadge, etc. to midone's visual language — layered-gradient filled look, outline/flat/text variants, bold filled badges — transcribed from midone's CVA + @zag-js styles into rtos's `tailwind-variants` + react-aria-components equivalents. Component APIs and page code stay unchanged.
- **Dashboard shell**: rebuild the dashboard layout's sidebar/header to match the **Rubick side-menu** theme — collapsed-sidebar animations, group labels, scroll-area navigation. The POS layout is **not** changed.
- **Color scheme theming**: port midone's `[data-theme='default'|1|2|3|4|5']` primary-color switcher (blue-900, blue-950, sky-800, cyan-800, indigo-900, gray-900) with localStorage persistence and settings UI, alongside the existing light/dark/system toggle.

## Capabilities

### New Capabilities

- `theme-tokens`: Design token layer — slate palette, semantic colors (incl. pending), radius, dark-mode overrides
- `theme-components`: Component visual layer — button/badge/input/etc. styling variants in midone's language
- `dashboard-shell`: Rubick side-menu dashboard shell (sidebar, header, collapsed states)
- `color-scheme`: Five-primary-color theming with localStorage persistence and settings UI

### Modified Capabilities

<!-- None: existing specs (pos-ui, user-auth, pos-transactions) keep their requirement contracts; this change is visual-only and token-driven, reinforcing pos-ui's "design-system tokens only" rule. -->

## Impact

- `resources/css/app.css`, `resources/css/toast.css` — token replacement
- `resources/js/components/ui/*` (~30 files) — style variant re-skin, no API changes
- `resources/js/layouts/dashboard-layout.tsx`, `resources/js/layouts/dashboard/sidebar.tsx` — shell rebuild
- `resources/js/hooks/use-theme.ts`, `resources/js/components/theme-switcher.tsx`, `resources/js/pages/settings/appearance.tsx` — color-scheme support
- Source of truth: `midone-dashboard-theme/src/` (NOT the `midone-dashboard/` scaffold subfolder)
- No new npm dependencies; no backend/API changes
