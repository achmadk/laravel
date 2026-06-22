## ADDED Requirements

### Requirement: Users Index Page

The system SHALL provide a user management page at `dashboard/users` with list/grid views, inline create/edit dialogs, and bulk delete.

#### Scenario: Renders index page with user list

- **WHEN** a user with `users-access` permission navigates to `/dashboard/users`
- **THEN** the system SHALL display a toggleable view (list/grid) of all users showing name, email, avatar, role badges, and action buttons

#### Scenario: Toggles between list and grid view

- **WHEN** the user clicks the grid/list toggle button
- **THEN** the system SHALL switch the display between a card grid layout and a table list layout

#### Scenario: Searches users by keyword

- **WHEN** the user types in the search field
- **THEN** the system SHALL filter users by name or email matching the query

#### Scenario: Opens create user dialog

- **WHEN** the user clicks "Tambah Pengguna" button
- **THEN** the system SHALL open an inline form or navigate to a create page for adding a new user

### Requirement: Users Create Page/Form

The system SHALL provide a user creation form with full profile fields and role assignment.

#### Scenario: Creates a new user

- **WHEN** the user fills in name, email, password, confirmation, selects roles, and submits
- **THEN** the system SHALL create the user and redirect to the users index with a success toast

#### Scenario: Validates required fields

- **WHEN** the user submits with empty required fields
- **THEN** the system SHALL display validation errors inline for name, email, password, and password confirmation

#### Scenario: Assigns roles during creation

- **WHEN** the user checks one or more role checkboxes and submits
- **THEN** the system SHALL assign the selected roles to the new user

#### Scenario: Uploads avatar

- **WHEN** the user selects an avatar image file
- **THEN** the system SHALL show a preview of the selected image before submission

### Requirement: Users Edit Page/Form

The system SHALL provide a user edit form to update user details and role assignments.

#### Scenario: Edits an existing user

- **WHEN** the user navigates to edit an existing user and modifies name, email, or role assignments and submits
- **THEN** the system SHALL update the user and redirect to the users index with a success toast

#### Scenario: Password change optional

- **WHEN** the user edits another user's profile
- **THEN** the password field SHALL be optional — leaving it blank preserves the existing password

#### Scenario: Deletes a user

- **WHEN** the user clicks "Hapus" on a user and confirms via a confirmation dialog
- **THEN** the system SHALL delete the user and remove them from the list with a success notification

#### Scenario: Bulk delete users

- **WHEN** the user selects multiple users via checkboxes and clicks the bulk delete button
- **THEN** the system SHALL delete all selected users after confirmation
