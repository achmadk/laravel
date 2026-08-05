## Context

`GET /home` throws `Error: Call to a member function format() on string` at `HomeController.php:29`. The chain of cause:

1. `Transaction` (committed `b4857c7`) defines a global `createdAt()` accessor — `Attribute::make(get: fn ($value) => Carbon::parse($value)->format('d-M-Y H:i:s'))` — which overrides Laravel's built-in `datetime` cast. Every `$transaction->created_at` across the app is therefore a pre-formatted **string**, not a Carbon instance.
2. `HomeController` was rewritten (uncommitted work) from `__invoke` → `inertia('home/page')` to `index()` → `Inertia::render('Home', ...)`, and its recent-transactions map calls `$t->created_at->format('d M Y')` — written against the Carbon contract.

The same landmine exists at `MemberController.php:284` (`$transaction->created_at?->toISOString()` — the nullsafe operator does not rescue a string, so the customer purchase-history endpoint will 500 identically). Two sibling call sites (`CustomerController.php:481`, `DashboardController.php:109`) survive only because they already wrap with `Carbon::parse()`, proving the defensive pattern is the de-facto convention for this accessor.

## Goals / Non-Goals

**Goals:**

- Unblock `GET /home` (the reported 500) with the smallest safe diff.
- Defuse the identical latent 500 in the member purchase-history endpoint.
- Keep the fix robust regardless of whether the `createdAt()` accessor stays or is later removed.
- Lock the behavior with regression tests.

**Non-Goals:**

- Removing/rewriting the `createdAt()` accessor (option A — see Decisions; tracked as follow-up).
- Fixing the frontend `CustomerHistoryPanel.tsx` `new Date(tx.created_at)` date-mangling (same follow-up).
- Refactoring `HomeController@index` (it is uncommitted in-progress work; only the crashing line is touched).

## Decisions

**D1 — Fix the callers, not the accessor (option B, per user).**
Wrap the two crashing expressions with `Carbon::parse(...)`:

- `HomeController.php:29`: `'date' => Carbon::parse($t->created_at)->format('d M Y')` (`Carbon` already imported).
- `MemberController.php:284`: `'created_at' => Carbon::parse($transaction->created_at)->toISOString()` (+ add `use Illuminate\Support\Carbon;` if absent).

_Alternatives considered:_

- **A — Remove the accessor** (root cause): deletes the 7-line accessor and restores Carbon everywhere. Rejected for now by the user; it also requires touching frontend render sites that currently display the raw `d-M-Y H:i:s` string (`Sales.tsx:409`, `Profits.tsx:388/424`), widening the diff.
- **C — Format in the frontend only**: does nothing for the server-side crash; not applicable.

Why `Carbon::parse()` is the right wrapper: it accepts both the current string form AND a Carbon instance, so this call site is safe under either model state — it is the same pattern the two surviving call sites already use.

**D2 — Null semantics.**
`Carbon::parse(null)` resolves to _now_, which would silently fake a timestamp for a null `created_at`. Transactions always have `created_at` (timestamps enforced at write time), and the two surviving call sites already ignore this edge — so no explicit null guard is added, keeping the diff minimal. Documented here so the follow-up (accessor removal) does not assume a null-safe chain.

## Risks / Trade-offs

- **[HomeController is uncommitted in-progress work]** → Only line 29 is touched; no structural changes. If the broader diff is reverted, the fix reverts with it cleanly.
- **[Fix B leaves the accessor as a future trap]** → Any future code treating `Transaction->created_at` as Carbon will 500. Mitigation: the design.md follow-up (option A) is the durable fix; the `Carbon::parse` wrapper is forward-compatible with it.
- **[`Carbon::parse(null)` → now]** → Not reachable for transactions in practice; noted in D2.
- **[Frontend `new Date(tx.created_at)` on `d-M-Y H:i:s`]** → Known display issue, out of scope; tracked in proposal.md as the follow-up that motivates option A later.

## Migration Plan

- Apply the two one-line edits; run the new Pest tests plus the existing affected suites; `vp check` on touched files.
- No schema, route, or dependency changes — no migration steps; rollback is `git checkout` of the two controller lines.

## Open Questions

- Whether/when to proceed with the follow-up (option A: remove accessor + fix `Sales.tsx`/`Profits.tsx`/`CustomerHistoryPanel.tsx` date rendering). Tracked in proposal.md; not blocking this fix.
