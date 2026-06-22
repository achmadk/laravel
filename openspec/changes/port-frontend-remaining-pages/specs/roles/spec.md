## ADDED Requirements

### Requirement: Roles Index Page

The system SHALL provide a role management page at `dashboard/roles` with inline create/edit dialogs and permission count display.

#### Scenario: Renders index page with role cards

- **WHEN** a user with `roles-access` permission navigates to `/dashboard/roles`
- **THEN** the system SHALL display a card grid of all roles showing role name, permission count, and up to 8 permission badges with overflow indicator

#### Scenario: Opens create role dialog

- **WHEN** the user clicks "Tambah Role"
- **THEN** the system SHALL open a modal/dialog with a role name input and a permission checklist grouped by module

#### Scenario: Creates a new role

- **WHEN** the user enters a role name, selects permissions, and submits
- **THEN** the system SHALL create the role and update the role list with a success toast

#### Scenario: Opens edit role dialog

- **WHEN** the user clicks the edit icon on a role card
- **THEN** the system SHALL open a modal/dialog pre-filled with the role's name and assigned permissions

#### Scenario: Updates an existing role

- **WHEN** the user modifies the role name or permission selections and submits
- **THEN** the system SHALL update the role and refresh the role list

#### Scenario: Deletes a role

- **WHEN** the user clicks the delete icon on a role card and confirms
- **THEN** the system SHALL delete the role and remove it from the list
