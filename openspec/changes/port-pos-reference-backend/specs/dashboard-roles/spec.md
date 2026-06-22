## ADDED Requirements

### Requirement: Role management UI

The dashboard SHALL include a Role index page at `/dashboard/roles`.

#### Scenario: Role index renders

- **WHEN** a user with `roles-access` visits `/dashboard/roles`
- **THEN** they SHALL see a list of roles with assigned permissions
