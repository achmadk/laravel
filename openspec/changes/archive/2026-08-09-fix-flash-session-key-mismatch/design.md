## Context

`HandleInertiaRequests::share()` builds the `flash` prop from session keys `message`, `type`, and `data`. Only the `flash()` helper (`app/helpers.php`) and one controller (`DeleteAccountController`) write those keys. All ~15 business controllers write `success` / `error` keys via `back()->with(...)`. The frontend `Flash` component (`components/flash.tsx`) renders a sonner toast only when `flash.message` is non-empty, so controllers using the `success`/`error` convention produce no feedback at all — the observed bug on `/dashboard/suppliers`.

## Goals / Non-Goals

**Goals:**
- Map both flash conventions into the `flash` prop so every controller's message reaches the UI as a toast.
- Preserve the existing `flash()` helper convention (`message`/`type`/`data`) as-is.
- Zero frontend changes.

**Non-Goals:**
- Not migrating the ~15 controllers to the `flash()` helper (would be a larger churn than fixing the mapper).
- Not removing or renaming the `flash()` helper.
- Not changing any messages/strings in the controllers.

## Decisions

**1. Resolve message with fallback chain: `message` → `success` → `error`.**
The `flash()` helper writes `message`; controller convention writes `success`/`error`. A single null-coalescing chain picks up either. Alternative considered: remapping every controller to the helper — rejected, larger diff touching 15 files for the same outcome.

**2. Derive `type` from key presence, not the message value.**
`type` SHALL be `error` when the `error` key exists, `success` otherwise (preserving the existing `'success'` default fallback). This keeps the helper path (`type` explicitly flashed) working and makes the controller path correct. Alternative: reading `session('type')` only — rejected because it doesn't cover the controller convention.

**3. Single-point change in the middleware share closure.**
The `flash` share is a closure — it can inspect the session lazily. All logic lives in one place, no new files, no new dependencies (`sonner` already installed and rendered by `Flash`).

## Risks / Trade-offs

- **Surfaces pre-existing silent behavior as toasts** — e.g. bank account delete errors, transaction errors. This is the intended fix, but users may notice new toasts on flows that previously appeared dead. → Mitigation: messages are the controllers' existing Indonesian copy; no string changes.
- **Key shadowing if both conventions used in one request** → `message` wins (first in chain), so the helper path stays authoritative when both are set. Edge case is theoretical; no controller mixes conventions in one request today.
- **`data` key is only populated by the helper path** → unchanged behavior; `data` is untouched by this change.