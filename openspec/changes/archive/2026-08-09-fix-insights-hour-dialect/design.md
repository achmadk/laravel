## Context

`AdvancedSalesInsightsController::hourBucketExpression()` builds the SQL fragment for bucketing transactions by hour for the hourly sales-distribution metric. Today it special-cases SQLite and returns `/HOUR(created_at)` (MySQL dialect) for every other driver. PostgreSQL does not ship `HOUR()` as a scalar function, so the insights query dies with `SQLSTATE[42883]` on the app's primary database.

## Goals / Non-Goals

**Goals:**
- Make `hourBucketExpression()` emit a valid SQL fragment on PostgreSQL (the app's real database).
- Keep SQLite and MySQL behavior unchanged.
- Lock the behavior with a feature test that would have caught the regression.

**Non-Goals:**
- No schema changes, no routing changes, no controller refactor of anything beyond the expression.
- No support for drivers beyond sqlite / pgsql / mysql fallback.

## Decisions

- Replace the ternary with a `match` on `DB::connection()->getDriverName()`:

```php
protected function hourBucketExpression(): string
{
    return match (DB::connection()->getDriverName()) {
        'sqlite' => "CAST(strftime('%H', created_at) AS INTEGER)",
        'pgsql'  => 'EXTRACT(HOUR FROM created_at)',
        default  => 'HOUR(created_at)',
    };
}
```

- `EXTRACT(HOUR FROM ...)` is standard SQL that PostgreSQL accepts; it returns `double precision` there, while `strftime` produces an integer on SQLite — matching is done via `(int)` cast at the call site either way (already the case), so no other code changes.
- Feature test: `tests/Feature/Apps/AdvancedSalesInsightsTest.php` — acting as a user with `reports-access`, `GET /dashboard/reports/insights` must return 200 and render the Inertia page. This runs against the real pgsql test connection, exercising the `pgsql` branch. The Rx also guards against future regressions on the default driver.

## Risks / Trade-offs

- `EXTRACT` returns numeric (possibly 0-padded single digits on some drivers), but the existing caller casts the bucket to `(int)` before keying, so the hash-keyed output is unchanged.
- If another project still runs MySQL, the `default` branch preserves prior behavior exactly.