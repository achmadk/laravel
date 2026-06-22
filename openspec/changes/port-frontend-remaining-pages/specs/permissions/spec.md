## ADDED Requirements

### Requirement: Permissions Index Page

The system SHALL provide a permissions overview page at `dashboard/permissions` displaying all available permissions in a searchable grid.

#### Scenario: Renders index page with permission grid

- **WHEN** a user with `permissions-access` permission navigates to `/dashboard/permissions`
- **THEN** the system SHALL display a responsive grid of permission items, each showing the permission name with a shield icon

#### Scenario: Searches permissions

- **WHEN** the user types in the search field
- **THEN** the system SHALL filter the permission grid to show only permissions whose names match the search query

#### Scenario: Shows total count

- **WHEN** the page loads
- **THEN** the system SHALL display the total number of registered permissions in the header
