## Context

The POS `AddCustomerModal` searches customers by calling `customers.index` with `Accept: application/json`. That route is an Inertia page route (`Inertia::render('Dashboard/Customers/Index', ...)`), and Inertia only serializes its JSON page object when the `X-Inertia` request header is present. A plain axios request therefore receives the full HTML document; the modal's `response.data?.customers ?? response.data?.data ?? response.data` chain falls through to an HTML string, `Array.isArray` is false, and results are always `[]`. The search looks "empty," not "broad."

Two supporting facts, confirmed in the codebase:

- `TransactionController@index` runs `Customer::latest()->get()` and passes it as a `customers` prop, but `Index.tsx` only declares the prop type (line 39) and never reads it — a dead, full-table payload on every POS open.
- The seeded `cashier` role (`RoleSeeder.php`) already grants both `customers-access` (gates `customers.index`) and `customers-create` (gates `customers.storeAjax`), so the standard cashier is not permission-blocked; only custom roles lacking these would 403.

The chosen direction is to reuse `customers.index` (no new route) and make it answer JSON for non-Inertia JSON requests.

## Goals / Non-Goals

**Goals:**

- Make POS customer search actually return results by having `customers.index` respond with JSON for non-Inertia JSON requests.
- Include phone (`no_telp`) in the search so the UI's promise is honored.
- Remove the dead all-customers prop from the POS page (`'customers' => []`).
- Keep normal Inertia navigation to `/dashboard/customers` fully intact.
- Cover the behavior with Pest feature tests.

**Non-Goals:**

- Adding a dedicated `customers.search` route/controller method (explicitly rejected in favor of reuse).
- Changing the cashier role's permission set (already sufficient; verify only).
- Client-side search against a preloaded list (the dead prop is being removed, not repurposed).
- Redesigning the modal UI or the customers index page.

## Decisions

### Decision 1: X-Inertia-guarded JSON branch in `CustomerController@index` (Option A)

`index()` returns JSON only when the request wants JSON **and** carries no `X-Inertia` header; otherwise it renders the Inertia page as today.

```php
if ($request->wantsJson() && ! $request->header('X-Inertia')) {
    return response()->json($customers);   // flat array
}
return Inertia::render('Dashboard/Customers/Index', ['customers' => $customers]);
```

- **Why**: Reuses the existing route and the modal's current `Accept: application/json` request with no new query contract.
- **Load-bearing detail**: Inertia's own XHR visits also send `Accept: application/json`. A naive `wantsJson()` check would hijack normal Inertia navigation to `/dashboard/customers`. The `! $request->header('X-Inertia')` guard is what prevents that regression.
- **Alternative considered (Option B)**: an explicit `?as_json=1` flag. Rejected: adds a query contract to a REST-ish route and diverges from the modal's existing header-based request.
- **Shape note**: the JSON branch returns a flat array (not the `paginate(5)` envelope) so the modal consumes results directly; the paginated shape is reserved for the Inertia page.

### Decision 2: Extend search to include `no_telp`

The index `when(request()->search)` filter adds `orWhere('no_telp', 'like', "%{$search}%")` alongside `name` and `member_code`.

- **Why**: The modal placeholder advertises phone search; today only name/member_code match. Note `no_telp` is stored as a numeric column — `LIKE` still works but partial/formatted input may not match; acceptable for this iteration.

### Decision 3: Empty `customers` prop on the POS page

`TransactionController@index` sends `'customers' => []` and stops calling `Customer::latest()->get()`.

- **Why**: The prop is unused client-side; removing the query and payload is a strict win, and search is now on-demand. This is the "fallback = empty list" decision.
- **Alternative considered**: remove the prop entirely. Kept as `[]` to avoid an undefined-prop churn in the typed page component; the type stays optional.

### Decision 4: Verify, don't modify, cashier permissions

Confirm via test/seeder that `cashier` has `customers-access` + `customers-create`; make no permission changes.

- **Why**: The seeder already grants both. A regression test documents the dependency so a future seeder edit can't silently break the modal.

## Risks / Trade-offs

- **Inertia navigation hijack** → Mitigated by the `X-Inertia` header guard (Decision 1); covered by a dedicated test asserting the page renders for Inertia requests.
- **Custom roles without `customers-access`** → Out of scope; only the seeded cashier is guaranteed. A test documents the requirement so misconfigured roles fail loudly in review, not silently in production.
- **Numeric `no_telp` LIKE matching** → Formatted/partial phone input may not match a bigint column cleanly; acceptable now, flagged for a future normalization pass.
- **Unauthenticated/permission JSON responses** → A 403/redirect from middleware still returns non-JSON; the modal must treat any non-array response as empty results (it already falls back to `[]`).

## Migration Plan

1. Add the JSON branch + phone search to `CustomerController@index`.
2. Set `'customers' => []` in `TransactionController@index`; drop the unused prop usage/type in `Index.tsx`.
3. Confirm `AddCustomerModal` reads the flat JSON array and falls back to `[]`.
4. Add Pest tests (JSON with/without `X-Inertia`, phone match, empty POS prop, cashier authorization).
5. Run `vp check`, the affected Pest suite, and `vp build`.

Rollback: revert the controller branch; the modal's `[]` fallback means search degrades to empty rather than erroring.

## Open Questions

- Should the JSON branch cap results (e.g. `limit(20)`) to bound payloads for very common search terms? Leaning yes, but not required for correctness.
- Is numeric `no_telp` acceptable long-term, or should phone be stored/searched as a normalized string? Deferred.
