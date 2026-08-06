## Why

Both the login and registration flows hardcode a redirect to `verification.notice` whenever the user's email is unverified, ignoring `config('security.auth.verify_email')` (env `APP_VERIFY_EMAIL`, default `false`). The `verified` middleware (`EnsureEmailIsVerifiedOptional`) already respects that config — so with the default setup, a fresh user gets stuck on `/verify-email` after login/register even though nothing would ever block them. The post-auth landing target is also inconsistent: `dashboard` requires the `dashboard-access` permission, which a default cashier-role user does not have (403 risk).

## What Changes

- `AuthenticatedSessionController::store`: gate the unverified-user bounce to `verification.notice` behind `config('security.auth.verify_email')`. When verification is not enforced (default), skip the bounce.
- Replace the permission-priority landing logic with a uniform redirect to `dashboard.access` for all users, keeping `redirect()->intended(...)` so deep-link returns still work.
- `RegisteredUserController::store`: apply the same gating — redirect to `verification.notice` only when `APP_VERIFY_EMAIL=true`; otherwise land on `dashboard.access`.
- When `APP_VERIFY_EMAIL=true` (enforced mode), current behavior is preserved exactly (unverified users bounce to `verification.notice`).
- Update the two existing tests that assert the old behavior (`RegistrationTest.php`, `AuthenticationTest.php`); add regression tests for both flows under both config values.

No new env var, no config change, no schema/migration/route changes.

## Capabilities

### New Capabilities

- `user-auth`: post-authentication redirect behavior (login + registration) and email-verification enforcement config (`APP_VERIFY_EMAIL`)

### Modified Capabilities

<!-- None — `pos-transactions` is not affected by this change. -->

## Impact

- `app/Http/Controllers/Auth/AuthenticatedSessionController.php` — `store()`: bounce gating + uniform `dashboard.access` landing
- `app/Http/Controllers/Auth/RegisteredUserController.php` — `store()`: bounce gating + `dashboard.access` landing
- `tests/Feature/Auth/RegistrationTest.php` — existing assertion updated (line 18 asserts `verification.notice` redirect)
- `tests/Feature/Auth/AuthenticationTest.php` — existing assertion updated (line 24 asserts `route('dashboard')` redirect)
- New test file(s) under `tests/Feature/Auth/` covering: unverified login/register with `APP_VERIFY_EMAIL=false` → `dashboard.access`; with `true` → `verification.notice`
- No routes, config, migrations, or frontend changes
