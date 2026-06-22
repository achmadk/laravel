## Why

The Dashboard has 29 page groups written across two stylistic generations — neither of which uses the project's existing React Aria component library or CSS design token system. Every listing page independently reimplements search, pagination, empty states, and filter bars, creating ~15+ copies of the same code. This makes maintenance expensive, visual consistency impossible to enforce, and on-boarding new developers slower than it should be.

The design system (react-aria-components in `@/components/ui/` + oklch CSS tokens in `app.css`) was already built for this project but remains unused by Dashboard pages. This change closes the gap: adopt the design system, extract shared patterns, and establish a single visual language across all Dashboard pages.

## What Changes

- **New:** `resources/js/components/dashboard/` — shared components extracted from repeated patterns: `SearchField`, `Pagination`, `EmptyState`, `SummaryCards`, `StatusBadge`, `PageHeader`, `FilterBar`
- **Modified:** All `Dashboard/**/*` TSX pages (~80 files across 29 page groups) — replace hardcoded Tailwind color classes with design system tokens (`text-slate-*` → `text-fg`, `bg-white dark:bg-slate-*` → `bg-bg`, `border-slate-*` → `border-border`)
- **Modified:** All Dashboard pages — adopt React Aria UI components (`Button`, `Card`, `Heading`, `Input`, `Modal`, `TextField`) in place of raw HTML elements
- **Modified:** All listing/pagination pages — use shared `Pagination`, `SearchField`, `EmptyState` components instead of inline implementations
- **No API, backend, or behavior changes** — same routes, same controllers, same data flow

## Capabilities

### New Capabilities

- `shared-dashboard-components`: Reusable UI primitives for Dashboard layout — SearchField (icon + input), Pagination (extracted inline pattern), EmptyState (icon + title + description + CTA), SummaryCards (KPI grid), StatusBadge (colored pill), PageHeader (title + subtitle + actions), FilterBar (search + filter dropdowns)
- `design-token-migration`: Systematic replacement of hardcoded Tailwind color classes with CSS design system tokens across all Dashboard pages
- `ui-component-adoption`: Migration from raw HTML elements to React Aria UI components (Button, Card, Heading, Input, Modal) across Dashboard pages

### Modified Capabilities

_(None — no spec-level behavior changes)_

## Impact

- **Frontend**: ~80 TSX files modified; 7 new shared components created; all Dashboard pages visually updated but functionally identical
- **No backend changes**: controllers, routes, models, services untouched
- **No database changes**
- **No dependency changes** — react-aria-components, @tabler/icons-react, and Tailwind CSS v4 are already present
- **No breaking changes** — all routes, permissions, data shapes, and page behavior remain identical
