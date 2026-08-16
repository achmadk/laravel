# pos-cart-qty-input

## Why

The cart line item quantity can only be changed by clicking the minus/plus buttons — one unit per click. For items sold in bulk (e.g. 12 bottles of water), a cashier must click 11 times. The POS needs a direct keyboard input so quantity can be typed in one gesture.

## What Changes

- Replace the read-only quantity `<span>` inside `CartItemComponent` (between the minus and plus buttons) with a keyboard-editable numeric input
- The input is edited locally and commits via the existing `transactions.updateCart` PATCH — once, on **blur or Enter** (no per-keystroke requests)
- Select-all-on-focus so typing replaces the current value
- Invalid/empty input on blur reverts to the last valid quantity
- Escape reverts without committing
- Input value stays in sync with the `carts` prop (server response, hold/resume, clear-all, plus/minus clicks)

## Capabilities

### New Capabilities

- (none — this refines existing cart quantity editing)

### Modified Capabilities

- `pos-transactions`: the "Update cart quantity" requirement gains a manual keyboard entry path (typed input with blur/Enter commit) in addition to the existing plus/minus buttons

## Impact

- `resources/js/components/pos/CartPanel.tsx` — `CartItemComponent`: quantity `<span>` becomes a controlled-by-local-state numeric `<input>` (h-7, text-center, matches button styling, `inputMode="numeric"`, `aria-label`)
- `resources/js/pages/Dashboard/Transactions/Index.tsx` — no change required; `handleUpdateQty` already fires the PATCH and guards `qty < 1`
- **No backend changes** — `TransactionController::updateCart` already validates `integer|min:1` and rejects over-stock with a 422 + toast ("Stok tidak mencukupi. Tersedia: X"); the client relies on that existing guard
