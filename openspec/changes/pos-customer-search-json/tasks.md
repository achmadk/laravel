## 1. Backend: JSON-capable customers index

- [x] 1.1 Add an `X-Inertia`-guarded JSON branch to `CustomerController@index`: when `$request->wantsJson() && ! $request->header('X-Inertia')`, return `response()->json($customers)` as a flat array; otherwise render the Inertia page as today
- [x] 1.2 Ensure the JSON branch returns the search-filtered set without the `paginate(5)` envelope (flat array the modal can consume directly)
- [x] 1.3 Extend the index `search` filter to add `orWhere('no_telp', 'like', "%{$search}%")` alongside `name` and `member_code`

## 2. Backend: drop the dead POS customers prop

- [x] 2.1 In `TransactionController@index`, remove the `Customer::latest()->get()` load and send `'customers' => []`
- [x] 2.2 Confirm no other POS server code depends on the populated `customers` prop

## 3. Frontend: modal search consumption

- [x] 3.1 Confirm `AddCustomerModal` calls `customers.index.url({ query: { search } })` with `Accept: application/json` and reads the flat JSON array
- [x] 3.2 Ensure any non-array response (HTML, 403 redirect) falls back to an empty result list without throwing
- [x] 3.3 Drop the now-unused `customers` prop usage/type from `Index.tsx` (keep it optional-typed if referenced elsewhere)

## 4. Permissions verification

- [x] 4.1 Confirm the seeded `cashier` role grants both `customers-access` and `customers-create` (no changes expected)

## 5. Tests

- [x] 5.1 Pest: `customers.index` with `Accept: application/json` and no `X-Inertia` header returns a JSON array
- [x] 5.2 Pest: `customers.index` as an Inertia request (with `X-Inertia`) still renders the `Dashboard/Customers/Index` component
- [x] 5.3 Pest: JSON search matches by `no_telp` (phone) as well as name and member_code
- [x] 5.4 Pest: `transactions.index` sends an empty `customers` prop
- [x] 5.5 Pest: a `cashier`-role user is authorized for both the JSON search and `customers.storeAjax` (no 403)

## 6. Verification

- [x] 6.1 Run `vp check` (typecheck + lint) and confirm no new errors in touched files
- [x] 6.2 Run the affected Pest suite and confirm all pass
- [x] 6.3 Run `vp build` and `vp build --ssr`; confirm both succeed
- [x] 6.4 Manually confirm normal Inertia navigation to `/dashboard/customers` is unaffected
