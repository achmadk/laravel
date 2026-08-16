# Tasks

## 1. Quantity Input Component

- [x] 1.1 In `CartPanel.tsx`, replace the read-only quantity `<span>` (line 95–97) inside `CartItemComponent` with a numeric `<input>` (h-7, text-center, rounded, `inputMode="numeric"`, `maxLength={4}`, `aria-label="Jumlah item"`, `onFocus` select-all)
- [x] 1.2 Add local `useState(item.qty)` draft state to `CartItemComponent`; control the input value from it; strip non-digits in `onChange`; guard against NaN
- [x] 1.3 Commit on blur: call `onUpdateQty(item.id, parsed)` when blur fires with a valid value (integer ≥ 1, different from current); revert to last valid value if empty/`<1` without a request
- [x] 1.4 Commit on Enter (same path as blur), revert on Escape — both via `onKeyDown`; Enter must not submit any surrounding form
- [x] 1.5 Add `useEffect` syncing draft state from `item.qty` when the prop changes (server response, hold/resume, clear-all, plus/minus)

## 2. Verification

- [x] 2.1 Run `vp check` (lint + typecheck) — clean
- [x] 2.2 Manual browser check: type a qty in the cart input, press Enter → PATCH fires once, cart subtotal + unit price × qty line update; blur path behaves identically; Escape and empty-input revert without requests; plus/minus still work
- [x] 2.3 Confirm over-stock qty shows the existing "Stok tidak mencukupi" toast (server guard untouched)
- [x] 2.4 Run Pest suite (`php artisan test --compact`) — 63 passed / 349 assertions baseline holds
