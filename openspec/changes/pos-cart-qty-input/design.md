# pos-cart-qty-input Design

## Context

- `CartItemComponent` lives inline in `resources/js/components/pos/CartPanel.tsx` (lines 34–108). The quantity sits between minus/plus buttons as a read-only `<span className="w-8">{item.qty}</span>`.
- `handleUpdateQty` (`resources/js/pages/Dashboard/Transactions/Index.tsx:188`) fires a `router.patch` to `transactions.updateCart` (`PATCH /transactions/{cart_id}/updateCart`) **per invocation**, with `preserveState: true` and server errors surfaced via toast.
- Backend (`TransactionController::updateCart`) validates `qty => integer|min:1` and rejects over-stock with 422 + "Stok tidak mencukupi. Tersedia: X". Price is recomputed server-side as `sell_price × qty`.
- The `carts` prop (source of truth) refreshes after every successful mutation via Inertia redirect.

## Goals / Non-Goals

**Goals:**
- Cashier can type a line-item quantity directly with the keyboard, replacing the read-only span
- Exactly one network request per committed edit (no per-keystroke requests, no races)
- Input reflects the `carts` prop (server response, hold/resume, clear-all, plus/minus)
- Accessible: `inputMode="numeric"`, `aria-label`, focus-selected value

**Non-Goals:**
- Client-side stock cap (server 422 + toast is the existing guard; no backend/payload change)
- Debounced "live" updates while typing
- Any backend or route change

## Decisions

1. **Commit on blur + Enter (user-selected).** Local `useState` holds the draft; `onUpdateQty` fires once on blur or Enter. Alternatives rejected: debounced `onChange` (timer complexity, still fires intermediate requests, race between "1" and "12" responses); per-keystroke PATCH (request spam, races).
2. **Local state + `useEffect` sync on `item.qty`.** The input is controlled by local state so typing is never stomped by the prop mid-edit; the effect re-syncs when the prop changes (successful PATCH, hold/resume, clear-all, plus/minus clicks).
3. **Select-all on focus** (`onFocus={(e) => e.target.select()}`). Cashier clicks, types "12", done — the biggest speed win for the POS.
4. **`inputMode="numeric"` + digit stripping + `maxLength={4}`.** Text input (not `type="number"`, avoids spinner arrows cluttering the 32px row); non-digits stripped in `onChange`; server remains the source of truth for bounds.
5. **Empty / `<1` on blur → revert to last valid value, no request.** Client-side mirror of the existing `newQty < 1` guard in `handleUpdateQty`.
6. **Escape → revert, no request.** `onKeyDown`, cheapest possible cancel.
7. **No backend change.** Existing validation + stock 422 toast covers correctness. Alternative considered: expose `stock` in `CartItemProduct` for a client-side clamp — deferred (YAGNI; server guard sufficient, toast already explains the limit).

## Risks / Trade-offs

- [Stale draft after rejected PATCH (e.g. over-stock)] → The prop doesn't change, so the sync effect doesn't fire; input keeps the typed value while the toast explains the rejection. Accepted: the component stays dumb, the error is visible, and the next interaction (plus/minus/focus) reconciles.
- [Width shift] → `w-8` span becomes a ~`w-10` input; row height stays `h-7`, text-center, borderless-with-subtle-hover to match button styling.
- [Sync effect overwrites an in-flight draft] → Draft only lives while focused; prop sync only matters when not editing. Effect runs on prop change regardless of focus, but a typed-then-blurred value is already committed by then.

## Open Questions

- None blocking. Optional future: client-side stock clamp if cashiers complain about the server-toast flow.
