## Context

The Dashboard has 29 page groups (~80 TSX files) spanning two stylistic generations. The project already has a full React Aria Components UI library (`@/components/ui/`) and a CSS design token system defined via `@theme inline` in `app.css` (`--color-bg`, `--color-fg`, `--color-primary`, `--color-muted`, `--color-border`, etc.) — but Dashboard pages use neither. Instead they use hardcoded Tailwind color classes (`text-slate-*`, `bg-white`, `dark:bg-slate-*`, `border-slate-*`) and raw HTML elements.

The UI library was intentionally kept out of the initial page porting to avoid scope creep during the backend migration. Now that all backend and frontend pages exist, this change closes the gap systematically.

## Goals / Non-Goals

**Goals:**

- Extract 7 shared components from repeated inline patterns (SearchField, Pagination, EmptyState, SummaryCards, StatusBadge, PageHeader, FilterBar)
- Adopt CSS design tokens across all Dashboard pages (~15 token-to-class mappings)
- Adopt React Aria UI components (Button, Card, Heading, Input, Modal) across all Dashboard pages
- Pilot on Categories (3 files), then expand to all 29 page groups
- 100% visual fidelity in light and dark modes — no regressions

**Non-Goals:**

- No backend PHP changes — controllers, routes, models, services untouched
- No database schema changes
- No new npm/composer dependencies
- No feature additions — same CRUD, same data shapes, same routes
- No behavior changes — delete confirmations, form submissions, pagination all work identically
- No restructuring of page navigation, sidebar, or dashboard layout
- No changes to auth/guest pages outside Dashboard

## Decisions

### Decision 1: Shared components live in `@/components/dashboard/` not `@/components/ui/`

| Decision         | Create a new `components/dashboard/` directory for shared page-level patterns                                                                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rationale**    | `@/components/ui/` hosts generic UI primitives (Button, Card, Input) usable across the entire app. The new components (SearchField, Pagination, EmptyState) are page-assembly patterns specific to Dashboard index pages. Co-locating them prevents `@/components/ui/` from accumulating layout-specific code. |
| **Alternatives** | Putting them in `@/components/ui/` (pollutes UI kit with page-specific patterns), or keeping them inline (defeats the purpose)                                                                                                                                                                                 |

### Decision 2: Incremental token replacement via eslint rule + manual review

| Decision         | Replace tokens file-by-file using a search-and-edit approach with a mapping table as reference                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rationale**    | A blanket `sed` regex replacement across 80 files would miss context-dependent mappings (e.g., `text-slate-700` → `text-fg` for headings but → `text-muted-fg` for secondary text). File-by-file replacement with manual review ensures correctness. |
| **Alternatives** | Global regex (too error-prone — `text-slate-500` in different contexts needs different tokens), AST-based codemod (over-engineered for one-time migration)                                                                                           |

### Decision 3: UI component adoption is additive — existing code removed after verification

| Decision         | Adopt UI components during page rewrite, keeping existing code path as fallback until verified                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Rationale**    | Each page is a standalone TSX file. When migrating a page, the entire file is rewritten with components + tokens simultaneously. If the page works correctly, the old code is simply replaced — no parallel code paths needed. |
| **Alternatives** | Wrap old code in conditionals (creates dead code), or do tokens-only then components in a second pass (two full passes per page)                                                                                               |

### Decision 4: Pagination component signature matches existing backend `links` shape

| Decision         | `Pagination` accepts `PaginationLink[]` — identical to the `links` property already returned by every paginated Inertia response                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rationale**    | Every backend controller already returns `->paginate()` which includes the `links` array with `{ url, label, active }`. No backend changes needed — the component maps directly to the existing data shape. |
| **Alternatives** | Custom pagination prop shape (would require adapters for each page)                                                                                                                                         |

### Decision 5: Categories as pilot, then concentric expansion by page complexity

| Decision         | Categories → Customers/Suppliers/Products → remaining pages                                                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rationale**    | Categories are the simplest CRUD (3 pages, minimal fields, standard patterns). Validating the approach on Categories catches edge cases before touching complex pages like StockOpnames Create (multi-step form) or Reports (chart.js integration). |
| **Alternatives** | Alphabetical order (StockOpnames first — would hit complexity before validation), or all pages at once (too risky — 80 files simultaneously)                                                                                                        |

## Risks / Trade-offs

| Risk                                                                                                                                       | Mitigation                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Token replacement changes visible appearance** in subtle ways (e.g., `--color-muted` may be slightly lighter/darker than `bg-slate-100`) | Compare every migrated page against the original in both light and dark modes during review. Adjust CSS variable values if needed — the variables are designed to match, but edge cases may differ |
| **Card component has different padding/gap** than the custom card divs currently in use                                                    | Verify `Card` component's `--gutter` default matches existing `p-5`. Use `className="p-5"` override on `CardContent` if needed during migration                                                    |
| **Pagination component regression** — missing edge case from 15 inline implementations                                                     | The component must handle: single page (hide), first/last page (disable prev/next), active page highlighting, truncation for many pages. Test against all ~15 existing implementations             |
| **SearchField debounce changes UX behavior** — current search submits on form submit, not on keystroke                                     | Keep the existing form-submit pattern for now — debounce is optional. SearchField defaults to immediate `onChange` just like current inline inputs                                                 |
| **Button component replaces Link styled as button** — need to distinguish navigation vs action                                             | Use `Button` with `onPress` for actions, and `Link` from `@/components/ui/link` for navigation — never style a link to look like a button or vice versa                                            |
| **Large file count (80 files) creates review fatigue**                                                                                     | Process in 5 phases with separate commits. Each phase is independently reviewable                                                                                                                  |
