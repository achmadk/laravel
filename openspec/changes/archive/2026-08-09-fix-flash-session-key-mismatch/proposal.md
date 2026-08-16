## Why

Controllers flash feedback to the session using `back()->with('success', '...')` / `('error', '...')`, but `HandleInertiaRequests` only reads session keys `message` and `type` when building the `flash` prop. The session keys never match, so `FlashProps.message` is always empty and no success/error toast ever fires — e.g. adding a supplier on `/dashboard/suppliers` silently succeeds with zero visual feedback. ~15 controllers (Supplier, PurchaseOrder, CashierShift, Receivable, Customer, CrmCampaign, BankAccount, GoodsReceiving, PaymentSetting, Transaction, Payable, CustomerVoucher, CustomerSegment) are all affected.

## What Changes

- `app/Http/Middleware/HandleInertiaRequests.php`: the `flash` share resolves a message from `message` (existing `flash()` helper convention) falling back to `success` / `error` session keys, and derives `type` as `error` when the `error` key is present, `success` otherwise.
- Both existing flash conventions keep working: the `flash()` helper path (`message`/`type`/`data`, used by `DeleteAccountController`) and the `->with('success'|'error', ...)` path used by the ~15 business controllers.
- Result: every controller that flashes `success`/`error` now produces a real sonner toast via the global `Flash` component (`components/flash.tsx`).
- No frontend changes required.

## Capabilities

### New Capabilities
- `flash-notifications`: server-to-client success/error feedback surfaced as toasts — session keys from either flash convention are mapped into the Inertia `flash` prop.

### Modified Capabilities
<!-- None: no existing spec describes the flash/feedback behavior. -->

## Impact

- `app/Http/Middleware/HandleInertiaRequests.php` — the only production file changed.
- Behavior: all controllers using `->with('success'|'error', ...)` now show toasts (previously silent). This may surface new toasts on interactions that previously appeared to do nothing — this is the intended fix, not a regression.
- No routes, migrations, or dependencies change.