## Why

Customer search in the POS `AddCustomerModal` is silently dead. It calls `customers.index` expecting JSON, but that route returns an Inertia HTML page (Inertia only emits its JSON page object when the `X-Inertia` header is present), so the modal parses an HTML document and always shows zero results. Separately, `TransactionController@index` eagerly loads every customer (`Customer::latest()->get()`) into a `customers` prop that `Index.tsx` never reads — a full-table serialization on every POS page open that feeds nothing.

## What Changes

- Add an `X-Inertia`-guarded JSON branch to `CustomerController@index`: when the request wants JSON **and** is not an Inertia navigation (no `X-Inertia` header), return the (search-filtered) customers as a plain JSON array instead of `Inertia::render`.
- Extend the index search filter to include phone (`no_telp`) alongside `name` and `member_code`, matching the modal's "Cari nama atau nomor telepon" placeholder.
- Point the POS `AddCustomerModal` search at `customers.index` with `Accept: application/json`, reading the JSON array shape the guarded branch returns.
- Stop shipping the dead all-customers prop: `TransactionController@index` sends `'customers' => []` (empty list fallback); the modal is the sole customer-discovery path.
- Verify/confirm POS cashiers hold `customers-access` (for search via index) and `customers-create` (for the modal's create fallback via `storeAjax`); the seeded `cashier` role already grants both.

## Capabilities

### New Capabilities

<!-- None; this extends the existing pos-transactions capability. -->

### Modified Capabilities

- `pos-transactions`: Adds a requirement for POS customer discovery — search flows through the JSON-capable `customers.index` endpoint, the transactions page no longer preloads a customers list, and the modal's search/create both function under the cashier permission set.

## Impact

- Backend: `app/Http/Controllers/Apps/CustomerController.php` (`index` gains JSON branch + phone search), `app/Http/Controllers/Apps/TransactionController.php` (`index` sends `'customers' => []`).
- Frontend: `resources/js/components/pos/AddCustomerModal.tsx` (search consumption), `resources/js/pages/Dashboard/Transactions/Index.tsx` (drop unused `customers` prop typing/usage).
- Permissions: `database/seeders/RoleSeeder.php` cashier role (already grants `customers-access` + `customers-create`; verify only).
- Routes: reuses existing `customers.index` (`GET /dashboard/customers`); no new route.
- Tests: Pest feature tests for the JSON branch (with/without `X-Inertia`), phone search, and the empty `customers` prop on `transactions.index`.
- Risk: the JSON branch MUST exclude Inertia's own XHR (which also sends `Accept: application/json`) or normal `/dashboard/customers` navigation breaks — the `X-Inertia` header guard is the load-bearing detail.
