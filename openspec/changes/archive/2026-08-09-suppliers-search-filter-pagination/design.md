## Context

The Suppliers page currently renders `Supplier::orderBy('name')->get()` as a plain array and shows a permanently open add/edit form Card. The repository already ships the exact machinery this change needs: `SearchField` / `FilterBar` / `Pagination` dashboard components, the `->when(request()->search)` + `paginate()` controller pattern (ProductController), and the Inertia-native `router.get(..., { preserveState, preserveScroll })` filter flow (Receivables). Also, since the `flash-notifications` fix, `back()->with('success'/'error')` now resurfaces as toasts — so form actions must not full-page-reload the way Products' `window.location.href` search does, or flash loops back cleanly.

## Goals / Non-Goals

**Goals:**
- Search across `name`, `phone`, `email` with debounced input, persisted in URL.
- Paginated list (10/page) with working page links.
- Add/edit form hidden by default; revealed by "Tambah Supplier" or by an edit action; cancellable.
- Preserve all existing CRUD behavior, flash toasts, delete-confirm modal, and `can("suppliers-access")` gates.

**Non-Goals:**
- No new DB columns or category/status filters (suppliers have no status field).
- No move to a separate Create page (form stays inline, just hidden by default).
- No changes to other modules.

## Decisions

**1. Inertia-native `router.get` for search (Receivables pattern), not `window.location.href` (Products pattern).**
Receivables keeps SPA state and the flash message survives; Products' hard nav drops both. This also composes with the `flash-notifications` behavior already fixed. → `router.get(suppliers.index.url(), { search }, { preserveState: true, preserveScroll: true })`.

**2. Search via `->when(request()->search, fn($q) => $q->where(fn($q2) => $q2->where('name','like',...)->orWhere('phone','like',...)->orWhere('email','like',...)))`.**
Nested closure keeps the three-way `OR` inside one where-group so it can't combine incorrectly with future filters. Deleted suppliers are already excluded by the model's `deleted_at` scoping.

**3. `paginate(10)` (Receivables' size) with `withQueryString()`.**
Products uses 5 (dense grids); suppliers are rows, so 10 fits. `withQueryString()` keeps `search` in pagination links.

**4. Hidden form via `showForm` boolean state.**
`Tambah Supplier` toggles add-mode; row edit action sets `editing` + opens the form; `cancel()` clears and hides. Search/pagination never touch `showForm` (user-confirmed "single form, never auto-hidden").

## Risks / Trade-offs

- **Search + edit-form interplay** → Mitigated by Decision 4: form state is independent of filter state; editing an item that falls off-page after a later search is user-triggered, same as today.
- **Paginator-to-prop shape change** → `suppliers.current_page/last_page/links` etc. Frontend contract updated in the same change; no external consumers of `suppliers` prop exist.
- **`preserveState` on a changed form** → Inertia keeps the DOM/form component mounted so unsaved input survives a search submission; validated as desirable.
- **Search only matches starting/inside substring with `%term%`** — same `LIKE` semantics as Products; case-insensitive on the DB collation widely used here.