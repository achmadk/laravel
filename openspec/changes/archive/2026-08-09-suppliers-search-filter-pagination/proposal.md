## Why

`/dashboard/suppliers` loads every supplier at once with no way to search, filter, or page through the list. As the supplier base grows the page becomes unusable, and the always-visible add/edit form crowds the list. Other modules (Products, Categories, Receivables) already ship search/filter/pagination — Suppliers should match that convention. Reference modules: `resources/js/pages/Dashboard/{Categories,Products,Receivables}/Index.tsx` + `ProductController::index`, which use `->when(request()->search, ...)` + `paginate()` and the shared `SearchField` / `FilterBar` / `Pagination` dashboard components.

## What Changes

- `app/Http/Controllers/Apps/SupplierController.php` `index()`:
  - Search suppliers by `name`, `phone`, or `email` (case-insensitive `LIKE`), driven by the `search` query param.
  - Paginate the result (`paginate(10)`), keeping the query string (`withQueryString()`) so search + page coexist in the URL.
- `resources/js/pages/Dashboard/Suppliers/Index.tsx`:
  - `suppliers` prop becomes the paginated shape `{ data, links, ... }` (matching Products/Receivables response contract).
  - Add `SearchField` (debounced, 300ms) inside a `FilterBar`; repeated submissions go through `router.get(suppliers.index.url(), { search }, { preserveScroll, preserveState })` (Receivables convention) so the Inertia page updates in place and flash toasts from the Part-1 `flash-notifications` fix keep working.
  - Render the existing `Pagination` component with `links` when `last_page > 1`.
  - **Add/Edit form hidden by default**: replace the always-visible form Card with a `Tambah Supplier` button that reveals it; editing an existing supplier reveals the same card in edit mode; `cancel()` returns to hidden state. Single form instance — never auto-hidden by search/pagination (per user decision).
  - Upgrade the page's bare `<Heading>` header to the `PageHeader` convention with a count description, matching Products.

## Capabilities

### New Capabilities
- `supplier-list-management`: keyed supplier list with search, pagination, and on-demand add/edit form on the dashboard Suppliers page.

### Modified Capabilities
<!-- None: no existing spec covers the suppliers list. -->

## Impact

- `app/Http/Controllers/Apps/SupplierController.php` — `index()` return shape changes from a bare collection to a paginator (Inertia prop contract change).
- `resources/js/pages/Dashboard/Suppliers/Index.tsx` — full page restructure.
- Route `suppliers.index` unchanged, still `permission:suppliers-access`.
- No DB, migration, or dependency changes.