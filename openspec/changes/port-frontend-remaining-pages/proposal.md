## Why

The initial `port-pos-reference-backend` change ported ~64 of ~80 frontend pages (80% complete). Nine page groups remain unported: Audit Logs, Stock Opnames, Stock Mutations, Users, Roles, Permissions, and Reports (Sales/Profit/Insights). These are needed to achieve feature parity with the source project and unblock admin workflows (user management, reporting, inventory operations).

Porting these last pages completes the frontend migration from `pos-reference` (Laravel 12 + Inertia v2 + React 18 + Tailwind v3 + JSX) to `rtos` (Laravel 13 + Inertia v3 + React 19 + Tailwind v4 + TypeScript + Justd/react-aria-components + Wayfinder routes).

## What Changes

- **New:** `dashboard/stock-opnames/index.tsx`, `create.tsx`, `show.tsx` — Stock take session management (create physical count sessions, enter product counts, finalize adjustments)
- **New:** `dashboard/stock-mutations/index.tsx` — Stock mutation history listing with date/product filters
- **New:** `dashboard/audit-logs/index.tsx`, `show.tsx` — Activity log viewer, filterable by user/action/date, with detail view
- **New:** `dashboard/users/index.tsx`, `create.tsx`, `edit.tsx` — User management CRUD with role assignment and permission checks
- **New:** `dashboard/roles/index.tsx` — Role listing with inline create/edit via dialog
- **New:** `dashboard/permissions/index.tsx` — Permission matrix display
- **New:** `dashboard/reports/sales.tsx` — Sales report with date/payment/category/status filters
- **New:** `dashboard/reports/profit.tsx` — Profit/loss report with date filter
- **New:** `dashboard/reports/insights.tsx` — Advanced sales insights dashboard with chart.js visualizations
- **Tech stack adaptation per page:** JSX→TSX, custom Dashboard UI components→Justd/react-aria-components, `route()` (Ziggy)→Wayfinder route imports, Tailwind v3→v4, Inertia v2→v3 API

## Capabilities

### New Capabilities

- `audit-logs`: Activity log viewer and detail pages with date/user/action filtering. Accessible to users with audit log permissions.
- `stock-opnames`: Stock take session management — create physical count sessions, enter product-by-product counts, finalize adjustments, review history. Accessible to warehouse/inventory managers.
- `stock-mutations`: Stock mutation history viewer — filter by date range, product, and mutation type. Accessible to inventory managers.
- `users`: User management CRUD with role assignment. Accessible to admin users with user management permissions.
- `roles`: Role listing with inline create/edit via dialog. Accessible to admin users.
- `permissions`: Permission matrix — display all permission groups with associated role assignments. Accessible to admin users.
- `reports-sales`: Sales report page with date range, payment method, category, and status filters.
- `reports-profit`: Profit/loss report with date filter and summary metrics.
- `reports-insights`: Advanced sales insights dashboard with chart.js line/bar/doughnut visualizations and KPI cards.

## Impact

- **No breaking changes** — all changes are additive (new frontend pages only)
- No backend PHP changes required — all controllers, models, services, routes already exist
- No database schema changes
- No dependency changes
- Follows existing patterns established by the 64 already-ported pages (Wayfinder routes, Justd components, Inertia v3 API, Tailwind v4)
