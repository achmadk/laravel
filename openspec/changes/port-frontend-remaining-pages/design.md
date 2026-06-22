## Context

The `port-pos-reference-backend` change ported ~64 frontend pages using a page-by-page adaptation strategy established in its design.md: JSX→TSX, custom Dashboard UI components→Justd/react-aria-components, Ziggy `route()`→Wayfinder typed imports, Tailwind v3→v4, Inertia v2→v3 API.

Nine page groups remain (9 spec areas, ~20 files). These are the final blocks to reach feature parity with `pos-reference`. The existing adaptation patterns apply identically — no new architectural patterns needed. The main variance is page complexity: Reports pages use chart.js (already a project dependency), while admin pages (Users/Roles/Permissions) have more complex permission-gating logic.

**Current state:**

- Backend controllers for all 9 page groups already exist in `app/Http/Controllers/Apps/`
- API routes (e.g., `stock-opnames.index`, `users.index`, `reports.sales`) are registered and functional
- 64 ported TSX pages in `resources/js/pages/dashboard/` provide the pattern templates
- Justd UI components (`components/ui/`), Wayfinder route modules, and `lib/auth.ts` (permission hook) are all in place

## Goals / Non-Goals

**Goals:**

- Port all 9 remaining page groups (~20 files) from `../pos-reference/resources/js/Pages/Dashboard/` → `resources/js/pages/dashboard/`
- Apply the established adaptation pattern: JSX→TSX, Justd components, Wayfinder routes, Tailwind v4, Inertia v3
- Ensure admin pages (Users/Roles/Permissions) use the existing permission gate system from `lib/auth.ts`
- Ensure report pages integrate with chart.js (already a project dependency)
- Match existing ported page patterns for layout, navigation, and component usage

**Non-Goals:**

- No backend PHP changes — controllers, routes, services are complete
- No new features beyond what `pos-reference` already has
- No database schema changes
- No CSS/design system changes — use existing Justd/Tailwind v4 patterns
- No dependency additions — chart.js, @tabler/icons-react, react-aria-components are all present

## Decisions

### Adaptation Strategy

| Decision                                                                           | Rationale                                                                                                                                                 | Alternatives Considered                                                                                |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Page-by-page porting (not bulk copy + regex)                                       | Each page needs 6 adaptation steps; bulk approach would miss imports, types, and component substitutions                                                  | Bulk copy + regex (too error-prone; established pattern from 64 prior pages proved page-by-page works) |
| Use existing Justd components for all UI (Button, Table, Dialog, DatePicker, etc.) | Project already has them; maintains visual consistency across all dashboard pages                                                                         | Custom components per page (creates inconsistency with 64 existing pages)                              |
| Convert Inertia v2 patterns inline during porting                                  | Inertia v3 `useForm` API differs from v2; must use current v3 patterns                                                                                    | Keep v2 syntax and fix later (would forget — do it during porting)                                     |
| Render controllers use Pascal-case names (unchanged)                               | Controllers call `inertia('Dashboard/StockOpnames/Index')` — Inertia resolves case-insensitively. Keeping Pascal-case avoids touching 9 controller files. | Rename controllers to kebab-case (risks breaking things; unnecessary)                                  |

### Page-Specific Design Decisions

| Page Group                            | Key Decision                                                                                                                             | Rationale                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Stock Opnames** (Index/Create/Show) | Multi-step form for Create: 1) session info → 2) product entry with barcode scanning → 3) finalize                                       | Matches pos-reference flow; Create page has substantial interactivity (per-product count entry, auto-finalize check) |
| **Stock Mutations** (Index)           | Simple filterable table; identical pattern to Payables/Receivables Index                                                                 | Low complexity — listing with search + date range                                                                    |
| **Audit Logs** (Index/Show)           | Server-side filtered table (by user, action, date range); Show page is read-only detail with all request context                         | Audit logs are append-only; no create/edit needed                                                                    |
| **Users** (Index/Create/Edit)         | Create/Edit inline via dialog (not separate pages with full navigation). Uses existing `users.routes` Wayfinder module + permission gate | pos-reference uses dialog forms for Users — compact UX pattern                                                       |
| **Roles** (Index)                     | Single-page with inline create/edit dialog + permission checkboxes grouped by module                                                     | Permission assignment uses checkbox groups — map to Justd CheckboxGroup components                                   |
| **Permissions** (Index)               | Read-only matrix: modules × roles with check indicators                                                                                  | No edit capability in pos-reference — purely informational                                                           |
| **Reports — Sales**                   | Date range picker + filter controls + chart.js bar chart + summary table                                                                 | chart.js already a dependency (`resources/js/lib/chart.ts` or similar pattern from dashboard)                        |
| **Reports — Profit**                  | Date range picker + summary cards + profit breakdown table                                                                               | Simpler than Sales — no charts                                                                                       |
| **Reports — Insights**                | Multi-chart dashboard: daily sales line, category doughnut, top products bar — with date range controls                                  | Most complex report; leverage chart.js + existing patterns                                                           |

