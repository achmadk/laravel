## 1. Backend: AuthenticatedSessionController

- [x] 1.1 In `AuthenticatedSessionController@store`, wrap the unverified-user bounce so it only fires when verification is enforced: change the hardcoded `if ($user && method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail())` block to `if (config('security.auth.verify_email') && $user && method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail())` (still `redirect()->route('verification.notice')` inside).
- [x] 1.2 Remove the `$routePriority` permission-priority loop and its `$defaultRoute` variable; return `redirect()->intended(route('dashboard.access', absolute: false));` for all users (keep the audit log / session writes above untouched).

## 2. Backend: RegisteredUserController

- [x] 2.1 In `RegisteredUserController@store`, after `Auth::login($user)`, replace the unconditional `return redirect()->route('verification.notice');` with: `return config('security.auth.verify_email') ? redirect()->route('verification.notice') : redirect()->intended(route('dashboard.access', absolute: false));` (keep `event(new Registered($user))` and role assignment untouched).

## 3. Tests: update existing assertions

- [x] 3.1 `tests/Feature/Auth/RegistrationTest.php` line 18: update `assertRedirect(route('verification.notice', absolute: false))` to assert the new default landing (`route('dashboard.access', absolute: false)`); add a `config(['security.auth.verify_email' => true])` variant asserting the notice redirect is preserved in enforced mode.
- [x] 3.2 `tests/Feature/Auth/AuthenticationTest.php` line 24: update `assertRedirect(route('dashboard', absolute: false))` to `route('dashboard.access', absolute: false)` (the test already creates + grants `dashboard-access`; the assertion target is now the access hub).

## 4. Tests: new regression coverage

- [x] 4.1 New Pest test: unverified user logs in with `APP_VERIFY_EMAIL=false` → redirected to `dashboard.access` (use `User::factory()->unverified()` — verify the factory supports it, else create with `email_verified_at => null`).
- [x] 4.2 New Pest test: unverified user logs in with `config(['security.auth.verify_email' => true])` → redirected to `verification.notice`.
- [x] 4.3 New Pest test: user registers (public registration enabled via `config(['security.auth.public_registration' => true])`) with `APP_VERIFY_EMAIL=false` → redirected to `dashboard.access`, not `verification.notice`.
- [x] 4.4 New Pest test: user registers with `config(['security.auth.verify_email' => true])` → redirected to `verification.notice`.

## 5. Verification

- [x] 5.1 Run `vendor/bin/pint --dirty --format agent` on the two touched controllers and test files.
- [x] 5.2 Run `php artisan test --compact --filter='Auth'` — all auth tests pass (new + updated + existing).
- [x] 5.3 Manually confirm: register + login locally (or via a logged-in `GET /dashboard/access` visit) render the access hub without 403, and no new errors in `laravel.log`.
