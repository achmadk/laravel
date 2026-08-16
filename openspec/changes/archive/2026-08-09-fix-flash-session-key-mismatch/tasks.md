## 1. Middleware Fix

- [x] 1.1 Update the `flash` share closure in `app/Http/Middleware/HandleInertiaRequests.php` so `message` resolves as first non-empty of session keys `message`, `success`, `error`
- [x] 1.2 Update `type` resolution to be `error` when the `error` key is present, otherwise preserve the existing explicit `type` value, falling back to `success`

## 2. Tests

- [x] 2.1 Add a feature test asserting `back()->with('success', ...)` yields `flash.message` and `flash.type = "success"` in the Inertia props
- [x] 2.2 Add a feature test asserting `back()->with('error', ...)` yields `flash.type = "error"`
- [x] 2.3 Add a feature test asserting the `flash($message, $type)` helper convention still maps verbatim and populates `data`

## 3. Verification

- [x] 3.1 Run `vendor/bin/pint --dirty --format agent` on changed PHP files
- [x] 3.2 Run the new feature tests plus the full suite (`php artisan test --compact`) and confirm green