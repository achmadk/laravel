## Why

`GET /home` returns a 500. The rewritten `HomeController@index` builds its recent-transactions list with `$t->created_at->format('d M Y')`, but `Transaction` carries a global `createdAt()` accessor that turns `created_at` into a pre-formatted **string** (`d-M-Y H:i:s`) on every fetch — so `format()` is called on a string and PHP throws `Error: Call to a member function format() on string` (HomeController.php:29). The same landmine sits in `MemberController@index` (line 284: `$transaction->created_at?->toISOString()`), which will 500 the customer purchase-history endpoint for the same reason; two other call sites only survive because they already wrap the value in `Carbon::parse()`.

## What Changes

- `HomeController.php:29` — wrap the recent-transaction date with `Carbon::parse(...)`: `'date' => Carbon::parse($t->created_at)->format('d M Y')`. Fixes the reported `/home` 500.
- `MemberController.php:284` — wrap with `Carbon::parse(...)`: `'created_at' => Carbon::parse($transaction->created_at)->toISOString()`. Fixes the latent second 500 on the member purchase-history endpoint (verify the `Illuminate\Support\Carbon` import exists in that file).
- Add Pest regression tests covering both endpoints (authenticated `/home` renders without error; member history endpoint returns an ISO date).
- The `createdAt()` accessor itself is **kept** (decision: option B — minimal, unblocks `/home` now; removing the accessor is tracked as a follow-up in design.md).

## Capabilities

### New Capabilities

<!-- None: this is a bugfix restoring intended behavior, not a new capability. -->

### Modified Capabilities

<!-- None: no spec-level requirement changes. The home dashboard and member history are not covered by an existing capability spec, and this change only restores the behavior those endpoints were designed to have. -->

## Impact

- **Backend**: `app/Http/Controllers/HomeController.php` (line 29 date wrap), `app/Http/Controllers/Apps/MemberController.php` (line 284 date wrap + Carbon import if missing).
- **Tests**: Pest feature tests for `GET /home` (authenticated) and the member purchase-history endpoint.
- **No routes, no schema, no frontend changes.**
- **Known limitation (out of scope)**: frontend `CustomerHistoryPanel.tsx` parses `tx.created_at` with `new Date(...)`; while the accessor keeps returning `d-M-Y H:i:s`, that panel's dates can render wrong/invalid. Fixing it means removing the accessor (option A) or switching the panel to parse the string — tracked as a follow-up, deliberately not part of this minimal fix.
- **Risk**: low. `Carbon::parse()` accepts both strings (current) and Carbon instances (post-removal), so this call site is safe under either model state.
