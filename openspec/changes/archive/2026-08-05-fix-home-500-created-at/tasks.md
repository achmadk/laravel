## 1. Backend: HomeController

- [x] 1.1 In `HomeController@index`, wrap the recent-transaction date with `Carbon::parse(...)`: `'date' => Carbon::parse($t->created_at)->format('d M Y')` (line 29). `Illuminate\Support\Carbon` is already imported.

## 2. Backend: MemberController

- [x] 2.1 Add `use Illuminate\Support\Carbon;` to `app/Http/Controllers/Apps/MemberController.php` (not currently imported).
- [x] 2.2 In `MemberController::recentTransactions()`, replace `'date' => $transaction->created_at?->toISOString()` with `'date' => Carbon::parse($transaction->created_at)->toISOString()` (line 284).

## 3. Regression tests

- [x] 3.1 Pest: an authenticated user requesting `GET /home` receives 200 and `recentTransactions[].date` values formatted as `d M Y` (create `tests/Feature/HomePageTest.php` or similar; seed a user + at least one transaction).
- [x] 3.2 Pest: `GET /home` with zero transactions still returns 200 with an empty `recentTransactions` list.
- [x] 3.3 Pest: member show (a customer with transactions) returns `recentTransactions[].date` as a valid ISO-8601 string without error (exercise `MemberController::recentTransactions()` via the member route).

## 4. Verification

- [x] 4.1 Run `vendor/bin/pint --dirty --format agent` on the two touched controllers.
- [x] 4.2 Run the new Pest tests (`php artisan test --compact --filter=Home`) plus the member-related suite; all pass.
- [x] 4.3 Manually confirm `GET /home` renders (logged-in) and no new errors in `laravel.log`.
