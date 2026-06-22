## ADDED Requirements

### Requirement: Audit Log Index Page

The system SHALL provide an audit log listing page at `dashboard/audit-logs` that displays activity logs with server-side filtering and pagination.

#### Scenario: Renders index page with log entries

- **WHEN** a user with `audit-logs-access` permission navigates to `/dashboard/audit-logs`
- **THEN** the system SHALL display a paginated table of audit log entries showing actor, module, event type, description, IP address, and timestamp

#### Scenario: Filters by user (actor)

- **WHEN** the user selects a user from the actor filter dropdown
- **THEN** the system SHALL reload the table showing only logs from that user, preserving pagination state

#### Scenario: Filters by module

- **WHEN** the user selects a module from the module filter dropdown
- **THEN** the system SHALL reload the table showing only logs for that module

#### Scenario: Filters by event type

- **WHEN** the user selects an event type (created, updated, deleted, etc.) from the event filter dropdown
- **THEN** the system SHALL reload the table showing only logs matching that event

#### Scenario: Filters by date range

- **WHEN** the user enters a start and end date in the date range filters
- **THEN** the system SHALL reload the table showing only logs within that date range

#### Scenario: Search by keyword

- **WHEN** the user types a search query
- **THEN** the system SHALL filter logs whose description or module matches the search term

#### Scenario: Navigates to detail page

- **WHEN** the user clicks the "view" action on a log entry
- **THEN** the system SHALL navigate to the audit log detail page

### Requirement: Audit Log Show Page

The system SHALL provide an audit log detail page displaying all captured context for a single activity log entry.

#### Scenario: Renders detail page

- **WHEN** a user navigates to `/dashboard/audit-logs/{id}`
- **THEN** the system SHALL display the log entry's full details including actor, action, module, event type, timestamp, IP address, user agent, and a key-value table of all old/new data

#### Scenario: Displays old/new data changes

- **WHEN** the log entry has old_values and new_values
- **THEN** the system SHALL render a key-value table showing all changed fields with their previous and current values

#### Scenario: Back navigation

- **WHEN** the user clicks the back link
- **THEN** the system SHALL navigate to the audit log index page
