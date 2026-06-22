## 1. Audit Log Pages

- [ ] 1.1 Port Audit Log Index page (`AuditLogs/Index.jsx` → `dashboard/audit-logs/index.tsx`): filterable table with user/module/event/date/search filters, paginated
- [ ] 1.2 Port Audit Log Show page (`AuditLogs/Show.jsx` → `dashboard/audit-logs/show.tsx`): detail view with key-value table of old/new data

## 2. Stock Opname Pages

- [ ] 2.1 Port Stock Opname Index page (`StockOpnames/Index.jsx` → `dashboard/stock-opnames/index.tsx`): session listing with search and status indicators
- [ ] 2.2 Port Stock Opname Create page (`StockOpnames/Create.jsx` → `dashboard/stock-opnames/create.tsx`): simple form with notes field to create a new session
- [ ] 2.3 Port Stock Opname Show page (`StockOpnames/Show.jsx` → `dashboard/stock-opnames/show.tsx`): detail page with item-level count entry, product search modal, finalize flow

## 3. Stock Mutation Page

- [ ] 3.1 Port Stock Mutation Index page (`StockMutations/Index.jsx` → `dashboard/stock-mutations/index.tsx`): mutation history listing with product/date/type filters

## 4. User Management Pages

- [ ] 4.1 Port Users Index page (`Users/Index.jsx` → `dashboard/users/index.tsx`): list/grid toggle view with search, inline create/edit dialogs, bulk delete
- [ ] 4.2 Port Users Create page (`Users/Create.jsx` → `dashboard/users/create.tsx`): full form with name/email/password/avatar/role assignment
- [ ] 4.3 Port Users Edit page (`Users/Edit.jsx` → `dashboard/users/edit.tsx`): edit form with existing data pre-filled, optional password change

## 5. Roles Page

- [ ] 5.1 Port Roles Index page (`Roles/Index.jsx` → `dashboard/roles/index.tsx`): card-based role listing with inline create/edit dialogs and permission checkboxes

## 6. Permissions Page

- [ ] 6.1 Port Permissions Index page (`Permissions/Index.jsx` → `dashboard/permissions/index.tsx`): searchable permission grid with count display

## 7. Report Pages

- [ ] 7.1 Port Sales Report page (`Reports/Sales.jsx` → `dashboard/reports/sales.tsx`): summary cards + date/cashier/customer filters + paginated transaction table
- [ ] 7.2 Port Profit Report page (`Reports/Profit.jsx` → `dashboard/reports/profit.tsx`): profit summary cards + date/filter + cost/profit breakdown table with color-coded values
- [ ] 7.3 Port Insights page (`Reports/Insights.jsx` → `dashboard/reports/insights.tsx`): multi-chart dashboard (line/doughnut/bar) with KPI cards, product coverage, promo status, date range filters

## 8. Verification

- [ ] 8.1 Run `lsp_diagnostics` on all new/changed TSX files — fix any type errors
- [ ] 8.2 Run `vp check` to verify lint, types, and formatting
- [ ] 8.3 Browse each new page and verify it renders without console errors (smoke test)
