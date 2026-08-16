## Why

`/dashboard/reports/insights` (route `reports.insights.index`) returns HTTP 500 on PostgreSQL. `AdvancedSalesInsightsController::hourBucketExpression()` falls back to MySQL syntax `HOUR(created_at)` for every driver except SQLite. The application's primary database is PostgreSQL (`pos_system`), which has no `HOUR()` function, so the hourly sales-distribution query throws `SQLSTATE[42883] Undefined function: function hour(timestamp without time zone) does not exist`.

## What Changes

- `app/Http/Controllers/Reports/AdvancedSalesInsightsController.php`: `hourBucketExpression()` switches to a `match` on the active driver — SQLite keeps `strftime('%H', created_at)`, PostgreSQL uses standard `EXTRACT(HOUR FROM created_at)`, and the MySQL `HOUR()` remains the fallback for other drivers.
- A feature test locks the insights endpoint so the PostgreSQL regression is caught (route requires `reports-access` permission).

## Capabilities

### New Capabilities
- _none_

### Modified Capabilities
- _none_ (single controller method fix — no spec-level behavior change to an existing capability; this is a bug fix)

## Impact

- `app/Http/Controllers/Reports/AdvancedSalesInsightsController.php` (one private method)
- `tests/Feature/Apps/AdvancedSalesInsightsTest.php` (new feature test)
- No schema, route, or dependency changes.