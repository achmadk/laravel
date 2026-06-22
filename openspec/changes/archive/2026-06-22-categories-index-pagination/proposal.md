## Why

The Dashboard Categories index page currently limits results to only 2 items per page (`paginate(2)` in `CategoryController@index`), which is far below the app standard of 10 items per page. This makes the feature difficult to use — users with many categories must paginate excessively, and the empty space on the page undermines trust. The product controller even uses `paginate(5)`, showing that 2 was likely a leftover from initial scaffolding.

## What Changes

- Change the `CategoryController@index` `paginate(2)` call to `paginate(10)` — matching the codebase convention used by 12+ other App controllers (Members, Transactions, Customers, Pricing Rules, etc.).
- No frontend changes needed — `Index.tsx` already handles paginated responses correctly with rendered pagination links.
- The search feature via `when(request()->search, ...)` is unaffected and will continue to work within the new page size.

## Capabilities

### New Capabilities

_(none — this is a configuration fix, not a new capability)_

### Modified Capabilities

- `categories-index`: Change pagination limit from 2 to 10 items per page in the index listing

## Impact

- **Single file change**: `app/Http/Controllers/Apps/CategoryController.php` line 24
- **Frontend**: No impact — the React `Index.tsx` renders any paginated response generically via `data.data`, `data.links`, and `data.last_page`
- **API**: The paginated JSON response shape remains unchanged; only `per_page` and `total` count in the response metadata will update
- **No migrations, no new dependencies, no breaking changes**
