## 1. Backend fix

- [x] 1.1 `app/Http/Controllers/Reports/AdvancedSalesInsightsController.php`: rewrite `hourBucketExpression()` as a driver `match` — sqlite → `CAST(strftime('%H', created_at) AS INTEGER)`, pgsql → `EXTRACT(HOUR FROM created_at)`, default → `HOUR(created_at)`; verify call site at line ~296 still keys by `(int)` bucket

## 2. Test

- [x] 2.1 New `tests/Feature/Apps/AdvancedSalesInsightsTest.php`: seed `reports-access` permission, actingAs user, `GET /dashboard/reports/insights` → assertOk + Inertia component `Dashboard/Reports/Insights`
- [x] 2.2 Confirm guest access redirects to login

## 3. Verification

- [x] 3.1 `php artisan test --compact` — full suite (baseline 57 + new tests) green
- [x] 3.2 `vendor/bin/pint --dirty --format agent` on the changed controller + test
- [x] 3.3 `tsc --noEmit` (+ no frontend touched → expect no-op)