### Wayfinder Route Mapping

Each page group uses Wayfinder route modules (already generated). Key routes:

| Page Group         | Wayfinder Import                                        | Key Routes                                                                                              |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Stock Opnames      | `import stockOpnames from '@/routes/stock-opnames'`     | `.index()`, `.create()`, `.store()`, `.show({stock_opname: id})`, `.finalize({stock_opname: id})`       |
| Stock Mutations    | `import stockMutations from '@/routes/stock-mutations'` | `.index()`                                                                                              |
| Audit Logs         | `import auditLogs from '@/routes/audit-logs'`           | `.index()`, `.show({audit_log: id})`                                                                    |
| Users              | `import users from '@/routes/users'`                    | `.index()`, `.create()`, `.store()`, `.edit({user: id})`, `.update({user: id})`, `.destroy({user: id})` |
| Roles              | `import roles from '@/routes/roles'`                    | `.index()`, `.store()`, `.update({role: id})`, `.destroy({role: id})`                                   |
| Permissions        | `import permissions from '@/routes/permissions'`        | `.index()`                                                                                              |
| Reports (Sales)    | `import salesReport from '@/routes/reports-sales'`      | `.index()`                                                                                              |
| Reports (Profit)   | `import profitReport from '@/routes/reports-profit'`    | `.index()`                                                                                              |
| Reports (Insights) | `import insights from '@/routes/reports-insights'`      | `.index()`                                                                                              |

### Permission Gating

Admin pages use the `useAuthorization` hook from `@/lib/auth` (same pattern as existing pages):

```typescript
const { can } = useAuthorization();
// Users: can("users-access"), can("users-create"), can("users-edit"), can("users-delete")
// Roles: can("roles-access"), can("roles-create"), can("roles-edit"), can("roles-delete")
// Permissions: can("permissions-access")  // read-only
// Audit Logs: can("audit-logs-access")
// Stock Opnames: can("stock-opnames-access"), can("stock-opnames-create"), can("stock-opnames-finalize")
// Stock Mutations: can("stock-mutations-access")
```

### Chart.js Integration (Reports)

chart.js is already a project dependency. The approach:

- Import directly in the report page component
- Initialize charts via `useEffect` + `useRef` (same pattern as the existing dashboard if it has charts, or use chart.js React wrapper pattern)
- No new chart library dependency needed

### Tailwind v4 Adaptation Notes

The pagination, filters, and table components in pos-reference use these v3 patterns that need adapting:

| v3 Pattern                        | v4 Equivalent                                               |
| --------------------------------- | ----------------------------------------------------------- |
| `space-y-4`                       | `space-y-4` (still works)                                   |
| `shadow-lg shadow-primary-500/30` | `shadow-lg shadow-primary-500/30` (still works)             |
| `border border-slate-200`         | `border border-slate-200` (still works)                     |
| Custom input styling              | Use Justd `TextField` / `SearchField`                       |
| Custom table styling              | Use Justd `Table` or plain HTML table with Tailwind classes |
| Custom pagination                 | Use Justd `Pagination`                                      |

## Risks / Trade-offs

| Risk                                                                                                        | Mitigation                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Stock Opnames Create** — barcode scanning feature (useBarcodeScanner hook) may need adaptation to TSX     | Port `hooks/use-barcode-scanner.ts` already exists; reuse from pos-reference with TS types                       |
| **Reports — Insights** — multiple chart.js instances may cause canvas/memory issues                         | Scope chart instances to page lifecycle; destroy on unmount in useEffect cleanup                                 |
| **Users Create/Edit** — role assignment UI (multi-select checkboxes) may differ between custom UI and Justd | Use Justd `CheckboxGroup` with role list; map selected role IDs on submit                                        |
| **Permissions matrix** — the grid layout may not map cleanly to Justd Table                                 | Use plain HTML `<table>` with Tailwind for the matrix — Justd Table expects row-oriented data; matrix is 2D      |
| Wayfinder route for `stockOpnames.finalize` may not exist if not registered in routes                       | Verify route in `routes/web.php`; if missing, add or use `router.post` with URL directly                         |
| Controllers may not have all Inertia props needed for new pages                                             | Controllers are already ported and functional; props are provided by the controller's `return inertia(...)` call |

## Open Questions

- Should Reports use chart.js directly (via useEffect/useRef) or a React chart wrapper like react-chartjs-2? (pos-reference uses chart.js directly — follow same pattern)
- Are there any Justd component gaps for Stock Opnames Create page (barcode input, bulk product entry)? If so, fall back to native HTML + Tailwind
- Should the Users Create/Edit flow reuse a shared form component (like `form.tsx`) or be inline in each page? (pos-reference uses inline — follow existing ported patterns)
