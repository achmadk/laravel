## ADDED Requirements

### Requirement: Permission management UI

The dashboard SHALL include a Permission index page at `/dashboard/permissions`.

#### Scenario: Permission index renders

- **WHEN** a user with `permissions-access` visits `/dashboard/permissions`
- **THEN** they SHALL see a matrix of roles and permissions
