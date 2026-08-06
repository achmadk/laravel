## Context

`config/security.php` exposes `verify_email => env('APP_VERIFY_EMAIL', false)` and the `verified` middleware alias (`EnsureEmailIsVerifiedOptional`) already short-circuits when that config is false. However, the two auth controllers ignore the config entirely:

- `AuthenticatedSessionController::store()` bounces any unverified user to `verification.notice` via a hardcoded `! $user->hasVerifiedEmail()` check, then lands verified users via a permission-priority list ending in `dashboard.access`.
- `RegisteredUserController::store()` always ends with `redirect()->route('verification.notice')` after registering and logging in the new user.

Result with the default (`false`) config: the middleware never enforces verification, yet both entry flows strand fresh users on `/verify-email`. The controllers' post-auth landing also diverges — `dashboard` requires the `dashboard-access` permission (403 risk for cashier-role users), while `dashboard.access` is an unpermissioned role-based hub.

Both controllers are committed (git clean); this change is behavioral only.

## Goals / Non-Goals

**Goals:**

- Make login and registration respect `config('security.auth.verify_email')` (env `APP_VERIFY_EMAIL`) exactly like the `verified` middleware does.
- Land all users on `dashboard.access` after login/registration, regardless of role or permissions.
- Preserve enforced-mode behavior (`APP_VERIFY_EMAIL=true` → unverified users still bounce to `verification.notice`).
- Keep `redirect()->intended()` semantics so a user mid-flow returns to the page they originally tried to reach.

**Non-Goals:**

- No new env var, no config key changes (explicitly rejected in favor of the existing `APP_VERIFY_EMAIL`).
- Not changing the `verified` middleware, `VerifyEmailController`, or `EmailVerificationPromptController` (their `dashboard` redirects are only reachable in enforced mode; left for a follow-up if desired).
- Not auto-marking emails verified at registration.
- Not altering the `/` route's authenticated redirect (still `home`).

## Decisions

### D1: Gate the verification.notice bounce behind the existing config, not a new env

**Choice:** Wrap the unverified-user redirect in `if (config('security.auth.verify_email')) { ... }` in both controllers.
**Alternatives:** A new `BYPASS_EMAIL_VERIFICATION` env (rejected — duplicates an existing switch and creates two sources of truth); auto-verifying on registration (rejected — changes user data, not just redirect behavior).
**Why:** One switch already governs enforcement in the middleware; the controllers should read the same switch. When it is false (default), verification is simply not part of the flow and the notice page is unreachable noise.

### D2: Uniform `dashboard.access` landing for all users

**Choice:** Remove the permission-priority loop; `return redirect()->intended(route('dashboard.access', absolute: false));`.
**Alternatives:** Keep permission-priority (rejected — user asked for uniform landing); land on `dashboard` (rejected — requires `dashboard-access` permission, 403 for fresh cashier-role users).
**Why:** `dashboard.access` is the unpermissioned role-based hub (cards filtered by the user's actual permissions), so it is safe for every role including brand-new users. `intended()` is retained so deep-link flows still return the user to the page they wanted.

### D3: Existing tests updated in the same change

**Choice:** Update `RegistrationTest.php:18` (asserts `verification.notice`) and `AuthenticationTest.php:24` (asserts `route('dashboard')`) to the new behavior, and add dedicated regression tests parameterized over both config values.
**Why:** The new behavior is intentional; leaving the old assertions would break CI. The `EmailVerificationTest` suite is untouched (only reachable in enforced mode, behavior unchanged).

## Risks / Trade-offs

- **Enforced-mode regression** → Covered by tests: with `APP_VERIFY_EMAIL=true`, both flows must still bounce unverified users to `verification.notice`.
- **Users lose the permission-based shortcut landing** (e.g., a sales-user used to landing directly on `transactions.index`) → `dashboard.access` is one extra click; the hub shows their allowed cards prominently. Accepted per explicit user decision.
- **`intended()` may still send users to `/home` or another protected page after login** → This is existing, standard Laravel behavior and desirable (return to the page they tried to reach). The default target is now always `dashboard.access`.
- **`EmailVerificationPromptController`/`VerifyEmailController` still redirect to `dashboard`** → Only reachable when verification is enforced; `dashboard` can 403 for permission-less users. Tracked as an open question, out of scope for this change.

## Migration Plan

1. Apply the two controller edits.
2. Update the two existing assertions; add new Pest regression tests.
3. Run `vendor/bin/pint --dirty --format agent` on the two controllers.
4. Run `php artisan test --compact --filter='Auth'` (plus full suite spot-check).
5. Rollback: `git checkout -- <files>` (controllers + tests are committed; no schema/migration involved).

## Open Questions

- Should `EmailVerificationPromptController` and `VerifyEmailController` also redirect to `dashboard.access` for consistency? (Only relevant in enforced mode; follow-up.)
- Should the `/` authenticated redirect move from `home` to `dashboard.access`? (User explicitly scoped this change to login + registration.)
