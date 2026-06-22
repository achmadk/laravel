## ADDED Requirements

### Requirement: User management CRUD

The dashboard SHALL include User management pages for creating, editing, and listing system users.

#### Scenario: User index renders

- **WHEN** a user with `users-access` visits `/dashboard/users`
- **THEN** they SHALL see a list of users with roles and status

#### Scenario: User create

- **WHEN** a user with `users-create` visits the create page
- **THEN** they SHALL see a form to add a new user with name, email, password, and role assignment

#### Scenario: User edit

- **WHEN** a user with `users-update` visits the edit page
- **THEN** they SHALL see a form to update user details and roles
