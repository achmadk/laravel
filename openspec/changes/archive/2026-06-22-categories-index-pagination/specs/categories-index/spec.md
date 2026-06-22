## ADDED Requirements

### Requirement: Categories index shows 10 items per page

The system SHALL display 10 categories per page in the Dashboard Categories index view.

#### Scenario: Index page loads with default pagination

- **WHEN** a user visits the Categories index page
- **THEN** the system SHALL display 10 categories per page

#### Scenario: Search filters within paginated results

- **WHEN** a user searches for a category name on the Categories index page
- **THEN** the system SHALL return matching results paginated at 10 items per page

#### Scenario: Pagination controls are available

- **WHEN** there are more than 10 categories
- **THEN** the system SHALL show pagination controls to navigate between pages
- **AND** each page SHALL contain up to 10 categories
