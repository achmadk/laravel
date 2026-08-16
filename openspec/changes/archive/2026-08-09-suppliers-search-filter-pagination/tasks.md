## 1. Backend — SupplierController::index

- [x] 1.1 Add search: `->when(request()->search, fn($q) => $q->where(fn($q2) => $q2->where('name','like','%'.request()->search.'%')->orWhere('phone','like',...)->orWhere('email','like',...)))`
- [x] 1.2 Change `orderBy('name')->get()` to `->paginate(10)->withQueryString()`

## 2. Frontend — Suppliers/Index.tsx

- [x] 2.1 Update `suppliers` prop types to paginated response shape (data/current_page/last_page/per_page/total/links + PaginationLink)
- [x] 2.2 Add `showForm` state; wrap form Card in `{showForm && ...}`; render `Tambah Supplier` button (gated by `can("suppliers-access")`) when hidden; cancel() hides form
- [x] 2.3 Add `SearchField` inside `FilterBar`; submit via `router.get(suppliers.index.url(), { search }, { preserveState: true, preserveScroll: true })`; seed input from `filters`/query param
- [x] 2.4 Render `Pagination links={suppliers.links}` when `last_page > 1`
- [x] 2.5 Upgrade bare `<Heading>` to `PageHeader` with count description (match Products)

## 3. Tests

- [x] 3.1 Feature test: index with `?search=` filters by name and phone
- [x] 3.2 Feature test: index returns paginated shape with links when > 10 suppliers
- [x] 3.3 Feature test: search + pagination preserve `search` in page links (`withQueryString`)

## 4. Verification

- [x] 4.1 Run `vendor/bin/pint --dirty --format agent` on changed PHP files
- [x] 4.2 Run `npm run build` / type-check for TS changes; run `php artisan test --compact` and confirm green