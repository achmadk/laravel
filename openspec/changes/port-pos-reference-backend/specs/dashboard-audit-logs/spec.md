## ADDED Requirements

### Requirement: Audit log viewer with detail pages

The dashboard SHALL include an Audit Logs page at `/dashboard/audit-logs` with a list view and a detail view per log entry.

#### Scenario: Audit log index renders

- **WHEN** a user with `audit-logs-access` permission visits `/dashboard/audit-logs`
- **THEN** they SHALL see a paginated, filterable list of audit log entries

#### Scenario: Audit log detail renders

- **WHEN** a user clicks on a log entry
- **THEN** they SHALL see full details of that audit event
