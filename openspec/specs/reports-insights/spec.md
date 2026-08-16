# reports-insights Specification

## Purpose
TBD - created by archiving change fix-insights-hour-dialect. Update Purpose after archive.
## Requirements
### Requirement: Sales insights render without SQL dialect errors

The hourly sales-insights query SHALL produce a valid SQL statement on the application's primary database driver (PostgreSQL) so that `/dashboard/reports/insights` renders successfully instead of throwing `SQLSTATE[42883]` on the unsupported `HOUR()` function.

#### Scenario: PostgreSQL driver renders insights page
- **WHEN** an authenticated user with `reports-access` requests `GET /dashboard/reports/insights` on the PostgreSQL database
- **THEN** the response is 200 and the insights page renders, using `EXTRACT(HOUR FROM created_at)` for the hourly bucket

#### Scenario: SQLite driver unchanged
- **WHEN** the same query runs on a SQLite connection
- **THEN** the hourly bucket still uses `CAST(strftime('%H', created_at) AS INTEGER)` as before

#### Scenario: MySQL fallback preserved
- **WHEN** the same query runs on a non-sqlite, non-pgsql driver
- **THEN** the hourly bucket uses `HOUR(created_at)` as before

